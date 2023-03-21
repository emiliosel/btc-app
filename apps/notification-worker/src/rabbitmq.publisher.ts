import { connect, Connection, Channel } from "amqplib";

export class RabbitMQPublisher {
  private readonly queueName: string;
  private connection!: Connection;
  private channel!: Channel;
  private readonly exchangeName: string;

  constructor(queueName: string, exchangeName?: string) {
    this.queueName = queueName;
    this.exchangeName = `${exchangeName || 'exchange'}:${queueName}`;
  }

  async connect(host: string) {
    try {
      this.connection = await connect(host || "amqp://localhost");
      this.channel = await this.connection.createChannel();
      // 'fanout' will broadcast all messages to all the queues it knows
      await this.channel.assertExchange(this.exchangeName, "fanout", {
        durable: false,
      });

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

  async publishMessage(message: string) {
    try {
      // console.log('channle: ', this.channel)
      await this.channel.publish(this.exchangeName, '', Buffer.from(message));
      console.log(`Sent message "${message}" to queue "${this.queueName}"`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error sending message to RabbitMQ: ${error.message}`);
      }
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
