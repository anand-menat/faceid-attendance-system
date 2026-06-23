FROM python:3.9-slim

WORKDIR /app

# Install system dependencies required for OpenCV and dlib
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    pkg-config \
    libx11-dev \
    libatlas-base-dev \
    libgtk-3-dev \
    libboost-python-dev \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend/ ./backend/

# Copy the frontend code (served statically by FastAPI)
COPY frontend/ ./frontend/

# Set working directory to backend
WORKDIR /app/backend

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Run the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
