from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
import re

class StudentBase(BaseModel):
    Department: str
    Course: str
    Year: str
    Semester: str
    Name: str
    Division: str
    Roll_no: int
    Gender: str
    DOB: str
    Email: EmailStr
    Phone: str
    Address: str
    Teacher: str

    @field_validator('Phone')
    @classmethod
    def validate_phone(cls, v):
        # Allow digits, spaces, hyphens, plus sign — 7 to 15 chars
        cleaned = re.sub(r'[\s\-]', '', v)
        if not re.match(r'^\+?\d{7,15}$', cleaned):
            raise ValueError('Phone number must be 7-15 digits (may include +, spaces, hyphens)')
        return v

    @field_validator('Name')
    @classmethod
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Name must be at least 2 characters')
        return v.strip()

class StudentCreate(StudentBase):
    Id: int

class StudentUpdate(BaseModel):
    """Schema for partial student updates — all fields optional."""
    Department: Optional[str] = None
    Course: Optional[str] = None
    Year: Optional[str] = None
    Semester: Optional[str] = None
    Name: Optional[str] = None
    Division: Optional[str] = None
    Roll_no: Optional[int] = None
    Gender: Optional[str] = None
    DOB: Optional[str] = None
    Email: Optional[EmailStr] = None
    Phone: Optional[str] = None
    Address: Optional[str] = None
    Teacher: Optional[str] = None

    @field_validator('Phone')
    @classmethod
    def validate_phone(cls, v):
        if v is None:
            return v
        cleaned = re.sub(r'[\s\-]', '', v)
        if not re.match(r'^\+?\d{7,15}$', cleaned):
            raise ValueError('Phone number must be 7-15 digits')
        return v

class Student(StudentBase):
    Id: int
    Photo: Optional[str] = None

    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    student_id: int
    roll_no: int
    name: str
    department: str
    time: str
    date: str
    status: str

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: int

    class Config:
        from_attributes = True
