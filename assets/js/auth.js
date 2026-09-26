// ─── Godavari Military Hotel — Auth + Nav Bootstrap ──────────────────────── 
document.addEventListener('DOMContentLoaded', () => {
  RJH.updateNav();
  setupHamburger();
  setupLogout();
  highlightActiveNav();

  // Guard: redirect from admin if not logged in
  if (location.pathname.includes('admin.html') && (!RJH.isLoggedIn() || !RJH.isAdmin())) {
    window.location.href = 'login.html';
  }
});

function setupHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('nav-active');
      hamburger.classList.toggle('toggle');
    });
  }

  // Mobile: toggle dropdowns on click of the trigger row
  document.querySelectorAll('.nav-dropdown > .dropdown-trigger').forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const parent = this.closest('.nav-dropdown');
        // close siblings
        document.querySelectorAll('.nav-dropdown').forEach(d => {
          if (d !== parent) d.classList.remove('open');
        });
        parent.classList.toggle('open');
      }
    });
  });

  // Desktop: close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    }
  });
}

function setupLogout() {
  document.querySelectorAll('.logout-trigger').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      RJH.clearSession();
      RJH.showToast('👋 Logged out successfully', 'success');
      setTimeout(() => window.location.href = 'index.html', 1000);
    });
  });
}

function highlightActiveNav() {
  const path = location.pathname;
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href && (path.endsWith(href) || (path.endsWith('/') && href === 'index.html'))) {
      link.classList.add('active');
    }
  });
}
