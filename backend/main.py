import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import models
from database import engine

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

# Create the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Face Recognition Attendance System API")

# Setup CORS for the React frontend (if run separately)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from websocket_manager import manager

# Include Routers
from routers import student, attendance, auth
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(student.router, prefix="/api/students", tags=["Students"])
app.include_router(attendance.router, prefix="/api/attendance", tags=["Attendance"])

# WebSocket Endpoint
@app.websocket("/api/ws/attendance")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Mount static files for uploads
app.mount("/api/uploads", StaticFiles(directory="uploads"), name="uploads")

# Mount static files for frontend at the root path
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
