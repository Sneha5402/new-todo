// Select elements
const inputText = document.querySelector("#txt");
const todoitem = document.querySelector(".todo-item ul");
const error = document.querySelector(".error");
const allFilter = document.querySelector("#all");
const assignedFilter = document.querySelector("#assigned");
const completedFilter = document.querySelector("#completed");
const clearBtn = document.querySelector(".clear-btn");
const noTasksMessage = document.querySelector(".no-tasks");

// Load tasks from local storage on page load
document.addEventListener("DOMContentLoaded", loadTasksFromLocalStorage);

// Add task on button click
document.querySelector('.text-btn').addEventListener('click', addtask);

// Event listener to add task on Enter key press
inputText.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        addtask();
    }
    else {
        return;
    }
});

// Add task function
function addtask() {
    if (inputText.value.trim() === '') {
        displayMessage("Task cannot be empty. Please enter a valid task.", "red");
    } else {
        displayMessage("Task added successfully.", "green");

        // Create task object
        const task = {
            text: inputText.value,
            completed: false
        };

        saveTaskToLocalStorage(task);

        createTaskElement(task);

        inputText.value = '';

        updateCounts();

        setActiveFilter(allFilter);
        filterTasks('all');
    }
}

// Function to display error messages
function displayMessage(message, color) {
    error.style.visibility = 'visible';
    error.style.color = color;
    error.textContent = message;
    setTimeout(() => {
        error.style.visibility = 'hidden';
    }, 3000);
}

// Create task function
function createTaskElement(task, updateCounts = window.updateCounts, applyCurrentFilter = window.applyCurrentFilter) {
    let li = document.createElement("li");
    li.innerHTML = `<span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                    <div class="button">
                        <button class="complete-btn" type="button">
                            <i class="fas ${task.completed ? 'fa-check completed' : 'fa-check'}"></i>
                        </button>
                        <button class="edit" type="button">
                            <i class="far fa-edit"></i>
                        </button>
                        <button class="edit-btn" type="button">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>`;
    todoitem.appendChild(li);
    updateCounts();

    // Add event listeners for the new buttons
    li.querySelector('.complete-btn').addEventListener('click', updateTaskStatus);
    li.querySelector('.edit').addEventListener('click', editTask);
    li.querySelector('.edit-btn').addEventListener('click', deleteTask);

    // Apply the current filter to the new task
    applyCurrentFilter();
}

// Edit task function
function editTask(event) {
    const li = event.target.closest('li');
    const taskText = li.querySelector('.task-text');
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.value = taskText.textContent;
    taskText.replaceWith(inputField);

    const saveEditedTask = () => {
        const newValue = inputField.value.trim();
        if (newValue === '') {
            displayMessage("Task cannot be empty. Please enter a valid task.", "red");
            inputField.replaceWith(taskText);
        }
        else {
            taskText.textContent = newValue;
            inputField.replaceWith(taskText);
            taskText.classList.add('edited');
            displayMessage("Task updated successfully.", "green");
            updateTaskInLocalStorage();
            updateCounts();
        }

        const tasks = todoitem.querySelectorAll('li');
        tasks.forEach(task => {
            if (task !== li) {
                task.style.filter = 'none'; // Remove blur effect
            }
        });
    };

    const tasks = todoitem.querySelectorAll('li');
    tasks.forEach(task => {
        if (task !== li) {
            task.style.filter = 'blur(3px)'; // Apply blur effect to other tasks
        }
    });

    inputField.addEventListener('blur', saveEditedTask);

    inputField.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            saveEditedTask();
        }
        else {
            return;
        }
    });

    inputField.focus();
}

function deleteTask(event) {
    const li = event.target.closest('li');
    const taskName = li.querySelector('.task-text').textContent; // Extract task name

    if (confirm(`Are you sure you want to delete the task: "${taskName}"?`)) {
        li.remove();
        updateTaskInLocalStorage();
        updateCounts();
    }
    else {
        return;
    }
    displayMessage("Task has been deleted.", "green");
}

// Update task status
function updateTaskStatus(event) {
    const li = event.target.closest('li');
    const taskText = li.querySelector('.task-text');
    const completeBtn = li.querySelector('.complete-btn');
    const isCompleted = taskText.classList.toggle('completed');
    completeBtn.innerHTML = `<i class="fas ${isCompleted ? 'fa-check completed' : 'fa-check'}"></i>`;
    updateTaskInLocalStorage();
    updateCounts();
    applyCurrentFilter();
}

// Clear all tasks function 
clearBtn.addEventListener('click', confirmClearTasks);

// Function to confirm and clear tasks based on the current filter
function confirmClearTasks() {
    const confirmation = confirm("Are you sure you want to clear the tasks? This action cannot be undone.");
    if (confirmation) {
        clearTasks();
    }
}

// Function to clear tasks based on the current filter
function clearTasks() {
    const activeFilter = document.querySelector('.filter-active');
    const tasks = todoitem.querySelectorAll('li');
    tasks.forEach(task => {
        if (activeFilter === allFilter) {
            task.remove();
            displayMessage("All tasks cleared successfully.", "green");
        } else if (activeFilter === assignedFilter && !task.querySelector('.task-text').classList.contains('completed')) {
            task.remove();
            displayMessage("Assigned tasks cleared sucessfully.", "green");
        } else if (activeFilter === completedFilter && task.querySelector('.task-text').classList.contains('completed')) {
            task.remove();
            displayMessage("Completed tasks cleared successfully.", "green");
        }
    });

    // Update local storage and counts after clearing tasks
    updateTaskInLocalStorage();
    updateCounts();
}

// Filter tasks function
function filterTasks(filter) {
    const tasks = todoitem.querySelectorAll('li');
    tasks.forEach(task => {
        switch (filter) {
            case 'all':
                task.style.display = '';
                break;
            case 'assigned':
                task.style.display = task.querySelector('.task-text').classList.contains('completed') ? 'none' : '';
                break;
            case 'completed':
                task.style.display = task.querySelector('.task-text').classList.contains('completed') ? '' : 'none';
                break;
        }
    });
    updateCounts();
}

// Add event listeners for filters
allFilter.addEventListener('click', () => {
    filterTasks('all');
    setActiveFilter(allFilter);
});
assignedFilter.addEventListener('click', () => {
    filterTasks('assigned');
    setActiveFilter(assignedFilter);
});
completedFilter.addEventListener('click', () => {
    filterTasks('completed');
    setActiveFilter(completedFilter);
});

// Set active filter function
function setActiveFilter(activeFilter) {
    allFilter.classList.remove('filter-active');
    assignedFilter.classList.remove('filter-active');
    completedFilter.classList.remove('filter-active');
    activeFilter.classList.add('filter-active');
}

function updateCounts() {
    const tasks = todoitem.querySelectorAll('li');
    const totalCount = tasks.length;
    let assignedCount = 0;
    let completedCount = 0;

    tasks.forEach(task => {
        if (task.querySelector('.task-text').classList.contains('completed')) {
            completedCount++;
        } else {
            assignedCount++;
        }
    });

    const allCount = document.getElementById('allCount');
    const assignedCountElement = document.getElementById('assignedCount');
    const completedCountElement = document.getElementById('completedCount');

    allCount.textContent = totalCount;
    assignedCountElement.textContent = assignedCount;
    completedCountElement.textContent = completedCount;

    // Show/hide "No Tasks" message based on total count
    if (totalCount === 0) {
        noTasksMessage.style.display = 'block';
    } else {
        noTasksMessage.style.display = 'none';
    }
}

// Apply the current filter to the tasks
function applyCurrentFilter() {
    const activeFilter = document.querySelector('.filter-active');
    if (activeFilter === allFilter) {
        filterTasks('all');
    }
    else if (activeFilter === assignedFilter) {
        filterTasks('assigned');
    } else {
        filterTasks('completed');
    }
}

// Local storage functions
function saveTaskToLocalStorage(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    let tasks = JSON.parse(localStorage.getItem('tasks'));
    tasks.forEach(task => {
        createTaskElement(task);
    });
    updateCounts();
}

function updateTaskInLocalStorage() {
    const taskElements = todoitem.querySelectorAll('li');
    let tasks = [];
    taskElements.forEach(taskElement => {
        const task = {
            text: taskElement.querySelector('.task-text').textContent,
            completed: taskElement.querySelector('.task-text').classList.contains('completed')
        };
        tasks.push(task);
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Initial filter setup on page load
filterTasks('all');
setActiveFilter(allFilter);