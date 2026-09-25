import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

async function verifyAdmin(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");
  try { return !!(await redis.get(`session:${token}`)); } catch { return false; }
}

const DEFAULT_MENU = [
  { id: 'm001', category: 'Starters', diet: 'Eggitarian', meatType: 'Egg', name: 'Boiled Egg', price: 30, ingredients: 'Egg', description: 'A perfectly boiled egg served with a sprinkle of salt and pepper.' },
  { id: 'm002', category: 'Starters', diet: 'Eggitarian', meatType: 'Egg', name: 'Egg Omlet', price: 119, ingredients: 'Egg, onion, green chilli, coriander', description: 'A fluffy, golden omelette.' },
  { id: 'm003', category: 'Starters', diet: 'Eggitarian', meatType: 'Egg', name: 'Egg Bhurji', price: 169, ingredients: 'Egg, onion, tomato, spices', description: 'Scrambled eggs with caramelised onions and spices.' },
  { id: 'm004', category: 'Curries', diet: 'Eggitarian', meatType: 'Egg', name: 'Egg Curry', price: 209, ingredients: 'Egg, onion, tomato, curry masala', description: 'Eggs in rich Andhra-style curry.' },
  { id: 'm005', category: 'Starters', diet: 'Eggitarian', meatType: 'Egg', name: 'Chilli Egg', price: 209, ingredients: 'Egg, green chilli, capsicum, soy sauce', description: 'Deep-fried egg in Indo-Chinese sauce.' },
  { id: 'm006', category: 'Starters', diet: 'Eggitarian', meatType: 'Egg', name: 'Egg 65', price: 209, ingredients: 'Egg, red chilli, curry leaves, spices', description: 'Crispy fried egg with red chilli marinade.' },
  { id: 'm007', category: 'Starters', diet: 'Eggitarian', meatType: 'Egg', name: 'Egg Manchuria', price: 209, ingredients: 'Egg, manchurian sauce, spring onion', description: 'Egg fritters in tangy Manchurian sauce.' },
  { id: 'm008', category: 'Starters', diet: 'Eggitarian', meatType: 'Egg', name: 'Hong Kong Egg', price: 209, ingredients: 'Egg, Hong Kong sauce, sesame', description: 'Eggs in Hong Kong-style sauce.' },
  { id: 'm010', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Chicken Joint Single Roast', price: 219, ingredients: 'Chicken, spices, curry leaves', description: 'Whole chicken joint slow-roasted with Andhra spices.' },
  { id: 'm011', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Chicken Fry Bone', price: 279, ingredients: 'Chicken bone-in, red chilli, dry spices', description: 'Bone-in chicken fried until crispy.' },
  { id: 'm012', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Chicken Fry Boneless', price: 309, ingredients: 'Chicken boneless, red chilli, dry spices', description: 'Boneless chicken fried to perfection.' },
  { id: 'm013', category: 'Curries', diet: 'Non-Veg', meatType: 'Chicken', name: 'Polo Chicken', price: 329, ingredients: 'Chicken, special masala', description: 'Raajanna signature chicken.' },
  { id: 'm014', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Chilli Chicken', price: 329, ingredients: 'Chicken, green chilli, capsicum, soy sauce', description: 'Indo-Chinese crispy chicken.' },
  { id: 'm015', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Chicken 65', price: 329, ingredients: 'Chicken, red chilli, curry leaves, yoghurt', description: 'Legendary Chicken 65.' },
  { id: 'm016', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Chicken Manchuria', price: 309, ingredients: 'Chicken, manchurian sauce, spring onion', description: 'Fried chicken in Manchurian sauce.' },
  { id: 'm017', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Fried Chicken', price: 319, ingredients: 'Chicken, buttermilk, flour, spices', description: 'Southern-style fried chicken.' },
  { id: 'm018', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Dragon Chicken', price: 329, ingredients: 'Chicken, dragon sauce, dry red chilli', description: 'Fiery Dragon Chicken.' },
  { id: 'm019', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Tadka Chicken', price: 339, ingredients: 'Chicken, tadka spices, curry leaves', description: 'Tempered chicken with sizzling tadka.' },
  { id: 'm020', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Pepper Chicken', price: 329, ingredients: 'Chicken, black pepper, curry leaves', description: 'Chicken stir-fried with black pepper.' },
  { id: 'm021', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Honey Garlic Chilli Chicken', price: 339, ingredients: 'Chicken, honey, garlic, chilli flakes', description: 'Sweet honey garlic crispy chicken.' },
  { id: 'm022', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Chicken Lollipop', price: 329, ingredients: 'Chicken wings, red chilli, corn flour', description: 'Chicken wing lollipops deep-fried.' },
  { id: 'm023', category: 'Starters', diet: 'Non-Veg', meatType: 'Chicken', name: 'Schezwan Chicken', price: 329, ingredients: 'Chicken, schezwan sauce, pepper', description: 'Crispy chicken in Schezwan sauce.' },
  { id: 'm030', category: 'Starters', diet: 'Non-Veg', meatType: 'Mutton', name: 'Chilli Mutton', price: 389, ingredients: 'Mutton, green chilli, capsicum', description: 'Mutton wok-tossed with green chillies.' },
  { id: 'm031', category: 'Starters', diet: 'Non-Veg', meatType: 'Mutton', name: 'Mutton Fry', price: 389, ingredients: 'Mutton, dry spices, curry leaves', description: 'Mutton fried with Andhra dry spices.' },
  { id: 'm032', category: 'Starters', diet: 'Non-Veg', meatType: 'Mutton', name: 'Mutton Dry Roast', price: 389, ingredients: 'Mutton, dry red chilli, garam masala', description: 'Bold mutton dry roast.' },
  { id: 'm033', category: 'Curries', diet: 'Non-Veg', meatType: 'Mutton', name: 'Mutton Keema Fry', price: 389, ingredients: 'Minced mutton, onion, tomato, spices', description: 'Spiced minced mutton keema.' },
  { id: 'm034', category: 'Starters', diet: 'Non-Veg', meatType: 'Mutton', name: 'Mutton 65', price: 389, ingredients: 'Mutton, red chilli, curry leaves', description: 'Deep-fried mutton in red chilli paste.' },
  { id: 'm040', category: 'Starters', diet: 'Non-Veg', meatType: 'Prawns', name: 'Prawns Fry', price: 359, ingredients: 'Prawns, turmeric, chilli, curry leaves', description: 'Jumbo prawns fried golden.' },
  { id: 'm041', category: 'Starters', diet: 'Non-Veg', meatType: 'Prawns', name: 'Chilli Prawn', price: 359, ingredients: 'Prawns, green chilli, capsicum, soy sauce', description: 'Prawns in spicy soy sauce.' },
  { id: 'm042', category: 'Starters', diet: 'Non-Veg', meatType: 'Prawns', name: 'Prawns 65', price: 359, ingredients: 'Prawns, red chilli, curry leaves, yoghurt', description: 'Prawns in spiced yoghurt, deep-fried.' },
  { id: 'm043', category: 'Starters', diet: 'Non-Veg', meatType: 'Fish', name: 'Apollo Fish', price: 329, ingredients: 'Fish, yoghurt, spices, curry leaves', description: 'Hyderabad-style deep-fried fish.' },
  { id: 'm044', category: 'Starters', diet: 'Non-Veg', meatType: 'Fish', name: 'Fish Fry Boneless', price: 329, ingredients: 'Fish fillet, turmeric, red chilli paste', description: 'Boneless fish fillets pan-fried golden.' },
  { id: 'm050', category: 'Soups', diet: 'Veg', meatType: 'Veg', name: 'Tomato Soup', price: 110, ingredients: 'Tomato, cream, spices', description: 'Velvety tomato soup.' },
  { id: 'm051', category: 'Soups', diet: 'Non-Veg', meatType: 'Chicken', name: 'Chicken Sweetcorn Soup', price: 120, ingredients: 'Chicken, sweetcorn, egg white, broth', description: 'Thick soup with chicken and corn.' },
  { id: 'm052', category: 'Soups', diet: 'Non-Veg', meatType: 'Chicken', name: 'Chicken Hot & Sour Soup', price: 130, ingredients: 'Chicken, vinegar, chilli, cornstarch', description: 'Bold Indo-Chinese hot & sour soup.' },
  { id: 'm060', category: 'Starters', diet: 'Veg', meatType: 'Veg', name: 'Paneer 65', price: 279, ingredients: 'Paneer, red chilli, curry leaves, yoghurt', description: 'Crispy paneer fried golden.' },
  { id: 'm061', category: 'Starters', diet: 'Veg', meatType: 'Veg', name: 'Tandoori Paneer Tikka', price: 299, ingredients: 'Paneer, tandoori masala, capsicum, onion', description: 'Smoky charred paneer tikka.' },
  { id: 'm070', category: 'Tandoori Breads', diet: 'Veg', meatType: 'Veg', name: 'Butter Naan', price: 79, ingredients: 'All-purpose flour, butter, yeast', description: 'Soft naan with melted butter.' },
  { id: 'm071', category: 'Tandoori Breads', diet: 'Veg', meatType: 'Veg', name: 'Tandoori Roti', price: 59, ingredients: 'Wheat flour, oil', description: 'Whole wheat tandoor roti.' },
  { id: 'm080', category: 'Biryanis', diet: 'Non-Veg', meatType: 'Chicken', name: 'Chicken Dum Biryani', price: 339, ingredients: 'Basmati rice, chicken, saffron, fried onions, biryani masala', description: 'Fragrant dum-cooked chicken biryani.' },
  { id: 'm081', category: 'Biryanis', diet: 'Non-Veg', meatType: 'Mutton', name: 'Mutton Fry Piece Biryani', price: 449, ingredients: 'Basmati rice, mutton, saffron, fried onions, biryani masala', description: 'Royal mutton dum biryani.' },
];

async function getMenu() {
  const raw = await redis.get("menu");
  if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw;
  await redis.set("menu", JSON.stringify(DEFAULT_MENU));
  return DEFAULT_MENU;
}

async function saveMenu(menu) {
  await redis.set("menu", JSON.stringify(menu));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      return res.status(200).json(await getMenu());
    }

    if (req.method === "POST") {
      if (!(await verifyAdmin(req))) return res.status(401).json({ error: "Unauthorized" });
      const menu = await getMenu();
      const newItem = { id: "m" + Date.now(), ...req.body };
      menu.push(newItem);
      await saveMenu(menu);
      return res.status(201).json({ success: true, item: newItem });
    }

    if (req.method === "PUT") {
      if (!(await verifyAdmin(req))) return res.status(401).json({ error: "Unauthorized" });
      const { id, ...data } = req.body;
      const menu = await getMenu();
      const item = menu.find(i => i.id === id);
      if (!item) return res.status(404).json({ error: "Not found" });
      Object.assign(item, data);
      await saveMenu(menu);
      return res.status(200).json({ success: true });
    }

    if (req.method === "DELETE") {
      if (!(await verifyAdmin(req))) return res.status(401).json({ error: "Unauthorized" });
      let menu = await getMenu();
      menu = menu.filter(i => i.id !== req.query.id);
      await saveMenu(menu);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
}
