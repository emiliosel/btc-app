import { Collection, MongoClient } from "mongodb";

type TransactionSubscriptionEntity = {
  // _id: ObjectId,
  userId: string,
  transaction: string
}

export class TransactionSubscriptionsRepository {

  public readonly collection: Collection<TransactionSubscriptionEntity>;

  constructor (private readonly connection: MongoClient) {
    this.collection = connection.db('btc').collection<TransactionSubscriptionEntity>('TransactionSubscription')
  }

  async init() {
    this.collection.createIndexes([
      { key: { transaction: 1 } }
    ]);
  }

  async createSubscription({transaction, userId}: {transaction: string, userId: string}) {
    const result = await this.collection.insertOne({transaction, userId});
    return result.insertedId
  }

  async findSubscriptions(transactionId: string) {
    return this.collection.find({transaction: transactionId}).toArray();
  }
}