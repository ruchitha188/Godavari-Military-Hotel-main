document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('nav-active');
      // Hamburger Animation
      hamburger.classList.toggle('toggle');
    });
  }

  // Active Link Highlighting
  const currentLocation = location.pathname;
  const menuItems = document.querySelectorAll('.nav-links a');
  
  menuItems.forEach(link => {
    // Check if the link href matches the current URL path.
    // Ensure accurate matching for index vs root.
    const linkPath = link.getAttribute('href');
    if(linkPath === currentLocation || (currentLocation.endsWith('/') && linkPath === 'index.html')) {
        link.classList.add('active');
    } else if (currentLocation.includes(linkPath.replace('./', '').replace('.html', '')) && linkPath !== 'index.html') {
        link.classList.add('active');
    }
  });

  // Inject Mobile Quick Links (Menu, Our Story, Contact Us)
  if (!document.querySelector('.mobile-quick-links')) {
    const nav = document.querySelector('nav');
    if (nav) {
      const quickLinks = document.createElement('div');
      quickLinks.className = 'mobile-quick-links';
      quickLinks.innerHTML = `
        <a href="menu.html">Menu</a>
        <a href="about-us.html">Our Story</a>
        <a href="contact.html">Contact Us</a>
      `;
      nav.appendChild(quickLinks);
    }
  }
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }).catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

