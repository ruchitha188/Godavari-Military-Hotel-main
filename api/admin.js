import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { password } = req.body;
    const adminPass = process.env.ADMIN_PASSWORD || "Raajanna@2025";

    if (password === adminPass) {
      const token = "rjh_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 12);
      await redis.set(`session:${token}`, "active", { ex: 86400 });
      return res.status(200).json({ success: true, token });
    } else {
      return res.status(401).json({ success: false, error: "Invalid password" });
    }
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
}
