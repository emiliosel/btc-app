import { Collection, MongoClient } from "mongodb";

type UserConnectionEntity = {
  // _id: ObjectId,
  userId: string,
  connectionId: string
}

export class UserConnectionsRepository {

  public readonly collection: Collection<UserConnectionEntity>;

  constructor (private readonly connection: MongoClient) {
    this.collection = connection.db('btc').collection<UserConnectionEntity>('UserConnection')
  }

  async init() {
    this.collection.createIndexes([
      { key: { userId: 1 } }
    ]);
  }

  async saveConnection({connectionId, userId}: {connectionId: string, userId: string}) {
    const result = await this.collection.insertOne({connectionId, userId});
    return result.insertedId
  }

  async removeConnection(connectionId: string) {
    const result = await this.collection.deleteOne({ connectionId });
    return result.deletedCount
  }

  async getUserConnectionIds(userId: string) {
    const result = await this.collection.find({ userId }).toArray();

    return result.map(con => con.connectionId)
  }
}