/* ================================================
   BEYBEY WORLD — Gallery Scripts
   ================================================ */

(function () {

  /* ---- RENDER CARDS FROM gallery.json ---- */
  var grid = document.getElementById('gallery-grid');

  fetch('gallery.json')
    .then(function (res) { return res.json(); })
    .then(function (cards) {
      cards.forEach(function (card, index) {
        var a = document.createElement('a');
        a.href = card.link;
        a.className = 'card-link fade-up';
        a.target = '_blank';
        a.setAttribute('data-series', card.series);

        a.innerHTML =
          '<div class="card">' +
            '<div class="card-image">' +
              '<span class="episode-tag">Episode ' + card.episode + '</span>' +
              '<img src="' + card.image + '" alt="' + card.alt + '">' +
            '</div>' +
            '<span class="card-tag ' + card.tagClass + '">' + card.tag + '</span>' +
            '<h4 class="card-title">' + card.name + '</h4>' +
            '<p class="card-text">' + card.description + '</p>' +
          '</div>';

        grid.appendChild(a);
      });

      /* Init filters AFTER cards are in the DOM */
      initFilters();
    });

  /* ---- SCROLL-TRIGGERED NAVBAR ---- */
  var wrapper = document.querySelector('.beybey-gallery .nav-wrapper');

  window.addEventListener('scroll', function () {
    wrapper.classList.toggle('visible', window.scrollY > 80);
  });

  /* ---- FILTER FUNCTIONALITY ---- */
  function initFilters() {
    var buttons   = document.querySelectorAll('.beybey-gallery .filter-btn');
    var cardLinks = document.querySelectorAll('.beybey-gallery .gallery-grid .card-link');

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {

        /* Remove 'active' class from all buttons, then add it to the clicked one */
        buttons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');

        var value = this.getAttribute('data-filter');
        var delay = 0;

        cardLinks.forEach(function (link) {
          var show = value === 'all' || link.getAttribute('data-series') === value;

          if (!show) {
            link.classList.add('hide');
            link.classList.remove('filtered-in');
          } else {
            link.classList.remove('hide');
            link.classList.remove('filtered-in');
            void link.offsetWidth; /* Forces reflow to restart the CSS animation */
            link.style.animationDelay = delay + 'ms';
            link.classList.add('filtered-in');
            delay += 60;
          }
        });

      });
    });
  }

})();