/* =========================
   STATE
========================= */
let beyblades  = [];   // default beys from battle.json
let customBeys = [];   // saved custom beys from localStorage
let activeBey1 = null; // currently selected custom bey
let activeBey2 = null; // currently selected default bey

/* =========================
   LOAD DATA
========================= */
fetch("battle.json")
  .then(res => res.json())
  .then(data => {
    beyblades = data;
    loadCustomSelector();
    loadDefaultSelector();
  });

/* =========================
   SHARED HELPERS
========================= */
function updateBar(barId, valId, value, colorClass){
  const bar = document.getElementById(barId);
  const val = document.getElementById(valId);
  const pct = (Math.min(value, 10) / 10 * 100) + "%";
  bar.innerHTML = '<div class="bar-fill ' + colorClass + '" style="width:' + pct + '"></div>';
  if(val) val.textContent = value;
}

function updateStars(containerId, value){
  const el = document.getElementById(containerId);
  el.innerHTML = "";
  for(let i = 0; i < 5; i++){
    const star = document.createElement("div");
    star.className = "star " + (i < value ? "on" : "off");
    star.innerHTML = "★";
    el.appendChild(star);
  }
}

function calcStars(atk, def, stm){
  const total = atk + def + stm;
  if(total >= 28) return 5;
  if(total >= 25) return 4;
  if(total >= 20) return 3;
  if(total >= 15) return 2;
  return 1;
}

/* =========================
   LEFT — CUSTOM BEY SELECTOR
========================= */
function loadCustomSelector(){
  customBeys = JSON.parse(localStorage.getItem("beySaves") || "[]");
  const select1 = document.getElementById("select1");
  select1.innerHTML = "";

  if(customBeys.length === 0){
    select1.innerHTML = '<option value="-1">No saved beys — go to Custom!</option>';
    activeBey1 = null;
    clearLeft();
    return;
  }

  customBeys.forEach((bey, i) => {
    select1.innerHTML += `<option value="${i}">${bey.name || "Custom Beyblade"}</option>`;
  });

  updateLeft();
}

function updateLeft(){
  const idx = parseInt(document.getElementById("select1").value);
  if(idx < 0 || !customBeys[idx]){ clearLeft(); return; }
  const s = customBeys[idx];

  activeBey1 = {
    name  : s.name || "Custom Beyblade",
    atk   : s.stats.atk,
    def   : s.stats.def,
    stm   : s.stats.stm,
    image : s.image || ""
  };

  document.getElementById("bey1").src = activeBey1.image;
  updateBar("atk1-bar","atk1-val", activeBey1.atk, "red");
  updateBar("def1-bar","def1-val", activeBey1.def, "blue");
  updateBar("stm1-bar","stm1-val", activeBey1.stm, "green");
  updateStars("stars1", calcStars(activeBey1.atk, activeBey1.def, activeBey1.stm));
}

function clearLeft(){
  document.getElementById("bey1").src = "";
  updateBar("atk1-bar","atk1-val", 0, "red");
  updateBar("def1-bar","def1-val", 0, "blue");
  updateBar("stm1-bar","stm1-val", 0, "green");
  updateStars("stars1", 0);
}

document.getElementById("select1").addEventListener("change", updateLeft);

/* =========================
   RIGHT — DEFAULT BEY SELECTOR
========================= */
function loadDefaultSelector(){
  const select2 = document.getElementById("select2");
  select2.innerHTML = "";
  beyblades.forEach((bey, i) => {
    select2.innerHTML += `<option value="${i}">${bey.name}</option>`;
  });
  updateRight();
}

function updateRight(){
  const bey = beyblades[document.getElementById("select2").value];
  if(!bey) return;
  activeBey2 = bey;

  document.getElementById("bey2").src = bey.image;
  updateBar("atk2-bar","atk2-val", bey.atk, "red");
  updateBar("def2-bar","def2-val", bey.def, "blue");
  updateBar("stm2-bar","stm2-val", bey.stm, "green");
  updateStars("stars2", calcStars(bey.atk, bey.def, bey.stm));
}

document.getElementById("select2").addEventListener("change", updateRight);

/* =========================
   BATTLE BUTTON
========================= */
document.getElementById("battleBtn").addEventListener("click", () => {
  if(!activeBey1 || !activeBey2) return;
  startBattleAnimation();
});

/* =========================
   BATTLE ANIMATION
========================= */
function startBattleAnimation(){
  const overlay  = document.getElementById("battle-overlay");
  const phase1   = document.getElementById("phase-battle");
  const phase2   = document.getElementById("phase-winner");
  const phaseVid = document.getElementById("phase-video");
  const video    = document.getElementById("clash-video");
  const countdown= document.getElementById("battle-countdown");
  const sparks   = document.getElementById("clash-sparks");
  const flash    = document.getElementById("clash-flash");

  /* set bey images in animation */
  document.getElementById("anim-bey1").src = activeBey1.image;
  document.getElementById("anim-bey2").src = activeBey2.image;

  /* reset */
  overlay.classList.remove("visible");
  phase1.classList.remove("hidden");
  phaseVid.classList.remove("visible");
  phase2.classList.remove("slide-up");
  phase2.style.transform = "translateY(100%)";
  countdown.textContent = "";
  sparks.innerHTML = "";
  flash.classList.remove("flash-active");
  video.currentTime = 0;

  /* show overlay */
  overlay.classList.add("visible");

  /* --- SEQUENCE --- */
  let count = 3;
  countdown.textContent = count;

  const tick = setInterval(() => {
    count--;
    if(count > 0){
      countdown.textContent = count;
      countdown.classList.add("pop");
      setTimeout(() => countdown.classList.remove("pop"), 300);
    } else {
      clearInterval(tick);
      countdown.textContent = "GO!";
      countdown.classList.add("pop");

      /* sparks burst */
      for(let i = 0; i < 18; i++) createSpark(sparks);

      /* flash */
      setTimeout(() => {
        flash.classList.add("flash-active");
        setTimeout(() => flash.classList.remove("flash-active"), 400);
      }, 300);

      /* show clash video after the flash */
      setTimeout(() => {
        phase1.classList.add("hidden");
        phaseVid.classList.add("visible");
        video.play();

        /* when video ends, show winner */
        video.onended = () => {
          phaseVid.classList.remove("visible");
          showWinner(phase1, phase2);
        };
      }, 800);
    }
  }, 900);
}

/* create a spark particle */
function createSpark(container){
  const s = document.createElement("div");
  s.className = "spark";
  const angle  = Math.random() * 360;
  const dist   = 60 + Math.random() * 120;
  const dx     = Math.cos(angle * Math.PI / 180) * dist;
  const dy     = Math.sin(angle * Math.PI / 180) * dist;
  const size   = 4 + Math.random() * 8;
  const colors = ["#ff4444","#ffcc00","#ff8800","#ffffff","#925dff"];
  s.style.cssText = `
    position:absolute;
    width:${size}px; height:${size}px;
    border-radius:50%;
    background:${colors[Math.floor(Math.random()*colors.length)]};
    top:50%; left:50%;
    transform:translate(-50%,-50%);
    animation:spark-fly 0.8s ease-out forwards;
    --dx:${dx}px; --dy:${dy}px;
  `;
  container.appendChild(s);
  setTimeout(() => s.remove(), 900);
}

/* =========================
   SHOW WINNER SCREEN
========================= */
function showWinner(phase1, phase2){
  const total1 = activeBey1.atk + activeBey1.def + activeBey1.stm;
  const total2 = activeBey2.atk + activeBey2.def + activeBey2.stm;

  let winnerName, winnerImg, isDrawl = false;

  if(total1 > total2){
    winnerName = activeBey1.name;
    winnerImg  = activeBey1.image;
  } else if(total2 > total1){
    winnerName = activeBey2.name;
    winnerImg  = activeBey2.image;
  } else {
    winnerName = "IT'S A DRAW!";
    winnerImg  = activeBey1.image;
    isDrawl    = true;
  }

  document.getElementById("winner-label").textContent = isDrawl ? "DRAW" : "WINNER";
  document.getElementById("winner-name").textContent  = winnerName;
  document.getElementById("winner-bey-img").src       = winnerImg;

  /* hide the battle arena so only the winner screen shows */
  phase1.classList.add("hidden");

  /* slide phase2 up from bottom */
  phase2.style.transform   = "translateY(100%)";
  phase2.style.transition  = "none";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      phase2.style.transition  = "transform 0.55s cubic-bezier(.2,.8,.3,1)";
      phase2.style.transform   = "translateY(0%)";
    });
  });

  /* tap anywhere to dismiss */
  setTimeout(() => {
    document.getElementById("battle-overlay").addEventListener("click", closeBattleOverlay, { once: true });
  }, 600);
}

function closeBattleOverlay(){
  const overlay = document.getElementById("battle-overlay");
  const video   = document.getElementById("clash-video");
  overlay.classList.remove("visible");
  video.pause();
  video.currentTime = 0;
  document.getElementById("phase-video").classList.remove("visible");

  /* reset bey classes on main page */
  document.getElementById("bey1").classList.remove("winner","loser");
  document.getElementById("bey2").classList.remove("winner","loser");
}