import { MongoClient } from "mongodb";
// TODO: add config
const MONGODB_URI = `mongodb://mongodb:27017/btc`;

// Once we connect to the database once, we'll store that connection and reuse it 
// so that we don't have to connect to the database on every request.
let cachedDb: Promise<MongoClient> | null = null;

export async function getConnection(url = MONGODB_URI) {
  if (cachedDb) {
    return await cachedDb;
  }

  cachedDb = MongoClient.connect(url);

  return await cachedDb;
}
