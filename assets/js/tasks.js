console.log("tasks.js loaded");

/* ===============================
   日付表示
=============================== */
const todayDateEl = document.getElementById("todayDate");
if (todayDateEl) {
    const today = new Date();
    todayDateEl.textContent =
        `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
}

/* ===============================
   タブ切り替え
=============================== */
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const target = button.dataset.tab;

        tabButtons.forEach(b => b.classList.remove("active"));
        button.classList.add("active");

        tabContents.forEach(content => {
            content.classList.remove("active");
            if (content.id === target) {
                content.classList.add("active");
            }
        });
    });
});

/* ===============================
   データ
=============================== */
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentTaskId = null;

/* ===============================
   DOM取得
=============================== */
const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskDeadline = document.getElementById("taskDeadline");
const taskPages = document.getElementById("taskPages");
const taskDaily = document.getElementById("taskDaily");
const taskColor = document.getElementById("taskColor");

const dailyTaskList = document.getElementById("dailyTaskList");
const taskList = document.getElementById("taskList");
const completedTaskList = document.getElementById("completedTaskList");

/* ===============================
   モーダル
=============================== */
const taskModal = document.getElementById("taskModal");
const modalTitle = document.getElementById("modalTitle");
const modalPagesRequired = document.getElementById("modalPagesRequired");
const modalPagesAdd = document.getElementById("modalPagesAdd");
const saveModalBtn = document.getElementById("saveModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

/* ===============================
   初期描画
=============================== */
renderTasks();

/* ===============================
   タスク追加
=============================== */
taskForm.addEventListener("submit", e => {
    e.preventDefault();

    const newTask = {
        id: Date.now(),
        title: taskTitle.value,
        deadline: taskDaily.checked ? null : taskDeadline.value,
        pagesRequired: Number(taskPages.value),
        pagesDone: 0,
        daily: taskDaily.checked,
        color: taskColor.value,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskForm.reset();
});

/* ===============================
   描画
=============================== */
function renderTasks() {
    dailyTaskList.innerHTML = "";
    taskList.innerHTML = "";
    completedTaskList.innerHTML = "";

    tasks.forEach(task => {
        if (task.completed) {
            completedTaskList.appendChild(createTaskElement(task));
        } else if (task.daily) {
            dailyTaskList.appendChild(createTaskElement(task));
        } else {
            taskList.appendChild(createTaskElement(task));
        }
    });
}

function createTaskElement(task) {
    const item = document.createElement("div");
    item.className = "task-item";

    item.innerHTML = `
        <div class="task-color" style="background:${task.color}"></div>
        <div class="task-main">
            <div class="task-title">
                ${task.title}
                ${task.daily ? `<span class="daily-label">毎日</span>` : ""}
            </div>
            <div class="task-info">
                <span>${task.pagesDone} / ${task.pagesRequired} ページ</span>
                ${task.deadline ? `<span>締切: ${task.deadline}</span>` : ""}
            </div>
        </div>
        <button class="task-open-btn">詳細</button>
    `;

    item.querySelector(".task-open-btn").onclick = () => {
        openTaskModal(task.id);
    };

    return item;
}

/* ===============================
   モーダル
=============================== */
function openTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    currentTaskId = taskId;
    modalTitle.textContent = task.title;
    modalPagesRequired.value = task.pagesRequired;
    modalPagesAdd.value = "";

    taskModal.classList.remove("hidden");
}

saveModalBtn.onclick = () => {
    const task = tasks.find(t => t.id === currentTaskId);
    if (!task) return;

    const add = Number(modalPagesAdd.value);
    const required = Number(modalPagesRequired.value);

    task.pagesDone = Number(task.pagesDone) || 0;
    task.pagesRequired = required;

    if (!isNaN(add)) {
        task.pagesDone += add;
    }

    if (task.pagesDone >= task.pagesRequired) {
        task.completed = true;
    }

    saveTasks();
    renderTasks();
    taskModal.classList.add("hidden");
};

closeModalBtn.onclick = () => {
    taskModal.classList.add("hidden");
};

/* ===============================
   保存
=============================== */
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
