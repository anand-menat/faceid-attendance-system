from sqlalchemy import Column, Integer, String, Date, DateTime
from database import Base
import datetime

class Student(Base):
    __tablename__ = "student_info"

    Id = Column(Integer, primary_key=True, index=True)
    Department = Column(String(50))
    Course = Column(String(50))
    Year = Column(String(50))
    Semester = Column(String(50))
    Name = Column(String(50))
    Division = Column(String(50))
    Roll_no = Column(Integer)
    Gender = Column(String(50))
    DOB = Column(String(50))
    Email = Column(String(50))
    Phone = Column(String(50))
    Address = Column(String(200))
    Teacher = Column(String(50))
    Photo = Column(String(50))  # Can store path or True/False
    
    # New column to store the 128-d face encoding (stored as a JSON string or comma-separated string)
    Face_Encoding = Column(String(5000), nullable=True)

class Attendance(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer)
    roll_no = Column(Integer)
    name = Column(String(50))
    department = Column(String(50))
    time = Column(String(50))
    date = Column(String(50))
    status = Column(String(50))
