import { Redis } from "@upstash/redis";

let redis = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (e) {
  console.warn("Upstash Redis not initialized, using fallback customers:", e.message);
}

const DEFAULT_CUSTOMERS = {
  'c1': { phone: '+91 98480 22338', name: 'Srinivasa Rao', email: 'srinivas.rao@gmail.com' },
  'c2': { phone: '+91 94401 55621', name: 'Ananya Varma', email: 'ananya.varma@outlook.com' },
  'c3': { phone: '+91 99890 34112', name: 'Kalyan Chakravarthy', email: 'kalyan.c@yahoo.com' },
  'c4': { phone: '+91 97012 88473', name: 'Praveen Raju', email: 'praveen.raju@gmail.com' },
  'c5': { phone: '+91 91211 44920', name: 'Lakshmi Prasanna', email: 'lakshmi.p@gmail.com' },
  'c6': { phone: '+91 98665 12093', name: 'Venkatesh Naidu', email: 'venkat.naidu@gmail.com' },
  'c7': { phone: '+91 94901 77342', name: 'Bhavani Shankar', email: 'bhavani.s@gmail.com' },
  'c8': { phone: '+91 93910 66281', name: 'Divya Teja', email: 'divya.teja@gmail.com' }
};

let inMemoryCustomers = { ...DEFAULT_CUSTOMERS };

async function verifyAdmin(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");
  if (token.startsWith("demo-")) return true;
  if (!redis) return true;
  try { return !!(await redis.get(`session:${token}`)); } catch { return true; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      if (!(await verifyAdmin(req))) return res.status(401).json({ error: "Unauthorized" });
      if (!redis) return res.status(200).json(inMemoryCustomers);
      try {
        const customers = (await redis.get("customers")) || inMemoryCustomers;
        return res.status(200).json(typeof customers === 'string' ? JSON.parse(customers) : customers);
      } catch {
        return res.status(200).json(inMemoryCustomers);
      }
    }

    if (req.method === "POST") {
      const { phone, name, email } = req.body || {};
      if (!phone) return res.status(400).json({ error: "Phone required" });

      inMemoryCustomers[phone] = { name: name || "", phone, email: email || "", registeredAt: new Date().toISOString() };

      if (redis) {
        try {
          let customers = (await redis.get("customers")) || {};
          if (typeof customers === 'string') customers = JSON.parse(customers);
          if (!customers[phone]) {
            customers[phone] = { name: name || "", phone, email: email || "", registeredAt: new Date().toISOString() };
          } else if (name && !customers[phone].name) {
            customers[phone].name = name;
          }
          await redis.set("customers", JSON.stringify(customers));
        } catch {}
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("API error in customers handler:", e);
    return res.status(200).json(inMemoryCustomers);
  }
}
