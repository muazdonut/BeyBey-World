/**
 * Intercepts card selections and updates browser memory.
 */
function openNews(id) {
  localStorage.setItem("selectedNews", id);
  window.location.href = "detail.html";
}

/**
 * Asynchronous function that fetches, sorts, and displays news cards
 * dynamically inside our news container.
 */
async function loadAndDisplayNews() {
  try {
    // 1. Fetch our centralized news data file
    const response = await fetch('news.json');
    if (!response.ok) throw new Error("Could not load news data file.");
    const newsData = await response.json();

    // 2. Convert the JSON object data into a sortable array structure
    // We attach the original object ID (1, 2, 3...) to each article item
    const articlesArray = Object.keys(newsData).map(id => {
      return { id: id, ...newsData[id] };
    });

    // 3. Sort the array from NEWEST to OLDEST based on the time format
    articlesArray.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    // 4. Target our empty HTML container
    const container = document.getElementById("news-container");
    container.innerHTML = ""; // Clear out any loading placeholders

    // 5. Loop through our newly sorted array and build the HTML templates
    articlesArray.forEach(article => {
      // Create a wrapper card div element
      const card = document.createElement("div");
      card.className = "news-card";
      
      // Setup the click handler passing the stored original item ID
      card.setAttribute("onclick", `openNews(${article.id})`);

      // Fill out the inside structure of the card layout dynamically
      card.innerHTML = `
        <img src="${article.image}" alt="${article.title}">
        <div class="news-content">
          <h3>${article.title}</h3>
          <p class="time" data-date="${article.date}"></p>
        </div>
      `;

      // Append our completely finished card straight into our grid container
      container.appendChild(card);
    });

    // 6. Run the timestamp clocks calculation right after creating our elements
    updateTimes();
    setInterval(updateTimes, 60000);

  } catch (error) {
    console.error("Error setting up dynamic sorted grid:", error);
  }
}

/**
 * Evaluates dataset timestamps to display real-time tracking logs (e.g., "x hours ago")
 */
function updateTimes() {
  const timeElements = document.querySelectorAll('.time');

  timeElements.forEach(element => {
    const uploadDate = new Date(element.dataset.date);
    const now = new Date();
    const diff = now - uploadDate;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) {
      element.textContent = `${minutes} minutes ago`;
    }
    else if (hours < 24) {
      element.textContent = `${hours} hours ago`;
    }
    else if (days < 7) {
      element.textContent = `${days} days ago`;
    }
    else {
      element.textContent = uploadDate.toDateString();
    }
  });
}

// Fire off the loading and sorting sequence immediately upon page land
loadAndDisplayNews();