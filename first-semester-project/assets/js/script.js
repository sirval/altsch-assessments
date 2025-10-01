let hours = 0, minutes = 0, seconds = 0, milliseconds = 0;
let interval = null, running = false;

const display = document.getElementById("display");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const resetBtn = document.getElementById("reset");
const lapBtn = document.getElementById("lap");
const themeToggle = document.getElementById("theme-toggle");
const lapsContainer = document.getElementById("laps");

// Modal elements
const reloadModal = document.getElementById("reloadModal");
const confirmReload = document.getElementById("confirmReload");
const cancelReload = document.getElementById("cancelReload");

const helpModal = document.getElementById("helpModal");
const closeHelp = document.getElementById("closeHelp");



// Update display with padded numbers
function updateDisplay() {
  let h = hours < 10 ? "0" + hours : hours;
  let m = minutes < 10 ? "0" + minutes : minutes;
  let s = seconds < 10 ? "0" + seconds : seconds;
  let ms = milliseconds < 100 ? (milliseconds < 10 ? "00" + milliseconds : "0" + milliseconds) : milliseconds;
  display.innerText = `${h}:${m}:${s}.${ms}`;
}

// Timer function
function timer() {
  milliseconds += 10; // increase every 10ms
  if (milliseconds === 1000) {
    milliseconds = 0;
    seconds++;
  }
  if (seconds === 60) {
    seconds = 0;
    minutes++;
  }
  if (minutes === 60) {
    minutes = 0;
    hours++;
  }
  updateDisplay();
}

// Start button
startBtn.addEventListener("click", () => {
  if (!running) {
    interval = setInterval(timer, 10); 
    running = true;
  }
});

// Stop button
stopBtn.addEventListener("click", () => {
  clearInterval(interval);
  running = false;
});

// Reset button
resetBtn.addEventListener("click", () => {
  if (! running) {
    clearInterval(interval);
    hours = minutes = seconds = milliseconds = 0;
    running = false;
    lapsContainer.innerHTML = "";
    updateDisplay();
    localStorage.removeItem("laps");
  }
});

// Lap button
lapBtn.addEventListener("click", () => {
  if (running) {
    const lapTime = display.innerText;
    let laps = JSON.parse(localStorage.getItem("laps")) || [];

    // Let's keep laps in order (oldest-newest)
    laps.push(lapTime);
    // Save back to storage 
    localStorage.setItem("laps", JSON.stringify(laps));

    // Clear and rebuild list (descending display)
    lapsContainer.innerHTML = "";
    laps
      .slice() // I guess I need to clone so we the original won't be messed with
      .reverse() // newest first
      .forEach((time, index) => {
        const lapNumber = laps.length - index;
        const li = document.createElement("li");
        li.textContent = `${String(lapNumber).padStart(2, "0")} - ${time}`;
        lapsContainer.appendChild(li);
      });
  }
});



// Load user theme preference from local storage on page load
window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  } else {
    document.body.classList.remove("dark");
    themeToggle.textContent = "🌙";
  }
});

// Toggle theme and save preference
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");

  // Update button icon
  themeToggle.textContent = isDark ? "☀️" : "🌙";

  // Save theme to localStorage
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    running ? stopBtn.click() : startBtn.click();
  } else if (e.code === "KeyR") {
    resetBtn.click();
  } else if (e.code === "KeyL") {
    lapBtn.click();
  }else  if (e.code === "KeyH") {
    helpModal.style.display = "flex";
  }
});

// Restore laps from localStorage
window.onload = () => {
  let savedLaps = JSON.parse(localStorage.getItem("laps")) || [];
  savedLaps.forEach(lap => {
    const li = document.createElement("li");
    li.textContent = lap;
    lapsContainer.appendChild(li);
  });
};

// Intercept reload keys only
document.addEventListener("keydown", (e) => {
  if (!running) return;
  // F5
  if (e.code === "F5") {
    e.preventDefault();
    reloadModal.style.display = "flex";
  }

  // Ctrl+R (Windows/Linux)
  if (e.ctrlKey && e.code === "KeyR") {
    e.preventDefault();
    reloadModal.style.display = "flex";
  }

  // Cmd+R (Mac)
  if (e.metaKey && e.code === "KeyR") {
    e.preventDefault();
    reloadModal.style.display = "flex";
  }
});

// Fallback for browser reload button (native only)
window.addEventListener("beforeunload", (e) => {
  if (running) {
    e.preventDefault();
    e.returnValue = ""; // might work for Chrome/Firefox/Safari native confirm
  }
});


// Handle modal actions
confirmReload.addEventListener("click", () => {
  reloadModal.style.display = "none";
  running = false;
  window.location.reload();
});

cancelReload.addEventListener("click", () => {
  reloadModal.style.display = "none";
});

closeHelp.addEventListener("click", () => {
  helpModal.style.display = "none";
});

window.addEventListener("load", () => {
  const visited = localStorage.getItem("visited");
  if (!visited) {
    helpModal.style.display = "flex"; // Show shortcuts guide
    localStorage.setItem("visited", "true");
  }
});

updateDisplay();