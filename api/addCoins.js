import { getDb, requireApiKey, onlyPost } from "./_mongo.js";

export default async function handler(req, res) {
  if (!onlyPost(req, res)) return;
  if (!requireApiKey(req, res)) return;

  try {
    let { display_name, amount } = req.body || {};

    // Validate display_name
    if (!display_name || typeof display_name !== "string") {
      return res.status(400).json({ error: "display_name is required" });
    }

    display_name = display_name.trim();

    // Validate amount
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount)) {
      return res.status(400).json({ error: "amount must be a valid number" });
    }

    const db = await getDb();
    const users = db.collection("economy");

    // Case-insensitive exact match on display_name
    const query = {
      display_name: { $regex: `^${display_name}$`, $options: "i" }
    };

    const update = {
      $inc: { money: parsedAmount },
      $setOnInsert: {
        display_name: display_name,
        money: 1000,
        job: "None",
        daily_income: 0,
        inventory: [],
        inventory_amount: [],
        small_vault: 0,
        medium_vault: 0,
        large_vault: 0,
        createdAt: new Date()
      }
    };

    const result = await users.updateOne(query, update, { upsert: true });

    return res.json({
      success: true,
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount ?? 0
    });

  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
}
