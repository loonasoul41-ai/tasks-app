// Task Manager Application
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.render();
    }

    setupEventListeners() {
        // Form submission
        const form = document.getElementById('taskForm');
        form.addEventListener('submit', (e) => this.handleAddTask(e));

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilter(e));
        });

        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Close menu when link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu?.classList.remove('active');
            });
        });

        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    handleAddTask(e) {
        e.preventDefault();

        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDesc').value.trim();
        const category = document.getElementById('taskCategory').value;
        const deadline = document.getElementById('taskDeadline').value;

        if (!title) {
            alert('Пожалуйста, введите название задания!');
            return;
        }

        const task = {
            id: Date.now(),
            title,
            description,
            category,
            deadline,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.render();

        // Reset form
        document.getElementById('taskForm').reset();
    }

    handleFilter(e) {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.currentFilter = e.target.dataset.filter;
        this.render();
    }

    getFilteredTasks() {
        if (this.currentFilter === 'all') {
            return this.tasks;
        }
        return this.tasks.filter(task => task.status === this.currentFilter);
    }

    deleteTask(id) {
        if (confirm('Вы уверены, что хотите удалить это задание?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    updateTaskStatus(id, newStatus) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.status = newStatus;
            this.saveTasks();
            this.render();
        }
    }

    updateStats() {
        const total = this.tasks.length;
        const pending = this.tasks.filter(t => t.status === 'pending').length;
        const inProgress = this.tasks.filter(t => t.status === 'in-progress').length;
        const completed = this.tasks.filter(t => t.status === 'completed').length;
        const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('pendingTasks').textContent = inProgress;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('completionRate').textContent = completionRate + '%';
    }

    render() {
        const filteredTasks = this.getFilteredTasks();
        const tasksList = document.getElementById('tasksList');

        if (filteredTasks.length === 0) {
            tasksList.innerHTML = `
                <div style="grid-column: 1 / -1;" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>Нет заданий</h3>
                    <p>Добавьте ваше первое задание, чтобы начать!</p>
                </div>
            `;
        } else {
            tasksList.innerHTML = filteredTasks.map(task => `
                <div class="task-card ${task.status === 'completed' ? 'completed' : ''}">
                    <div class="task-header">
                        <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                        <span class="task-category ${task.category}">${this.getCategoryLabel(task.category)}</span>
                    </div>
                    ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                    ${task.deadline ? `<div class="task-deadline"><i class="fas fa-calendar"></i> ${new Date(task.deadline).toLocaleDateString('ru-RU')}</div>` : ''}
                    <div class="task-status">
                        <span class="status-badge ${task.status}">${this.getStatusLabel(task.status)}</span>
                    </div>
                    <div class="task-actions">
                        ${task.status !== 'in-progress' ? `
                            <button class="task-btn task-btn-start" onclick="taskManager.updateTaskStatus(${task.id}, 'in-progress')">
                                <i class="fas fa-play"></i> Начать
                            </button>
                        ` : ''}
                        ${task.status !== 'completed' ? `
                            <button class="task-btn task-btn-complete" onclick="taskManager.updateTaskStatus(${task.id}, 'completed')">
                                <i class="fas fa-check"></i> Готово
                            </button>
                        ` : ''}
                        <button class="task-btn task-btn-delete" onclick="taskManager.deleteTask(${task.id})">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                </div>
            `).join('');
        }

        this.updateStats();
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'К выполнению',
            'in-progress': 'В процессе',
            'completed': 'Готово'
        };
        return labels[status] || status;
    }

    getCategoryLabel(category) {
        const labels = {
            'work': 'Работа',
            'study': 'Учеба',
            'personal': 'Личное',
            'health': 'Здоровье'
        };
        return labels[category] || category;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [
            {
                id: 1,
                title: 'Изучить основы JavaScript',
                description: 'Пройти курс по основам JS',
                category: 'study',
                deadline: '2024-09-15',
                status: 'in-progress',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Завершить проект сайта',
                description: 'Создать сайт управления задачами',
                category: 'work',
                deadline: '2024-09-20',
                status: 'in-progress',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: 'Тренировка в спортзале',
                description: 'Кардио + силовая тренировка',
                category: 'health',
                deadline: '2024-08-30',
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        ];
    }
}

// Initialize the app
const taskManager = new TaskManager();