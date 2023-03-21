import { connect, Connection, Channel, Message } from "amqplib";

export class RabbitMQSubscriber {
  private readonly queueName: string;
  private connection!: Connection;
  private channel!: Channel;

  private readonly exchangeName: string;

  constructor(queueName: string) {
    this.queueName = queueName;
    this.exchangeName = `exchange:${this.queueName}`;
  }

  async connect(host: string) {
    try {
      this.connection = await connect(host || "amqp://localhost");
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchangeName, "fanout", {
        durable: false,
      });
      const q = await this.channel.assertQueue(this.queueName);
      await this.channel.bindQueue(q.queue, this.exchangeName, "");
      console.log(
        `Connected to RabbitMQ and created channel with queue "${this.queueName}"`
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error connecting to RabbitMQ: ${error.message}`);
      }
      setTimeout(() => this.connect(host), 5000);
    }
  }

  // eslint-disable-next-line no-unused-vars
  async startConsumingMessage(callback: (msg: string) => void | Promise<void>) {
    try {
      console.log(` [*] Waiting for messages in queue "${this.queueName}"`);

      this.channel.consume(
        this.queueName,
        async (message: Message | null) => {
          if (message === null) return;
          try {
            await callback(message.content.toString());
            this.channel.ack(message);
          } catch (error) {
            if (error instanceof Error) {
              console.error(
                `Error processing message from RabbitMQ: ${error.message}`
              );
            }

            this.channel.nack(message);
          }
        },
        { noAck: false }
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `Error consuming message from RabbitMQ: ${error.message}`
        );
      }
      setTimeout(() => this.startConsumingMessage(callback), 5000);
    }
  }

  async close() {
    await this.channel.close();
    await this.connection.close();
    console.log(
      `Disconnected from RabbitMQ and closed channel with queue "${this.queueName}"`
    );
  }
}
