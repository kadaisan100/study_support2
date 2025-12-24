// ================================
// タスク管理（tasks.js）
// ================================

// タスク一覧
let tasks = [];

// ================================
// 初期化
// ================================
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  renderTasks();
});

// ================================
// タスク構造
// ================================
/*
task = {
  id: string,
  title: string,
  subjectColor: string,
  isDaily: boolean,
  deadline: string | null,   // YYYY-MM-DD
  totalPages: number,        // 必要ページ数
  donePages: number,         // 完了ページ数
  estimatedMinutes: number,  // 想定総時間（分）
  doneMinutes: number,       // 実績時間（分）
  remainingMinutes: number   // 残り時間（分）
}
*/

// ================================
// 保存・読込
// ================================
function saveTasks() {
  localStorage.setItem("studyPlannerTasks", JSON.stringify(tasks));
}

function loadTasks() {
  const data = localStorage.getItem("studyPlannerTasks");
  if (data) {
    tasks = JSON.parse(data);
  }
}

// ================================
// 完了判定
// ================================
function isTaskCompleted(task) {
  return task.donePages >= task.totalPages;
}

// ================================
// タスク追加
// ================================
function addTask({
  title,
  subjectColor,
  isDaily = false,
  deadline = null,
  totalPages = 0,
  estimatedMinutes = 0
}) {
  const task = {
    id: crypto.randomUUID(),
    title,
    subjectColor,
    isDaily,
    deadline,
    totalPages,
    donePages: 0,
    estimatedMinutes,
    doneMinutes: 0,
    remainingMinutes: estimatedMinutes
  };

  tasks.push(task);
  saveTasks();
  renderTasks();

  if (typeof rescheduleStudyPlans === "function") {
    rescheduleStudyPlans();
  }
}

// ================================
// タスク更新（詳細画面）
// ================================
function updateTask(taskId, updates) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  Object.assign(task, updates);

  // 完了ページ数が増えた場合の補正
  if (task.donePages > task.totalPages) {
    task.totalPages = task.donePages;
  }

  recalcRemainingTime(task);
  saveTasks();
  renderTasks();

  if (typeof rescheduleStudyPlans === "function") {
    rescheduleStudyPlans();
  }
}

// ================================
// 進捗入力
// ================================
function addProgress(taskId, pages, minutes) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.donePages += pages;
  task.doneMinutes += minutes;

  recalcRemainingTime(task);
  saveTasks();
  renderTasks();

  if (typeof rescheduleStudyPlans === "function") {
    rescheduleStudyPlans();
  }
}

// ================================
// 残り時間再計算
// ================================
function recalcRemainingTime(task) {
  task.remainingMinutes = Math.max(
    0,
    task.estimatedMinutes - task.doneMinutes
  );
}

// ================================
// 並び順制御
// ================================
function getSortedTasks() {
  const active = tasks.filter(t => !isTaskCompleted(t));
  const completed = tasks.filter(t => isTaskCompleted(t));

  active.sort((a, b) => {
    // 毎日課題優先
    if (a.isDaily && !b.isDaily) return -1;
    if (!a.isDaily && b.isDaily) return 1;

    // 締切が近い順
    if (a.deadline && b.deadline) {
      const diff = new Date(a.deadline) - new Date(b.deadline);
      if (diff !== 0) return diff;
    }

    // 次回取り組み時間（残り時間が少ない方を優先）
    return a.remainingMinutes - b.remainingMinutes;
  });

  return { active, completed };
}

// ================================
// 表示
// ================================
function renderTasks() {
  const activeList = document.getElementById("task-list");
  const completedList = document.getElementById("completed-task-list");

  if (!activeList || !completedList) return;

  activeList.innerHTML = "";
  completedList.innerHTML = "";

  const { active, completed } = getSortedTasks();

  active.forEach(task => {
    activeList.appendChild(createTaskElement(task));
  });

  completed.forEach(task => {
    completedList.appendChild(createTaskElement(task, true));
  });
}

// ================================
// タスクDOM生成
// ================================
function createTaskElement(task, completed = false) {
  const div = document.createElement("div");
  div.className = "task-item";
  if (completed) div.classList.add("completed");

  const progressPercent =
    task.totalPages > 0
      ? Math.min(100, Math.round((task.donePages / task.totalPages) * 100))
      : 0;

  div.innerHTML = `
    <div class="task-header">
      <span class="task-color" style="background:${task.subjectColor}"></span>
      <span class="task-title">${task.title}</span>
    </div>

    <div class="task-info">
      <span>
        ${task.doneMinutes}分 /
        ${task.estimatedMinutes}分
      </span>
      <span>
        ${task.donePages} / ${task.totalPages} ページ
      </span>
    </div>

    <div class="task-progress">
      <div class="task-progress-bar" style="width:${progressPercent}%"></div>
    </div>
  `;

  div.onclick = () => openTaskDetail(task.id);
  return div;
}

// ================================
// 詳細画面（ダミー）
// ================================
function openTaskDetail(taskId) {
  // 詳細モーダル等はここから実装
  console.log("open task detail:", taskId);
}
