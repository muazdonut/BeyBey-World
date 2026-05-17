let data = [];

const charGrid = document.getElementById('charGrid');
const vidGrid  = document.getElementById('vidGrid');
let vidOffset = 0;
let activeCategory = '';
let selectedVideoId = '';
let categories = [];

async function loadData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`Failed to load data.json: ${response.status}`);
    }
    data = await response.json();
    buildCategories();
    activeCategory = categories[0]?.category || '';
    selectedVideoId = categories[0]?.videos[0]?.id || '';
    renderCards();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

function buildCategories() {
  const map = {};
  categories = [];
  data.forEach(item => {
    if (!map[item.category]) {
      map[item.category] = {
        category: item.category,
        cardImage: item.cardImage,
        hoverCardImage: item.hoverCardImage,
        videos: []
      };
      categories.push(map[item.category]);
    }
    map[item.category].videos.push(item);
  });
}

function renderCards() {
  renderCharacterCards();
  renderVideoCards();
}

function renderCharacterCards() {
  charGrid.innerHTML = '';
  categories.forEach(category => {
    const card = document.createElement('div');
    card.className = 'char-card';
    card.dataset.category = category.category;
    if (category.category === activeCategory) card.classList.add('active');
    card.innerHTML = `
      <div class="card-thumb">
        <img src="${category.cardImage}" class="card-main" alt="${category.category}">
        <img src="${category.hoverCardImage || category.cardImage}" class="card-hover" alt="${category.category} hover">
      </div>
      <div class="char-name">${category.category}</div>
      <div class="char-series">${category.videos.length} videos</div>
    `;
    card.addEventListener('click', () => selectCategory(category.category));
    charGrid.appendChild(card);
  });
}

function renderVideoCards() {
  vidGrid.innerHTML = '';
  const visibleVideos = data.filter(item => item.category === activeCategory);
  visibleVideos.forEach(item => {
    const card = document.createElement('div');
    const isActive = item.id === selectedVideoId;
    card.className = 'video-card';
    card.dataset.id = item.id;
    if (isActive) card.classList.add('active');
    const src = isActive
      ? `https://www.youtube.com/embed/${item.videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`
      : `https://www.youtube.com/embed/${item.videoId}?mute=1&controls=0&loop=1&playlist=${item.videoId}&modestbranding=1&rel=0`;
    card.innerHTML = `
      <div class="vc-thumb">
        <iframe src="${src}"
                allow="autoplay; encrypted-media" allowfullscreen></iframe>
        <div class="vc-overlay"></div>
      </div>
      <div class="vc-info">
        <div class="vc-title">${item.title}</div>
        <div class="vc-cat">${item.category}</div>
      </div>
    `;
    card.addEventListener('click', () => selectVideo(item.id));
    vidGrid.appendChild(card);
  });
}

function selectCategory(category) {
  activeCategory = category;
  selectedVideoId = data.find(item => item.category === category)?.id || '';
  renderCards();
  vidOffset = 0;
  applyOffset(vidGrid, vidOffset);
}

function selectVideo(id) {
  selectedVideoId = id;
  renderVideoCards();
}

loadData();

// ── OFFSET HELPER ──
function applyOffset(grid, offset) {
  const max = grid.children.length - 1;
  offset = Math.max(0, Math.min(offset, max));
  grid.style.transform = `translateX(calc(-${offset} * (25% + 20px)))`;
}

// ── ARROW CONTROLS ──
document.getElementById('vidNext').addEventListener('click', () => {
  vidOffset = Math.min(vidOffset + 1, vidGrid.children.length - 1);
  applyOffset(vidGrid, vidOffset);
});
document.getElementById('vidPrev').addEventListener('click', () => {
  vidOffset = Math.max(vidOffset - 1, 0);
  applyOffset(vidGrid, vidOffset);
});
