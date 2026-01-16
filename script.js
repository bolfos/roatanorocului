/* -------------------- LOADER -------------------- */
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loader").classList.add("loader-hide");
  }, 800);
});

/* -------------------- ELEMENTE -------------------- */
const fbLike = document.getElementById("fbLike");
const ttFollow = document.getElementById("ttFollow");
const statusEl = document.getElementById("status");
const spinBtn = document.getElementById("spinBtn");
const wheel = document.getElementById("wheel");
const resultEl = document.getElementById("result");

let isSpinning = false;
let currentRotation = 0;

const prizes = [
  "SHAORMA MARE",
  "BAUTURĂ",
  "DESERT",
  "-20% NOTA",
  "SHAORMA MICĂ",
  "SOS"
];

/* -------------------- SUNET CLICK -------------------- */
function playTick() {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.frequency.value = 900;
  gain.gain.value = 0.1;

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

function startTicking() {
  let ticks = 40;
  let interval = 60;

  function tickLoop() {
    playTick();
    interval += 8;
    ticks--;

    if (ticks > 0) {
      setTimeout(tickLoop, interval);
    }
  }

  tickLoop();
}

/* -------------------- SUNETE WIN -------------------- */
const winSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_3f0e3b824c.mp3?filename=success-1-6297.mp3");
const customWinSound = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_3f0e3b824c.mp3?filename=success-1-6297.mp3");

/* -------------------- ANTI-ABUZ -------------------- */
const today = new Date().toLocaleDateString("ro-RO");
const lastPlay = localStorage.getItem("lastPlayDate");

if (lastPlay === today) {
  spinBtn.disabled = true;
  spinBtn.textContent = "Ai jucat deja azi";
}

spinBtn.addEventListener("click", () => {
  localStorage.setItem("lastPlayDate", today);
});

/* -------------------- DEBLOCARE -------------------- */
function checkSteps() {
  if (fbLike.checked && ttFollow.checked) {
    statusEl.textContent = "Perfect! Poți învârti roata.";
    statusEl.classList.add("ready");
    spinBtn.textContent = "Învarte roata";
    spinBtn.classList.add("enabled");
    spinBtn.disabled = false;
  } else {
    statusEl.textContent = "Bifează ambii pași pentru a juca.";
    statusEl.classList.remove("ready");
    spinBtn.textContent = "Deblochează roata";
    spinBtn.classList.remove("enabled");
    spinBtn.disabled = true;
  }
}

fbLike.addEventListener("change", checkSteps);
ttFollow.addEventListener("change", checkSteps);

/* -------------------- COD UNIC -------------------- */
function generatePrizeCode() {
  return "PRM-" + Math.floor(100000 + Math.random() * 900000);
}

/* -------------------- QR -------------------- */
function generateQR(code) {
  const url = `https://siteultau.ro/revendica.html?cod=${code}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
}

/* -------------------- POPUP REGULAMENT -------------------- */
document.getElementById("rulesBtn").addEventListener("click", () => {
  document.getElementById("popupTitle").textContent = "Regulament";
  document.getElementById("popupContent").innerHTML = `
    • Fiecare participant poate juca o singură dată pe zi.<br>
    • Premiile se revendică doar în locație.<br>
    • Codul QR trebuie prezentat la tejghea.<br>
    • Ne rezervăm dreptul de a invalida tentativele de abuz.
  `;
  document.getElementById("popupOverlay").style.display = "flex";
});

function closePopup() {
  document.getElementById("popupOverlay").style.display = "none";
}

/* -------------------- WIN SCREEN -------------------- */
function showWinScreen(prize, code) {
  document.getElementById("winText").innerHTML =
    `Ai câștigat <strong>${prize}</strong><br>Cod: <strong>${code}</strong>`;
  document.getElementById("winScreen").style.display = "flex";

  launchConfetti();
  winSound.currentTime = 0;
  winSound.play();
  customWinSound.currentTime = 0;
  customWinSound.play();

  if (navigator.vibrate) {
    navigator.vibrate([120, 80, 120]);
  }

  document.body.classList.add("shake-screen");
  setTimeout(() => document.body.classList.remove("shake-screen"), 400);
}

function closeWinScreen() {
  document.getElementById("winScreen").style.display = "none";
}

/* -------------------- CONFETTI -------------------- */
const confettiCanvas = document.getElementById("confettiCanvas");
const ctx = confettiCanvas.getContext("2d");

function resizeConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
resizeConfetti();
window.addEventListener("resize", resizeConfetti);

let confettiPieces = [];

function launchConfetti() {
  confettiPieces = [];

  for (let i = 0; i < 120; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * -50,
      size: Math.random() * 8 + 4,
      color: ["#ff1a1a", "#ff6a00", "#ffe600", "#ffffff"][Math.floor(Math.random() * 4)],
      speed: Math.random() * 3 + 2,
      angle: Math.random() * 360
    });
  }

  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  confettiPieces.forEach((p) => {
    p.y += p.speed;
    p.angle += 5;

    ctx.fillStyle = p.color;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.angle * Math.PI) / 180);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
    ctx.restore();
  });

  confettiPieces = confettiPieces.filter((p) => p.y < confettiCanvas.height + 50);

  if (confettiPieces.length > 0) {
    requestAnimationFrame(animateConfetti);
  }
}

/* -------------------- CSV AUTO-GENERATION -------------------- */
function updateCSV() {
  const data = JSON.parse(localStorage.getItem("prizes") || "[]");
  let csv = "Cod,Premiu,Data,Status\n";

  data.forEach(entry => {
    csv += `${entry.code},${entry.prize},${entry.date},${entry.claimed ? "Revendicat" : "Nerevendicat"}\n`;
  });

  localStorage.setItem("csv_export", csv);
}

/* -------------------- ROTIRE ROATĂ -------------------- */
spinBtn.addEventListener("click", () => {
  if (!spinBtn.classList.contains("enabled") || isSpinning) return;

  isSpinning = true;
  resultEl.textContent = "";
  startTicking();

  const sectorCount = prizes.length;
  const sectorAngle = 360 / sectorCount;

  const randomSector = Math.floor(Math.random() * sectorCount);
  const extraSpins = 5;

  const targetAngle =
    extraSpins * 360 +
    (360 - randomSector * sectorAngle - sectorAngle / 2);

  currentRotation = targetAngle;

  wheel.style.transform = `rotate(${currentRotation}deg)`;

  setTimeout(() => {
    const prize = prizes[randomSector];

    const code = generatePrizeCode();
    const qrUrl = generateQR(code);

    resultEl.innerHTML = `
      <div>Ai câștigat: <strong>${prize}</strong></div>
      <div>Cod premiu: <strong>${code}</strong></div>
      <img src="${qrUrl}" style="margin-top:10px; width:180px;">
      <p>Arată acest cod la tejghea pentru revendicare.</p>
    `;

    wheel.classList.add("bounce");
    setTimeout(() => wheel.classList.remove("bounce"), 600);

    const prizeData = JSON.parse(localStorage.getItem("prizes") || "[]");

    prizeData.push({
      code: code,
      prize: prize,
      date: new Date().toLocaleString("ro-RO"),
      claimed: false
    });

    localStorage.setItem("prizes", JSON.stringify(prizeData));

    updateCSV(); // CSV actualizat automat

    showWinScreen(prize, code);

    isSpinning = false;
  }, 4000);
});
