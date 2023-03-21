import { MongoClient } from "mongodb";
const MONGODB_URI = `mongodb://mongodb:27017/btc`;

let cachedDb: Promise<MongoClient> | null = null;

export async function getConnection(url = MONGODB_URI) {
  if (cachedDb) {
    return await cachedDb;
  }

  cachedDb = MongoClient.connect(url);

  return await cachedDb;
}
