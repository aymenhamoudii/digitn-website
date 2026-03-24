document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('current-date');
    const greetingElement = document.getElementById('greeting');
    const themeToggle = document.getElementById('theme-toggle');
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const taskCount = document.getElementById('task-count');
    const quoteElement = document.getElementById('quote');
    const quoteAuthorElement = document.getElementById('quote-author');

    // State
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    // Initialize
    initClock();
    initTheme();
    renderTodos();
    updateGreeting();
    fetchQuote();

    // --- Clock & Date ---
    function initClock() {
        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            clockElement.textContent = `${hours}:${minutes}:${seconds}`;

            const options = { weekday: 'long', month: 'long', day: 'numeric' };
            dateElement.textContent = now.toLocaleDateString('en-US', options);
        };
        setInterval(updateClock, 1000);
        updateClock();
    }

    function updateGreeting() {
        const hours = new Date().getHours();
        let greeting = 'Good Morning';
        if (hours >= 12 && hours < 17) greeting = 'Good Afternoon';
        else if (hours >= 17) greeting = 'Good Evening';
        greetingElement.textContent = greeting;
    }

    // --- Theme Management ---
    function initTheme() {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    // --- Todo List ---
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            const newTodo = {
                id: Date.now(),
                text,
                completed: false
            };
            todos.push(newTodo);
            saveTodos();
            renderTodos();
            todoInput.value = '';
        }
    });

    function deleteTodo(id) {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
    }

    function toggleTodo(id) {
        todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        saveTodos();
        renderTodos();
    }

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function renderTodos() {
        todoList.innerHTML = '';
        const activeCount = todos.filter(t => !t.completed).length;
        taskCount.textContent = `${activeCount} Active`;

        if (todos.length === 0) {
            todoList.innerHTML = `
                <li class="text-center py-8 text-slate-400 dark:text-slate-500 italic">
                    No tasks yet. Add one above!
                </li>
            `;
            return;
        }

        todos.sort((a, b) => a.completed - b.completed).forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 group hover:shadow-md transition-all`;
            
            li.innerHTML = `
                <div class="flex items-center space-x-3">
                    <button onclick="toggleTodo(${todo.id})" class="w-6 h-6 rounded-full border-2 border-indigo-400 flex items-center justify-center transition-colors ${todo.completed ? 'bg-indigo-500 border-indigo-500' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}">
                        ${todo.completed ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                    </button>
                    <span class="text-slate-700 dark:text-slate-200 ${todo.completed ? 'completed-task' : ''}">${todo.text}</span>
                </div>
                <button onclick="deleteTodo(${todo.id})" class="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                    <i class="fas fa-trash-alt"></i>
                </button>
            `;
            todoList.appendChild(li);
        });
    }

    // Expose functions to window for inline onclick handlers
    window.toggleTodo = toggleTodo;
    window.deleteTodo = deleteTodo;

    // --- Quotes ---
    const quotes = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
        { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
        { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
        { text: "Quality is not an act, it is a habit.", author: "Aristotle" }
    ];

    function fetchQuote() {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteElement.textContent = `"${randomQuote.text}"`;
        quoteAuthorElement.textContent = `— ${randomQuote.author}`;
    }
});
