/* ===============================
   共通：日付表示
=============================== */
const today = new Date();
document.getElementById("todayDate").textContent =
    today.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });

/* ===============================
   タブ切り替え
=============================== */
document.querySelectorAll(".tab-button").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

        btn.classList.add("active");
        document.getElementById(btn.dataset.tab + "-tab").classList.add("active");
    });
});

/* ===============================
   カレンダー
=============================== */
let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

const calendarMonth = document.getElementById("calendarMonth");
const calendarGrid = document.getElementById("calendarGrid");
const selectedDateTitle = document.getElementById("selectedDateTitle");
const deadlineList = document.getElementById("deadlineList");

document.getElementById("prevMonthBtn").onclick = () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
};

document.getElementById("nextMonthBtn").onclick = () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
};

function renderCalendar() {
    calendarGrid.innerHTML = "";

    calendarMonth.textContent =
        `${currentMonth.getFullYear()}年 ${currentMonth.getMonth() + 1}月`;

    const firstDay = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1
    ).getDay();

    const lastDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0
    ).getDate();

    // 空白
    for (let i = 0; i < firstDay; i++) {
        calendarGrid.appendChild(document.createElement("div"));
    }

    for (let d = 1; d <= lastDate; d++) {
        const cell = document.createElement("div");
        cell.textContent = d;
        cell.style.padding = "8px";
        cell.style.background = "#fff";
        cell.style.borderRadius = "8px";
        cell.style.textAlign = "center";
        cell.style.cursor = "pointer";

        const dateStr = formatDate(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + 1,
            d
        );

        cell.onclick = () => showDayTasks(dateStr);

        calendarGrid.appendChild(cell);
    }
}

function formatDate(y, m, d) {
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/* ===============================
   日付クリック → 締切課題表示
=============================== */
function showDayTasks(dateStr) {
    selectedDateTitle.textContent = `${dateStr} の予定`;
    deadlineList.innerHTML = "";

    const tasks = JSON.parse(localStorage.getItem("tasks_v2")) || [];

    const deadlines = tasks.filter(
        t => t.deadline === dateStr && !t.completed
    );

    if (deadlines.length === 0) {
        deadlineList.innerHTML = "<li>締切の課題はありません</li>";
        return;
    }

    deadlines.forEach(task => {
        const li = document.createElement("li");
        li.textContent = `${task.title}（${task.pagesDone}/${task.pagesRequired}p）`;
        deadlineList.appendChild(li);
    });
}

renderCalendar();
