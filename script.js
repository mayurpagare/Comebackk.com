// --- BACKONTRACK APP LOGIC ---

const app = {
    // State
    currentUser: null,
    subjects: [],
    isDarkMode: true,

    // Initialize
    init: function() {
        this.loadTheme();
        this.loadSubjects();
        this.checkAuth();
        this.setupEventListeners();
    },

    // --- NAVIGATION ---
    navigate: function(pageId) {
        // Hide all pages
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show requested page
        if (pageId === 'landing') {
            document.getElementById('landing-page').classList.remove('hidden');
            document.getElementById('dashboard-page').classList.add('hidden');
            document.getElementById('auth-page').classList.add('hidden');
        } else if (pageId === 'auth') {
            document.getElementById('landing-page').classList.add('hidden');
            document.getElementById('auth-page').classList.remove('hidden');
            document.getElementById('dashboard-page').classList.add('hidden');
        } else if (pageId === 'dashboard') {
            document.getElementById('landing-page').classList.add('hidden');
            document.getElementById('auth-page').classList.add('hidden');
            document.getElementById('dashboard-page').classList.remove('hidden');
            this.updateDashboard();
        }

        // Close mobile menu if open
        document.querySelector('.sidebar').classList.remove('active');
        document.querySelector('.nav-links').classList.remove('mobile-active');
    },

    // --- AUTHENTICATION ---
    handleAuth: function(e) {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!name || !email || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Simulate Login/Register
        this.currentUser = { name, email };
        localStorage.setItem('backOnTrackUser', JSON.stringify(this.currentUser));
        
        // Update UI
        document.getElementById('welcome-msg').textContent = `Welcome back, ${name}!`;
        this.navigate('dashboard');
    },

    checkAuth: function() {
        const user = localStorage.getItem('backOnTrackUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            document.getElementById('welcome-msg').textContent = `Welcome back, ${this.currentUser.name}!`;
            this.navigate('dashboard');
        } else {
            this.navigate('landing');
        }
    },

    logout: function() {
        localStorage.removeItem('backOnTrackUser');
        this.currentUser = null;
        this.navigate('landing');
    },

    // --- SUBJECTS MANAGEMENT ---
    addSubject: function(e) {
        e.preventDefault();
        const name = document.getElementById('sub-name').value;
        const difficulty = document.getElementById('sub-diff').value;
        const date = document.getElementById('sub-date').value;

        const newSubject = {
            id: Date.now(),
            name,
            difficulty,
            date
        };

        this.subjects.push(newSubject);
        this.saveSubjects();
        this.renderSubjects();
        
        // Reset form
        e.target.reset();
        alert('Subject added successfully!');
    },

    deleteSubject: function(id) {
        if(confirm('Are you sure you want to delete this subject?')) {
            this.subjects = this.subjects.filter(sub => sub.id !== id);
            this.saveSubjects();
            this.renderSubjects();
        }
    },

    saveSubjects: function() {
        localStorage.setItem('backOnTrackSubjects', JSON.stringify(this.subjects));
    },

    loadSubjects: function() {
        const stored = localStorage.getItem('backOnTrackSubjects');
        if (stored) {
            this.subjects = JSON.parse(stored);
            this.renderSubjects();
        }
    },

    renderSubjects: function() {
        const tbody = document.querySelector('#subjects-table tbody');
        tbody.innerHTML = '';

        if (this.subjects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">No subjects added yet.</td></tr>';
            return;
        }

        this.subjects.forEach(sub => {
            const row = `
                <tr>
                    <td>${sub.name}</td>
                    <td><span class="badge badge-${sub.difficulty.toLowerCase()}">${sub.difficulty}</span></td>
                    <td>${sub.date}</td>
                    <td>
                        <i class="fa-solid fa-trash action-btn" onclick="app.deleteSubject(${sub.id})"></i>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    },

    // --- DASHBOARD UPDATES ---
    updateDashboard: function() {
        this.renderSubjects();
        this.initChart();
    },

    // --- THEME TOGGLE ---
    toggleTheme: function() {
        this.isDarkMode = !this.isDarkMode;
        this.saveTheme();
        this.applyTheme();
    },

    saveTheme: function() {
        localStorage.setItem('backOnTrackTheme', this.isDarkMode ? 'dark' : 'light');
    },

    loadTheme: function() {
        const theme = localStorage.getItem('backOnTrackTheme');
        if (theme === 'light') {
            this.isDarkMode = false;
            document.documentElement.setAttribute('data-theme', 'light');
            document.querySelector('.theme-toggle i').classList.replace('fa-moon', 'fa-sun');
        }
    },

    applyTheme: function() {
        if (this.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.querySelector('.theme-toggle i').classList.replace('fa-sun', 'fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            document.querySelector('.theme-toggle i').classList.replace('fa-moon', 'fa-sun');
        }
    },

    // --- MOBILE MENU ---
    toggleMobileMenu: function() {
        document.querySelector('.sidebar').classList.toggle('active');
        document.querySelector('.nav-links').classList.toggle('mobile-active');
    },

    // --- CHART.JS ---
    initChart: function() {
        const ctx = document.getElementById('studyChart');
        if (!ctx) return;

        // Destroy existing chart if re-rendering
        if (window.myChart) {
            window.myChart.destroy();
        }

        window.myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Study Hours',
                    data: [2.5, 3, 2, 4, 3.5, 5, 4],
                    backgroundColor: '#6366f1',
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#334155' }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: {
                        labels: { color: '#94a3b8' }
                    }
                }
            }
        });
    },

    // --- EVENT LISTENERS ---
    setupEventListeners: function() {
        // Auth Toggle (Login/Register)
        const authToggle = document.getElementById('auth-toggle-text');
        const authTitle = document.getElementById('auth-title');
        const authSubtitle = document.getElementById('auth-subtitle');
        const authBtnText = document.getElementById('auth-btn-text');
        let isLogin = true;

        authToggle.addEventListener('click', () => {
            isLogin = !isLogin;
            if (isLogin) {
                authTitle.textContent = 'Welcome Back';
                authSubtitle.textContent = 'Enter your details to access your dashboard';
                authBtnText.textContent = 'Login';
                authToggle.innerHTML = '<span>Don\'t have an account? Register</span>';
            } else {
                authTitle.textContent = 'Create Account';
                authSubtitle.textContent = 'Join BackOnTrack and start your recovery';
                authBtnText.textContent = 'Register';
                authToggle.innerHTML = '<span>Already have an account? Login</span>';
            }
        });
    }
};

// Start App
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});