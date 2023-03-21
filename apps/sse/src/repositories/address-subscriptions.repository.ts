import { Collection, MongoClient } from "mongodb";

type AddressSubscriptionEntity = {
  // _id: ObjectId,
  userId: string,
  address: string
}

export class AddressSubscriptionsRepository {

  public readonly collection: Collection<AddressSubscriptionEntity>;

  constructor (private readonly connection: MongoClient) {
    this.collection = connection.db('btc').collection<AddressSubscriptionEntity>('AddressSubscription')
  }

  async init() {
    this.collection.createIndexes([
      { key: { address: 1 } }
    ]);
  }

  async createSubscription({address, userId}: {address: string, userId: string}) {
    const result = await this.collection.insertOne({address, userId});
    return result.insertedId
  }
}