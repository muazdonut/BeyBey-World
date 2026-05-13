let videoData = [];
async function loadVideoData() {
  try {
    const response = await fetch('data.json');
    if (!response.ok) {
      throw new Error(`Failed to load data.json: ${response.status}`);
    }

    videoData = await response.json();
    displayVideosByCategory();
  } catch (error) {
    console.error(error);
  }
}

function displayVideosByCategory() {
  const container = document.querySelector('.video-grid');
  if (!container) return;

  container.innerHTML = "";

  const videosByCategory = videoData.reduce((groups, video) => {
    if (!groups[video.category]) {
      groups[video.category] = [];
    }
    groups[video.category].push(video);
    return groups;
  }, {});

  Object.keys(videosByCategory).forEach(category => {
    const sectionHTML = `
      <section class="video-category">
        <div class="category-header">
          <h1>${category}</h1>
          <div class="category-controls">
            <button class="slider-btn prev" aria-label="Previous ${category}">‹</button>
            <button class="slider-btn next" aria-label="Next ${category}">›</button>
          </div>
        </div>
        <div class="video-row">
          ${videosByCategory[category].map(video => `
            <div class="video-card">
              <iframe width="300" height="200"
                src="https://www.youtube.com/embed/${video.videoId}"
                title="${video.title}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
              </iframe>

              <div class="info">
                <h4>${video.title}</h4>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    `;

    container.innerHTML += sectionHTML;
  });

  document.querySelectorAll('.video-category').forEach(section => {
    const row = section.querySelector('.video-row');
    const prev = section.querySelector('.slider-btn.prev');
    const next = section.querySelector('.slider-btn.next');
    const scrollAmount = 320;

    prev.addEventListener('click', () => {
      row.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    next.addEventListener('click', () => {
      row.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
  });
}
loadVideoData();
