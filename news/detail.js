/**
 * Asynchronous Data Processing Engine (Modern AJAX Implementation)
 * Reads decoupled content metrics out of static external JSON files, matches
 * the browser's stored navigation ID, and paints target DOM elements.
 */
async function streamArticleDetails() {
  try {
    // 1. Initiates an asynchronous background network request to find our JSON file
    const networkResponse = await fetch('news.json');
    
    // Safety check: Halt execution and fail if file path targets or server pipes go offline
    if (!networkResponse.ok) {
      throw new Error(`Data pipeline connection failure. HTTP Code status: ${networkResponse.status}`);
    }

    // 2. Extracts raw data blocks out of the stream buffer and reads them into a JavaScript object
    const newsData = await networkResponse.json();

    // 3. Retrieves the unique card choice selection code saved by news.js inside browser memory
    const selectedArticleID = localStorage.getItem("selectedNews");
    
    // 4. Matches tracking key signatures against our extracted JSON data library structure
    const activeArticle = newsData[selectedArticleID];

    // If an article object matches our lookup parameter, update the HTML document structure
    if (activeArticle) {
      // Swaps blank image sources with correct file references
      document.getElementById("detail-image").src = activeArticle.image;
      
      // Overwrites placeholder elements with the article's real title text
      document.getElementById("detail-title").textContent = activeArticle.title;
      
      // Populates empty descriptions with long copy content strings
      document.getElementById("detail-description").textContent = activeArticle.description;

      // Generates a clean localized chronological date string for target content lines
      const calendarTimestamp = new Date(activeArticle.date);
      document.getElementById("detail-time").textContent = calendarTimestamp.toLocaleString();
    } else {
      // Fallback: Handles edge-case situations if missing/corrupt item IDs are parsed
      document.getElementById("detail-title").textContent = "Article Content Not Found";
    }

  } catch (executionError) {
    // Error Logging: Catches and outputs runtime configuration failures straight to the developer console
    console.error("Critical execution fault encountered inside data pipeline:", executionError);
    document.getElementById("detail-title").textContent = "Service Interface Interruption";
  }
}

// Executes the streaming lifecycle function immediately when detail.html loads its DOM layout tree
streamArticleDetails();