// lib/db.ts
import { MongoClient, Db, Collection } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "sleep_test";
  if (!uri) throw new Error("Missing MONGODB_URI env var");
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  return db;
}

export async function getCollection<T = any>(name: string): Promise<Collection<T>> {
  const database = await getDb();
  return database.collection<T>(name);
}
