// ─── Godavari Military Hotel — Central Data Layer (API-backed) ──────────────
const RJH = (() => {
  // API base — works locally with netlify dev and in production
  const API = '/api';

  // ── Admin Token (stored in localStorage for session persistence) ──────────
  function getAdminToken() { return localStorage.getItem('rjh_admin_token') || ''; }
  function setAdminToken(token) { localStorage.setItem('rjh_admin_token', token); }
  function clearAdminToken() { localStorage.removeItem('rjh_admin_token'); }

  function authHeaders() {
    const token = getAdminToken();
    const h = { 'Content-Type': 'application/json' };
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
  }

  // ── Session (stays in localStorage — per-browser) ─────────────────────────
  function getSession() { try { return JSON.parse(localStorage.getItem('rjh_session')) || {}; } catch { return {}; } }
  function setSession(data) { localStorage.setItem('rjh_session', JSON.stringify(data)); }
  function clearSession() { localStorage.removeItem('rjh_session'); clearAdminToken(); }
  function isLoggedIn() { const s = getSession(); return !!(s.loggedIn && s.phone); }
  function isAdmin() { return !!(getSession().isAdmin); }

  // ── Dynamic Nav ───────────────────────────────────────────────────────────
  function updateNav() {
    const loginLinks = document.querySelectorAll('.nav-login-link');
    const session = getSession();
    loginLinks.forEach(link => {
      if (session.loggedIn && session.isAdmin) {
        link.textContent = '⚙️ Admin Panel';
        link.href = 'admin.html';
      } else {
        link.textContent = 'Admin Login';
        link.href = 'login.html';
      }
    });
    document.querySelectorAll('.nav-logout-btn').forEach(btn => {
      btn.style.display = (session.loggedIn && session.isAdmin) ? 'inline-flex' : 'none';
    });
  }

  // ── Admin Auth ────────────────────────────────────────────────────────────
  async function checkAdminPass(password) {
    try {
      const res = await fetch(API + '/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success && data.token) {
        setAdminToken(data.token);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Admin auth error:', e);
      return false;
    }
  }

  // ── Reviews ───────────────────────────────────────────────────────────────
  async function getApprovedReviews() {
    try {
      const res = await fetch(API + '/reviews?t=' + Date.now(), { cache: 'no-store' });
      return await res.json();
    } catch (e) {
      console.error('Error fetching reviews:', e);
      return [];
    }
  }

  async function getReviews() {
    try {
      const res = await fetch(API + '/reviews?admin=true&t=' + Date.now(), { 
        headers: authHeaders(),
        cache: 'no-store'
      });
      if (!res.ok) return [];
      return await res.json();
    } catch (e) {
      console.error('Error fetching all reviews:', e);
      return [];
    }
  }

  async function addReview(review) {
    try {
      const res = await fetch(API + '/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      return await res.json();
    } catch (e) {
      console.error('Error adding review:', e);
      return { success: false };
    }
  }

  async function approveReview(id) {
    try {
      await fetch(API + '/reviews', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ id })
      });
    } catch (e) {
      console.error('Error approving review:', e);
    }
  }

  async function deleteReview(id) {
    try {
      await fetch(API + '/reviews?id=' + id, {
        method: 'DELETE',
        headers: authHeaders()
      });
    } catch (e) {
      console.error('Error deleting review:', e);
    }
  }

  // ── Menu ──────────────────────────────────────────────────────────────────
  async function getMenu() {
    try {
      const res = await fetch(API + '/menu?t=' + Date.now(), { cache: 'no-store' });
      return await res.json();
    } catch (e) {
      console.error('Error fetching menu:', e);
      return [];
    }
  }

  async function addMenuItem(item) {
    try {
      await fetch(API + '/menu', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(item)
      });
    } catch (e) {
      console.error('Error adding menu item:', e);
    }
  }

  async function updateMenuItem(id, data) {
    try {
      await fetch(API + '/menu', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ id, ...data })
      });
    } catch (e) {
      console.error('Error updating menu item:', e);
    }
  }

  async function deleteMenuItem(id) {
    try {
      await fetch(API + '/menu?id=' + id, {
        method: 'DELETE',
        headers: authHeaders()
      });
    } catch (e) {
      console.error('Error deleting menu item:', e);
    }
  }

  // ── Gallery ───────────────────────────────────────────────────────────────
  async function getGallery() {
    try {
      const res = await fetch(API + '/gallery?t=' + Date.now(), { cache: 'no-store' });
      return await res.json();
    } catch (e) {
      console.error('Error fetching gallery:', e);
      return [];
    }
  }

  async function addGalleryImage(img) {
    try {
      await fetch(API + '/gallery', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(img)
      });
    } catch (e) {
      console.error('Error adding gallery image:', e);
    }
  }

  async function deleteGalleryImage(id) {
    try {
      await fetch(API + '/gallery?id=' + id, {
        method: 'DELETE',
        headers: authHeaders()
      });
    } catch (e) {
      console.error('Error deleting gallery image:', e);
    }
  }

  // ── Customers ─────────────────────────────────────────────────────────────
  async function getCustomers() {
    try {
      const res = await fetch(API + '/customers', { headers: authHeaders() });
      if (!res.ok) return {};
      return await res.json();
    } catch (e) {
      console.error('Error fetching customers:', e);
      return {};
    }
  }

  async function registerCustomer(phone, name, email = '') {
    try {
      await fetch(API + '/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name, email })
      });
    } catch (e) {
      console.error('Error registering customer:', e);
    }
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  async function getSiteStats() {
    try {
      const res = await fetch(API + '/stats', { headers: authHeaders() });
      if (!res.ok) return { websiteVisits: 0, reviewers: 0 };
      return await res.json();
    } catch (e) {
      console.error('Error fetching stats:', e);
      return { websiteVisits: 0, reviewers: 0 };
    }
  }

  async function incrementWebsiteVisit() {
    try {
      await fetch(API + '/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'visit' })
      });
    } catch (e) {
      // Silent fail for visit tracking
    }
  }

  async function recordReviewer() {
    try {
      await fetch(API + '/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reviewer' })
      });
    } catch (e) {
      // Silent fail
    }
  }

  // ── Dish Ratings (kept in server via reviews, computed client-side from approved reviews) ──
  // We'll compute ratings from the review data instead of a separate store
  async function getDishAvgRating(itemId) {
    // Dish ratings are computed from approved reviews that match the item
    return null; // Will be computed in-page from loaded reviews
  }

  function getDishRatingCount(itemId) {
    return 0;
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  function showToast(message, type = 'info', duration = 4500) {
    document.querySelectorAll('.rjh-toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = `rjh-toast rjh-toast-${type}`;
    toast.innerHTML = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('rjh-toast-show'), 10);
    setTimeout(() => {
      toast.classList.remove('rjh-toast-show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
    return toast;
  }

  // ── Format helpers ────────────────────────────────────────────────────────
  function formatDate(iso) {
    if (!iso) return 'N/A';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return {
    getSession, setSession, clearSession, isLoggedIn, isAdmin, updateNav,
    getAdminToken, setAdminToken, clearAdminToken,
    checkAdminPass,
    getCustomers, registerCustomer,
    getReviews, addReview, approveReview, deleteReview, getApprovedReviews,
    getMenu, addMenuItem, updateMenuItem, deleteMenuItem,
    getGallery, addGalleryImage, deleteGalleryImage,
    getDishAvgRating, getDishRatingCount,
    getSiteStats, incrementWebsiteVisit, recordReviewer,
    showToast, formatDate
  };
})();
