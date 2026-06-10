// ==============================
// GANG FOCUS PRO - Ultimate JS
// ==============================
(function () {
    'use strict';

    // ======================== DATA ========================
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

    // ======================== DOM ELEMENTS ========================
    const $ = (id) => document.getElementById(id);
    const shamsiDateEl = $('shamsiDate');
    const liveClockEl = $('liveClock');
    const weatherInfoEl = $('weatherInfo');
    const streakCountEl = $('streakCount');
    const totalScoreEl = $('totalScore');
    const todayStudyTimeEl = $('todayStudyTime');
    const weeklyGoalEl = $('weeklyGoal');
    const quoteTextEl = $('quoteText');
    const quoteAuthorEl = $('quoteAuthor');
    const timerDisplay = $('timerDisplay');
    const modeLabel = $('modeLabel');
    const timerSessions = $('timerSessions');
    const startPauseBtn = $('startPauseBtn');
    const resetBtn = $('resetBtn');
    const switchModeBtn = $('switchModeBtn');
    const skipBtn = $('skipBtn');
    const autoPomodoroCheck = $('autoPomodoroCheck');
    const sessionCountSelect = $('sessionCount');
    const taskInput2 = $('taskInputField2');
    const prioritySelect = $('prioritySelect');
    const deadlineInput = $('deadlineInput');
    const addBtn2 = $('addTaskButton2');
    const taskContainer2 = $('taskListContainer2');
    const taskCounterDisplay2 = $('taskCounterDisplay2');
    const canvas = $('progressCanvas');
    const ctx = canvas.getContext('2d');
    const chartPercentLabel = $('chartPercentLabel');
    const barChartCanvas = $('barChartCanvas');
    const barCtx = barChartCanvas.getContext('2d');
    const confettiCanvas = $('confettiCanvas');
    const confettiCtx = confettiCanvas.getContext('2d');
    const notification = $('notification');
    const sidebar = $('sidebar');
    const overlay = $('overlay');
    const menuToggle = $('menuToggle');
    const sidebarClose = $('sidebarClose');
    const dailyNote = $('dailyNote');
    const noteSavedIndicator = $('noteSavedIndicator');
    const historyList = $('historyList');
    const totalStudyHoursEl = $('totalStudyHours');
    const totalCompletedTasksEl = $('totalCompletedTasks');
    const bestStreakEl = $('bestStreak');
    const activeDaysEl = $('activeDays');

    // ======================== STATE ========================
    let tasks = [];
    let timerInterval = null;
    let timerSeconds = 25 * 60;
    let isTimerRunning = false;
    let timerMode = 'study';
    let autoPomodoro = true;
    let maxSessions = 4;
    let currentSession = 0;
    let todayStudySeconds = 0;
    let streak = 0;
    let totalScore = 0;
    let bestStreak = 0;
    let activeDays = 0;
    let totalCompletedTasks = 0;
    let totalStudySecondsAll = 0;
    let weeklyGoalHours = 10;
    let studyMinutes = 25;
    let breakMinutes = 5;
    let currentFilter = 'all';
    let confettiParticles = [];
    let historyLog = [];
    let weeklyData = [0, 0, 0, 0, 0, 0, 0];

    // ======================== CONFETTI ========================
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
            if (this.shape === 'rect') ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
            else { ctx.beginPath(); ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2); ctx.fill(); }
            ctx.restore();
        }
    }

    function spawnConfetti(x, y, count = 60) {
        for (let i = 0; i < count; i++) confettiParticles.push(new ConfettiParticle(x, y));
    }

    function animateConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiParticles = confettiParticles.filter(p => p.opacity > 0);
        confettiParticles.forEach(p => { p.update(); p.draw(confettiCtx); });
        if (confettiParticles.length > 0) requestAnimationFrame(animateConfetti);
    }

    function triggerConfetti(x, y) {
        spawnConfetti(x, y, 70);
        if (confettiParticles.length === 70) animateConfetti();
    }

    // ======================== NOTIFICATION ========================
    function showNotification(msg, duration = 3000) {
        notification.textContent = msg;
        notification.classList.add('show');
        setTimeout(() => notification.classList.remove('show'), duration);
    }

    // ======================== DATE & WEATHER ========================
    function toShamsi(date) {
        try { return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', calendar: 'persian' }).format(date); }
        catch (e) { return date.toLocaleDateString('fa-IR'); }
    }

    function updateDateTime() {
        const now = new Date();
        shamsiDateEl.textContent = '📅 ' + toShamsi(now);
        liveClockEl.textContent = '🕐 ' + now.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    async function fetchWeather() {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=35.6892&longitude=51.3890&current_weather=true');
            const data = await res.json();
            const temp = data.current_weather.temperature;
            const code = data.current_weather.weathercode;
            const icons = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 51: '🌧️', 61: '🌧️', 71: '🌨️', 95: '⛈️' };
            weatherInfoEl.textContent = (icons[code] || '🌤️') + ' ' + temp + '°';
        } catch (e) { weatherInfoEl.textContent = '🌤️ --°'; }
    }

    // ======================== STATS ========================
    function loadAllData() {
        try {
            const stats = JSON.parse(localStorage.getItem('gang_focus_stats_v2') || '{}');
            streak = stats.streak || 0;
            totalScore = stats.totalScore || 0;
            todayStudySeconds = stats.todayStudySeconds || 0;
            bestStreak = stats.bestStreak || 0;
            activeDays = stats.activeDays || 0;
            totalCompletedTasks = stats.totalCompletedTasks || 0;
            totalStudySecondsAll = stats.totalStudySecondsAll || 0;
            weeklyGoalHours = stats.weeklyGoalHours || 10;
            studyMinutes = stats.studyMinutes || 25;
            breakMinutes = stats.breakMinutes || 5;
            weeklyData = stats.weeklyData || [0, 0, 0, 0, 0, 0, 0];
            historyLog = stats.historyLog || [];

            const lastDate = stats.lastDate || '';
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            if (lastDate !== today) {
                if (lastDate === yesterday) streak += 1;
                else if (lastDate !== today) streak = 1;
                todayStudySeconds = 0;
                if (!lastDate) activeDays += 1;
                else if (lastDate !== today) activeDays += 1;
                if (streak > bestStreak) bestStreak = streak;
            }

            tasks = JSON.parse(localStorage.getItem('gang_focus_tasks_v5') || '[]');
            if (tasks.length === 0) {
                tasks = [
                    { id: Date.now() + 1, text: 'مطالعه ریاضی', completed: false, priority: 'high', deadline: '' },
                    { id: Date.now() + 2, text: 'تمرین برنامه‌نویسی', completed: false, priority: 'medium', deadline: '' },
                    { id: Date.now() + 3, text: 'مرور فیزیک', completed: true, priority: 'low', deadline: '' }
                ];
            }

            dailyNote.value = localStorage.getItem('gang_focus_note') || '';
        } catch (e) {
            streak = 1; totalScore = 0; todayStudySeconds = 0; bestStreak = 1; activeDays = 1;
            tasks = [];
        }
        updateStatsUI();
    }

    function saveAllData() {
        localStorage.setItem('gang_focus_stats_v2', JSON.stringify({
            streak, totalScore, todayStudySeconds, bestStreak, activeDays,
            totalCompletedTasks, totalStudySecondsAll, weeklyGoalHours,
            studyMinutes, breakMinutes, weeklyData, historyLog,
            lastDate: new Date().toDateString()
        }));
        localStorage.setItem('gang_focus_tasks_v5', JSON.stringify(tasks));
    }

    function updateStatsUI() {
        streakCountEl.textContent = streak;
        totalScoreEl.textContent = totalScore;
        todayStudyTimeEl.textContent = Math.floor(todayStudySeconds / 60) + ' دقیقه';
        const weekSec = weeklyData.reduce((a, b) => a + b, 0);
        const goalSec = weeklyGoalHours * 3600;
        weeklyGoalEl.textContent = Math.min(100, Math.round((weekSec / goalSec) * 100)) + '%';
        totalStudyHoursEl.textContent = Math.floor(totalStudySecondsAll / 3600) + ' ساعت';
        totalCompletedTasksEl.textContent = totalCompletedTasks;
        bestStreakEl.textContent = bestStreak + ' روز';
        activeDaysEl.textContent = activeDays + ' روز';
        updateHistoryUI();
    }

    function addScore(points) {
        totalScore += points;
        saveAllData();
        updateStatsUI();
    }

    function addStudyTime(seconds) {
        todayStudySeconds += seconds;
        totalStudySecondsAll += seconds;
        const today = new Date().getDay();
        weeklyData[today] = (weeklyData[today] || 0) + seconds;
        historyLog.unshift({ time: new Date().toLocaleTimeString('fa-IR'), action: `📚 ${Math.floor(seconds / 60)} دقیقه مطالعه`, type: 'study' });
        if (historyLog.length > 100) historyLog.length = 100;
        saveAllData();
        updateStatsUI();
        drawBarChart();
    }

    function updateHistoryUI() {
        historyList.innerHTML = '<h4>📜 تاریخچه امروز</h4>' + historyLog.slice(0, 20).map(h =>
            `<div class="history-item"><span>${h.action}</span><span>${h.time}</span></div>`
        ).join('');
    }

    // ======================== QUOTE ========================
    function updateQuote() {
        const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
        quoteTextEl.textContent = '"' + q.text + '"';
        quoteAuthorEl.textContent = '— ' + q.author;
    }

    function copyQuote() {
        navigator.clipboard.writeText(quoteTextEl.textContent + ' ' + quoteAuthorEl.textContent);
        showNotification('📋 نقل قول کپی شد!');
    }

    function shareQuote() {
        if (navigator.share) {
            navigator.share({ title: 'نقل قول انگیزشی', text: quoteTextEl.textContent + ' ' + quoteAuthorEl.textContent });
        } else {
            copyQuote();
        }
    }

    // ======================== TIMER ========================
    function formatTime(seconds) {
        return Math.floor(seconds / 60).toString().padStart(2, '0') + ':' + (seconds % 60).toString().padStart(2, '0');
    }

    function updateTimerUI() {
        timerDisplay.textContent = formatTime(timerSeconds);
        timerSessions.textContent = `جلسه ${currentSession} از ${maxSessions}`;
    }

    function stopTimer() {
        if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        isTimerRunning = false;
        startPauseBtn.textContent = '▶ شروع';
    }

    function resetTimer() {
        stopTimer();
        timerSeconds = timerMode === 'study' ? studyMinutes * 60 : breakMinutes * 60;
        updateTimerUI();
    }

    function updateModeUI() {
        modeLabel.textContent = timerMode === 'study' ? '📚 مطالعه' : '☕ استراحت';
        switchModeBtn.textContent = timerMode === 'study' ? '🔄 استراحت' : '🔄 مطالعه';
    }

    function switchMode() {
        stopTimer();
        timerMode = timerMode === 'study' ? 'break' : 'study';
        updateModeUI();
        resetTimer();
    }

    function playSound() {
        try {
            const soundType = $('notificationSound')?.value || 'beep';
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            if (soundType === 'bell') { osc.frequency.value = 1000; osc.type = 'sine'; }
            else if (soundType === 'chime') { osc.frequency.value = 1200; osc.type = 'triangle'; }
            else { osc.frequency.value = 800; osc.type = 'square'; }
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch (e) { }
    }

    function handleTimerComplete() {
        stopTimer();
        playSound();
        if (timerMode === 'study') {
            addStudyTime(studyMinutes * 60);
            addScore(10);
            currentSession++;
            updateTimerUI();
            if (autoPomodoro && currentSession < maxSessions) {
                timerMode = 'break';
                updateModeUI();
                resetTimer();
                toggleTimer();
                showNotification('☕ وقت استراحت!');
                return;
            } else if (currentSession >= maxSessions) {
                showNotification('🎉 همه جلسات تموم شد!');
                currentSession = 0;
                updateTimerUI();
                return;
            }
        } else {
            if (autoPomodoro) {
                timerMode = 'study';
                updateModeUI();
                resetTimer();
                toggleTimer();
                showNotification('📚 برگرد سر درس!');
                return;
            }
        }
        showNotification(timerMode === 'study' ? '⏰ مطالعه تموم شد!' : '☕ استراحت تموم شد!');
    }

    function toggleTimer() {
        if (isTimerRunning) { stopTimer(); return; }
        if (timerSeconds <= 0) resetTimer();
        isTimerRunning = true;
        startPauseBtn.textContent = '⏸ توقف';
        timerInterval = setInterval(() => {
            if (timerSeconds <= 0) { handleTimerComplete(); return; }
            timerSeconds--;
            updateTimerUI();
        }, 1000);
    }

    function skipSession() {
        stopTimer();
        handleTimerComplete();
    }

    // ======================== TASKS ========================
    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
    }

    function getFilteredTasks() {
        if (currentFilter === 'all') return tasks;
        if (currentFilter === 'active') return tasks.filter(t => !t.completed);
        if (currentFilter === 'completed') return tasks.filter(t => t.completed);
        return tasks.filter(t => t.priority === currentFilter);
    }

    function renderTasks() {
        const filtered = getFilteredTasks();
        if (filtered.length === 0) {
            taskContainer2.innerHTML = '<li class="empty-message">هنوز کاری اضافه نکردی 🧠</li>';
        } else {
            taskContainer2.innerHTML = filtered.map(task => {
                const checkedAttr = task.completed ? 'checked' : '';
                const completedClass = task.completed ? 'completed-task' : '';
                const deadlineStr = task.deadline ? '⏰ ' + task.deadline : '';
                return `
                    <li class="task-item ${completedClass} priority-${task.priority}" data-id="${task.id}">
                        <div class="task-left">
                            <input type="checkbox" class="task-checkbox" ${checkedAttr} data-id="${task.id}">
                            <span class="task-text">${escapeHtml(task.text)}</span>
                        </div>
                        <div class="task-meta">
                            <span>${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}</span>
                            <span>${deadlineStr}</span>
                        </div>
                        <button class="delete-task" data-id="${task.id}">✕</button>
                    </li>
                `;
            }).join('');
        }
        const completedCount = tasks.filter(t => t.completed).length;
        taskCounterDisplay2.textContent = completedCount + '/' + tasks.length + ' انجام شده';
        attachTaskEvents();
        updateChartFromTasks();
    }

    function attachTaskEvents() {
        taskContainer2.querySelectorAll('.task-checkbox').forEach(cb => {
            cb.addEventListener('change', function (e) {
                const id = Number(e.target.dataset.id);
                const task = tasks.find(t => t.id === id);
                if (task) {
                    task.completed = e.target.checked;
                    if (task.completed) {
                        totalCompletedTasks++;
                        addScore(5);
                        const rect = e.target.getBoundingClientRect();
                        triggerConfetti(rect.left + rect.width / 2, rect.top);
                        historyLog.unshift({ time: new Date().toLocaleTimeString('fa-IR'), action: `✅ ${task.text}`, type: 'task' });
                    }
                    saveAllData();
                    renderTasks();
                }
            });
        });
        taskContainer2.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', function (e) {
                const id = Number(e.target.dataset.id);
                tasks = tasks.filter(t => t.id !== id);
                saveAllData();
                renderTasks();
            });
        });
    }

    function addTask(text, priority, deadline) {
        const trimmed = text.trim();
        if (!trimmed) return;
        tasks.push({ id: Date.now(), text: trimmed, completed: false, priority: priority || 'medium', deadline: deadline || '' });
        saveAllData();
        renderTasks();
        taskInput2.value = '';
        taskInput2.focus();
        showNotification('✅ کار اضافه شد!');
    }

    // ======================== CHARTS ========================
    function drawChart(percentage) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2, cy = canvas.height / 2, r = 68, lw = 15;
        ctx.beginPath(); ctx
