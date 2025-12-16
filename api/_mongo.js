import { MongoClient } from "mongodb";

let cached = global._mongoCached;
if (!cached) cached = global._mongoCached = { client: null, db: null };

export async function getDb() {
  if (cached.db) return cached.db;

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DATABASE_NAME;

  if (!uri) throw new Error("Missing MONGODB_URI env var");
  if (!dbName) throw new Error("Missing DATABASE_NAME env var");

  cached.client = cached.client ?? new MongoClient(uri);
  if (!cached.client.topology?.isConnected?.()) {
    await cached.client.connect();
  }

  cached.db = cached.client.db(dbName);
  return cached.db;
}

export function requireApiKey(req, res) {
  const expected = process.env.API_KEY;
  if (!expected) {
    res.status(500).json({ error: "Server missing API_KEY" });
    return false;
  }

  const got = req.headers["x-api-key"];
  if (got !== expected) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export function onlyPost(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return false;
  }
  return true;
}
