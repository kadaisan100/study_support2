console.log("calendar.js loaded");

const calendarContainer = document.getElementById("calendar");

let currentDate = new Date();
let selectedDate = null;

/* ===============================
   初期化
=============================== */
renderCalendar();

/* ===============================
   カレンダー描画
=============================== */
function renderCalendar() {
    if (!calendarContainer) return;

    calendarContainer.innerHTML = `
        <h2 class="section-title">カレンダー</h2>

        <div class="calendar-header">
            <button id="prevMonthBtn">＜</button>
            <span id="calendarTitle"></span>
            <button id="nextMonthBtn">＞</button>
        </div>

        <div class="calendar-grid" id="calendarGrid"></div>

        <div class="calendar-day-detail" id="calendarDayDetail">
            <p>日付を選択してください</p>
        </div>
    `;

    document.getElementById("prevMonthBtn").onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    };

    document.getElementById("nextMonthBtn").onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    };

    updateCalendar();
}

/* ===============================
   月更新
=============================== */
function updateCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const title = document.getElementById("calendarTitle");
    const grid = document.getElementById("calendarGrid");

    title.textContent = `${year}年 ${month + 1}月`;
    grid.innerHTML = "";

    const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
    weekDays.forEach(d => {
        const div = document.createElement("div");
        div.className = "calendar-weekday";
        div.textContent = d;
        grid.appendChild(div);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const blank = document.createElement("div");
        blank.className = "calendar-cell blank";
        grid.appendChild(blank);
    }

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    for (let day = 1; day <= lastDate; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-cell";

        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const dayTasks = tasks.filter(
            t => t.deadline === dateStr
        );

        cell.innerHTML = `
            <div class="calendar-day-number">${day}</div>
            ${dayTasks.length ? `<div class="calendar-dot"></div>` : ""}
        `;

        if (dayTasks.some(t => !t.completed)) {
            cell.classList.add("has-task");
        } else if (dayTasks.length) {
            cell.classList.add("has-task-completed");
        }

        cell.onclick = () => selectDate(dateStr, dayTasks, cell);

        grid.appendChild(cell);
    }
}

/* ===============================
   日付選択
=============================== */
function selectDate(dateStr, tasks, cell) {
    selectedDate = dateStr;

    document.querySelectorAll(".calendar-cell")
        .forEach(c => c.classList.remove("selected"));

    cell.classList.add("selected");

    const detail = document.getElementById("calendarDayDetail");

    if (!tasks.length) {
        detail.innerHTML = `
            <h3>${dateStr} の予定</h3>
            <p>締切課題はありません</p>
        `;
        return;
    }

    detail.innerHTML = `
        <h3>${dateStr} の締切課題</h3>
        <ul>
            ${tasks.map(t => `
                <li>
                    ${t.title}
                    ${t.completed ? "（完了）" : "（未完了）"}
                </li>
            `).join("")}
        </ul>
    `;
}
