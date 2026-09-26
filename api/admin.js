import { Redis } from "@upstash/redis";

let redis = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (e) {
  console.warn("Upstash Redis not initialized, using local session verification:", e.message);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { password } = req.body || {};
    const adminPass = process.env.ADMIN_PASSWORD || "Godavari@2025";
    const p = (password || '').trim();

    // Accept real password or portfolio demo credentials
    if (p === adminPass || p === "admin123" || p === "admin" || p === "godavari" || p === "demo") {
      const token = "demo_rjh_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 8);
      if (redis) {
        try {
          await redis.set(`session:${token}`, "active", { ex: 86400 });
        } catch (err) {
          console.warn("Session save warning:", err.message);
        }
      }
      return res.status(200).json({ success: true, token });
    } else {
      return res.status(401).json({ success: false, error: "Invalid password. Use demo password: admin123" });
    }
  } catch (e) {
    console.error("API error in admin handler:", e);
    // Allow demo access even on server error
    const token = "demo_fallback_" + Date.now();
    return res.status(200).json({ success: true, token });
  }
}
