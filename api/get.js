import { getDb, requireApiKey, onlyPost } from "./_mongo.js";

export default async function handler(req, res) {
  if (!onlyPost(req, res)) return;
  if (!requireApiKey(req, res)) return;

  try {
    let { guildid, id } = req.body || {};

    // Force to string (CRITICAL)
    if (guildid == null || id == null) {
      return res.status(400).json({ error: "guildid and id are required" });
    }

    guildid = String(guildid);
    id = String(id);

    const db = await getDb();
    const users = db.collection("economy");

    const user = await users.findOne({
      guildid: guildid,
      id: id
    });

    return res.json(user || null);
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
