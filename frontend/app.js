const API_URL = 'http://localhost:8000/api';

// ============================================
//  Authentication & Fetch Wrapper
// ============================================

let authToken = localStorage.getItem('faceid_token');

function checkAuth() {
    if (authToken) {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        initApp();
    } else {
        document.getElementById('login-container').style.display = 'flex';
        document.getElementById('app-container').style.display = 'none';
    }
}

async function fetchWithAuth(url, options = {}) {
    if (!options.headers) options.headers = {};
    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const res = await fetch(url, options);
    
    // If unauthorized, log out automatically
    if (res.status === 401) {
        logout();
    }
    return res;
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('btn-login');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;"></div>';
        
        try {
            const formData = new URLSearchParams();
            formData.append('username', username);
            formData.append('password', password);
            
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
            
            const data = await res.json();
            if (res.ok) {
                authToken = data.access_token;
                localStorage.setItem('faceid_token', authToken);
                showToast("Login successful", "success");
                checkAuth();
            } else {
                showToast(data.detail || "Login failed", "error");
            }
        } catch (err) {
            showToast("Network error during login", "error");
        } finally {
            btn.innerHTML = originalText;
            if (window.lucide) lucide.createIcons();
        }
    });
}

function logout() {
    authToken = null;
    localStorage.removeItem('faceid_token');
    checkAuth();
    showToast("Logged out successfully", "info");
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) btnLogout.addEventListener('click', logout);


// ============================================
//  Toast Notification System
// ============================================

const toastContainer = document.getElementById('toast-container');

function showToast(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        info: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
        warning: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
    };

    toast.innerHTML = `
        ${icons[type] || icons.info}
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 350);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 350);
        }
    }, duration);
}

// ============================================
//  Animated Counter
// ============================================

function animateCounter(element, target, suffix = '') {
    const start = parseInt(element.textContent) || 0;
    const duration = 800;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * ease);
        element.textContent = current + suffix;
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

// ============================================
//  Navigation Logic
// ============================================

const navLinks = document.querySelectorAll('.nav-links li');
const views = document.querySelectorAll('.view');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

function navigateTo(targetId) {
    navLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-links li[data-target="${targetId}"]`);
    if (activeLink) activeLink.classList.add('active');

    views.forEach(view => {
        view.classList.remove('active-view');
        view.classList.add('hidden-view');
    });
    const targetView = document.getElementById(targetId);
    if (targetView) {
        targetView.classList.add('active-view');
        targetView.classList.remove('hidden-view');
    }

    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');

    if (targetId === 'dashboard') loadDashboard();
    if (targetId === 'logs') loadLogs();
    if (targetId === 'students') loadStudents();
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navigateTo(link.getAttribute('data-target'));
    });
});

document.querySelectorAll('.action-card[data-navigate]').forEach(card => {
    card.addEventListener('click', () => {
        navigateTo(card.getAttribute('data-navigate'));
    });
});

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    });
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    });
}

// ============================================
//  Dashboard & Chart Logic
// ============================================

let attendanceChart = null;

async function loadDashboard() {
    if (!authToken) return;
    try {
        const [studentsRes, attendanceRes, statsRes] = await Promise.all([
            fetchWithAuth(`${API_URL}/students/`),
            fetchWithAuth(`${API_URL}/attendance/`),
            fetchWithAuth(`${API_URL}/attendance/stats`)
        ]);

        if (!studentsRes.ok || !attendanceRes.ok || !statsRes.ok) return;

        const students = await studentsRes.json();
        const attendance = await attendanceRes.json();
        const stats = await statsRes.json();

        // Calculate today's stats
        let targetDate = "";
        if (attendance.length > 0) {
            targetDate = attendance[0].date;
        }
        const todayAttendance = attendance.filter(a => a.date === targetDate);
        const totalStudents = students.length;
        const todayCount = todayAttendance.length;
        const rate = totalStudents > 0 ? Math.round((todayCount / totalStudents) * 100) : 0;

        animateCounter(document.getElementById('stat-students'), totalStudents);
        animateCounter(document.getElementById('stat-attendance'), todayCount);
        animateCounter(document.getElementById('stat-rate'), rate, '%');

        // Render Chart.js
        renderChart(stats);

    } catch (e) {
        console.error("Error loading dashboard", e);
        showToast("Could not load dashboard data.", "error");
    }
}

function renderChart(statsData) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    
    // Prepare data
    const labels = statsData.map(d => d.date);
    const data = statsData.map(d => d.count);

    if (attendanceChart) {
        attendanceChart.destroy();
    }

    // Chart.js styling variables
    const primaryColor = '#818cf8'; // var(--primary-light)
    const gridColor = 'rgba(255, 255, 255, 0.05)';
    const textColor = '#94a3b8'; // var(--text-muted)

    attendanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Attendance Count',
                data: data,
                borderColor: primaryColor,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                borderWidth: 3,
                pointBackgroundColor: '#0a0e1a',
                pointBorderColor: primaryColor,
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4 // smooth curves
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
                },
                y: {
                    grid: { color: gridColor, drawBorder: false },
                    ticks: { 
                        color: textColor, 
                        font: { family: 'Inter', size: 11 },
                        stepSize: 1,
                        beginAtZero: true 
                    }
                }
            }
        }
    });
}

// ============================================
//  WebSockets Logic (Live Updates)
// ============================================

let ws = null;

function connectWebSocket() {
    if (!authToken || ws) return;

    // Use current host to construct ws URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // Assuming backend is at same host:8000 or proxied
    // In our docker setup, it's the same origin
    const wsUrl = `${protocol}//localhost:8000/api/ws/attendance`;
    
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "NEW_ATTENDANCE") {
            // Update dashboard counters if on dashboard
            const attElem = document.getElementById('stat-attendance');
            const rateElem = document.getElementById('stat-rate');
            const stuElem = document.getElementById('stat-students');
            
            let currentAtt = parseInt(attElem.textContent) || 0;
            let currentStu = parseInt(stuElem.textContent) || 1;
            
            currentAtt += 1;
            attElem.textContent = currentAtt;
            rateElem.textContent = Math.round((currentAtt / currentStu) * 100) + '%';
            
            // Show toast notification
            showToast(`Live: ${data.student} marked present!`, "success");
            
            // If live view is active, update the list manually
            const scanList = document.getElementById('scan-list');
            const emptyScans = document.getElementById('empty-scans');
            
            if (emptyScans) emptyScans.style.display = 'none';
            if (scanList) {
                const li = document.createElement('li');
                li.innerHTML = `<span><strong>${data.student}</strong></span> <span>${data.time}</span>`;
                scanList.prepend(li);
                if (scanList.children.length > 5) scanList.lastChild.remove();
            }
            
            // Refresh chart
            if (document.getElementById('dashboard').classList.contains('active-view')) {
                loadDashboard(); 
            }
        }
    };

    ws.onclose = () => {
        console.log("WebSocket disconnected. Reconnecting in 5s...");
        ws = null;
        setTimeout(connectWebSocket, 5000);
    };
}


// ============================================
//  Students List Logic
// ============================================

let studentsCache = [];

async function loadStudents(searchQuery = '') {
    if (!authToken) return;
    const tbody = document.getElementById('students-tbody');
    const loading = document.getElementById('students-loading');
    const emptyState = document.getElementById('students-empty');
    const table = document.getElementById('students-table');

    loading.style.display = 'flex';
    table.style.display = 'none';
    emptyState.style.display = 'none';

    try {
        let url = `${API_URL}/students/`;
        if (searchQuery) url += `?search=${encodeURIComponent(searchQuery)}`;

        const res = await fetchWithAuth(url);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const students = await res.json();
        studentsCache = students;

        loading.style.display = 'none';

        if (students.length === 0) {
            emptyState.style.display = 'block';
            table.style.display = 'none';
            return;
        }

        table.style.display = 'table';
        tbody.innerHTML = '';

        // Get origin for full URL to backend images
        const baseUrl = 'http://localhost:8000';

        students.forEach(s => {
            const tr = document.createElement('tr');
            
            // Avatar HTML
            let avatarHtml = `<div class="avatar-placeholder"><i data-lucide="user"></i></div>`;
            if (s.Photo && s.Photo !== 'stored') {
                avatarHtml = `<img src="${baseUrl}${s.Photo}" alt="${s.Name}" class="avatar-img" onerror="this.outerHTML='<div class=\\'avatar-placeholder\\'><i data-lucide=\\'user\\'></i></div>'">`;
            }

            tr.innerHTML = `
                <td>${avatarHtml}</td>
                <td>${s.Id}</td>
                <td><strong>${s.Name}</strong></td>
                <td>${s.Department}</td>
                <td>${s.Roll_no}</td>
                <td>${s.Email}</td>
                <td>${s.Phone}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn primary btn-sm" onclick="openEditModal(${s.Id})">Edit</button>
                        <button class="btn danger btn-sm" onclick="deleteStudent(${s.Id}, '${s.Name.replace(/'/g, "\\'")}')">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
        
        if (window.lucide) lucide.createIcons();

    } catch (e) {
        loading.style.display = 'none';
        console.error("Error loading students", e);
        showToast("Failed to load students list.", "error");
    }
}

let studentSearchTimeout;
const studentSearchInput = document.getElementById('student-search');
if (studentSearchInput) {
    studentSearchInput.addEventListener('input', (e) => {
        clearTimeout(studentSearchTimeout);
        studentSearchTimeout = setTimeout(() => {
            loadStudents(e.target.value.trim());
        }, 350);
    });
}

// ============================================
//  Edit & Delete Student (Abbreviated for brevity)
// ============================================

const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');

function openEditModal(studentId) {
    const student = studentsCache.find(s => s.Id === studentId);
    if (!student) return;

    document.getElementById('edit-id').value = student.Id;
    document.getElementById('edit-name').value = student.Name || '';
    document.getElementById('edit-dept').value = student.Department || '';
    document.getElementById('edit-course').value = student.Course || '';
    document.getElementById('edit-year').value = student.Year || '';
    document.getElementById('edit-sem').value = student.Semester || '';
    document.getElementById('edit-div').value = student.Division || '';
    document.getElementById('edit-roll').value = student.Roll_no || '';
    document.getElementById('edit-gender').value = student.Gender || 'Male';
    document.getElementById('edit-dob').value = student.DOB || '';
    document.getElementById('edit-email').value = student.Email || '';
    document.getElementById('edit-phone').value = student.Phone || '';
    document.getElementById('edit-address').value = student.Address || '';
    document.getElementById('edit-teacher').value = student.Teacher || '';

    editModal.classList.add('active');
}

function closeEditModal() {
    editModal.classList.remove('active');
}

document.getElementById('modal-close-btn').addEventListener('click', closeEditModal);
document.getElementById('modal-cancel-btn').addEventListener('click', closeEditModal);

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('edit-id').value;

    const formData = new FormData();
    formData.append('Name', document.getElementById('edit-name').value);
    formData.append('Department', document.getElementById('edit-dept').value);
    formData.append('Course', document.getElementById('edit-course').value);
    formData.append('Year', document.getElementById('edit-year').value);
    formData.append('Semester', document.getElementById('edit-sem').value);
    formData.append('Division', document.getElementById('edit-div').value);
    formData.append('Roll_no', document.getElementById('edit-roll').value);
    formData.append('Gender', document.getElementById('edit-gender').value);
    formData.append('DOB', document.getElementById('edit-dob').value);
    formData.append('Email', document.getElementById('edit-email').value);
    formData.append('Phone', document.getElementById('edit-phone').value);
    formData.append('Address', document.getElementById('edit-address').value);
    formData.append('Teacher', document.getElementById('edit-teacher').value);

    try {
        const res = await fetchWithAuth(`${API_URL}/students/${studentId}`, {
            method: 'PUT',
            body: formData
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(`Error: ${data.detail}`, 'error');
        } else {
            showToast('Student updated successfully!', 'success');
            closeEditModal();
            loadStudents();
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
});

async function deleteStudent(studentId, studentName) {
    if (!confirm(`Delete "${studentName}" (ID: ${studentId})?`)) return;

    try {
        const res = await fetchWithAuth(`${API_URL}/students/${studentId}`, {
            method: 'DELETE'
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(`Error: ${data.detail}`, 'error');
        } else {
            showToast(data.message, 'success');
            loadStudents();
        }
    } catch (err) {
        showToast('Network error', 'error');
    }
}

// ============================================
//  Attendance Logs Logic
// ============================================

async function loadLogs(filters = {}) {
    if (!authToken) return;
    const tbody = document.getElementById('logs-tbody');
    const loading = document.getElementById('logs-loading');
    const emptyState = document.getElementById('logs-empty');
    const table = document.getElementById('logs-table');

    loading.style.display = 'flex';
    table.style.display = 'none';
    emptyState.style.display = 'none';

    try {
        let url = `${API_URL}/attendance/?`;
        if (filters.name) url += `name=${encodeURIComponent(filters.name)}&`;
        if (filters.date) {
            const parts = filters.date.split('-');
            if (parts.length === 3) {
                const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                url += `date=${encodeURIComponent(formattedDate)}&`;
            }
        }

        const res = await fetchWithAuth(url);
        const logs = await res.json();

        loading.style.display = 'none';

        if (logs.length === 0) {
            emptyState.style.display = 'block';
            table.style.display = 'none';
            return;
        }

        table.style.display = 'table';
        tbody.innerHTML = '';

        logs.forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${log.student_id}</td>
                <td>${log.roll_no}</td>
                <td><strong>${log.name}</strong></td>
                <td>${log.department}</td>
                <td>${log.date}</td>
                <td>${log.time}</td>
                <td><span class="status-badge present">${log.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        document.getElementById('logs-loading').style.display = 'none';
        showToast("Failed to load attendance logs.", "error");
    }
}

document.getElementById('btn-filter-logs')?.addEventListener('click', () => {
    const name = document.getElementById('log-search-name').value.trim();
    const date = document.getElementById('log-filter-date').value;
    loadLogs({ name, date });
});

document.getElementById('btn-clear-filters')?.addEventListener('click', () => {
    document.getElementById('log-search-name').value = '';
    document.getElementById('log-filter-date').value = '';
    loadLogs();
});

document.getElementById('btn-export-csv')?.addEventListener('click', async () => {
    const date = document.getElementById('log-filter-date').value;
    let url = `${API_URL}/attendance/export?`;
    if (date) {
        const parts = date.split('-');
        if (parts.length === 3) {
            url += `date=${encodeURIComponent(`${parts[2]}/${parts[1]}/${parts[0]}`)}&`;
        }
    }
    
    // For download with auth header, we must fetch the blob and trigger download
    try {
        const res = await fetchWithAuth(url);
        const blob = await res.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `attendance_${date || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('Downloading CSV...', 'info');
    } catch (e) {
        showToast('Failed to export CSV', 'error');
    }
});

// ============================================
//  Registration & Live Camera Logic
// ============================================

const regVideo = document.getElementById('reg-video');
const regCanvas = document.getElementById('reg-canvas');
const btnStartRegCam = document.getElementById('btn-start-reg-cam');
const btnCaptureReg = document.getElementById('btn-capture-reg');
const regPhotoStatus = document.getElementById('reg-photo-status');
const registerForm = document.getElementById('register-form');
const regCameraPlaceholder = document.getElementById('reg-camera-placeholder');

let regStream = null;
let capturedBlob = null;

btnStartRegCam?.addEventListener('click', async () => {
    try {
        regStream = await navigator.mediaDevices.getUserMedia({ video: true });
        regVideo.srcObject = regStream;
        if (regCameraPlaceholder) regCameraPlaceholder.style.display = 'none';
        btnStartRegCam.disabled = true;
        btnCaptureReg.disabled = false;
        regPhotoStatus.innerText = "Camera active. Position face clearly.";
        regPhotoStatus.style.color = 'var(--primary-light)';
    } catch (err) {
        showToast("Camera access denied.", "error");
    }
});

btnCaptureReg?.addEventListener('click', () => {
    regCanvas.width = regVideo.videoWidth;
    regCanvas.height = regVideo.videoHeight;
    regCanvas.getContext('2d').drawImage(regVideo, 0, 0);

    regCanvas.toBlob((blob) => {
        capturedBlob = blob;
        regPhotoStatus.innerText = "✓ Photo captured successfully!";
        regPhotoStatus.style.color = 'var(--success-light)';
        regStream.getTracks().forEach(track => track.stop());
        regVideo.srcObject = null;
        if (regCameraPlaceholder) regCameraPlaceholder.style.display = 'flex';
        btnCaptureReg.disabled = true;
        btnStartRegCam.disabled = false;
        showToast("Face photo captured!", "success");
    }, 'image/jpeg');
});

registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!capturedBlob) {
        showToast("Please capture a photo first.", "warning");
        return;
    }

    const submitBtn = document.getElementById('btn-submit-reg');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;"></div> Processing...';
    submitBtn.disabled = true;

    const formData = new FormData();
    formData.append("Id", document.getElementById('reg-id').value);
    formData.append("Name", document.getElementById('reg-name').value);
    formData.append("Department", document.getElementById('reg-dept').value);
    formData.append("Course", document.getElementById('reg-course').value);
    formData.append("Year", document.getElementById('reg-year').value);
    formData.append("Semester", document.getElementById('reg-sem').value);
    formData.append("Division", document.getElementById('reg-div').value);
    formData.append("Roll_no", document.getElementById('reg-roll').value);
    formData.append("Gender", document.getElementById('reg-gender').value);
    formData.append("DOB", document.getElementById('reg-dob').value);
    formData.append("Email", document.getElementById('reg-email').value);
    formData.append("Phone", document.getElementById('reg-phone').value);
    formData.append("Address", document.getElementById('reg-address').value);
    formData.append("Teacher", document.getElementById('reg-teacher').value);
    formData.append("photo", capturedBlob, "face.jpg");

    try {
        const res = await fetchWithAuth(`${API_URL}/students/`, {
            method: 'POST',
            body: formData
        });

        const data = await res.json();
        if (!res.ok) {
            showToast(`Registration failed: ${data.detail}`, "error");
        } else {
            showToast(`Student "${data.Name}" registered successfully!`, "success");
            registerForm.reset();
            capturedBlob = null;
            regPhotoStatus.innerText = "No photo captured.";
            regPhotoStatus.style.color = 'var(--text-dim)';
        }
    } catch (err) {
        showToast("Network error.", "error");
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        if (window.lucide) lucide.createIcons();
    }
});

// Live Attendance Tracking
const attVideo = document.getElementById('att-video');
const attCanvas = document.getElementById('att-canvas');
const btnStartAttCam = document.getElementById('btn-start-att-cam');
const btnStopAttCam = document.getElementById('btn-stop-att-cam');
const attStatus = document.getElementById('att-status');

let attStream = null;
let attInterval = null;

btnStartAttCam?.addEventListener('click', async () => {
    try {
        attStream = await navigator.mediaDevices.getUserMedia({ video: true });
        attVideo.srcObject = attStream;
        document.getElementById('att-camera-placeholder').style.display = 'none';
        btnStartAttCam.disabled = true;
        btnStopAttCam.disabled = false;
        attStatus.className = "status-box info";
        attStatus.innerText = "System running. Scanning for faces...";
        attInterval = setInterval(processAttendanceFrame, 3000);
    } catch (err) {
        showToast("Camera access denied.", "error");
    }
});

btnStopAttCam?.addEventListener('click', () => {
    if (attStream) {
        attStream.getTracks().forEach(track => track.stop());
        attVideo.srcObject = null;
        document.getElementById('att-camera-placeholder').style.display = 'flex';
    }
    if (attInterval) clearInterval(attInterval);
    btnStartAttCam.disabled = false;
    btnStopAttCam.disabled = true;
    attStatus.className = "status-box info";
    attStatus.innerText = "System Idle.";
});

function processAttendanceFrame() {
    if (!attVideo.videoWidth) return;
    attCanvas.width = attVideo.videoWidth;
    attCanvas.height = attVideo.videoHeight;
    attCanvas.getContext('2d').drawImage(attVideo, 0, 0);

    attCanvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("frame", blob, "frame.jpg");

        try {
            const res = await fetchWithAuth(`${API_URL}/attendance/recognize`, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                attStatus.className = "status-box success";
                attStatus.innerText = `✓ ${data.message}`;
                // Recent scans list is handled by the WebSocket event now!
            } else if (data.detail !== "Unknown Face" && data.detail !== "No registered students with face data.") {
                attStatus.className = "status-box error";
                attStatus.innerText = `Error: ${data.detail}`;
            }
        } catch (err) {
            console.error(err);
        }
    }, 'image/jpeg', 0.8);
}


// ============================================
//  Initialization
// ============================================

function initApp() {
    loadDashboard();
    connectWebSocket();
    setTimeout(() => {
        if (window.lucide) lucide.createIcons();
    }, 100);
}

// Initial check
checkAuth();
