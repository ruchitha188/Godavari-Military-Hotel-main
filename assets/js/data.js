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

  // ── Fallback Menu & Gallery Data (Immediate availability & offline resilience) ──
  const FALLBACK_MENU = [
    { id: 'm001', category: 'Biryanis', diet: 'Non-Veg', meatType: 'Chicken', name: 'Natu Kodi Pulao (Country Chicken)', price: 389, isSpecial: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', ingredients: 'Country chicken, seeraga samba rice, shallots, green chillies, mint, country spices, pure ghee', description: 'Authentic Andhra village country chicken slow-cooked with seeraga samba rice, shallots, green chillies, mint, and pure ghee.' },
    { id: 'm002', category: 'Biryanis', diet: 'Non-Veg', meatType: 'Mutton', name: 'Mutton Fry Piece Biryani', price: 469, isSpecial: true, image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80', ingredients: 'Tender goat meat, basmati rice, caramelized onions, saffron, ghee, whole garam masala', description: 'Tender goat meat pan-fried with roasted spices and served over long-grain fragrant dum basmati rice.' },
    { id: 'm003', category: 'Biryanis', diet: 'Non-Veg', meatType: 'Chicken', name: 'Godavari Special Chicken Dum Biryani', price: 339, isSpecial: false, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80', ingredients: 'Chicken, long-grain basmati, brown onions, saffron milk, curd, mint, cloves', description: 'Slow-cooked in a sealed clay handi with tender chicken, basmati rice, aromatic saffron milk, and caramelized onions.' },
    { id: 'm004', category: 'Biryanis', diet: 'Non-Veg', meatType: 'Prawns', name: 'Godavari Royyala Pulao (Prawns)', price: 399, isSpecial: true, image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80', ingredients: 'River prawns, basmati rice, coconut milk, green chillies, coriander, ghee', description: 'Fresh Godavari river prawns simmered in aromatic Andhra masala and gently tossed with fragrant pulao rice.' },
    { id: 'm005', category: 'Biryanis', diet: 'Veg', meatType: 'Veg', name: 'Gutti Vankaya Pulao (Stuffed Brinjal)', price: 269, isSpecial: true, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80', ingredients: 'Baby brinjal, basmati rice, roasted peanuts, sesame seeds, tamarind, ghee', description: 'Tender baby brinjals stuffed with roasted peanut-sesame masala and dum-cooked with fragrant spiced rice.' },
    { id: 'm006', category: 'Biryanis', diet: 'Veg', meatType: 'Veg', name: 'Paneer Tikka Dum Biryani', price: 299, isSpecial: false, image: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&auto=format&fit=crop&q=80', ingredients: 'Fresh paneer, basmati rice, yogurt, Kashmiri red chilli, mint, roasted cashews', description: 'Tandoor-charred cottage cheese cubes layered with spiced basmati rice, mint, and fried cashews.' },
    { id: 'm007', category: 'Starters', diet: 'Non-Veg', meatType: 'Mutton', name: 'Mutton Keema Balls (Sukka)', price: 399, isSpecial: true, image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&auto=format&fit=crop&q=80', ingredients: 'Minced goat meat, roasted gram flour, crushed peppercorns, curry leaves, ginger-garlic paste', description: 'Military hotel legendary spiced minced mutton meatballs fried crisp on the outside and tender juicy inside.' },
    { id: 'm008', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Guntur Chilli Chicken', price: 329, isSpecial: false, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80', ingredients: 'Boneless chicken, Guntur red chilli flakes, curry leaves, garlic, soy drizzle', description: 'Tender boneless chicken tossed with spicy crushed Guntur red chillies, shallots, and crisp curry leaves.' },
    { id: 'm009', category: 'Starters', diet: 'Non-Veg', meatType: 'Prawns', name: 'Godavari Royyala Vepudu (Prawns Fry)', price: 379, isSpecial: true, image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&auto=format&fit=crop&q=80', ingredients: 'Fresh river prawns, sliced shallots, black pepper, turmeric, curry leaves, green chilli', description: 'Fresh catch prawns pan-roasted on high flame with caramelized shallots, tellicherry pepper, and curry leaves.' },
    { id: 'm010', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Chicken 65 (Military Cut)', price: 319, isSpecial: false, image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80', ingredients: 'Chicken cubes, curd, curry leaves, Kashmiri chili, garlic paste, cornstarch', description: 'Classic Andhra-style crisp fried chicken tossed in seasoned yoghurt, mustard crackle, and spicy red masala.' },
    { id: 'm011', category: 'Starters', diet: 'Non-Veg', meatType: 'Fish', name: 'Apollo Fish Fry', price: 349, isSpecial: false, image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', ingredients: 'Boneless fish fillets, egg, ginger, green chillies, lemon juice, curry leaves', description: 'Boneless fish fillets seasoned with turmeric, egg-wash, and wok-tossed in a spicy tangy Andhra sauce.' },
    { id: 'm012', category: 'Starters', diet: 'Veg', meatType: 'Veg', name: 'Paneer 65', price: 279, isSpecial: false, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80', ingredients: 'Fresh paneer, yogurt, corn flour, curry leaves, Kashmiri chili powder', description: 'Fresh malai paneer cubes golden-fried and tossed with roasted garlic, curry leaves, and green chillies.' },
    { id: 'm013', category: 'Starters', diet: 'Eggitarian', meatType: 'Egg', name: 'Chilli Egg Roast', price: 219, isSpecial: false, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80', ingredients: 'Farm eggs, sliced capsicum, onions, crushed pepper, green chillies', description: 'Boiled eggs sliced and wok-fried with bell peppers, onions, and spicy green chillies.' },
    { id: 'm014', category: 'Starters', diet: 'Veg', meatType: 'Veg', name: 'Crispy Corn Pepper Fry', price: 229, isSpecial: false, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80', ingredients: 'Sweet corn, black pepper, bell peppers, spring onion, chat masala', description: 'Sweet corn kernels fried golden and seasoned with cracked Tellicherry black pepper and spring onion.' },
    { id: 'm015', category: 'Curries', diet: 'Non-Veg', meatType: 'Fish', name: 'Godavari Chapala Pulusu (Fish Curry)', price: 369, isSpecial: true, image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80', ingredients: 'Godavari river fish, tamarind extract, fenugreek seeds, mustard, garlic, raw mango slivers', description: 'The pride of Rajahmundry! River fish gently simmered in tangy tamarind gravy, fenugreek, garlic, and fresh green chillies in a clay pot.' },
    { id: 'm016', category: 'Curries', diet: 'Non-Veg', meatType: 'Mutton', name: 'Gongura Mutton Curry', price: 439, isSpecial: true, image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600&auto=format&fit=crop&q=80', ingredients: 'Tender mutton, fresh Gongura leaves, coriander, whole red chillies, shallots, garlic', description: 'Tender goat meat slow-simmered in sour red sorrel (Gongura) leaves, coriander paste, and fiery Andhra red chillies.' },
    { id: 'm017', category: 'Curries', diet: 'Non-Veg', meatType: 'Chicken', name: 'Natu Kodi Kura (Country Chicken Curry)', price: 379, isSpecial: true, image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80', ingredients: 'Free-range country chicken, coconut paste, poppy seeds, shallots, stone-ground masala', description: 'Rustic Andhra village country chicken curry in thick roasted coconut, poppy seeds, and stone-ground garam masala gravy.' },
    { id: 'm018', category: 'Curries', diet: 'Eggitarian', meatType: 'Egg', name: 'Andhra Egg Curry', price: 219, isSpecial: false, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80', ingredients: 'Boiled farm eggs, onions, ripe tomatoes, curry leaves, red chilli powder', description: 'Pan-blistered hard-boiled eggs cooked in a spiced onion, tomato, and curry leaf gravy.' },
    { id: 'm019', category: 'Curries', diet: 'Veg', meatType: 'Veg', name: 'Gutti Vankaya Koora (Stuffed Brinjal)', price: 259, isSpecial: false, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', ingredients: 'Tender brinjal, roasted peanuts, sesame seeds, dry coconut, tamarind paste', description: 'Whole tender brinjals simmered in a luscious roasted peanut, white sesame, dry coconut, and tamarind gravy.' },
    { id: 'm020', category: 'Curries', diet: 'Veg', meatType: 'Veg', name: 'Paneer Butter Masala', price: 289, isSpecial: false, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80', ingredients: 'Malai paneer, cashew nut paste, tomatoes, butter, kasuri methi, fresh cream', description: 'Soft cottage cheese cubes in rich satin-smooth tomato cashew gravy with kasuri methi and fresh cream.' },
    { id: 'm021', category: 'Thalis', diet: 'Non-Veg', meatType: 'Chicken', name: 'Godavari Military Non-Veg Thali', price: 499, isSpecial: true, image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80', ingredients: 'Chicken curry, mutton fry, fish pulusu, steamed sona masoori rice, rasam, curd, dessert', description: 'Grand traditional feast! Natu kodi kura, mutton fry, chapala pulusu, steamed rice, sambar, rasam, avakaya, curd & double ka meetha.' },
    { id: 'm022', category: 'Thalis', diet: 'Veg', meatType: 'Veg', name: 'Authentic Andhra Veg Bhojanam (Thali)', price: 239, isSpecial: false, image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80', ingredients: 'Steamed rice, mudda pappu, pure ghee, gunpowder, sambar, rasam, curd, papad', description: 'Complete traditional Andhra meal: Muddapappu with ghee, sambar, rasam, avakaya pickle, fryums, vepudu, curd & sweet.' },
    { id: 'm023', category: 'Rice Items', diet: 'Veg', meatType: 'Veg', name: 'Bagara Rice with Dalcha', price: 219, isSpecial: false, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&auto=format&fit=crop&q=80', ingredients: 'Basmati rice, mint, cloves, star anise, chana dal, bottle gourd', description: 'Fragrant tempered basmati rice flavored with bay leaves, star anise, and mint, accompanied by rich lentil dalcha.' },
    { id: 'm024', category: 'Rice Items', diet: 'Veg', meatType: 'Veg', name: 'Temple Style Curd Rice (Daddojanam)', price: 159, isSpecial: false, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80', ingredients: 'Cooked rice, fresh curd, mustard seeds, ginger, green chillies, curry leaves, pomegranate', description: 'Cool and comforting tempered curd rice garnished with fresh ginger, curry leaves, and ruby pomegranate seeds.' },
    { id: 'm025', category: 'Tandoori Breads', diet: 'Veg', meatType: 'Veg', name: 'Butter Garlic Naan', price: 89, isSpecial: false, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', ingredients: 'Wheat flour, garlic, butter, fresh coriander', description: 'Clay-oven baked leavened flatbread brushed with roasted minced garlic, fresh coriander, and melted butter.' },
    { id: 'm026', category: 'Tandoori Breads', diet: 'Veg', meatType: 'Veg', name: 'Tandoori Roti', price: 59, isSpecial: false, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', ingredients: 'Whole wheat flour, sea salt, light butter glaze', description: 'Crisp and smoky whole-wheat flatbread cooked on the inner wall of a charcoal tandoor.' },
    { id: 'm027', category: 'Soups', diet: 'Non-Veg', meatType: 'Chicken', name: 'Natu Kodi Charu (Country Chicken Broth)', price: 149, isSpecial: true, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80', ingredients: 'Country chicken stock, black pepper, garlic, curry leaves, shallots', description: 'Slow-simmered aromatic country chicken broth infused with crushed black pepper, shallots, and fresh coriander.' },
    { id: 'm028', category: 'Soups', diet: 'Veg', meatType: 'Veg', name: 'Tomato Miriyala Charu', price: 119, isSpecial: false, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80', ingredients: 'Fresh tomatoes, black pepper, cumin seeds, garlic cloves, coriander stems', description: 'Tangy ripe tomato broth tempered with cumin, crushed pepper, and roasted garlic.' },
    { id: 'm029', category: 'Desserts', diet: 'Veg', meatType: 'Veg', name: 'Double Ka Meetha', price: 149, isSpecial: true, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80', ingredients: 'Bread, thickened milk rabri, saffron, green cardamom, slivered pistachios', description: 'Golden-fried milk bread slices soaked in fragrant saffron and cardamom rabri, garnished with slivered almonds.' },
    { id: 'm030', category: 'Desserts', diet: 'Veg', meatType: 'Veg', name: 'Apricot Delight', price: 169, isSpecial: true, image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80', ingredients: 'Dried Turkish apricots, vanilla custard, heavy cream, sponge crumble', description: 'Stewed dry apricots layered with rich vanilla custard and fresh whipped cream.' },
    { id: 'm031', category: 'Beverages', diet: 'Veg', meatType: 'Veg', name: 'Godavari Spiced Majjiga (Buttermilk)', price: 69, isSpecial: false, image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80', ingredients: 'Fresh curd, churned water, ginger, green chillies, curry leaves, rock salt', description: 'Chilled churned curd spiced with crushed ginger, green chilli, curry leaves, and a touch of black salt.' },
    { id: 'm032', category: 'Beverages', diet: 'Veg', meatType: 'Veg', name: 'Degree Filter Coffee', price: 59, isSpecial: false, image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', ingredients: 'South Indian coffee decoction, full-cream milk, raw cane sugar', description: 'Authentic South Indian filter coffee brewed with chicory-blended fresh roast beans and frothed milk.' }
  ];

  const FALLBACK_GALLERY = [
    { id: 'g1', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', caption: 'Atmospheric Sunset Dining', colSpan: false },
    { id: 'g2', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80', caption: 'Natu Kodi & Signature Biryani', colSpan: true },
    { id: 'g3', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80', caption: 'Godavari Chapala Pulusu in Clay Pot', colSpan: false },
    { id: 'g4', url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=80', caption: 'Sizzling Royyala Vepudu (Prawns Fry)', colSpan: false },
    { id: 'g5', url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&q=80', caption: 'Mutton Keema Sukka & Andhra Curries', colSpan: false },
    { id: 'g6', url: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=800&q=80', caption: 'Royal Military Bhojanam (Thali)', colSpan: true },
    { id: 'g7', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80', caption: 'Double Ka Meetha with Saffron Rabri', colSpan: false },
    { id: 'g8', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80', caption: 'Clay Oven Fresh Butter Garlic Naan', colSpan: false }
  ];

  // ── Menu ──────────────────────────────────────────────────────────────────
  async function getMenu() {
    try {
      const res = await fetch(API + '/menu?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem('rjh_menu', JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn('API unreachable, using local/fallback menu:', e);
    }
    const local = localStorage.getItem('rjh_menu');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    localStorage.setItem('rjh_menu', JSON.stringify(FALLBACK_MENU));
    return FALLBACK_MENU;
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
    const menu = await getMenu();
    menu.push({ id: 'm' + Date.now(), ...item });
    localStorage.setItem('rjh_menu', JSON.stringify(menu));
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
    const menu = await getMenu();
    const item = menu.find(i => i.id === id);
    if (item) Object.assign(item, data);
    localStorage.setItem('rjh_menu', JSON.stringify(menu));
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
    let menu = await getMenu();
    menu = menu.filter(i => i.id !== id);
    localStorage.setItem('rjh_menu', JSON.stringify(menu));
  }

  // ── Gallery ───────────────────────────────────────────────────────────────
  async function getGallery() {
    try {
      const res = await fetch(API + '/gallery?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem('rjh_gallery', JSON.stringify(data));
          return data;
        }
      }
    } catch (e) {
      console.warn('API unreachable, using fallback gallery:', e);
    }
    const local = localStorage.getItem('rjh_gallery');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    localStorage.setItem('rjh_gallery', JSON.stringify(FALLBACK_GALLERY));
    return FALLBACK_GALLERY;
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
    const gallery = await getGallery();
    gallery.unshift({ id: 'g' + Date.now(), ...img });
    localStorage.setItem('rjh_gallery', JSON.stringify(gallery));
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
    let gallery = await getGallery();
    gallery = gallery.filter(g => g.id !== id);
    localStorage.setItem('rjh_gallery', JSON.stringify(gallery));
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
