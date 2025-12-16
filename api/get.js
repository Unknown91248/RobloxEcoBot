import { getDb, requireApiKey, onlyPost } from "./_mongo.js";

export default async function handler(req, res) {
  console.log("==== /get USER CALLED ====");

  if (!onlyPost(req, res)) {
    console.log("❌ Method not allowed:", req.method);
    return;
  }

  if (!requireApiKey(req, res)) {
    console.log("❌ Invalid API key");
    return;
  }

  try {
    let { guildid, id } = req.body || {};

    console.log("📥 Raw body:", req.body);
    console.log("📥 Raw guildid:", guildid, "type:", typeof guildid);
    console.log("📥 Raw id:", id, "type:", typeof id);

    if (guildid == null || id == null) {
      console.log("❌ Missing guildid or id");
      return res.status(400).json({ error: "guildid and id are required" });
    }

    // FORCE STRING (CRITICAL)
    guildid = String(guildid);
    id = String(id);

    console.log("🔄 Parsed guildid:", guildid, "type:", typeof guildid);
    console.log("🔄 Parsed id:", id, "type:", typeof id);

    const db = await getDb();
    console.log("✅ MongoDB connected");

    const users = db.collection("economy");
    console.log("📦 Using collection: economy");

    console.log("🔍 Querying with:", {
      guildid: guildid,
      id: id
    });

    const user = await users.findOne({
      guildid: guildid,
      id: id
    });

    console.log("📤 Query result:", user);

    if (!user) {
      console.log("⚠️ User NOT FOUND");
    } else {
      console.log("✅ User FOUND, money:", user.money);
    }

    console.log("==== /get USER END ====");
    return res.json(user || null);

  } catch (e) {
    console.error("🔥 ERROR:", e);
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
