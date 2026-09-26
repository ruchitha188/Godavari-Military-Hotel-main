import { Redis } from "@upstash/redis";

let redis = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();
  }
} catch (e) {
  console.warn("Upstash Redis not initialized, using in-memory/default data:", e.message);
}

const DEFAULT_REVIEWS = [
  {
    id: "r001",
    approved: true,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    customerId: "+91 98480 22338",
    customerName: "Srinivasa Rao",
    itemName: "Natu Kodi Pulao (Country Chicken)",
    rating: 5,
    comment: "Authentic Godavari river basin flavor! The country chicken was tender and the seeraga samba rice aroma brought back childhood memories."
  },
  {
    id: "r002",
    approved: true,
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    customerId: "+91 94401 55621",
    customerName: "Ananya Varma",
    itemName: "Godavari Chapala Pulusu (Fish Curry)",
    rating: 5,
    comment: "The best Chapala Pulusu in Rajahmundry! Perfectly tangy tamarind gravy with raw mango notes. Must try with hot steamed rice."
  },
  {
    id: "r003",
    approved: true,
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    customerId: "+91 99890 34112",
    customerName: "Kalyan Chakravarthy",
    itemName: "Mutton Fry Piece Biryani",
    rating: 5,
    comment: "Juicy spiced mutton fry pieces over long-grain aromatic dum biryani. Pure military hotel style spice punch!"
  },
  {
    id: "r004",
    approved: true,
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    customerId: "+91 97012 88473",
    customerName: "Praveen Raju",
    itemName: "Godavari Royyala Vepudu (Prawns Fry)",
    rating: 5,
    comment: "Crispy, peppery river prawns fried to perfection. Pairs extraordinarily well with degree filter coffee afterwards."
  },
  {
    id: "r005",
    approved: true,
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
    customerId: "+91 91211 44920",
    customerName: "Lakshmi Prasanna",
    itemName: "Gutti Vankaya Pulao (Stuffed Brinjal)",
    rating: 5,
    comment: "Rich roasted peanut-sesame masala stuffed in tender brinjals. Vegetarian perfection with pure ghee."
  },
  {
    id: "r006",
    approved: true,
    date: new Date(Date.now() - 86400000 * 7).toISOString(),
    customerId: "+91 98665 12093",
    customerName: "Venkatesh Naidu",
    itemName: "Double Ka Meetha",
    rating: 5,
    comment: "Rich saffron rabri soaked bread dessert. Melts in mouth with abundant pistachios and almonds!"
  },
  {
    id: "r007",
    approved: false,
    date: new Date(Date.now() - 3600000 * 3).toISOString(),
    customerId: "+91 94901 77342",
    customerName: "Bhavani Shankar",
    itemName: "Mutton Keema Balls (Sukka)",
    rating: 5,
    comment: "Crisp on the outside, supremely juicy inside. The Tellicherry pepper spice level is unmatched!"
  },
  {
    id: "r008",
    approved: false,
    date: new Date(Date.now() - 3600000 * 1).toISOString(),
    customerId: "+91 93910 66281",
    customerName: "Divya Teja",
    itemName: "Chilli Egg Roast",
    rating: 4,
    comment: "Great pepper and green chilli flavor with capsicum. Excellent starter for egg lovers."
  }
];

let inMemoryReviews = [...DEFAULT_REVIEWS];

async function verifyAdmin(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return false;
  const token = authHeader.replace("Bearer ", "");
  if (token.startsWith("demo-")) return true; // portfolio demo session
  if (!redis) return true;
  try {
    const data = await redis.get(`session:${token}`);
    return !!data;
  } catch { return true; }
}

async function getReviews() {
  if (!redis) return inMemoryReviews;
  try {
    const raw = await redis.get("reviews");
    if (raw) {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    await redis.set("reviews", JSON.stringify(DEFAULT_REVIEWS));
    return DEFAULT_REVIEWS;
  } catch (e) {
    console.warn("Redis reviews get failed, using fallback:", e.message);
    return inMemoryReviews;
  }
}

async function saveReviews(reviews) {
  inMemoryReviews = reviews;
  if (!redis) return;
  try {
    await redis.set("reviews", JSON.stringify(reviews));
  } catch (e) {
    console.warn("Redis reviews save failed:", e.message);
  }
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
      const { customerId, customerName, itemName, rating, comment } = req.body || {};
      if (!customerName || !rating || !comment) return res.status(400).json({ error: "Missing fields" });

      const reviews = await getReviews();
      const newReview = {
        id: "r" + Date.now(),
        approved: false,
        date: new Date().toISOString(),
        customerId: customerId || "",
        customerName,
        itemName: itemName || "General Experience",
        rating: parseInt(rating),
        comment
      };
      reviews.unshift(newReview);
      await saveReviews(reviews);
      return res.status(201).json({ success: true, review: newReview });
    }

    if (req.method === "PUT") {
      const authed = await verifyAdmin(req);
      if (!authed) return res.status(401).json({ error: "Unauthorized" });
      const { id } = req.body || {};
      const reviews = await getReviews();
      const review = reviews.find(r => r.id === id);
      if (review) review.approved = true;
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
    console.error("API error in reviews handler:", e);
    // Never send 500 error to user for GET
    if (req.method === "GET") {
      return res.status(200).json(DEFAULT_REVIEWS.filter(r => r.approved));
    }
    return res.status(200).json({ success: true, error: e.message });
  }
}
