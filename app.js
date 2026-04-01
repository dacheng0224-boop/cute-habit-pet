(() => {
  const STORAGE_KEY = "cute-habit-pet-v1";
  const PET_TIERS = [
    { min: 0, max: 19, label: "Lv1 幼崽", emoji: "🥚" },
    { min: 20, max: 49, label: "Lv2 成长期", emoji: "🐣" },
    { min: 50, max: 89, label: "Lv3 活力期", emoji: "🐥" },
    { min: 90, max: Number.POSITIVE_INFINITY, label: "Lv4 成熟期", emoji: "🦊" },
  ];

  const els = {
    habitForm: document.getElementById("habit-form"),
    habitEmoji: document.getElementById("habit-emoji"),
    habitName: document.getElementById("habit-name"),
    habitList: document.getElementById("habit-list"),
    todayText: document.getElementById("today-text"),
    todayCheckins: document.getElementById("today-checkins"),
    monthTitle: document.getElementById("month-title"),
    prevMonth: document.getElementById("prev-month"),
    nextMonth: document.getElementById("next-month"),
    calendarGrid: document.getElementById("calendar-grid"),
    petEmoji: document.getElementById("pet-emoji"),
    petLevel: document.getElementById("pet-level"),
    petGrowth: document.getElementById("pet-growth"),
    petNext: document.getElementById("pet-next"),
    petStageFill: document.getElementById("pet-stage-fill"),
    petScene: document.getElementById("pet-scene"),
  };

  const state = loadState();
  const now = new Date();
  const view = { year: now.getFullYear(), month: now.getMonth() };

  bindEvents();
  render();
  registerServiceWorker();

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        habits: Array.isArray(parsed.habits) ? parsed.habits : [],
        checkinsByDate: parsed.checkinsByDate && typeof parsed.checkinsByDate === "object" ? parsed.checkinsByDate : {},
        petConfig: {
          growthPerCheckin: 1,
        },
      };
    } catch {
      return { habits: [], checkinsByDate: {}, petConfig: { growthPerCheckin: 1 } };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function bindEvents() {
    els.habitForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const emoji = (els.habitEmoji.value || "").trim();
      const name = (els.habitName.value || "").trim();
      if (!emoji || !name) return;
      state.habits.push({
        id: crypto.randomUUID(),
        emoji,
        name: name.slice(0, 30),
        createdAt: Date.now(),
        archived: false,
      });
      els.habitEmoji.value = "";
      els.habitName.value = "";
      saveState();
      render();
    });

    els.habitList.addEventListener("click", (event) => {
      const btn = event.target.closest("button[data-habit-id]");
      if (!btn) return;
      const id = btn.dataset.habitId;
      state.habits = state.habits.filter((h) => h.id !== id);
      for (const dateKey of Object.keys(state.checkinsByDate)) {
        state.checkinsByDate[dateKey] = (state.checkinsByDate[dateKey] || []).filter((habitId) => habitId !== id);
      }
      saveState();
      render();
    });

    els.todayCheckins.addEventListener("change", (event) => {
      const input = event.target.closest("input[data-habit-id]");
      if (!input) return;
      const dateKey = getDateKey(new Date());
      const checkedSet = new Set(state.checkinsByDate[dateKey] || []);
      if (input.checked) {
        checkedSet.add(input.dataset.habitId);
      } else {
        checkedSet.delete(input.dataset.habitId);
      }
      state.checkinsByDate[dateKey] = [...checkedSet];
      saveState();
      render();
    });

    els.prevMonth.addEventListener("click", () => {
      view.month -= 1;
      if (view.month < 0) {
        view.month = 11;
        view.year -= 1;
      }
      renderCalendar();
    });

    els.nextMonth.addEventListener("click", () => {
      view.month += 1;
      if (view.month > 11) {
        view.month = 0;
        view.year += 1;
      }
      renderCalendar();
    });
  }

  function render() {
    renderHabits();
    renderTodayCheckins();
    renderCalendar();
    renderPet();
  }

  function renderHabits() {
    els.habitList.innerHTML = "";
    if (!state.habits.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "还没有习惯，先添加一个吧。";
      els.habitList.append(li);
      return;
    }

    for (const habit of state.habits) {
      const li = document.createElement("li");
      li.className = "habit-item";
      li.innerHTML =
        '<span class="habit-mark"></span>' +
        '<span class="habit-name"></span>' +
        '<button type="button" data-habit-id="">删除</button>';
      li.querySelector(".habit-mark").textContent = habit.emoji;
      li.querySelector(".habit-name").textContent = habit.name;
      li.querySelector("button").dataset.habitId = habit.id;
      els.habitList.append(li);
    }
  }

  function renderTodayCheckins() {
    const today = new Date();
    const dateKey = getDateKey(today);
    const checkedSet = new Set(state.checkinsByDate[dateKey] || []);
    els.todayText.textContent = `${dateKey} 已完成 ${checkedSet.size}/${state.habits.length || 0}`;
    els.todayCheckins.innerHTML = "";

    if (!state.habits.length) {
      const li = document.createElement("li");
      li.className = "empty";
      li.textContent = "先添加习惯后再打卡。";
      els.todayCheckins.append(li);
      return;
    }

    for (const habit of state.habits) {
      const li = document.createElement("li");
      li.className = "checkin-item";
      li.innerHTML =
        '<label><input type="checkbox" data-habit-id="" /><span class="emoji"></span><span class="name"></span></label>';
      const input = li.querySelector("input");
      input.dataset.habitId = habit.id;
      input.checked = checkedSet.has(habit.id);
      li.querySelector(".emoji").textContent = habit.emoji;
      li.querySelector(".name").textContent = habit.name;
      els.todayCheckins.append(li);
    }
  }

  function renderCalendar() {
    const firstDay = new Date(view.year, view.month, 1);
    const totalDays = new Date(view.year, view.month + 1, 0).getDate();
    const monthName = `${view.year}年 ${String(view.month + 1).padStart(2, "0")}月`;
    els.monthTitle.textContent = monthName;
    els.calendarGrid.innerHTML = "";

    const weekIndexMonFirst = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < weekIndexMonFirst; i += 1) {
      const blank = document.createElement("div");
      blank.className = "day blank";
      els.calendarGrid.append(blank);
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(view.year, view.month, day);
      const key = getDateKey(date);
      const checkedIds = state.checkinsByDate[key] || [];
      const emojis = checkedIds
        .map((id) => state.habits.find((h) => h.id === id)?.emoji)
        .filter(Boolean);

      const tile = document.createElement("div");
      tile.className = "day";
      if (isToday(date)) tile.classList.add("today");

      const maxShow = 4;
      const visible = emojis.slice(0, maxShow).join(" ");
      const rest = emojis.length > maxShow ? ` +${emojis.length - maxShow}` : "";

      tile.innerHTML =
        '<div class="day-num"></div>' +
        '<div class="day-count"></div>' +
        '<div class="day-emojis"></div>';
      tile.querySelector(".day-num").textContent = String(day);
      tile.querySelector(".day-count").textContent = `${checkedIds.length}/${state.habits.length || 0}`;
      tile.querySelector(".day-emojis").textContent = visible + rest;
      els.calendarGrid.append(tile);
    }
  }

  function renderPet() {
    const growth30Days = getGrowthInLast30Days();
    const tier = PET_TIERS.find((t) => growth30Days >= t.min && growth30Days <= t.max) || PET_TIERS[0];
    const tierIndex = PET_TIERS.findIndex((t) => t.label === tier.label);
    els.petEmoji.textContent = tier.emoji;
    els.petLevel.textContent = `当前状态：${tier.label}`;
    els.petGrowth.textContent = `近30天成长值：${growth30Days}`;
    els.petScene.className = `pet-scene stage-${tierIndex + 1}`;
    els.petStageFill.style.width = `${Math.min(100, Math.max(0, getTierProgressPercent(growth30Days, tier))) + tierIndex * 25}%`;

    const nextTier = PET_TIERS[tierIndex + 1];
    if (!nextTier) {
      els.petNext.textContent = "已达到最高档位，继续保持！";
      els.petStageFill.style.width = "100%";
    } else {
      const need = Math.max(0, nextTier.min - growth30Days);
      els.petNext.textContent = `距离下一档还差 ${need} 点成长值`;
    }
  }

  function getTierProgressPercent(growth, tier) {
    if (!Number.isFinite(tier.max)) return 100;
    const span = tier.max - tier.min + 1;
    const current = Math.min(span, Math.max(0, growth - tier.min + 1));
    return (current / span) * 25;
  }

  function getGrowthInLast30Days() {
    const today = new Date();
    let sum = 0;
    for (let i = 0; i < 30; i += 1) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const key = getDateKey(date);
      sum += (state.checkinsByDate[key] || []).length * state.petConfig.growthPerCheckin;
    }
    return sum;
  }

  function getDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function isToday(date) {
    const now = new Date();
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }
})();
