# FaceID — Face Recognition Attendance System

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

> An AI-powered attendance tracking system using **real-time facial recognition** to automatically identify and log student attendance. Built with a FastAPI backend and a modern glassmorphism frontend.

---

## Features

| Feature | Description |
|---------|-------------|
| **Student Registration** | Register students with webcam face capture and store 128-d face embeddings |
| **Live Attendance** | Real-time face recognition via webcam — automatically marks attendance |
| **Dashboard** | Overview cards with animated counters for total students, today's attendance, and rate |
| **Attendance Logs** | Searchable and filterable attendance history with date and name filters |
| **CSV Export** | Export filtered attendance data as downloadable CSV files |
| **Student Management** | Full CRUD — view, edit, and delete students with a modal interface |
| **Toast Notifications** | Elegant slide-in toast alerts replace browser alerts |
| **Responsive Design** | Mobile-first responsive layout with hamburger navigation |

---

## Tech Stack

### Backend
- **FastAPI** — High-performance Python web framework
- **SQLAlchemy** — ORM for database operations
- **SQLite** — Lightweight embedded database
- **face_recognition** (dlib) — 128-d face encoding & comparison
- **OpenCV** — Image processing
- **Pydantic** — Input validation with email & phone validators

### Frontend
- **Vanilla HTML/CSS/JS** — No frameworks, pure web technologies
- **Glassmorphism UI** — Modern dark theme with blur effects
- **Lucide Icons** — Beautiful SVG icon set
- **Inter Font** — Clean modern typography

---

## Project Structure

```
CapStone_Project/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # SQLAlchemy engine & session
│   ├── models.py            # Student & Attendance ORM models
│   ├── schemas.py           # Pydantic validation schemas
│   ├── routers/
│   │   ├── student.py       # CRUD endpoints for students
│   │   └── attendance.py    # Attendance recognition & logs
│   └── services/
│       └── face_service.py  # Face encoding & recognition logic
├── frontend/
│   ├── index.html           # Single-page application
│   ├── style.css            # Glassmorphism design system
│   └── app.js               # Client-side logic & API integration
├── Data/                    # Training data directory
├── attendance.csv           # Legacy attendance data
└── README.md                # This file
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- pip (Python package manager)
- CMake (required for dlib/face_recognition)
- A webcam for face capture

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd CapStone_Project
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

   > **Note**: Installing `face_recognition` requires `dlib` which needs CMake. On Ubuntu/WSL: `sudo apt install cmake`

3. **Start the Application**
   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the App**
   
   Open your browser and visit `http://localhost:8000`
   
   > **Admin Login:**
   > - **Username:** `admin`
   > - **Password:** `password`

---

## API Reference

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/students/` | List all students (supports `?search=` and `?department=`) |
| `GET` | `/api/students/{id}` | Get a single student |
| `POST` | `/api/students/` | Register a new student (multipart form with photo) |
| `PUT` | `/api/students/{id}` | Update student details |
| `DELETE` | `/api/students/{id}` | Delete student and their attendance records |

### Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/attendance/` | List attendance logs (supports `?date=`, `?name=`, `?department=`) |
| `GET` | `/api/attendance/export` | Download attendance as CSV |
| `POST` | `/api/attendance/recognize` | Recognize face and mark attendance |

---

## How It Works

1. **Registration** — Student's face is captured via webcam. The `face_recognition` library extracts a 128-dimensional face embedding which is stored in the database.

2. **Recognition** — During live attendance, webcam frames are sent to the backend every 3 seconds. Each frame is compared against all stored face embeddings using Euclidean distance with a tolerance threshold (0.5).

3. **Attendance Marking** — When a match is found, attendance is automatically logged with timestamp. Duplicate entries for the same day are prevented.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

