console.log("tasks.js loaded");

/* ===============================
   グローバル
=============================== */
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

/* ===============================
   初期化
=============================== */
document.addEventListener("DOMContentLoaded", () => {
    renderTaskList();
});

/* ===============================
   タスク追加
=============================== */
const taskForm = document.getElementById("taskForm");
if (taskForm) {
    taskForm.addEventListener("submit", e => {
        e.preventDefault();

        const title = document.getElementById("taskTitle").value.trim();
        const deadline = document.getElementById("taskDeadline").value;
        const pages = Number(document.getElementById("taskPages").value) || 0;
        const color = document.getElementById("taskColor").value || "#4e7cff";

        if (!title || !deadline || pages <= 0) {
            alert("正しく入力してください");
            return;
        }

        tasks.push({
            id: Date.now(),
            title,
            deadline,
            totalPages: pages,
            donePages: 0,
            color,
            completed: false,
            history: []
        });

        saveTasks();
        taskForm.reset();
        renderTaskList();
    });
}

/* ===============================
   タスク一覧
=============================== */
function renderTaskList() {
    const list = document.getElementById("taskList");
    if (!list) return;

    list.innerHTML = "";

    if (tasks.length === 0) {
        list.innerHTML = "<p>課題はありません</p>";
        return;
    }

    tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = "task-item";

        div.innerHTML = `
            <div class="task-color" style="background:${task.color}"></div>
            <div class="task-main">
                <div class="task-title">${task.title}</div>
                <div class="task-info">
                    <span>締切: ${task.deadline}</span>
                    <span>${task.donePages}/${task.totalPages} ページ</span>
                </div>
            </div>
        `;

        list.appendChild(div);
    });
}

/* ===============================
   学習速度推定（B-2）
=============================== */
function estimateSpeed(task) {
    if (!task.history || task.history.length === 0) return 1;

    let totalPages = 0;
    let totalMinutes = 0;

    task.history.forEach(h => {
        totalPages += h.pages || 0;
        totalMinutes += h.minutes || 0;
    });

    if (totalMinutes <= 0) return 1;
    return totalPages / totalMinutes;
}

function estimateRemainingMinutes(task) {
    const speed = estimateSpeed(task);
    const remainingPages = Math.max(
        task.totalPages - task.donePages,
        0
    );
    return Math.ceil(remainingPages / speed);
}

/* ===============================
   今日の学習予定生成
=============================== */
function generateTodayStudyPlans(dateStr) {
    if (!dateStr) return [];

    return tasks
        .filter(t => !t.completed && t.deadline >= dateStr)
        .map(task => ({
            taskId: task.id,
            title: task.title,
            minutes: estimateRemainingMinutes(task),
            color: task.color
        }));
}

/* ===============================
   保存
=============================== */
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* ===============================
   学習履歴追加
=============================== */
function addStudyHistory(taskId, date, pages, minutes) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.history.push({ date, pages, minutes });
    task.donePages += pages;

    if (task.donePages >= task.totalPages) {
        task.completed = true;
    }

    saveTasks();
}
