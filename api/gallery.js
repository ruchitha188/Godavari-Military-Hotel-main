import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

async function verifyAdmin(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");
  try { return !!(await redis.get(`session:${token}`)); } catch { return false; }
}

const DEFAULT_GALLERY = [
  { id: 'g1', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', caption: 'Dining Experience', colSpan: false },
  { id: 'g2', url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', caption: 'Signature Biryani', colSpan: true },
  { id: 'g3', url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80', caption: 'Spicy Starters', colSpan: false },
  { id: 'g4', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80', caption: 'Tandoori Items', colSpan: false },
  { id: 'g5', url: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80', caption: 'Rich Curries', colSpan: false },
];

async function getGallery() {
  const raw = await redis.get("gallery");
  if (raw) return typeof raw === 'string' ? JSON.parse(raw) : raw;
  await redis.set("gallery", JSON.stringify(DEFAULT_GALLERY));
  return DEFAULT_GALLERY;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      return res.status(200).json(await getGallery());
    }

    if (req.method === "POST") {
      if (!(await verifyAdmin(req))) return res.status(401).json({ error: "Unauthorized" });
      const gallery = await getGallery();
      const newItem = { id: "g" + Date.now(), ...req.body };
      gallery.unshift(newItem);
      await redis.set("gallery", JSON.stringify(gallery));
      return res.status(201).json({ success: true, item: newItem });
    }

    if (req.method === "DELETE") {
      if (!(await verifyAdmin(req))) return res.status(401).json({ error: "Unauthorized" });
      let gallery = await getGallery();
      gallery = gallery.filter(g => g.id !== req.query.id);
      await redis.set("gallery", JSON.stringify(gallery));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
}
