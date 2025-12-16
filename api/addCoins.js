import { getDb, requireApiKey, onlyPost } from "./_mongo.js";

export default async function handler(req, res) {
  if (!onlyPost(req, res)) return;
  if (!requireApiKey(req, res)) return;

  try {
    const { userId, amount } = req.body || {};
    if (typeof userId !== "number") {
      return res.status(400).json({ error: "userId must be a number" });
    }
    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      return res.status(400).json({ error: "amount must be a number" });
    }

    const db = await getDb();
    const users = db.collection("users");

    // Optional: auto-create user if missing (safe)
    const result = await users.updateOne(
      { userId },
      {
        $inc: { coins: amount },
        $setOnInsert: { userId, coins: 1000, createdAt: new Date() }
      },
      { upsert: true }
    );

    return res.json({ success: true, modified: result.modifiedCount });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
