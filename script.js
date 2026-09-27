(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  const bootScreen = $("#bootScreen");
  const bootProgress = $("#bootProgress");
  const startButton = $("#startButton");
  const startMenu = $("#startMenu");
  const taskButtons = $("#taskButtons");
  const toast = $("#toast");
  const galleryImage = $("#galleryImage");
  const galleryStatus = $("#galleryStatus");

  const apps = {
    "Browser": {
      icon: "assets/browser.png",
      description: "The FruitiOS web browser, styled around the system's globe-and-orbit identity."
    },
    "Calculator": {
      icon: "assets/calculator.png",
      description: "A compact calculator with large classic controls and FruitiOS red action keys."
    },
    "Console": {
      icon: "assets/console.png",
      description: "The native FruitiOS terminal: black shell, green prompt and a red title strip."
    },
    "File Explorer": {
      icon: "assets/files.png",
      description: "Browse files and volumes with FruitiOS's pixel-art folder interface."
    },
    "Tic Tac Toe": {
      icon: "assets/game.png",
      description: "A built-in retro game using FruitiOS's red and green visual language."
    },
    "Notes": {
      icon: "assets/notes.png",
      description: "A lightweight notes application with a paper-and-pencil pixel icon."
    },
    "Paint": {
      icon: "assets/paint.png",
      description: "A FruitiOS drawing program with a classic palette-and-brush identity."
    },
    "Photo Preview": {
      icon: "assets/photos.png",
      description: "The native FruitiOS image viewer for photographs and artwork."
    },
    "Settings": {
      icon: "assets/settings.png",
      description: "Configure FruitiOS using the system's gear-and-apple control panel."
    },
    "Task Manager": {
      icon: "assets/tasks.png",
      description: "Monitor FruitiOS activity with a classic green performance graph."
    }
  };

  let topZ = 40;
  let toastTimer;

  function runBootSequence() {
    if (!bootScreen || !bootProgress) return;
    bootScreen.classList.remove("done");
    bootProgress.style.width = "0%";

    const stages = [12, 28, 46, 61, 78, 92, 100];
    stages.forEach((value, index) => {
      window.setTimeout(() => {
        bootProgress.style.width = `${value}%`;
      }, 120 + index * 135);
    });

    window.setTimeout(() => {
      bootScreen.classList.add("done");
    }, 1300);
  }

  window.addEventListener("load", runBootSequence);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !bootScreen?.classList.contains("done")) {
      bootScreen.classList.add("done");
    }
  });

  function setStartMenu(open) {
    if (!startMenu || !startButton) return;
    startMenu.classList.toggle("hidden", !open);
    startButton.classList.toggle("open", open);
    startButton.setAttribute("aria-expanded", String(open));
  }

  startButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    setStartMenu(startMenu.classList.contains("hidden"));
  });

  document.addEventListener("click", (event) => {
    if (
      startMenu &&
      !startMenu.classList.contains("hidden") &&
      !startMenu.contains(event.target) &&
      !startButton?.contains(event.target)
    ) {
      setStartMenu(false);
    }
  });

  function focusWindow(win) {
    if (!win) return;
    $$(".window").forEach(w => w.classList.remove("active"));
    $$(".task-button").forEach(b => b.classList.remove("active"));
    win.classList.add("active");
    win.style.zIndex = String(++topZ);
    const task = $(`.task-button[data-window="${win.id}"]`);
    task?.classList.add("active");
  }

  function windowTitle(win) {
    return $(".window-title span", win)?.textContent || "FruitiOS";
  }

  function windowIcon(win) {
    return $(".window-title img", win)?.getAttribute("src") || "assets/apple.png";
  }

  function ensureTaskButton(win) {
    if (!taskButtons || !win) return;
    let task = $(`.task-button[data-window="${win.id}"]`);
    if (task) return task;

    task = document.createElement("button");
    task.className = "task-button";
    task.dataset.window = win.id;
    task.innerHTML = `<img src="${windowIcon(win)}" alt="">${windowTitle(win)}`;
    task.addEventListener("click", () => {
      if (win.classList.contains("hidden")) win.classList.remove("hidden");
      focusWindow(win);
    });
    taskButtons.appendChild(task);
    return task;
  }

  function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.classList.remove("hidden");
    win.style.display = "";
    ensureTaskButton(win);
    focusWindow(win);
    setStartMenu(false);
  }

  function closeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.classList.add("hidden");
    $(`.task-button[data-window="${id}"]`)?.remove();
  }

  function minimizeWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;
    win.classList.add("hidden");
    $(`.task-button[data-window="${id}"]`)?.classList.remove("active");
  }

  $$("[data-window]").forEach(button => {
    button.addEventListener("click", () => openWindow(button.dataset.window));
  });

  $$("[data-close]").forEach(button => {
    button.addEventListener("click", () => closeWindow(button.dataset.close));
  });

  $$("[data-minimize]").forEach(button => {
    button.addEventListener("click", () => minimizeWindow(button.dataset.minimize));
  });

  $$("[data-maximize]").forEach(button => {
    button.addEventListener("click", () => {
      const win = document.getElementById(button.dataset.maximize);
      if (!win) return;
      win.classList.toggle("maximized");
      focusWindow(win);
    });
  });

  $$(".window").forEach(win => {
    win.addEventListener("pointerdown", () => focusWindow(win));
  });

  // Drag windows
  $$(".drag-handle").forEach(handle => {
    const win = handle.closest(".window");
    if (!win) return;

    handle.addEventListener("pointerdown", event => {
      if (event.target.closest("button")) return;
      if (window.innerWidth <= 900 || win.classList.contains("maximized")) return;

      const rect = win.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;

      focusWindow(win);
      handle.setPointerCapture?.(event.pointerId);

      const move = e => {
        const maxX = window.innerWidth - win.offsetWidth - 3;
        const maxY = window.innerHeight - win.offsetHeight - 39;
        const left = Math.max(2, Math.min(maxX, e.clientX - offsetX));
        const top = Math.max(2, Math.min(maxY, e.clientY - offsetY));
        win.style.left = `${left}px`;
        win.style.top = `${top}px`;
      };

      const stop = e => {
        handle.releasePointerCapture?.(e.pointerId);
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", stop);
        handle.removeEventListener("pointercancel", stop);
      };

      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", stop);
      handle.addEventListener("pointercancel", stop);
    });
  });

  // Generic app preview
  $$("[data-app]").forEach(button => {
    button.addEventListener("click", () => {
      const name = button.dataset.app;
      const app = apps[name];
      if (!app) return;

      $("#appPreviewTitle").textContent = name;
      $("#appPreviewName").textContent = name;
      $("#appInfoName").textContent = name;
      $("#appPreviewDescription").textContent = app.description;
      $("#appPreviewIcon").src = app.icon;
      $("#appPreviewTitleIcon").src = app.icon;
      openWindow("appPreviewWindow");
    });
  });

  // Gallery
  const galleryData = {
    desktop: {
      src: "assets/desktop-reference.png",
      alt: "FruitiOS desktop screenshot",
      status: "Desktop screenshot"
    },
    boot: {
      src: "assets/boot-screen.png",
      alt: "FruitiOS startup screen",
      status: "Startup screen"
    },
    wallpaper: {
      src: "assets/orchard.png",
      alt: "FruitiOS Orchard wallpaper",
      status: "Orchard light wallpaper"
    }
  };

  $$(".gallery-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      $$(".gallery-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const item = galleryData[tab.dataset.gallery];
      if (!item || !galleryImage) return;
      galleryImage.src = item.src;
      galleryImage.alt = item.alt;
      if (galleryStatus) galleryStatus.textContent = item.status;
    });
  });

  // Clock
  function updateClock() {
    const clock = $("#clock");
    if (!clock) return;
    clock.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Notices
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add("hidden"), 3000);
  }

  $$("[data-notice]").forEach(button => {
    button.addEventListener("click", () => showToast(button.dataset.notice));
  });

  $("#downloadButton")?.addEventListener("click", () => {
    showToast("Connect this button to your FruitiOS ISO or GitHub release.");
  });

  $("#restartButton")?.addEventListener("click", () => {
    setStartMenu(false);
    runBootSequence();
  });

  // Seed the welcome window taskbar button behavior
  $$(".task-button[data-window]").forEach(button => {
    button.addEventListener("click", () => {
      const win = document.getElementById(button.dataset.window);
      if (!win) return;
      if (win.classList.contains("hidden")) win.classList.remove("hidden");
      focusWindow(win);
    });
  });
})();
