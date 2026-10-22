const KEY = "kelastugas-v1";

const COLORS = ["#1fa2a2", "#e85d4c", "#d9a441", "#4c7ae8", "#8a5cf6", "#3d9a6a"];

const uid = () => crypto.randomUUID();

const todayISO = () => new Date().toISOString().slice(0, 10);

function load() {
  const raw = localStorage.getItem(KEY);
  if (raw) return JSON.parse(raw);
  return seed();
}

function save(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function seed() {
  const subjects = [
    { id: uid(), name: "Matematika", color: COLORS[0], teacher: "Bu Sari" },
    { id: uid(), name: "Bahasa Inggris", color: COLORS[4], teacher: "Mr. Andi" },
    { id: uid(), name: "Fisika", color: COLORS[2], teacher: "Pak Budi" },
    { id: uid(), name: "Sejarah", color: COLORS[1], teacher: "Bu Rina" },
  ];
  const d = new Date();
  const iso = (offset) => {
    const x = new Date(d);
    x.setDate(x.getDate() + offset);
    return x.toISOString().slice(0, 10);
  };
  const tasks = [
    {
      id: uid(),
      title: "PR Integral",
      subjectId: subjects[0].id,
      due: iso(0),
      dueTime: "21:00",
      priority: "high",
      status: "todo",
      notes: "Bab 4 nomor 1-10",
      reminder: true,
    },
    {
      id: uid(),
      title: "Essay Climate Change",
      subjectId: subjects[1].id,
      due: iso(1),
      dueTime: "07:30",
      priority: "medium",
      status: "doing",
      notes: "Min. 400 kata, kumpulkan di Google Classroom",
      reminder: true,
    },
    {
      id: uid(),
      title: "Laporan Praktikum",
      subjectId: subjects[2].id,
      due: iso(3),
      dueTime: "12:00",
      priority: "low",
      status: "todo",
      notes: "Sertakan foto alat",
      reminder: false,
    },
    {
      id: uid(),
      title: "Presentasi Proklamasi",
      subjectId: subjects[3].id,
      due: iso(-1),
      dueTime: "09:00",
      priority: "high",
      status: "todo",
      notes: "Slide 8 halaman",
      reminder: false,
    },
    {
      id: uid(),
      title: "Kuis rumus turunan",
      subjectId: subjects[0].id,
      due: iso(-4),
      dueTime: "",
      priority: "medium",
      status: "done",
      notes: "",
      reminder: false,
    },
  ];
  return {
    profile: { name: "", className: "", theme: "light", notify: true },
    subjects,
    tasks,
    calCursor: todayISO(),
  };
}

function subjectOf(state, id) {
  return state.subjects.find((s) => s.id === id);
}

function isOverdue(task) {
  if (task.status === "done") return false;
  return task.due < todayISO();
}

function formatDue(task) {
  const t = todayISO();
  if (task.due === t) return `Hari ini${task.dueTime ? " " + task.dueTime : ""}`;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (task.due === tomorrow.toISOString().slice(0, 10)) return `Besok${task.dueTime ? " " + task.dueTime : ""}`;
  const [y, m, d] = task.due.split("-");
  return `${d}/${m}/${y}${task.dueTime ? " " + task.dueTime : ""}`;
}

function svgCheck() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12c0 0 4 8 4 8s12-16 12-16"/></svg>`;
}

function icon(name) {
  const paths = {
    home: "M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z",
    list: "M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01",
    cal: "M5 6h14v14H5zM5 10h14M9 6V4M15 6V4",
    user: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z",
    bell: "M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2h16z",
  };
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]}"/></svg>`;
}

function ringSvg(done, total) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  const dash = `${pct * c} ${c}`;
  return `<svg class="ring" viewBox="0 0 84 84">
    <circle class="track" cx="42" cy="42" r="${r}"></circle>
    <circle class="value" cx="42" cy="42" r="${r}" stroke-dasharray="${dash}"></circle>
  </svg>`;
}

export function createApp(root) {
  let state = load();
  let view = state.profile.name ? "home" : "onboard";
  let filter = "all";
  let query = "";
  let sheet = null;
  let calMonth = new Date();

  document.documentElement.dataset.theme = state.profile.theme;

  function commit() {
    save(state);
    render();
  }

  function openTask(task = null) {
    sheet = {
      type: "task",
      draft: task
        ? { ...task }
        : {
            id: uid(),
            title: "",
            subjectId: state.subjects[0]?.id || "",
            due: todayISO(),
            dueTime: "",
            priority: "medium",
            status: "todo",
            notes: "",
            reminder: true,
            isNew: true,
          },
    };
    render();
  }

  function openSubject(sub = null) {
    sheet = {
      type: "subject",
      draft: sub
        ? { ...sub }
        : { id: uid(), name: "", color: COLORS[state.subjects.length % COLORS.length], teacher: "", isNew: true },
    };
    render();
  }

  function taskCard(task) {
    const sub = subjectOf(state, task.subjectId);
    const overdue = isOverdue(task);
    return `<button class="task ${task.status === "done" ? "done" : ""}" data-open="${task.id}">
      <span class="check ${task.status === "done" ? "on" : ""}" data-toggle="${task.id}"></span>
      <div>
        <div class="title">${escapeHtml(task.title)}</div>
        <div class="meta">
          <span class="pill">${escapeHtml(sub?.name || "Umum")}</span>
          <span class="pill ${task.priority}">${priorityLabel(task.priority)}</span>
          ${overdue ? `<span class="pill overdue">Terlambat</span>` : ""}
        </div>
      </div>
      <div class="due">${overdue ? "Lewat " : ""}${formatDue(task)}</div>
    </button>`;
  }

  function nav() {
    if (view === "onboard") return "";
    return `<nav class="nav">
      ${navBtn("home", "Beranda", "home")}
      ${navBtn("tasks", "Tugas", "list")}
      ${navBtn("calendar", "Kalender", "cal")}
      ${navBtn("profile", "Profil", "user")}
    </nav>
    <button class="fab" data-add>+</button>`;
  }

  function navBtn(id, label, ic) {
    return `<button class="${view === id ? "on" : ""}" data-view="${id}">${icon(ic)}<span>${label}</span></button>`;
  }

  function home() {
    const open = state.tasks.filter((t) => t.status !== "done");
    const today = open.filter((t) => t.due === todayISO());
    const overdue = open.filter(isOverdue);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const week = open.filter((t) => t.due >= todayISO() && t.due <= weekEnd.toISOString().slice(0, 10));
    const done = state.tasks.filter((t) => t.status === "done").length;
    const dueToday = state.tasks.filter((t) => t.due === todayISO());
    const doneToday = dueToday.filter((t) => t.status === "done").length;
    const name = state.profile.name || "Siswa";
    const list = [...overdue, ...today.filter((t) => !isOverdue(t)), ...open.filter((t) => t.due > todayISO())].slice(
      0,
      6
    );
    return `<section class="page">
      <div class="topbar">
        <div>
          <p class="kicker">Hai, ${escapeHtml(name)}</p>
          <h1>Tugas hari ini</h1>
        </div>
        <button class="icon-btn" data-view="profile">${icon("bell")}</button>
      </div>
      <div class="progress-wrap">
        ${ringSvg(doneToday, dueToday.length || open.length || 1)}
        <div class="progress-copy">
          <h2>${doneToday}/${dueToday.length || 0} selesai</h2>
          <small>Deadline hari ini. Terus kerjakan yang tersisa.</small>
        </div>
      </div>
      <div class="chips">
        <div class="chip alert"><b>${overdue.length}</b><span>Terlambat</span></div>
        <div class="chip"><b>${week.length}</b><span>Minggu ini</span></div>
        <div class="chip"><b>${done}</b><span>Selesai</span></div>
      </div>
      <div class="section-head"><h2>Perlu dikerjakan</h2><button class="link" data-view="tasks">Lihat semua</button></div>
      ${list.length ? list.map(taskCard).join("") : `<div class="empty">Tidak ada tugas. Waktunya istirahat.</div>`}
    </section>`;
  }

  function tasksPage() {
    const q = query.trim().toLowerCase();
    let list = [...state.tasks];
    if (filter === "today") list = list.filter((t) => t.due === todayISO());
    if (filter === "overdue") list = list.filter(isOverdue);
    if (filter === "done") list = list.filter((t) => t.status === "done");
    if (filter === "todo") list = list.filter((t) => t.status !== "done");
    if (filter.startsWith("sub:")) list = list.filter((t) => t.subjectId === filter.slice(4));
    if (q) list = list.filter((t) => t.title.toLowerCase().includes(q) || (t.notes || "").toLowerCase().includes(q));
    list.sort((a, b) => (a.status === "done") - (b.status === "done") || a.due.localeCompare(b.due));
    return `<section class="page">
      <h1>Semua tugas</h1>
      <div class="search-row"><input placeholder="Cari judul atau catatan..." value="${escapeAttr(query)}" data-search /></div>
      <div class="filters">
        ${chip("all", "Semua")}
        ${chip("todo", "Aktif")}
        ${chip("today", "Hari ini")}
        ${chip("overdue", "Terlambat")}
        ${chip("done", "Selesai")}
        ${state.subjects.map((s) => chip("sub:" + s.id, s.name)).join("")}
      </div>
      ${list.length ? list.map(taskCard).join("") : `<div class="empty">Tidak ada tugas yang cocok.</div>`}
    </section>`;
  }

  function chip(id, label) {
    return `<button class="filter ${filter === id ? "on" : ""}" data-filter="${id}">${escapeHtml(label)}</button>`;
  }

  function calendarPage() {
    const y = calMonth.getFullYear();
    const m = calMonth.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const selected = state.calCursor;
    const cells = [];
    for (let i = 0; i < first; i++) cells.push("<div></div>");
    for (let d = 1; d <= days; d++) {
      const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const has = state.tasks.some((t) => t.due === iso && t.status !== "done");
      cells.push(
        `<button class="day ${has ? "has" : ""} ${selected === iso ? "on" : ""}" data-day="${iso}">${d}</button>`
      );
    }
    const dayTasks = state.tasks.filter((t) => t.due === selected);
    const title = calMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    return `<section class="page">
      <div class="section-head">
        <button class="ghost" style="width:auto;padding:8px 12px" data-cal="-1">‹</button>
        <h1 style="font-size:22px">${title}</h1>
        <button class="ghost" style="width:auto;padding:8px 12px" data-cal="1">›</button>
      </div>
      <div class="cal-grid">
        ${["M", "S", "S", "R", "K", "J", "S"].map((x) => `<span>${x}</span>`).join("")}
        ${cells.join("")}
      </div>
      <div class="section-head" style="margin-top:18px"><h2>Agenda ${formatDue({ due: selected, dueTime: "", status: "todo" })}</h2></div>
      ${dayTasks.length ? dayTasks.map(taskCard).join("") : `<div class="empty">Tidak ada agenda di tanggal ini.</div>`}
    </section>`;
  }

  function profilePage() {
    const total = state.tasks.length || 1;
    const done = state.tasks.filter((t) => t.status === "done").length;
    const pct = Math.round((done / total) * 100);
    return `<section class="page">
      <h1>Profil kelas</h1>
      <div class="field"><label>Nama</label><input data-profile="name" value="${escapeAttr(state.profile.name)}" /></div>
      <div class="field"><label>Kelas</label><input data-profile="className" value="${escapeAttr(state.profile.className)}" placeholder="Contoh: XII IPA 2" /></div>
      <div class="toggle">Mode gelap
        <button class="switch ${state.profile.theme === "dark" ? "on" : ""}" data-theme-toggle><i></i></button>
      </div>
      <div class="toggle">Pengingat deadline
        <button class="switch ${state.profile.notify ? "on" : ""}" data-notify><i></i></button>
      </div>
      <h2>Progres</h2>
      <div class="stats-bar"><i style="width:${pct}%"></i></div>
      <p class="kicker">${done} dari ${state.tasks.length} tugas selesai (${pct}%)</p>
      <div class="section-head"><h2>Mata pelajaran</h2><button class="link" data-add-subject>Tambah</button></div>
      <div class="subjects">
        ${state.subjects
          .map(
            (s) => `<button class="subject" data-edit-subject="${s.id}">
            <span><span class="dot" style="background:${s.color}"></span>${escapeHtml(s.name)}</span>
            <span class="kicker">${escapeHtml(s.teacher || "")}</span>
          </button>`
          )
          .join("")}
      </div>
      <button class="ghost" data-export>Ekspor data JSON</button>
      <button class="ghost" data-import>Impor data JSON</button>
      <input type="file" accept="application/json" hidden data-file />
      <button class="danger" data-reset>Reset contoh data</button>
    </section>`;
  }

  function onboard() {
    return `<section class="page" style="padding-top:64px">
      <p class="kicker">KelasTugas</p>
      <h1>Daftar tugas kelas, rapi dalam genggaman.</h1>
      <p class="kicker" style="margin:12px 0 24px">Catat PR, deadline, mapel, dan progres - lalu bungkus jadi aplikasi HP.</p>
      <div class="field"><label>Nama kamu</label><input data-ob="name" placeholder="Evan" /></div>
      <div class="field"><label>Kelas</label><input data-ob="className" placeholder="XII IPA 2" /></div>
      <button class="primary" data-start>Mulai kelola tugas</button>
    </section>`;
  }

  function sheetHtml() {
    if (!sheet) return "";
    if (sheet.type === "task") {
      const d = sheet.draft;
      return `<div class="sheet"><form class="sheet-card" data-save-task>
        <h2>${d.isNew ? "Tugas baru" : "Edit tugas"}</h2>
        <div class="field"><label>Judul</label><input name="title" required value="${escapeAttr(d.title)}" /></div>
        <div class="field"><label>Mapel</label>
          <select name="subjectId">${state.subjects
            .map((s) => `<option value="${s.id}" ${s.id === d.subjectId ? "selected" : ""}>${escapeHtml(s.name)}</option>`)
            .join("")}</select>
        </div>
        <div class="row-2">
          <div class="field"><label>Tanggal</label><input type="date" name="due" value="${d.due}" required /></div>
          <div class="field"><label>Jam</label><input type="time" name="dueTime" value="${d.dueTime || ""}" /></div>
        </div>
        <div class="row-2">
          <div class="field"><label>Prioritas</label>
            <select name="priority">
              <option value="low" ${d.priority === "low" ? "selected" : ""}>Rendah</option>
              <option value="medium" ${d.priority === "medium" ? "selected" : ""}>Sedang</option>
              <option value="high" ${d.priority === "high" ? "selected" : ""}>Tinggi</option>
            </select>
          </div>
          <div class="field"><label>Status</label>
            <select name="status">
              <option value="todo" ${d.status === "todo" ? "selected" : ""}>Belum</option>
              <option value="doing" ${d.status === "doing" ? "selected" : ""}>Dikerjakan</option>
              <option value="done" ${d.status === "done" ? "selected" : ""}>Selesai</option>
            </select>
          </div>
        </div>
        <div class="field"><label>Catatan</label><textarea name="notes" rows="3">${escapeHtml(d.notes || "")}</textarea></div>
        <label class="toggle">Ingatkan mendekati deadline <input type="checkbox" name="reminder" ${d.reminder ? "checked" : ""} /></label>
        <button class="primary" type="submit">Simpan</button>
        ${d.isNew ? "" : `<button class="danger" type="button" data-delete-task="${d.id}">Hapus tugas</button>`}
        <button class="ghost" type="button" data-close>Batal</button>
      </form></div>`;
    }
    const d = sheet.draft;
    return `<div class="sheet"><form class="sheet-card" data-save-subject>
      <h2>${d.isNew ? "Mapel baru" : "Edit mapel"}</h2>
      <div class="field"><label>Nama mapel</label><input name="name" required value="${escapeAttr(d.name)}" /></div>
      <div class="field"><label>Guru</label><input name="teacher" value="${escapeAttr(d.teacher || "")}" /></div>
      <div class="field"><label>Warna</label>
        <select name="color">${COLORS.map(
          (c) => `<option value="${c}" ${c === d.color ? "selected" : ""}>${c}</option>`
        ).join("")}</select>
      </div>
      <button class="primary" type="submit">Simpan mapel</button>
      ${d.isNew ? "" : `<button class="danger" type="button" data-delete-subject="${d.id}">Hapus mapel</button>`}
      <button class="ghost" type="button" data-close>Batal</button>
    </form></div>`;
  }

  function render() {
    const pages = { home, tasks: tasksPage, calendar: calendarPage, profile: profilePage, onboard };
    root.innerHTML = (pages[view] || home)() + nav() + sheetHtml();
  }

  root.addEventListener("click", (e) => {
    const t = e.target.closest("[data-view],[data-add],[data-toggle],[data-open],[data-filter],[data-close],[data-add-subject],[data-edit-subject],[data-theme-toggle],[data-notify],[data-export],[data-import],[data-reset],[data-start],[data-cal],[data-day],[data-delete-task],[data-delete-subject]");
    if (!t) return;
    if (t.dataset.view) {
      view = t.dataset.view;
      render();
    }
    if (t.dataset.add !== undefined) openTask();
    if (t.dataset.addSubject !== undefined) openSubject();
    if (t.dataset.editSubject) openSubject(state.subjects.find((s) => s.id === t.dataset.editSubject));
    if (t.dataset.toggle) {
      e.stopPropagation();
      const task = state.tasks.find((x) => x.id === t.dataset.toggle);
      task.status = task.status === "done" ? "todo" : "done";
      commit();
    }
    if (t.dataset.open && !e.target.closest("[data-toggle]")) {
      openTask(state.tasks.find((x) => x.id === t.dataset.open));
    }
    if (t.dataset.filter) {
      filter = t.dataset.filter;
      render();
    }
    if (t.dataset.close !== undefined) {
      sheet = null;
      render();
    }
    if (t.dataset.themeToggle !== undefined) {
      state.profile.theme = state.profile.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = state.profile.theme;
      commit();
    }
    if (t.dataset.notify !== undefined) {
      state.profile.notify = !state.profile.notify;
      if (state.profile.notify && "Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
      commit();
    }
    if (t.dataset.export !== undefined) {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "kelastugas.json";
      a.click();
    }
    if (t.dataset.import !== undefined) root.querySelector("[data-file]").click();
    if (t.dataset.reset !== undefined) {
      if (confirm("Reset ke data contoh?")) {
        const profile = { ...state.profile };
        state = seed();
        state.profile = { ...state.profile, ...profile };
        document.documentElement.dataset.theme = state.profile.theme;
        commit();
      }
    }
    if (t.dataset.start !== undefined) {
      const name = root.querySelector('[data-ob="name"]').value.trim();
      const className = root.querySelector('[data-ob="className"]').value.trim();
      if (!name) return alert("Isi nama dulu.");
      state.profile.name = name;
      state.profile.className = className;
      view = "home";
      commit();
    }
    if (t.dataset.cal) {
      calMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + Number(t.dataset.cal), 1);
      render();
    }
    if (t.dataset.day) {
      state.calCursor = t.dataset.day;
      commit();
    }
    if (t.dataset.deleteTask) {
      state.tasks = state.tasks.filter((x) => x.id !== t.dataset.deleteTask);
      sheet = null;
      commit();
    }
    if (t.dataset.deleteSubject) {
      state.subjects = state.subjects.filter((x) => x.id !== t.dataset.deleteSubject);
      sheet = null;
      commit();
    }
  });

  root.addEventListener("input", (e) => {
    if (e.target.matches("[data-search]")) {
      query = e.target.value;
      render();
      const el = root.querySelector("[data-search]");
      el.focus();
      el.setSelectionRange(query.length, query.length);
    }
    if (e.target.matches("[data-profile]")) {
      state.profile[e.target.dataset.profile] = e.target.value;
      save(state);
    }
  });

  root.addEventListener("submit", (e) => {
    e.preventDefault();
    if (e.target.matches("[data-save-task]")) {
      const fd = new FormData(e.target);
      const draft = {
        id: sheet.draft.id,
        title: fd.get("title").trim(),
        subjectId: fd.get("subjectId"),
        due: fd.get("due"),
        dueTime: fd.get("dueTime"),
        priority: fd.get("priority"),
        status: fd.get("status"),
        notes: fd.get("notes"),
        reminder: fd.get("reminder") === "on",
      };
      const i = state.tasks.findIndex((x) => x.id === draft.id);
      if (i >= 0) state.tasks[i] = draft;
      else state.tasks.unshift(draft);
      sheet = null;
      commit();
    }
    if (e.target.matches("[data-save-subject]")) {
      const fd = new FormData(e.target);
      const draft = {
        id: sheet.draft.id,
        name: fd.get("name").trim(),
        teacher: fd.get("teacher").trim(),
        color: fd.get("color"),
      };
      const i = state.subjects.findIndex((x) => x.id === draft.id);
      if (i >= 0) state.subjects[i] = draft;
      else state.subjects.push(draft);
      sheet = null;
      commit();
    }
  });

  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-file]") && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          state = JSON.parse(reader.result);
          document.documentElement.dataset.theme = state.profile.theme;
          commit();
        } catch {
          alert("File JSON tidak valid.");
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  });

  if (state.profile.notify && "Notification" in window && Notification.permission === "granted") {
    const overdue = state.tasks.filter(isOverdue);
    if (overdue.length) {
      new Notification("KelasTugas", { body: `${overdue.length} tugas terlambat. Buka dan selesaikan.` });
    }
  }

  render();
}

function priorityLabel(p) {
  return { low: "Rendah", medium: "Sedang", high: "Tinggi" }[p] || p;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}
