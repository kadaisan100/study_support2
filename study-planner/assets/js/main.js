// ================================
// グローバル状態
// ================================
let currentYear;
let currentMonth;
let selectedDate = null;
let calendarEvents = [];

// ================================
// タブ切替
// ================================
function initTabs() {
  const tabTasks = document.getElementById("tab-tasks");
  const tabCalendar = document.getElementById("tab-calendar");
  const tasksTab = document.getElementById("tasks-tab");
  const calendarTab = document.getElementById("calendar-tab");

  if (!tabTasks || !tabCalendar || !tasksTab || !calendarTab) return;

  tabTasks.onclick = () => {
    tabTasks.classList.add("active");
    tabCalendar.classList.remove("active");
    tasksTab.classList.remove("hidden");
    calendarTab.classList.add("hidden");
  };

  tabCalendar.onclick = () => {
    tabCalendar.classList.add("active");
    tabTasks.classList.remove("active");
    calendarTab.classList.remove("hidden");
    tasksTab.classList.add("hidden");
  };
}

// ================================
// 今日の日付表示
// ================================
function initTodayDate() {
  const el = document.getElementById("today-date");
  if (!el) return;

  const d = new Date();
  el.textContent = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// ================================
// カレンダー初期化
// ================================
function initCalendar() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();

  const prev = document.getElementById("prev-month");
  const next = document.getElementById("next-month");

  if (prev) prev.onclick = () => changeMonth(-1);
  if (next) next.onclick = () => changeMonth(1);

  renderCalendar();
}

// ================================
// 月切替
// ================================
function changeMonth(diff) {
  currentMonth += diff;

  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }

  renderCalendar();
}

// ================================
// カレンダー描画
// ================================
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const title = document.getElementById("current-month");
  if (!grid || !title) return;

  grid.innerHTML = "";
  title.textContent = `${currentYear}年 ${currentMonth + 1}月`;

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let i = 0; i < firstDay.getDay(); i++) {
    grid.appendChild(document.createElement("div"));
  }

  for (let d = 1; d <= lastDate; d++) {
    const cell = document.createElement("div");
    cell.className = "day-cell";
    cell.textContent = d;
    cell.onclick = () => selectDate(currentYear, currentMonth, d);
    grid.appendChild(cell);
  }
}

// ================================
// 日付選択
// ================================
function selectDate(y, m, d) {
  selectedDate = `${y}-${pad(m + 1)}-${pad(d)}`;

  const title = document.getElementById("selected-date-title");
  if (title) {
    title.textContent = `${y}年${m + 1}月${d}日の予定`;
  }

  renderDayEvents();
}

// ================================
// 日別予定表示
// ================================
function renderDayEvents() {
  const list = document.getElementById("event-list");
  if (!list) return;

  list.innerHTML = "";

  const events = calendarEvents
    .filter(e => e.date === selectedDate)
    .sort((a, b) => a.start.localeCompare(b.start));

  if (events.length === 0) {
    const li = document.createElement("li");
    li.textContent = "予定はありません";
    list.appendChild(li);
    return;
  }

  events.forEach(e => {
    const li = document.createElement("li");
    li.textContent = `${e.start}〜${e.end} ${e.title}`;
    list.appendChild(li);
  });
}

// ================================
// 私用予定フォーム
// ================================
function initEventForm() {
  const form = document.getElementById("add-event-form");
  if (!form) return;

  form.onsubmit = e => {
    e.preventDefault();
    if (!selectedDate) return;

    const title = document.getElementById("event-title").value;
    const start = document.getElementById("event-start").value;
    const end = document.getElementById("event-end").value;
    const repeat = document.getElementById("event-repeat").value;

    calendarEvents.push({
      id: crypto.randomUUID(),
      type: "private",
      title,
      date: selectedDate,
      start,
      end,
      repeat
    });

    saveEvents();
    renderDayEvents();
    form.reset();
  };
}

// ================================
// 保存・復元
// ================================
function saveEvents() {
  localStorage.setItem(
    "studyPlannerEvents",
    JSON.stringify(calendarEvents)
  );
}

function loadEvents() {
  const data = localStorage.getItem("studyPlannerEvents");
  if (data) {
    calendarEvents = JSON.parse(data);
  }
}

// ================================
// 空き時間抽出（後続用）
// ================================
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getEventsForDay(date) {
  return calendarEvents
    .filter(e => e.date === date)
    .map(e => ({
      start: timeToMinutes(e.start),
      end: timeToMinutes(e.end)
    }))
    .sort((a, b) => a.start - b.start);
}

function getFreeTimeSlots(date) {
  const events = getEventsForDay(date);
  const freeSlots = [];
  let current = 0;

  events.forEach(ev => {
    if (current < ev.start) {
      freeSlots.push({
        start: minutesToTime(current),
        end: minutesToTime(ev.start)
      });
    }
    current = Math.max(current, ev.end);
  });

  if (current < 1440) {
    freeSlots.push({
      start: minutesToTime(current),
      end: "24:00"
    });
  }

  return freeSlots;
}

// ================================
// util
// ================================
function pad(n) {
  return String(n).padStart(2, "0");
}

// ================================
// 即時初期化（重要）
// ================================
initTabs();
initTodayDate();
loadEvents();
initCalendar();
initEventForm();
