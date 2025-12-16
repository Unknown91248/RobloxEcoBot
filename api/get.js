import { getDb, requireApiKey, onlyPost } from "./_mongo.js";

export default async function handler(req, res) {
  console.log("==== /getByName CALLED ====");

  if (!onlyPost(req, res)) {
    console.log("❌ Method not allowed:", req.method);
    return;
  }

  if (!requireApiKey(req, res)) {
    console.log("❌ Invalid API key");
    return;
  }

  try {
    let { name } = req.body || {};

    console.log("📥 Raw name:", name, "type:", typeof name);

    if (!name || typeof name !== "string") {
      console.log("❌ Missing or invalid name");
      return res.status(400).json({ error: "name is required" });
    }

    // Normalize
    name = name.trim();

    console.log("🔍 Normalized name:", name);

    const db = await getDb();
    console.log("✅ MongoDB connected");

    const users = db.collection("economy");
    console.log("📦 Using collection: economy");

    // Case-insensitive exact match
    const query = {
      name: { $regex: `^${name}$`, $options: "i" }
    };

    console.log("🔎 Query:", query);

    const user = await users.findOne(query);

    console.log("📤 Query result:", user || "NOT FOUND");

    console.log("==== /getByName END ====");
    return res.json(user || null);

  } catch (e) {
    console.error("🔥 ERROR:", e);
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
