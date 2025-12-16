import { getDb, requireApiKey, onlyPost } from "./_mongo.js";

export default async function handler(req, res) {
  if (!onlyPost(req, res)) return;
  if (!requireApiKey(req, res)) return;

  try {
    const { userId } = req.body || {};
    if (typeof userId !== "number") {
      return res.status(400).json({ error: "userId must be a number" });
    }

    const db = await getDb();
    const users = db.collection("users");

    const user = await users.findOne({ userId });
    return res.json(user || null);
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
