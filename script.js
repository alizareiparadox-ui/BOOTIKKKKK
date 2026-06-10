// ==============================
// GANG FOCUS APP - Ultimate
// ==============================

(function () {
    'use strict';

    // ========================
    // DATA
    // ========================
    const QUOTES = [
        { text: "ذهن مانند چتر نجات است؛ وقتی باز شود بهتر کار می‌کند.", author: "فرانک زاپا" },
        { text: "تنها راه انجام کار بزرگ، عشق به کاری است که انجام می‌دهی.", author: "استیو جابز" },
        { text: "موفقیت یعنی از شکستی به شکست دیگر رفتن بدون از دست دادن اشتیاق.", author: "وینستون چرچیل" },
        { text: "آینده به کسانی تعلق دارد که به زیبایی رؤیاهایشان باور دارند.", author: "النور روزولت" },
        { text: "هر استادی روزی یک مبتدی بوده است.", author: "ضرب‌المثل" },
        { text: "امروز اولین روز از باقی عمر توست.", author: "بیل کین" },
        { text: "تنها محدودیتی که داری، ذهن خودت است.", author: "ناشناس" },
        { text: "برای رسیدن به قله‌ها، توقف ممنوع.", author: "ناشناس" },
        { text: "سخت کار کن تا روزی بهترین خودت باشی.", author: "ناشناس" },
        { text: "هر قدم کوچک، یک پیروزی بزرگ است.", author: "ناشناس" }
    ];

    // ========================
    // DOM ELEMENTS
    // ========================
    const shamsiDateEl = document.getElementById('shamsiDate');
    const liveClockEl = document.getElementById('liveClock');
    const streakCountEl = document.getElementById('streakCount');
    const totalScoreEl = document.getElementById('totalScore');
    const todayStudyTimeEl = document.getElementById('todayStudyTime');
    const quoteTextEl = document.getElementById('quoteText');
    const quoteAuthorEl = document.getElementById('quoteAuthor');
    const timerDisplay = document.getElementById('timerDisplay');
    const modeLabel = document.getElementById('modeLabel');
    const startPauseBtn = document.getElementById('startPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const switchModeBtn = document.getElementById('switchModeBtn');
    const autoPomodoroCheck = document.getElementById('autoPomodoroCheck');
    const taskInput = document.getElementById('taskInputField');
    const addBtn = document.getElementById('addTaskButton');
    const taskContainer = document.getElementById('taskListContainer');
    const taskCounterDisplay = document.getElementById('taskCounterDisplay');
    const canvas = document.getElementById('progressCanvas');
    const ctx = canvas.getContext('2d');
    const chartPercentLabel = document.getElementById('chartPercentLabel');
    const confettiCanvas = document.getElementById('confettiCanvas');
    const confettiCtx = confettiCanvas.getContext('2d');

    // ========================
    // STATE
    // ========================
    let tasks = [];
    let timerInterval = null;
    let timerSeconds = 25 * 60;
    let isTimerRunning = false;
    let timerMode = 'study';
    let autoPomodoro = false;
    let pomodoroCycleCount = 0;
    let todayStudySeconds = 0;
    let streak = 0;
    let totalScore = 0;
    let confettiParticles = [];

    const STUDY_MINUTES = 25;
    const BREAK_MINUTES = 5;

    // ========================
    // CONFETTI SYSTEM
    // ========================
    function resizeConfettiCanvas() {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }

    class ConfettiParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 4;
            this.speedX = (Math.random() - 0.5) * 10;
            this.speedY = Math.random() * 6 + 2;
            this.color = `hsl(${Math.random() * 360}, 80%, 60%)`;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 10;
            this.opacity = 1;
            this.decay = 0.015 + Math.random() * 0.02;
            this.shape = Math.random() > 0.5 ? 'rect' : 'circle';
        }

        update() {
            this.x += this.speedX;
            this.y -= this.speedY;
            this.speedY -= 0.05;
            this.rotation += this.rotationSpeed;
            this.opacity -= this.decay;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;
            if (this.shape === 'rect') {
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    function spawnConfetti(x, y, count = 60) {
        for (let i = 0; i < count; i++) {
            confettiParticles.push(new ConfettiParticle(x, y));
        }
    }

    function animateConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiParticles = confettiParticles.filter(p => p.opacity > 0);
        confettiParticles.forEach(p => {
            p.update();
            p.draw(confettiCtx);
        });
        if (confettiParticles.length > 0) {
            requestAnimationFrame(animateConfetti);
        }
    }

    function triggerConfetti(x, y) {
        spawnConfetti(x, y, 70);
        if (confettiParticles.length === 70) {
            animateConfetti();
        }
    }

    // ========================
    // DATE & TIME (Shamsi)
    // ========================
    function toShamsi(date) {
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric', calendar: 'persian' };
            return new Intl.DateTimeFormat('fa-IR', options).format(date);
        } catch (e) {
            return date.toLocaleDateString('fa-IR');
        }
    }

    function updateDateTime() {
        const now = new Date();
        shamsiDateEl.textContent = '📅 ' + toShamsi(now);
        const timeStr = now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        liveClockEl.textContent = '🕐 ' + timeStr;
    }

    // ========================
    // STREAK & SCORE
    // ========================
    function loadStats() {
        try {
            const stored = localStorage.getItem('gang_focus_stats');
            if (stored) {
                const stats = JSON.parse(stored);
                streak = stats.streak || 0;
                totalScore = stats.totalScore || 0;
                todayStudySeconds = stats.todayStudySeconds || 0;
                const lastDate = stats.lastDate || '';
                const today = new Date().toDateString();
                const yesterday = new Date(Date.now() - 86400000).toDateString();
                if (lastDate !== today) {
                    if (lastDate === yesterday) {
                        streak += 1;
                    } else if (lastDate !== today) {
                        streak = 1;
                    }
                    todayStudySeconds = 0;
                }
            } else {
                streak = 1;
                totalScore = 0;
                todayStudySeconds = 0;
            }
        } catch (e) {
            streak = 1;
            totalScore = 0;
            todayStudySeconds = 0;
        }
        updateStatsUI();
    }

    function saveStats() {
        const stats = {
            streak: streak,
            totalScore: totalScore,
            todayStudySeconds: todayStudySeconds,
            lastDate: new Date().toDateString()
        };
        localStorage.setItem('gang_focus_stats', JSON.stringify(stats));
    }

    function updateStatsUI() {
        streakCountEl.textContent = streak;
        totalScoreEl.textContent = totalScore;
        const minutes = Math.floor(todayStudySeconds / 60);
        todayStudyTimeEl.textContent = minutes + ' دقیقه';
    }

    function addScore(points) {
        totalScore += points;
        saveStats();
        updateStatsUI();
    }

    function addStudyTime(seconds) {
        todayStudySeconds += seconds;
        saveStats();
        updateStatsUI();
    }

    // ========================
    // QUOTE FUNCTIONS
    // ========================
    function getRandomQuote() {
        return QUOTES[Math.floor(Math.random() * QUOTES.length)];
    }

    function updateQuote() {
        const quote = getRandomQuote();
        quoteTextEl.textContent = '"' + quote.text + '"';
        quoteAuthorEl.textContent = '— ' + quote.author;
    }

    // ========================
    // TIMER FUNCTIONS
    // ========================
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return mins + ':' + secs;
    }

    function updateTimerUI() {
        timerDisplay.textContent = formatTime(timerSeconds);
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        isTimerRunning = false;
        startPauseBtn.textContent = '▶ شروع';
    }

    function resetTimer() {
        stopTimer();
        timerSeconds = timerMode === 'study' ? STUDY_MINUTES * 60 : BREAK_MINUTES * 60;
        updateTimerUI();
    }

    function updateModeUI() {
        if (timerMode === 'study') {
            modeLabel.textContent = '📚 مطالعه';
            switchModeBtn.textContent = '🔄 استراحت';
        } else {
            modeLabel.textContent = '☕ استراحت';
            switchModeBtn.textContent = '🔄 مطالعه';
        }
    }

    function switchMode() {
        stopTimer();
        timerMode = timerMode === 'study' ? 'break' : 'study';
        updateModeUI();
        resetTimer();
    }

    function handleTimerComplete() {
        stopTimer();
        if (timerMode === 'study') {
            addStudyTime(STUDY_MINUTES * 60);
            addScore(10);
            pomodoroCycleCount++;
            if (autoPomodoro) {
                timerMode = 'break';
                updateModeUI();
                resetTimer();
                toggleTimer();
                return;
            }
        } else {
            if (autoPomodoro) {
                timerMode = 'study';
                updateModeUI();
                resetTimer();
                toggleTimer();
                return;
            }
        }
        alert(timerMode === 'study' ? '⏰ مطالعه تموم شد! برو استراحت.' : '☕ استراحت تموم شد! برگرد سر درس.');
    }

    function toggleTimer() {
        if (isTimerRunning) {
            stopTimer();
            return;
        }
        if (timerSeconds <= 0) {
            resetTimer();
        }
        isTimerRunning = true;
        startPauseBtn.textContent = '⏸ توقف';
        timerInterval = setInterval(function () {
            if (timerSeconds <= 0) {
                handleTimerComplete();
                return;
            }
            timerSeconds--;
            updateTimerUI();
        }, 1000);
    }

    // ========================
    // TASK FUNCTIONS
    // ========================
    function saveTasksToLocalStorage() {
        try {
            localStorage.setItem('gang_focus_tasks_v4', JSON.stringify(tasks));
        } catch (error) {
            console.error('خطا در ذخیره‌سازی:', error);
        }
    }

    function loadTasksFromLocalStorage() {
        try {
            const stored = localStorage.getItem('gang_focus_tasks_v4');
            if (stored) {
                tasks = JSON.parse(stored);
            } else {
                tasks = [
                    { id: Date.now() + 1, text: 'مطالعه ریاضی', completed: false },
                    { id: Date.now() + 2, text: 'تمرین برنامه‌نویسی', completed: false },
                    { id: Date.now() + 3, text: 'مرور فیزیک', completed: true }
                ];
                saveTasksToLocalStorage();
            }
        } catch (error) {
            console.error('خطا در بارگذاری:', error);
            tasks = [];
        }
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, function (m) { return map[m]; });
    }

    function renderTasks() {
        if (tasks.length === 0) {
            taskContainer.innerHTML = '<li class="empty-message">هنوز کاری اضافه نکردی 🧠</li>';
            taskCounterDisplay.textContent = '۰ کار';
            updateChart(0);
            return;
        }

        let html = '';
        tasks.forEach(function (task) {
            const checkedAttr = task.completed ? 'checked' : '';
            const completedClass = task.completed ? 'completed-task' : '';
            html += `
                <li class="task-item ${completedClass}" data-id="${task.id}">
                    <div class="task-left">
                        <input type="checkbox" class="task-checkbox" ${checkedAttr} data-id="${task.id}">
                        <span class="task-text">${escapeHtml(task.text)}</span>
                    </div>
                    <button class="delete-task" data-id="${task.id}">✕</button>
                </li>
            `;
        });

        taskContainer.innerHTML = html;

        const completedCount = tasks.filter(function (t) { return t.completed; }).length;
        taskCounterDisplay.textContent = completedCount + '/' + tasks.length + ' انجام شده';

        attachTaskEvents();
        updateChartFromTasks();
    }

    function attachTaskEvents() {
        const checkboxes = taskContainer.querySelectorAll('.task-checkbox');
        checkboxes.forEach(function (checkbox) {
            checkbox.addEventListener('change', function (event) {
                const taskId = Number(event.target.getAttribute('data-id'));
                const isChecked = event.target.checked;
                toggleTaskCompletion(taskId, isChecked);
                if (isChecked) {
                    addScore(5);
                    const rect = event.target.getBoundingClientRect();
                    triggerConfetti(rect.left + rect.width / 2, rect.top);
                }
            });
        });

        const deleteButtons = taskContainer.querySelectorAll('.delete-task');
        deleteButtons.forEach(function (button) {
            button.addEventListener('click', function (event) {
                const taskId = Number(event.target.getAttribute('data-id'));
                deleteTask(taskId);
            });
        });
    }

    function addTask(taskText) {
        const trimmedText = taskText.trim();
        if (!trimmedText) return;
        const newTask = {
            id: Date.now(),
            text: trimmedText,
            completed: false
        };
        tasks.push(newTask);
        saveTasksToLocalStorage();
        renderTasks();
        taskInput.value = '';
        taskInput.focus();
    }

    function toggleTaskCompletion(taskId, isCompleted) {
        const task = tasks.find(function (t) { return t.id === taskId; });
        if (task) {
            task.completed = isCompleted;
            saveTasksToLocalStorage();
            renderTasks();
            saveStats();
        }
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(function (t) { return t.id !== taskId; });
        saveTasksToLocalStorage();
        renderTasks();
    }

    // ========================
    // CHART FUNCTIONS
    // ========================
    function drawChart(percentage) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 68;
        const lineWidth = 15;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#1a1a38';
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        if (percentage > 0) {
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + (percentage / 100) * 2 * Math.PI;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            const gradient = ctx.createLinearGradient(20, 20, 140, 140);
            gradient.addColorStop(0, '#818cf8');
            gradient.addColorStop(1, '#c084fc');
            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        chartPercentLabel.textContent = Math.round(percentage) + '%';
    }

    function updateChart(percentage) {
        drawChart(percentage);
    }

    function updateChartFromTasks() {
        if (tasks.length === 0) {
            drawChart(0);
            return;
        }
        const completedCount = tasks.filter(function (t) { return t.completed; }).length;
        const percentage = (completedCount / tasks.length) * 100;
        drawChart(percentage);
    }

    // ========================
    // EVENT LISTENERS SETUP
    // ========================
    function setupEventListeners() {
        startPauseBtn.addEventListener('click', toggleTimer);
        resetBtn.addEventListener('click', resetTimer);
        switchModeBtn.addEventListener('click', switchMode);
        autoPomodoroCheck.addEventListener('change', function () {
            autoPomodoro = autoPomodoroCheck.checked;
        });
        addBtn.addEventListener('click', function () {
            addTask(taskInput.value);
        });
        taskInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                addTask(taskInput.value);
            }
        });
        window.addEventListener('resize', resizeConfettiCanvas);
    }

    // ========================
    // INITIALIZATION
    // ========================
    function init() {
        resizeConfettiCanvas();
        loadTasksFromLocalStorage();
        loadStats();
        renderTasks();
        updateQuote();
        updateModeUI();
        resetTimer();
        updateDateTime();
        setupEventListeners();
        setInterval(updateQuote, 40000);
        setInterval(updateDateTime, 1000);
        setInterval(saveStats, 10000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
