import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

async function verifyAdmin(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");
  try { return !!(await redis.get(`session:${token}`)); } catch { return false; }
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
      const customers = (await redis.get("customers")) || {};
      return res.status(200).json(typeof customers === 'string' ? JSON.parse(customers) : customers);
    }

    if (req.method === "POST") {
      const { phone, name, email } = req.body;
      if (!phone) return res.status(400).json({ error: "Phone required" });

      let customers = (await redis.get("customers")) || {};
      if (typeof customers === 'string') customers = JSON.parse(customers);
      
      if (!customers[phone]) {
        customers[phone] = { name: name || "", phone, email: email || "", registeredAt: new Date().toISOString() };
      } else if (name && !customers[phone].name) {
        customers[phone].name = name;
      }
      await redis.set("customers", JSON.stringify(customers));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
}
