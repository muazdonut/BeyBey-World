/* ================================================
   BEYBEY WORLD — Shared Nav Script
   Drop <script src="../nav.js"></script> (adjust path per page) before </body>
   ================================================ */
(function () {
  var wrapper = document.querySelector('.nav-wrapper');
  var page = window.location.pathname.split('/').pop() || 'home.html';

  if (wrapper) {
    if (page === 'home.html') {
      /* Home page: hidden until user scrolls 80px */
      window.addEventListener('scroll', function () {
        wrapper.classList.toggle('visible', window.scrollY > 80);
      });
    } else {
      /* All other pages: nav is always visible and stays fixed */
      wrapper.classList.add('visible');
    }
  }

  /* Mark the active nav link based on the current page filename */
  document.querySelectorAll('.nav-menu a, .nav-links a').forEach(function (a) {
    var href = a.getAttribute('href').split('/').pop();
    if (href === page) a.classList.add('active');
    else a.classList.remove('active');
  });
})();