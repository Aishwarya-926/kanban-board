document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const tasksContainers = document.querySelectorAll('.tasks-container');
    const addTaskBtns = document.querySelectorAll('.add-task-btn');
    const modal = document.getElementById('add-task-modal');
    const taskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const cancelBtn = document.getElementById('cancel-btn');

    let currentColumn = null;
    let draggedTask = null;

    // --- Task Creation ---

    function createTaskCard(text) {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.draggable = true;
        card.textContent = text;
        return card;
    }

    // --- Modal Handling ---

    addTaskBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentColumn = btn.dataset.column;
            modal.classList.remove('hidden');
            taskInput.focus();
        });
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        taskForm.reset();
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = taskInput.value.trim();
        if (taskText) {
            const newTask = createTaskCard(taskText);
            const targetContainer = document.querySelector(`.tasks-container[data-column="${currentColumn}"]`);
            targetContainer.appendChild(newTask);
            modal.classList.add('hidden');
            taskForm.reset();
        }
    });


    // --- Drag and Drop API ---

    // Using event delegation on the parent containers
    tasksContainers.forEach(container => {
        // Fired when a drag starts on a task card
        container.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                draggedTask = e.target;
                e.target.classList.add('dragging');
            }
        });

        // Fired when a drag ends (dropped or cancelled)
        container.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-card')) {
                draggedTask = null;
                e.target.classList.remove('dragging');
            }
        });

        // Fired continuously as an item is dragged over a column
        container.addEventListener('dragover', (e) => {
            e.preventDefault(); // This is crucial to allow a drop
            const isTaskCard = draggedTask !== null;
            if (isTaskCard) {
                container.classList.add('drag-over');
            }
        });

        // Fired when an item leaves a potential drop target
        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });

        // Fired when an item is dropped on a column
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggedTask) {
                container.appendChild(draggedTask);
                container.classList.remove('drag-over');
            }
        });
    });
});
