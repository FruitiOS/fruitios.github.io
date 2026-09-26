(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  // Boot screen
  const bootScreen = $("#bootScreen");
  window.addEventListener("load", () => {
    if (!bootScreen) return;
    window.setTimeout(() => bootScreen.classList.add("is-done"), 900);
  });

  // Start menu
  const startButton = $("#startButton");
  const startMenu = $("#startMenu");

  function setStartMenu(open) {
    if (!startButton || !startMenu) return;
    startMenu.classList.toggle("open", open);
    startButton.setAttribute("aria-expanded", String(open));
  }

  if (startButton && startMenu) {
    startButton.addEventListener("click", (event) => {
      event.stopPropagation();
      setStartMenu(!startMenu.classList.contains("open"));
    });

    document.addEventListener("click", (event) => {
      if (!startMenu.contains(event.target) && !startButton.contains(event.target)) {
        setStartMenu(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setStartMenu(false);
    });
  }

  // Section navigation
  function scrollToTarget(selector) {
    if (!selector) return;
    const target = $(selector);
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    setStartMenu(false);
  }

  $$("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => scrollToTarget(button.dataset.scroll));
  });

  // Desktop clock
  const desktopClock = $("#desktopClock");

  function updateClock() {
    if (!desktopClock) return;

    desktopClock.textContent = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  // Desktop windows
  let topZ = 20;

  function focusWindow(win) {
    if (!win) return;

    $$(".draggable").forEach((item) => {
      item.classList.remove("active-window");
    });

    win.classList.add("active-window");
    win.style.zIndex = String(++topZ);
  }

  function openWindow(id) {
    if (!id) return;

    const win = document.getElementById(id);
    if (!win) return;

    win.classList.remove("is-hidden");
    focusWindow(win);
    setStartMenu(false);
  }

  function closeWindow(id) {
    if (!id) return;

    const win = document.getElementById(id);
    if (!win) return;

    win.classList.add("is-hidden");
  }

  $$("[data-window]").forEach((button) => {
    button.addEventListener("click", () => openWindow(button.dataset.window));
  });

  $$("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeWindow(button.dataset.close));
  });

  // Draggable windows
  const desktopShell = $(".desktop-shell");

  $$(".draggable").forEach((win) => {
    const handle = $(".drag-handle", win);
    if (!handle) return;

    win.addEventListener("pointerdown", () => focusWindow(win));

    handle.addEventListener("pointerdown", (event) => {
      if (window.innerWidth < 760) return;
      if (event.target.closest("button")) return;
      if (!desktopShell) return;

      const winRect = win.getBoundingClientRect();
      const offsetX = event.clientX - winRect.left;
      const offsetY = event.clientY - winRect.top;

      win.style.position = "absolute";
      win.style.margin = "0";
      win.style.transform = "none";

      focusWindow(win);

      if (handle.setPointerCapture) {
        handle.setPointerCapture(event.pointerId);
      }

      const move = (moveEvent) => {
        const desktopRect = desktopShell.getBoundingClientRect();

        const maxX = Math.max(4, desktopRect.width - win.offsetWidth - 6);
        const maxY = Math.max(4, desktopRect.height - win.offsetHeight - 52);

        const left = Math.max(
          4,
          Math.min(maxX, moveEvent.clientX - desktopRect.left - offsetX)
        );

        const top = Math.max(
          4,
          Math.min(maxY, moveEvent.clientY - desktopRect.top - offsetY)
        );

        win.style.left = `${left}px`;
        win.style.top = `${top}px`;
      };

      const finishDrag = (upEvent) => {
        if (
          handle.releasePointerCapture &&
          handle.hasPointerCapture?.(upEvent.pointerId)
        ) {
          handle.releasePointerCapture(upEvent.pointerId);
        }

        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", finishDrag);
        handle.removeEventListener("pointercancel", finishDrag);
      };

      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", finishDrag);
      handle.addEventListener("pointercancel", finishDrag);
    });
  });

  // Terminal
  const terminalOutput = $("#terminalOutput");
  const terminalForm = $("#terminalForm");
  const terminalInput = $("#terminalInput");
  const terminalWindow = $(".terminal-window");

  const fileList = [
    "Documents/",
    "Downloads/",
    "Library/",
    "FruitiOS/",
    "Program Files/",
    "Music/",
    "Pictures/",
    "Coding/"
  ];

  const fruitMessages = [
    "Apple acquired.",
    "Orange driver loaded.",
    "Strawberry.dll is somehow stable.",
    "Banana bus detected.",
    "Watermelon successfully mounted.",
    "Grape cluster allocated.",
    "Pear device initialized."
  ];

  const commands = {
    help() {
      return [
        "Available commands:",
        "  help       Show this command list",
        "  about      About FruitiOS",
        "  version    Show the current version",
        "  ls         List directories",
        "  specs      Show project platform details",
        "  fruit      Receive a highly technical fruit",
        "  subscribe  A historically important command",
        "  echo TEXT  Print text",
        "  clear      Clear the terminal"
      ].join("\n");
    },

    about() {
      return [
        "FruitiOS is a hobby operating-system project",
        "combining classic desktop UI ideas with a modern-retro direction.",
        "",
        'The New "Apple" OS for Intel.'
      ].join("\n");
    },

    version() {
      return "FruitiOS 2\nDevelopment Build";
    },

    ls() {
      return fileList.join("\n");
    },

    specs() {
      return [
        "Architecture: Intel / x86",
        "Interface: framebuffer GUI",
        "Input: keyboard + mouse",
        "Desktop: windows + taskbar + Fruit menu",
        "Style: classic desktop, modernized"
      ].join("\n");
    },

    fruit() {
      return fruitMessages[Math.floor(Math.random() * fruitMessages.length)];
    },

    subscribe() {
      return "Make sure to subscribe to FruitiGaming! :)";
    }
  };

  function addTerminalLine(text, className = "") {
    if (!terminalOutput) return;

    const line = document.createElement("div");

    if (className) line.className = className;

    line.style.whiteSpace = "pre-wrap";
    line.textContent = text;

    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
  }

  if (terminalForm && terminalInput && terminalOutput) {
    terminalForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const raw = terminalInput.value.trim();

      if (!raw) {
        terminalInput.focus();
        return;
      }

      addTerminalLine(`$FruitiOS:> ${raw}`, "terminal-line-command");

      const [commandRaw, ...args] = raw.split(/\s+/);
      const command = commandRaw.toLowerCase();

      if (command === "clear") {
        terminalOutput.innerHTML = "";
      } else if (command === "echo") {
        addTerminalLine(args.join(" "));
      } else if (Object.prototype.hasOwnProperty.call(commands, command)) {
        addTerminalLine(commands[command]());
      } else {
        addTerminalLine(
          `'${commandRaw}' is not recognized. Type 'help' for available commands.`
        );
      }

      terminalInput.value = "";
      terminalInput.focus();
    });
  }

  if (terminalWindow && terminalInput) {
    terminalWindow.addEventListener("click", (event) => {
      if (!event.target.closest("button")) {
        terminalInput.focus();
      }
    });
  }

  // Toasts / placeholder buttons
  const toast = $("#toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    if (toastTimer) window.clearTimeout(toastTimer);

    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  $$("[data-placeholder]").forEach((button) => {
    button.addEventListener("click", () => {
      const kind = button.dataset.placeholder;

      if (kind === "github") {
        showToast(
          "Connect this button to the FruitiOS GitHub repository when you are ready."
        );
      } else {
        showToast(
          "Connect this button to the current FruitiOS development build when you are ready."
        );
      }
    });
  });

  // Ctrl/Cmd + K -> terminal
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      if (!terminalInput) return;

      event.preventDefault();
      scrollToTarget("#terminal");

      window.setTimeout(() => {
        terminalInput.focus();
      }, 450);
    }
  });
})();
