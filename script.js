const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];
try {
    const savedTasks = localStorage.getItem("personalTasks");
    const parsedTasks = savedTasks ? JSON.parse(savedTasks) : [];

    if (Array.isArray(parsedTasks)) {
        tasks = parsedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean"
        );
    }
} catch (error) {
    console.error("Unable to load saved tasks:", error);
}

let currentFilter = "all";
function generateId() {
    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    return Date.now().toString() + Math.random().toString(36).slice(2);
}

function saveTasks() {
    try {
        localStorage.setItem("personalTasks", JSON.stringify(tasks));
    } catch (error) {
        alert("Unable to save tasks in this browser.");
        console.error("Unable to save tasks:", error);
    }
}
function addTask(taskText) {
    const newTask = {
        id: generateId(),
        text: taskText,
        completed: false
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
}
function renderTasks() {
    taskList.replaceChildren();
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "pending") {
            return !task.completed;
        }
        if (currentFilter === "completed") {
            return task.completed;
        }
        return true;
    });
    filteredTasks.forEach(task => {
        const listItem = document.createElement("li");
        listItem.className = "task-item";
        if (task.completed) {
            listItem.classList.add("completed");
        }
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.text + " as completed"
        );
        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;
        const status = document.createElement("span");
        status.className = task.completed? "status completed": "status pending";
        status.textContent = task.completed ?"Completed":"Pending";
        const deleteButton = document.createElement("button");
        deleteButton.type="button";
        deleteButton.className="delete-btn";
        deleteButton.textContent="Delete";
        deleteButton.setAttribute(
            "aria-label",
            "Delete " + task.text
        );
        listItem.append(checkbox,taskText,status,deleteButton);
        taskList.appendChild(listItem);
        checkbox.addEventListener("change",function(){
            toggleTask(task.id);
        });
        deleteButton.addEventListener("click",function(){
            deleteTask(task.id);
        });
    });
    emptyMessage.style.display=filteredTasks.length === 0 ? "block" : "none";
    if (filteredTasks.length===0) {
        if (tasks.length===0){
            emptyMessage.textContent="No tasks yet. Add your first task!";
        } else if (currentFilter==="pending") {
            emptyMessage.textContent="No pending tasks. Great job!";
        } else if (currentFilter==="completed") {
            emptyMessage.textContent="No completed tasks yet.";
        } else {
            emptyMessage.textContent="No tasks to display.";
        }
    }
    updateStatistics();
}
function toggleTask(taskId){
    tasks=tasks.map(task=>{
        if (task.id===taskId){
            return {...task,completed: !task.completed};
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

function updateStatistics() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;
}

taskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const taskText = taskInput.value.trim();
    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }
    addTask(taskText);
    taskForm.reset();
    taskInput.focus();
});

filterButtons.forEach(button => {
    button.addEventListener("click", function () {
        currentFilter = button.dataset.filter;
        filterButtons.forEach(filterButton => {
            filterButton.classList.remove("active");
        });
        button.classList.add("active");
        renderTasks();
    });
});
renderTasks();