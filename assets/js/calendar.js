console.log("calendar.js loaded");

const calendarContainer = document.getElementById("calendar");

let currentDate = new Date();
let selectedDate = null;
let editingPrivateIndex = null;

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
    const privates = JSON.parse(localStorage.getItem("privateEvents")) || [];

    for (let day = 1; day <= lastDate; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-cell";

        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        const dayTasks = tasks.filter(t => t.deadline === dateStr);
        const dayPrivates = privates.filter(p => p.date === dateStr);

        cell.innerHTML = `
            <div class="calendar-day-number">${day}</div>
            ${dayTasks.length ? `<div class="calendar-dot task-dot"></div>` : ""}
            ${dayPrivates.length ? `<div class="calendar-dot private-dot"></div>` : ""}
        `;

        cell.onclick = () => selectDate(dateStr, dayTasks, dayPrivates, cell);
        grid.appendChild(cell);
    }
}

/* ===============================
   日付選択
=============================== */
function selectDate(dateStr, tasks, privates, cell) {
    selectedDate = dateStr;
    editingPrivateIndex = null;

    document.querySelectorAll(".calendar-cell")
        .forEach(c => c.classList.remove("selected"));
    cell.classList.add("selected");

    renderDayDetail(tasks, privates);
}

/* ===============================
   日別詳細描画
=============================== */
function renderDayDetail(tasks, privates) {
    const detail = document.getElementById("calendarDayDetail");

    detail.innerHTML = `
        <h3>${selectedDate}</h3>

        <h4>締切課題</h4>
        ${tasks.length ? `
            <ul>
                ${tasks.map(t => `
                    <li>${t.title} ${t.completed ? "（完了）" : "（未完了）"}</li>
                `).join("")}
            </ul>
        ` : "<p>なし</p>"}

        <h4>私用予定（学習不可）</h4>
        ${privates.length ? `
            <ul>
                ${privates.map((p, i) => `
                    <li>
                        ${p.start}〜${p.end}：${p.title}
                        <button onclick="editPrivate(${i})">編集</button>
                        <button onclick="deletePrivate(${i})">削除</button>
                    </li>
                `).join("")}
            </ul>
        ` : "<p>なし</p>"}

        <h4>${editingPrivateIndex === null ? "追加" : "編集"}する</h4>
        <div class="private-form">
            <input type="text" id="privateTitle" placeholder="内容">
            <div class="time-row">
                <input type="time" id="privateStart">
                <span>〜</span>
                <input type="time" id="privateEnd">
            </div>
            <button id="savePrivateBtn">保存</button>
        </div>
    `;

    document.getElementById("savePrivateBtn").onclick = savePrivate;
}

/* ===============================
   私用予定 保存 / 更新
=============================== */
function savePrivate() {
    const title = document.getElementById("privateTitle").value.trim();
    const start = document.getElementById("privateStart").value;
    const end = document.getElementById("privateEnd").value;

    if (!title || !start || !end) {
        alert("すべて入力してください");
        return;
    }

    const privates = JSON.parse(localStorage.getItem("privateEvents")) || [];

    if (editingPrivateIndex === null) {
        privates.push({ date: selectedDate, title, start, end });
    } else {
        privates[editingPrivateIndex] = { date: selectedDate, title, start, end };
        editingPrivateIndex = null;
    }

    localStorage.setItem("privateEvents", JSON.stringify(privates));
    updateCalendar();

    const dayTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    renderDayDetail(
        dayTasks.filter(t => t.deadline === selectedDate),
        privates.filter(p => p.date === selectedDate)
    );
}

/* ===============================
   編集
=============================== */
function editPrivate(index) {
    const privates = JSON.parse(localStorage.getItem("privateEvents")) || [];
    const p = privates.filter(p => p.date === selectedDate)[index];

    editingPrivateIndex = privates.indexOf(p);

    document.getElementById("privateTitle").value = p.title;
    document.getElementById("privateStart").value = p.start;
    document.getElementById("privateEnd").value = p.end;
}

/* ===============================
   削除
=============================== */
function deletePrivate(index) {
    if (!confirm("削除しますか？")) return;

    let privates = JSON.parse(localStorage.getItem("privateEvents")) || [];
    const dayList = privates.filter(p => p.date === selectedDate);
    const target = dayList[index];

    privates = privates.filter(p => p !== target);
    localStorage.setItem("privateEvents", JSON.stringify(privates));

    updateCalendar();

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    renderDayDetail(
        tasks.filter(t => t.deadline === selectedDate),
        privates.filter(p => p.date === selectedDate)
    );
}
