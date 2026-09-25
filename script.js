/* =========================
   FruitiOS Website
   ========================= */


/* --------------------------------
   Copyright year
-------------------------------- */

const yearElement = document.getElementById("year");

yearElement.textContent = new Date().getFullYear();


/* --------------------------------
   Navigation
-------------------------------- */

const menuButton = document.getElementById("menuButton");
const navLinks = document.getElementById("navLinks");

menuButton.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});


document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
  });
});


/* --------------------------------
   Dark mode
-------------------------------- */

const themeButton = document.getElementById("themeButton");

const storedTheme = localStorage.getItem("fruitios-theme");

if (storedTheme === "dark") {
  document.body.classList.add("dark");
  themeButton.textContent = "☀";
}


themeButton.addEventListener("click", () => {

  document.body.classList.toggle("dark");

  const darkMode =
    document.body.classList.contains("dark");

  themeButton.textContent =
    darkMode ? "☀" : "☾";

  localStorage.setItem(
    "fruitios-theme",
    darkMode ? "dark" : "light"
  );

});


/* --------------------------------
   FruitiOS Fruit Menu
-------------------------------- */

const fruitButton =
  document.getElementById("fruitButton");

const fruitMenu =
  document.getElementById("fruitMenu");


fruitButton.addEventListener("click", event => {

  event.stopPropagation();

  fruitMenu.classList.toggle("open");

});


document.addEventListener("click", event => {

  if (
    !fruitMenu.contains(event.target) &&
    event.target !== fruitButton
  ) {

    fruitMenu.classList.remove("open");

  }

});


/* --------------------------------
   FruitiOS desktop clock
-------------------------------- */

const taskTime =
  document.getElementById("taskTime");


function updateDesktopTime() {

  const now = new Date();

  taskTime.textContent =
    now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

}


updateDesktopTime();

setInterval(updateDesktopTime, 1000);


/* --------------------------------
   Terminal
-------------------------------- */

const terminalForm =
  document.getElementById("terminalForm");

const terminalInput =
  document.getElementById("terminalInput");

const terminalOutput =
  document.getElementById("terminalOutput");


const commands = {

  help() {

    return `
Available commands:

help       Show available commands
about      About FruitiOS
ls         List files
version    Show FruitiOS version
fruit      Get some fruit
echo       Print text
clear      Clear the terminal
subscribe  Very important command
`;

  },


  about() {

    return `
FruitiOS is a hobby operating-system project
built to experiment with kernels, graphics,
interfaces and making computers a little more fun.
`;

  },


  ls() {

    return `
Documents/
Downloads/
Library/
FruitiOS/
Program Files/
Music/
Pictures/
Coding/
`;

  },


  version() {

    return `
FruitiOS 2
Development Build
`;

  },


  fruit() {

    const fruits = [
      "🍎 Apple acquired.",
      "🍊 Orange installed successfully.",
      "🍓 Strawberry loaded into memory.",
      "🍉 Watermelon detected.",
      "🍌 Banana driver initialized.",
      "🍇 Grapes.exe is responding."
    ];

    return fruits[
      Math.floor(
        Math.random() * fruits.length
      )
    ];

  },


  subscribe() {

    return `
Make sure to subscribe to FruitiGaming! :)
`;

  }

};


terminalForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    const input =
      terminalInput.value.trim();

    if (!input) {
      return;
    }


    /* Display entered command */

    const commandLine =
      document.createElement("div");

    commandLine.innerHTML =
      `<span class="terminal-command">$FruitiOS:&gt;</span> ${escapeHTML(input)}`;

    terminalOutput.appendChild(commandLine);


    const parts =
      input.split(" ");

    const command =
      parts[0].toLowerCase();

    const argumentsText =
      parts.slice(1).join(" ");


    /* Clear command */

    if (command === "clear") {

      terminalOutput.innerHTML = "";

      terminalInput.value = "";

      return;

    }


    /* Echo command */

    if (command === "echo") {

      addTerminalOutput(
        argumentsText || ""
      );

    }

    /* Known command */

    else if (commands[command]) {

      addTerminalOutput(
        commands[command]()
      );

    }

    /* Unknown command */

    else {

      addTerminalOutput(
        `'${command}' is not a recognized FruitiOS command.\nType 'help' for available commands.`
      );

    }


    terminalInput.value = "";

    terminalOutput.scrollTop =
      terminalOutput.scrollHeight;

  }
);


function addTerminalOutput(text) {

  const output =
    document.createElement("div");

  output.style.whiteSpace = "pre-wrap";

  output.textContent = text.trim();

  output.style.marginBottom = "8px";

  terminalOutput.appendChild(output);

}


function escapeHTML(string) {

  return string
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* Click terminal to start typing */

document
  .querySelector(".interactive-terminal")
  .addEventListener("click", () => {

    terminalInput.focus();

  });


/* --------------------------------
   Scroll reveal
-------------------------------- */

const revealElements =
  document.querySelectorAll(
    ".feature-card, .app-card, .story-panel, .download-card"
  );


revealElements.forEach(element => {
  element.classList.add("reveal");
});


const observer =
  new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add(
            "visible"
          );

          observer.unobserve(
            entry.target
          );

        }

      });

    },
    {
      threshold: 0.12
    }
  );


revealElements.forEach(element => {
  observer.observe(element);
});


/* --------------------------------
   Small parallax effect
-------------------------------- */

const desktop =
  document.querySelector(".desktop");


if (
  desktop &&
  window.matchMedia("(min-width: 1000px)").matches
) {

  desktop.addEventListener(
    "mousemove",
    event => {

      const rect =
        desktop.getBoundingClientRect();

      const x =
        event.clientX - rect.left;

      const y =
        event.clientY - rect.top;

      const rotateY =
        ((x / rect.width) - 0.5) * 5;

      const rotateX =
        ((y / rect.height) - 0.5) * -5;

      desktop.style.transform =
        `
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateY(-3px)
        `;

    }
  );


  desktop.addEventListener(
    "mouseleave",
    () => {

      desktop.style.transform =
        `
          rotateY(-5deg)
          rotateX(2deg)
        `;

    }
  );

}
