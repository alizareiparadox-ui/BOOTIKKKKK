// ==============================
// GANG FOCUS APP - Main Script
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
        { text: "برای رسیدن به قله‌ها، توقف ممنوع.", author: "ناشناس" }
    ];

    // ========================
    // DOM ELEMENTS
    // ========================
    const quoteTextEl = document.getElementById('quoteText');
    const quoteAuthorEl = document.getElementById('quoteAuthor');
    const timerDisplay = document.getElementById('timerDisplay');
    const modeLabel = document.getElementById('modeLabel');
    const startPauseBtn = document.getElementById('startPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const switchModeBtn = document.getElementById('switchModeBtn');
    const taskInput = document.getElementById('taskInputField');
    const addBtn = document.getElementById('addTaskButton');
    const taskContainer = document.getElementById('taskListContainer');
    const taskCounterDisplay = document.getElementById('taskCounterDisplay');
    const canvas = document.getElementById('progressCanvas');
    const ctx = canvas.getContext('2d');
    const chartPercentLabel = document.getElementById('chartPercentLabel');

    // ========================
    // STATE
    // ========================
    let tasks = [];
    let timerInterval = null;
    let timerSeconds = 25 * 60;
    let isTimerRunning = false;
    let timerMode = 'study'; // 'study' | 'break'

    const STUDY_MINUTES = 25;
    const BREAK_MINUTES = 5;

    // ========================
    // QUOTE FUNCTIONS
    // ========================
    function getRandomQuote() {
        const randomIndex = Math.floor(Math.random() * QUOTES.length);
        return QUOTES[randomIndex];
    }

    function updateQuote() {
        const quote = getRandomQuote();
        quoteTextEl.textContent = `"${quote.text}"`;
        quoteAuthorEl.textContent = `— ${quote.author}`;
    }

    // ========================
    // TIMER FUNCTIONS
    // ========================
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
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

    function toggleTimer() {
        if (isTimerRunning) {
            // توقف تایمر
            stopTimer();
            return;
        }

        // شروع تایمر
        if (timerSeconds <= 0) {
            resetTimer();
        }

        isTimerRunning = true;
        startPauseBtn.textContent = '⏸ توقف';

        timerInterval = setInterval(function () {
            if (timerSeconds <= 0) {
                stopTimer();
                alert(timerMode === 'study' ? '⏰ مطالعه تموم شد! برو استراحت.' : '☕ استراحت تموم شد! برگرد سر درس.');
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
            localStorage.setItem('gang_focus_tasks_v3', JSON.stringify(tasks));
        } catch (error) {
            console.error('خطا در ذخیره‌سازی:', error);
        }
    }

    function loadTasksFromLocalStorage() {
        try {
            const stored = localStorage.getItem('gang_focus_tasks_v3');
            if (stored) {
                tasks = JSON.parse(stored);
            } else {
                // کارهای پیش‌فرض
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
        taskCounterDisplay.textContent = `${completedCount}/${tasks.length} انجام شده`;

        // Attach event listeners
        attachTaskEvents();
        updateChartFromTasks();
    }

    function attachTaskEvents() {
        // Checkbox events
        const checkboxes = taskContainer.querySelectorAll('.task-checkbox');
        checkboxes.forEach(function (checkbox) {
            checkbox.addEventListener('change', function (event) {
                const taskId = Number(event.target.getAttribute('data-id'));
                toggleTaskCompletion(taskId, event.target.checked);
            });
        });

        // Delete button events
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
        if (!trimmedText) {
            return;
        }

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

        // Background circle
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
        // Timer events
        startPauseBtn.addEventListener('click', toggleTimer);
        resetBtn.addEventListener('click', resetTimer);
        switchModeBtn.addEventListener('click', switchMode);

        // Task events
        addBtn.addEventListener('click', function () {
            addTask(taskInput.value);
        });

        taskInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                addTask(taskInput.value);
            }
        });
    }

    // ========================
    // INITIALIZATION
    // ========================
    function init() {
        loadTasksFromLocalStorage();
        renderTasks();
        updateQuote();
        updateModeUI();
        resetTimer();
        setupEventListeners();

        // Auto-update quote every 40 seconds
        setInterval(updateQuote, 40000);
    }

    // Start the app when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
