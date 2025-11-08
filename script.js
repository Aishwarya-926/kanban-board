document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    let tasks = {
        todo: [],
        inprogress: [],
        done: []
    };
    let draggedTask = null;

    // --- Selectors ---
    const columns = document.querySelectorAll('.kanban-column');
    const modal = document.getElementById('add-task-modal');
    const taskForm = document.getElementById('add-task-form');
    const cancelBtn = document.getElementById('cancel-btn');

    // --- Persistence Functions ---
    const saveTasks = () => localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
    const loadTasks = () => {
        const storedTasks = localStorage.getItem('kanbanTasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    };

    // --- Core Render Function ---
    const renderBoard = () => {
        // Clear all columns
        document.querySelectorAll('.tasks-container').forEach(container => container.innerHTML = '');

        // Re-populate columns from the state object
        Object.keys(tasks).forEach(columnKey => {
            const columnContainer = document.querySelector(`.kanban-column[data-column="${columnKey}"] .tasks-container`);
            tasks[columnKey].forEach(task => {
                const taskCard = createTaskCard(task);
                columnContainer.appendChild(taskCard);
            });
        });
    };

    const createTaskCard = (task) => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.dataset.id = task.id;
        card.dataset.priority = task.priority;
        card.draggable = true;

        const text = document.createElement('p');
        text.textContent = task.text;
        card.appendChild(text);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete-btn';
        deleteBtn.innerHTML = '&times;';
        card.appendChild(deleteBtn);

        return card;
    };
    
    // --- Event Handlers ---
    
    // Modal Handling
    columns.forEach(column => {
        const addTaskBtn = column.querySelector('.add-task-btn');
        addTaskBtn.addEventListener('click', () => {
            modal.dataset.column = column.dataset.column;
            modal.classList.remove('hidden');
            taskForm.querySelector('textarea').focus();
        });
    });

    cancelBtn.addEventListener('click', () => modal.classList.add('hidden'));

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const columnKey = modal.dataset.column;
        const taskText = taskForm.querySelector('textarea').value.trim();
        const taskPriority = taskForm.querySelector('select').value;

        if (taskText) {
            const newTask = { id: `task-${Date.now()}`, text: taskText, priority: taskPriority };
            tasks[columnKey].push(newTask);
            saveTasks();
            renderBoard();
            taskForm.reset();
            modal.classList.add('hidden');
        }
    });

    // Delegated Event Handlers for Tasks (Delete, Edit, Drag)
    document.querySelector('.kanban-board').addEventListener('click', (e) => {
        if (e.target.classList.contains('task-delete-btn')) {
            const card = e.target.closest('.task-card');
            const taskId = card.dataset.id;
            const columnKey = card.closest('.kanban-column').dataset.column;
            tasks[columnKey] = tasks[columnKey].filter(task => task.id !== taskId);
            saveTasks();
            renderBoard();
        }
    });

    document.querySelector('.kanban-board').addEventListener('dblclick', (e) => {
        if (e.target.tagName === 'P' && e.target.closest('.task-card')) {
            const card = e.target.closest('.task-card');
            const textElement = e.target;
            const originalText = textElement.textContent;
            
            const input = document.createElement('textarea');
            input.className = 'edit-task-input';
            input.value = originalText;
            
            card.replaceChild(input, textElement);
            input.focus();

            const saveEdit = () => {
                const newText = input.value.trim();
                const taskId = card.dataset.id;
                const columnKey = card.closest('.kanban-column').dataset.column;
                
                const taskToUpdate = tasks[columnKey].find(task => task.id === taskId);
                if (taskToUpdate) {
                    taskToUpdate.text = newText || originalText;
                    saveTasks();
                    renderBoard();
                }
            };
            input.addEventListener('blur', saveEdit);
            input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') input.blur(); });
        }
    });

    // Drag and Drop
    document.querySelector('.kanban-board').addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('task-card')) {
            draggedTask = e.target;
            e.target.classList.add('dragging');
        }
    });

    document.querySelector('.kanban-board').addEventListener('dragend', (e) => {
        if (e.target.classList.contains('task-card')) {
            draggedTask.classList.remove('dragging');
            draggedTask = null;
        }
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (draggedTask) column.querySelector('.tasks-container').classList.add('drag-over');
        });
        column.addEventListener('dragleave', () => {
            column.querySelector('.tasks-container').classList.remove('drag-over');
        });
        column.addEventListener('drop', (e) => {
            e.preventDefault();
            const columnContainer = column.querySelector('.tasks-container');
            columnContainer.classList.remove('drag-over');

            if (draggedTask) {
                const fromColumnKey = draggedTask.closest('.kanban-column').dataset.column;
                const toColumnKey = column.dataset.column;
                const taskId = draggedTask.dataset.id;

                const taskIndex = tasks[fromColumnKey].findIndex(t => t.id === taskId);
                const [taskObject] = tasks[fromColumnKey].splice(taskIndex, 1);
                
                tasks[toColumnKey].push(taskObject);
                saveTasks();
                renderBoard();
            }
        });
    });

    // --- Initial Load ---
    loadTasks();
    renderBoard();
});
