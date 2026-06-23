from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import logging
import os

from database import get_db
import models
import schemas
from services.face_service import encode_face
from routers.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[schemas.Student])
def get_students(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    query = db.query(models.Student)

    if search:
        query = query.filter(
            models.Student.Name.ilike(f"%{search}%") |
            models.Student.Email.ilike(f"%{search}%")
        )
    if department:
        query = query.filter(models.Student.Department == department)

    students = query.offset(skip).limit(limit).all()
    return students

@router.get("/{student_id}", response_model=schemas.Student)
def get_student(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    student = db.query(models.Student).filter(models.Student.Id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.post("/")
async def create_student(
    Id: int = Form(...),
    Department: str = Form(...),
    Course: str = Form(...),
    Year: str = Form(...),
    Semester: str = Form(...),
    Name: str = Form(...),
    Division: str = Form(...),
    Roll_no: int = Form(...),
    Gender: str = Form(...),
    DOB: str = Form(...),
    Email: str = Form(...),
    Phone: str = Form(...),
    Address: str = Form(...),
    Teacher: str = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    # Check if student exists
    db_student = db.query(models.Student).filter(models.Student.Id == Id).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Student ID already registered")

    # Read image and generate encoding
    image_bytes = await photo.read()
    face_encoding = encode_face(image_bytes)

    if not face_encoding:
        raise HTTPException(status_code=400, detail="Could not detect exactly one face in the uploaded image. Please try again with a clear photo.")

    # Serialize encoding to JSON string
    encoding_json = json.dumps(face_encoding)
    
    # Save the physical image to uploads directory
    os.makedirs("uploads", exist_ok=True)
    filename = f"student_{Id}.jpg"
    file_path = os.path.join("uploads", filename)
    with open(file_path, "wb") as f:
        f.write(image_bytes)

    new_student = models.Student(
        Id=Id,
        Department=Department,
        Course=Course,
        Year=Year,
        Semester=Semester,
        Name=Name,
        Division=Division,
        Roll_no=Roll_no,
        Gender=Gender,
        DOB=DOB,
        Email=Email,
        Phone=Phone,
        Address=Address,
        Teacher=Teacher,
        Photo=f"/api/uploads/{filename}",
        Face_Encoding=encoding_json
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    logger.info(f"Registered student: {Name} (ID: {Id})")

    return new_student

@router.put("/{student_id}")
def update_student(
    student_id: int,
    Department: str = Form(None),
    Course: str = Form(None),
    Year: str = Form(None),
    Semester: str = Form(None),
    Name: str = Form(None),
    Division: str = Form(None),
    Roll_no: int = Form(None),
    Gender: str = Form(None),
    DOB: str = Form(None),
    Email: str = Form(None),
    Phone: str = Form(None),
    Address: str = Form(None),
    Teacher: str = Form(None),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    student = db.query(models.Student).filter(models.Student.Id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Update only the fields that were provided
    update_fields = {
        "Department": Department, "Course": Course, "Year": Year,
        "Semester": Semester, "Name": Name, "Division": Division,
        "Roll_no": Roll_no, "Gender": Gender, "DOB": DOB,
        "Email": Email, "Phone": Phone, "Address": Address, "Teacher": Teacher
    }

    for field, value in update_fields.items():
        if value is not None:
            setattr(student, field, value)

    db.commit()
    db.refresh(student)
    logger.info(f"Updated student ID: {student_id}")

    return student

@router.delete("/{student_id}")
def delete_student(
    student_id: int, 
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    student = db.query(models.Student).filter(models.Student.Id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Delete their attendance records
    db.query(models.Attendance).filter(models.Attendance.student_id == student_id).delete()
    
    # Delete the student record
    db.delete(student)
    db.commit()
    
    # Remove the physical photo if it exists
    file_path = os.path.join("uploads", f"student_{student_id}.jpg")
    if os.path.exists(file_path):
        os.remove(file_path)
        
    logger.info(f"Deleted student ID: {student_id} and their attendance records")

    return {"message": f"Student {student.Name} (ID: {student_id}) deleted successfully"}
