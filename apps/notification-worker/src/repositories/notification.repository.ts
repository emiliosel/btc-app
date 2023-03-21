import { Collection, MongoClient } from "mongodb";

type NotificationEntity = {
  // _id: ObjectId,
  forUserId: string,
  type: 'transaction' | 'address',
  data: any,
  read?: Date,
  created: Date,
}

export class NotificationsRepository {
  public readonly collection: Collection<NotificationEntity>;

  constructor(private readonly connection: MongoClient) {
    this.collection = connection
      .db("btc")
      .collection<NotificationEntity>("Notification");
  }

  async init() {
    this.collection.createIndexes([{ key: { userId: 1, created: -1 } }, ]);
  }

  async saveNotification(notification: Omit<NotificationEntity, 'created'>) {
    const result = await this.collection.insertOne({...notification, created: new Date()});
    return result.insertedId;
  }

  async getNotifications(userId: string) {
    const result = await this.collection.find({ userId }).sort({created: -1}).toArray();

    return result;
  }
}