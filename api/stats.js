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
      let stats = (await redis.get("stats")) || { websiteVisits: 0, reviewers: 0 };
      if (typeof stats === 'string') stats = JSON.parse(stats);
      return res.status(200).json(stats);
    }

    if (req.method === "POST") {
      const action = (req.body && req.body.action) || "visit";
      let stats = (await redis.get("stats")) || { websiteVisits: 0, reviewers: 0 };
      if (typeof stats === 'string') stats = JSON.parse(stats);

      if (action === "visit") stats.websiteVisits = (stats.websiteVisits || 0) + 1;
      else if (action === "reviewer") stats.reviewers = (stats.reviewers || 0) + 1;

      await redis.set("stats", JSON.stringify(stats));
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
}
