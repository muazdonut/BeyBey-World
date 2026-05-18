const wrapper = document.querySelector('.nav-wrapper'); /* grabs the wrapper */
    const links = document.querySelectorAll('.nav-menu a'); /* grabs all nav links */

    window.addEventListener('scroll', function() {          /* listens for scroll */
      if (window.scrollY > 100) {                           /* after scrolling 100px */
        wrapper.classList.add('visible');                   /* slides bar into view */
      } else {
        wrapper.classList.remove('visible');                /* hides it again at top */
      }
    });

    links.forEach(function(link) {                          /* loops through each link */
      link.addEventListener('click', function() {           /* listens for click */
        links.forEach(function(l) {                         /* removes active from all */
          l.classList.remove('active');
        });
        this.classList.add('active');                       /* adds active to clicked one */
      });
    });

let data = [];

const charGrid = document.getElementById('charGrid');
let activeCategory = '';
let selectedVideoId = '';
let categories = [];
const catOffsets = {};

async function loadData() {
  try {
    const response = await fetch('series.json');
    if (!response.ok) {
      throw new Error(`Failed to load series.json: ${response.status}`);
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
  renderCategoryBlocks();
}

// ── CHARACTER CARDS (unchanged) ──
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

// ── CATEGORY BLOCKS (new episode layout) ──
function renderCategoryBlocks() {
  const container = document.getElementById('categoryBlocks');
  container.innerHTML = '';

  categories.forEach(cat => {
    catOffsets[cat.category] = catOffsets[cat.category] || 0;

    const block = document.createElement('div');
    block.id = `cat-${cat.category}`;
    block.style.marginBottom = '52px';
    block.style.scrollMarginTop = '20px';

    // Category label row
    const label = document.createElement('h3');
    label.className = 'cat-label';
    label.textContent = cat.category;
    block.appendChild(label);

    // Carousel
    const wrap = document.createElement('div');
    wrap.className = 'carousel-wrap';

    const prevBtn = document.createElement('button');
    prevBtn.className = 'arrow-btn';
    prevBtn.innerHTML = '&#8249;';

    const track = document.createElement('div');
    track.className = 'carousel-track';
    const grid = document.createElement('div');
    grid.className = 'carousel-grid';
    track.appendChild(grid);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'arrow-btn';
    nextBtn.innerHTML = '&#8250;';

    wrap.appendChild(prevBtn);
    wrap.appendChild(track);
    wrap.appendChild(nextBtn);
    block.appendChild(wrap);

    // Arrow events
    prevBtn.addEventListener('click', () => {
      catOffsets[cat.category] = Math.max(0, catOffsets[cat.category] - 1);
      applyOffset(grid, catOffsets[cat.category]);
    });
    nextBtn.addEventListener('click', () => {
      catOffsets[cat.category] = Math.min(cat.videos.length - 1, catOffsets[cat.category] + 1);
      applyOffset(grid, catOffsets[cat.category]);
    });

    // Video cards
    cat.videos.forEach(item => {
      const isActive = item.id === selectedVideoId;
      const card = document.createElement('div');
      card.className = 'video-card' + (isActive ? ' active' : '');
      card.dataset.id = item.id;
      const src = isActive
        ? `https://www.youtube.com/embed/${item.videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`
        : `https://www.youtube.com/embed/${item.videoId}?mute=1&controls=0&loop=1&playlist=${item.videoId}&modestbranding=1&rel=0`;
      card.innerHTML = `
        <div class="vc-thumb">
          <iframe src="${src}" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          <div class="vc-overlay"></div>
        </div>
        <div class="vc-info">
          <div class="vc-title">${item.title}</div>
        </div>
      `;
      card.addEventListener('click', () => selectVideo(item.id));
      grid.appendChild(card);
    });

    container.appendChild(block);
  });
}

function selectCategory(category) {
  activeCategory = category;
  selectedVideoId = data.find(item => item.category === category)?.id || '';

  // Update active state on char cards
  charGrid.querySelectorAll('.char-card').forEach(c => {
    c.classList.toggle('active', c.dataset.category === category);
  });

  // Scroll to the category block
  const target = document.getElementById(`cat-${category}`);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectVideo(id) {
  selectedVideoId = id;
  // Re-render only video cards
  renderCategoryBlocks();
}

loadData();

// ── OFFSET HELPER ──
function applyOffset(grid, offset) {
  const max = grid.children.length - 1;
  offset = Math.max(0, Math.min(offset, max));
  grid.style.transform = `translateX(calc(-${offset} * (25% + 20px)))`;
}
