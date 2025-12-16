import { getDb, requireApiKey, onlyPost } from "./_mongo.js";

export default async function handler(req, res) {
  console.log("==== /getByDisplayName CALLED ====");

  if (!onlyPost(req, res)) {
    console.log("❌ Method not allowed:", req.method);
    return;
  }

  if (!requireApiKey(req, res)) {
    console.log("❌ Invalid API key");
    return;
  }

  try {
    let { display_name } = req.body || {};

    console.log("📥 Raw display_name:", display_name, "type:", typeof display_name);

    if (!display_name || typeof display_name !== "string") {
      console.log("❌ Missing or invalid display_name");
      return res.status(400).json({ error: "display_name is required" });
    }

    // Normalize
    display_name = display_name.trim();

    console.log("🔍 Normalized display_name:", display_name);

    const db = await getDb();
    console.log("✅ MongoDB connected");

    const users = db.collection("economy");
    console.log("📦 Using collection: economy");

    // Case-insensitive EXACT match on display_name
    const query = {
      display_name: { $regex: `^${display_name}$`, $options: "i" }
    };

    console.log("🔎 Query:", query);

    const user = await users.findOne(query);

    console.log("📤 Query result:", user || "NOT FOUND");

    console.log("==== /getByDisplayName END ====");
    return res.json(user || null);

  } catch (e) {
    console.error("🔥 ERROR:", e);
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
