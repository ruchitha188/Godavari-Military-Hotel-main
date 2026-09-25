import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

async function verifyAdmin(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");
  try {
    const data = await redis.get(`session:${token}`);
    return !!data;
  } catch { return false; }
}

async function getReviews() {
  const raw = await redis.get("reviews");
  return raw || [];
}

async function saveReviews(reviews) {
  await redis.set("reviews", JSON.stringify(reviews));
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    if (req.method === "GET") {
      const reviews = await getReviews();
      const isAdmin = req.query.admin === "true";

      if (isAdmin) {
        const authed = await verifyAdmin(req);
        if (!authed) return res.status(401).json({ error: "Unauthorized" });
        return res.status(200).json(reviews);
      }
      return res.status(200).json(reviews.filter(r => r.approved));
    }

    if (req.method === "POST") {
      const { customerId, customerName, itemName, rating, comment } = req.body;
      if (!customerName || !rating || !comment) return res.status(400).json({ error: "Missing fields" });

      const reviews = await getReviews();
      const newReview = {
        id: "r" + Date.now(), approved: false, date: new Date().toISOString(),
        customerId: customerId || "", customerName,
        itemName: itemName || "General Experience",
        rating: parseInt(rating), comment
      };
      reviews.unshift(newReview);
      await saveReviews(reviews);
      return res.status(201).json({ success: true, review: newReview });
    }

    if (req.method === "PUT") {
      const authed = await verifyAdmin(req);
      if (!authed) return res.status(401).json({ error: "Unauthorized" });
      const { id } = req.body;
      const reviews = await getReviews();
      const review = reviews.find(r => r.id === id);
      if (!review) return res.status(404).json({ error: "Not found" });
      review.approved = true;
      await saveReviews(reviews);
      return res.status(200).json({ success: true });
    }

    if (req.method === "DELETE") {
      const authed = await verifyAdmin(req);
      if (!authed) return res.status(401).json({ error: "Unauthorized" });
      const id = req.query.id;
      let reviews = await getReviews();
      reviews = reviews.filter(r => r.id !== id);
      await saveReviews(reviews);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ error: "Server error: " + e.message });
  }
}
