console.log("calendar.js loaded");

const calendarContainer = document.getElementById("calendar");

let currentDate = new Date();
let selectedDate = null;
let editingPrivateIndex = null;
let editingStudyIndex = null;

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
    editingStudyIndex = null;

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

    // 学習予定＋私用予定を統合
    const combinedList = [];

    // 学習予定
    tasks.forEach((t, i) => {
        combinedList.push({ type: "study", index: i, title: t.title, start: t.start, end: t.end });
    });

    // 私用予定
    privates.forEach((p, i) => {
        combinedList.push({ type: "private", index: i, title: p.title, start: p.start, end: p.end });
    });

    // 時刻順にソート
    combinedList.sort((a, b) => {
        return a.start.localeCompare(b.start);
    });

    detail.innerHTML = `
        <h3>${selectedDate}</h3>

        <h4>一日の予定</h4>
        ${combinedList.length ? `<ul>
            ${combinedList.map(item => `
                <li>
                    ${item.start}〜${item.end} ${item.title} ${item.type === "study" ? `<button onclick="editStudy(${item.index})">編集</button>` : ""}
                </li>
            `).join("")}
        </ul>` : "<p>なし</p>"}

        <h4>${editingPrivateIndex === null ? "追加" : "編集"}する私用予定</h4>
        <div class="private-form">
            <input type="text" id="privateTitle" placeholder="内容">
            <div class="time-row">
                <input type="time" id="privateStart">
                <span>〜</span>
                <input type="time" id="privateEnd">
            </div>
            <button id="savePrivateBtn">保存</button>
        </div>

        <h4>${editingStudyIndex === null ? "" : "編集"}学習予定</h4>
        <div class="study-edit-form" style="display:none;">
            <input type="time" id="studyStartEdit">
            <button id="saveStudyEditBtn">保存</button>
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
   編集学習予定
=============================== */
function editStudy(index) {
    editingStudyIndex = index;

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const t = tasks.filter(t => t.deadline === selectedDate)[index];

    document.querySelector(".study-edit-form").style.display = "block";
    document.getElementById("studyStartEdit").value = t.start;

    document.getElementById("saveStudyEditBtn").onclick = () => {
        let newStart = document.getElementById("studyStartEdit").value;
        if (!newStart) return;

        newStart = roundUpTo10Min(newStart);

        // 重なり判定
        const privates = JSON.parse(localStorage.getItem("privateEvents")) || [];
        const conflict = privates.some(p => !(newStart >= p.end || (parseTime(p.start)+parseTime(p.end))/2 <= parseTime(newStart)));
        if (conflict) {
            alert("他の予定と重なるので変更してください");
            return;
        }

        t.start = newStart;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        updateCalendar();
        renderDayDetail(
            tasks.filter(tt => tt.deadline === selectedDate),
            privates.filter(p => p.date === selectedDate)
        );
        document.querySelector(".study-edit-form").style.display = "none";
        editingStudyIndex = null;
    };
}

/* ===============================
   時刻処理ユーティリティ
=============================== */
function roundUpTo10Min(time) {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m;
    const rounded = Math.ceil(total / 10) * 10;
    return minToTime(rounded);
}

function minToTime(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
}

function parseTime(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h*60 + m;
}

/* ===============================
   編集 / 削除私用予定
=============================== */
function editPrivate(index) {
    const privates = JSON.parse(localStorage.getItem("privateEvents")) || [];
    const p = privates.filter(p => p.date === selectedDate)[index];

    editingPrivateIndex = privates.indexOf(p);

    document.getElementById("privateTitle").value = p.title;
    document.getElementById("privateStart").value = p.start;
    document.getElementById("privateEnd").value = p.end;
}

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
