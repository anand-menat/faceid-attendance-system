from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import json
import csv
import io
import logging
from datetime import datetime, timedelta

from database import get_db
import models
import schemas
from services.face_service import recognize_face
from routers.auth import get_current_user
from websocket_manager import manager

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[schemas.Attendance])
def get_attendance(
    skip: int = 0,
    limit: int = 100,
    date: Optional[str] = None,
    name: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    query = db.query(models.Attendance)

    if date:
        query = query.filter(models.Attendance.date == date)
    if name:
        query = query.filter(models.Attendance.name.ilike(f"%{name}%"))
    if department:
        query = query.filter(models.Attendance.department == department)

    logs = query.order_by(models.Attendance.id.desc()).offset(skip).limit(limit).all()
    return logs

@router.get("/stats")
def get_attendance_stats(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Returns attendance counts for the last 7 days for Chart.js"""
    stats = []
    # Generate the last 7 dates
    for i in range(6, -1, -1):
        target_date = (datetime.now() - timedelta(days=i)).strftime("%d/%m/%Y")
        count = db.query(models.Attendance).filter(models.Attendance.date == target_date).count()
        stats.append({
            "date": (datetime.now() - timedelta(days=i)).strftime("%b %d"),
            "count": count
        })
    return stats

@router.get("/export")
def export_attendance_csv(
    date: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Export attendance records as a downloadable CSV file."""
    query = db.query(models.Attendance)

    if date:
        query = query.filter(models.Attendance.date == date)
    if department:
        query = query.filter(models.Attendance.department == department)

    logs = query.order_by(models.Attendance.id.desc()).all()

    # Build CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Student ID", "Roll No", "Name", "Department", "Date", "Time", "Status"])

    for log in logs:
        writer.writerow([log.student_id, log.roll_no, log.name, log.department, log.date, log.time, log.status])

    output.seek(0)
    filename = f"attendance_{date.replace('/', '-') if date else 'all'}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/recognize")
async def recognize_and_mark_attendance(
    frame: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    image_bytes = await frame.read()

    # Fetch all students and their encodings
    students = db.query(models.Student).filter(models.Student.Face_Encoding.isnot(None)).all()

    known_encodings = {}
    for s in students:
        if s.Face_Encoding:
            known_encodings[s.Id] = json.loads(s.Face_Encoding)

    if not known_encodings:
        raise HTTPException(status_code=400, detail="No registered students with face data.")

    # Attempt to recognize the face
    matched_id = recognize_face(image_bytes, known_encodings)

    if matched_id is None:
        raise HTTPException(status_code=404, detail="Unknown Face")

    # Mark attendance for matched_id
    student = db.query(models.Student).filter(models.Student.Id == matched_id).first()

    now = datetime.now()
    d1 = now.strftime("%d/%m/%Y")
    dtString = now.strftime("%H:%M:%S")

    # Check if already marked for today
    existing = db.query(models.Attendance).filter(
        models.Attendance.student_id == matched_id,
        models.Attendance.date == d1
    ).first()

    if existing:
        return {"message": f"Attendance already marked for {student.Name} today.", "student": student.Name}

    new_attendance = models.Attendance(
        student_id=student.Id,
        roll_no=student.Roll_no,
        name=student.Name,
        department=student.Department,
        time=dtString,
        date=d1,
        status="Present"
    )

    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)
    logger.info(f"Attendance marked for {student.Name} (ID: {student.Id})")
    
    # Broadcast to WebSockets
    await manager.broadcast({
        "type": "NEW_ATTENDANCE",
        "student": student.Name,
        "time": dtString,
        "date": d1
    })

    return {"message": f"Attendance marked for {student.Name}", "student": student.Name}
