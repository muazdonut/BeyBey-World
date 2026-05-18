/* =========================
   IMAGE FOLDER
========================= */
const folder = "";

/* =========================
   PART DATA
========================= */
const layers = [
  { name:"Layer 1", image:"../customIMG/layer1.png",  atk:5, def:4, stm:4 },
  { name:"Layer 2", image:"../customIMG/layer2.png",  atk:3, def:4, stm:3 },
  { name:"Layer 3", image:"../customIMG/layer3.png",  atk:1, def:2, stm:2 }
];

const discs = [
  { name:"Disc 1", image:"../customIMG/disc1.png",   atk:4, def:5, stm:5 },
  { name:"Disc 2", image:"../customIMG/disc2.png",   atk:3, def:3, stm:4 },
  { name:"Disc 3", image:"../customIMG/disc3.webp",  atk:1, def:1, stm:1 }
];

const drivers = [
  { name:"Driver 1", image:"../customIMG/driver1.webp", atk:5, def:5, stm:4 },
  { name:"Driver 2", image:"../customIMG/driver2.webp", atk:3, def:3, stm:3 },
  { name:"Driver 3", image:"../customIMG/driver3.png",  atk:1, def:1, stm:1 }
];

/* =========================
   INDEX
========================= */
let layerIndex  = 0;
let discIndex   = 0;
let driverIndex = 0;

/* =========================
   INITIAL LOAD
========================= */
updateUI();

/* =========================
   CHANGE FUNCTIONS
========================= */
function changeLayer(dir){
  layerIndex = (layerIndex + dir + layers.length) % layers.length;
  updateUI();
}
function changeDisc(dir){
  discIndex = (discIndex + dir + discs.length) % discs.length;
  updateUI();
}
function changeDriver(dir){
  driverIndex = (driverIndex + dir + drivers.length) % drivers.length;
  updateUI();
}

/* =========================
   UPDATE UI
========================= */
function updateUI(){
  const layer  = layers[layerIndex];
  const disc   = discs[discIndex];
  const driver = drivers[driverIndex];

  document.getElementById("layer-img").src  = folder + layer.image;
  document.getElementById("disc-img").src   = folder + disc.image;
  document.getElementById("driver-img").src = folder + driver.image;

  document.getElementById("layer-name-text").textContent  = layer.name;
  document.getElementById("disc-name-text").textContent   = disc.name;
  document.getElementById("driver-name-text").textContent = driver.name;

  const atk = Math.min(layer.atk + disc.atk + driver.atk, 10);
  const def = Math.min(layer.def + disc.def + driver.def, 10);
  const stm = Math.min(layer.stm + disc.stm + driver.stm, 10);

  updateBar("atk-bar", atk, 10);
  updateBar("def-bar", def, 10);
  updateBar("stm-bar", stm, 10);

  const total = atk + def + stm;
  let stars = 1;
  if      (total >= 28) stars = 5;
  else if (total >= 25) stars = 4;
  else if (total >= 20) stars = 3;
  else if (total >= 15) stars = 2;
  updateStars(stars);

  const statsBox = document.querySelector('.stats-box');
  statsBox.style.borderColor = '#925dff';
  statsBox.style.boxShadow   = '0 0 30px rgba(146,93,255,0.6)';
  setTimeout(() => {
    statsBox.style.borderColor = 'rgba(150,100,255,.15)';
    statsBox.style.boxShadow   = 'none';
  }, 300);
}

/* =========================
   UPDATE BAR
========================= */
function updateBar(id, value, max){
  const bar = document.getElementById(id);
  const colorMap = { 'atk-bar':'red', 'def-bar':'blue', 'stm-bar':'green' };
  const color   = colorMap[id];
  const percent = (value / max * 100) + '%';
  bar.innerHTML = '<div class="bar-fill ' + color + '" style="width:' + percent + '"></div>';
  const valEl = document.getElementById(id.replace('-bar', '-val'));
  if(valEl) valEl.textContent = value;
}

/* =========================
   UPDATE STARS
========================= */
function updateStars(value){
  const starsEl = document.getElementById("stars");
  starsEl.innerHTML = "";
  for(let i = 0; i < 5; i++){
    const star = document.createElement("div");
    star.classList.add("star", i < value ? "on" : "off");
    star.innerHTML = "★";
    starsEl.appendChild(star);
  }
}

/* =========================
   NAME MODAL — open when Save clicked
========================= */
document.getElementById("saveBtn").addEventListener("click", openNameModal);

function openNameModal(){
  document.getElementById("bey-name-input").value = "";
  document.getElementById("name-modal").classList.add("open");
  setTimeout(() => document.getElementById("bey-name-input").focus(), 200);
}

function closeNameModal(e){
  if(e.target === document.getElementById("name-modal")){
    document.getElementById("name-modal").classList.remove("open");
  }
}

function closeNameModalBtn(){
  document.getElementById("name-modal").classList.remove("open");
}

/* also confirm on Enter key */
document.getElementById("bey-name-input").addEventListener("keydown", e => {
  if(e.key === "Enter") confirmSave();
});

/* =========================
   CONFIRM SAVE
========================= */
function confirmSave(){
  const rawName = document.getElementById("bey-name-input").value.trim();
  const beyName = rawName || "Custom Beyblade";

  document.getElementById("name-modal").classList.remove("open");
  saveCustomization(beyName);
}

/* =========================
   SAVE TO LOCALSTORAGE
========================= */
function saveCustomization(beyName){
  const layer  = layers[layerIndex];
  const disc   = discs[discIndex];
  const driver = drivers[driverIndex];

  const atk = Math.min(layer.atk + disc.atk + driver.atk, 10);
  const def = Math.min(layer.def + disc.def + driver.def, 10);
  const stm = Math.min(layer.stm + disc.stm + driver.stm, 10);
  const total = atk + def + stm;

  let rating = 1;
  if      (total >= 28) rating = 5;
  else if (total >= 25) rating = 4;
  else if (total >= 20) rating = 3;
  else if (total >= 15) rating = 2;

  const saveEntry = {
    id         : Date.now(),
    name       : beyName,
    savedAt    : new Date().toLocaleString(),
    layerIndex, discIndex, driverIndex,
    combo : {
      layer  : layer.name,
      disc   : disc.name,
      driver : driver.name
    },
    stats  : { atk, def, stm },
    image  : layer.image,
    rating
  };

  const existing = JSON.parse(localStorage.getItem("beySaves") || "[]");
  existing.push(saveEntry);
  localStorage.setItem("beySaves", JSON.stringify(existing));

  /* Button feedback */
  const btn = document.getElementById("saveBtn");
  btn.textContent = "SAVED ✓";
  btn.style.background = "linear-gradient(135deg,#20cc50,#00ff80)";
  setTimeout(() => {
    btn.textContent = "SAVE BEYBLADE";
    btn.style.background = "";
  }, 1500);

  updateBadge();
}

/* =========================
   DELETE SAVE
========================= */
function deleteSave(id){
  let saves = JSON.parse(localStorage.getItem("beySaves") || "[]");
  saves = saves.filter(s => s.id !== id);
  localStorage.setItem("beySaves", JSON.stringify(saves));
  updateBadge();
  renderModal();
}

/* =========================
   LOAD SAVE
========================= */
function loadSave(id){
  const saves = JSON.parse(localStorage.getItem("beySaves") || "[]");
  const s = saves.find(s => s.id === id);
  if(!s) return;
  layerIndex  = s.layerIndex;
  discIndex   = s.discIndex;
  driverIndex = s.driverIndex;
  updateUI();
  document.getElementById("modal-overlay").classList.remove("open");
}

/* =========================
   SAVES MODAL TOGGLE
========================= */
function toggleModal(e){
  if(e) e.preventDefault();
  const overlay = document.getElementById("modal-overlay");
  const isOpen  = overlay.classList.toggle("open");
  if(isOpen) renderModal();
}

function closeModal(e){
  if(e.target === document.getElementById("modal-overlay")){
    document.getElementById("modal-overlay").classList.remove("open");
  }
}

/* =========================
   RENDER MODAL CARDS
========================= */
function renderModal(){
  const saves = JSON.parse(localStorage.getItem("beySaves") || "[]");
  const grid  = document.getElementById("modal-grid");
  grid.innerHTML = "";

  if(saves.length === 0){
    grid.innerHTML = '<div class="modal-empty">No saved combos yet.<br>Build one and hit SAVE!</div>';
    return;
  }

  [...saves].reverse().forEach(s => {
    const layerImg  = layers[s.layerIndex]   ? layers[s.layerIndex].image   : "";
    const discImg   = discs[s.discIndex]     ? discs[s.discIndex].image     : "";
    const driverImg = drivers[s.driverIndex] ? drivers[s.driverIndex].image : "";
    const starsStr  = "★".repeat(s.rating) + "☆".repeat(5 - s.rating);
    const atkPct    = (s.stats.atk / 10 * 100).toFixed(0);
    const defPct    = (s.stats.def / 10 * 100).toFixed(0);
    const stmPct    = (s.stats.stm / 10 * 100).toFixed(0);

    const card = document.createElement("div");
    card.className = "mc";
    card.innerHTML = `
      <div class="mc-bey-name">${s.name || "Custom Beyblade"}</div>
      <div class="mc-stars">${starsStr}</div>
      <div class="mc-imgs">
        <div class="mc-img-wrap">
          <img src="${folder + layerImg}" class="mc-img">
          <span class="mc-img-label">${s.combo.layer}</span>
        </div>
        <div class="mc-img-wrap">
          <img src="${folder + discImg}" class="mc-img">
          <span class="mc-img-label">${s.combo.disc}</span>
        </div>
        <div class="mc-img-wrap">
          <img src="${folder + driverImg}" class="mc-img mc-img-sm">
          <span class="mc-img-label">${s.combo.driver}</span>
        </div>
      </div>
      <div class="mc-stats">
        <div class="mc-stat-row">
          <span class="mc-stat-lbl">ATK</span>
          <div class="mc-bar"><div class="mc-bar-fill red"   style="width:${atkPct}%"></div></div>
          <span class="mc-stat-num">${s.stats.atk}</span>
        </div>
        <div class="mc-stat-row">
          <span class="mc-stat-lbl">DEF</span>
          <div class="mc-bar"><div class="mc-bar-fill blue"  style="width:${defPct}%"></div></div>
          <span class="mc-stat-num">${s.stats.def}</span>
        </div>
        <div class="mc-stat-row">
          <span class="mc-stat-lbl">STM</span>
          <div class="mc-bar"><div class="mc-bar-fill green" style="width:${stmPct}%"></div></div>
          <span class="mc-stat-num">${s.stats.stm}</span>
        </div>
      </div>
      <div class="mc-date">${s.savedAt}</div>
      <div class="mc-actions">
        <button class="mc-load-btn" onclick="loadSave(${s.id})">LOAD</button>
        <button class="mc-del-btn"  onclick="deleteSave(${s.id})">DELETE</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* =========================
   UPDATE BADGE COUNT
========================= */
function updateBadge(){
  const saves = JSON.parse(localStorage.getItem("beySaves") || "[]");
  const badge = document.getElementById("nav-saves-badge");
  if(badge) badge.textContent = saves.length > 0 ? saves.length : "";
}

updateBadge();