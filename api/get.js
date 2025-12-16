import { getDb, requireApiKey, onlyPost } from "./_mongo.js";

export default async function handler(req, res) {
  if (!onlyPost(req, res)) return;
  if (!requireApiKey(req, res)) return;

  try {
    const { guildid, id } = req.body || {};

    const parsedGuildId = Number(guildid);
    const parsedUserId = Number(id);

    if (!Number.isInteger(parsedGuildId)) {
      return res.status(400).json({ error: "guildid must be a valid integer" });
    }

    if (!Number.isInteger(parsedUserId)) {
      return res.status(400).json({ error: "id must be a valid integer" });
    }

    const db = await getDb();
    const users = db.collection("users");

    const user = await users.findOne({
      guildid: parsedGuildId,
      id: parsedUserId
    });

    return res.json(user || null);
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
