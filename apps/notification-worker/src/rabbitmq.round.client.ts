import { connect, Connection, Channel, Message } from "amqplib";

export class RabbitMQClient {
  private readonly queueName: string;
  private connection!: Connection;
  private channel!: Channel;

  constructor(queueName: string) {
    this.queueName = queueName;
  }

  async connect(host: string) {
    try {
      this.connection = await connect(host || "amqp://localhost");
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(this.queueName);
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

  async sendMessage(message: string) {
    try {
      await this.channel.sendToQueue(this.queueName, Buffer.from(message));
      console.log(`Sent message "${message}" to queue "${this.queueName}"`);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error sending message to RabbitMQ: ${error.message}`);
      }
    }
  }

  // eslint-disable-next-line no-unused-vars
  async startConsumingMessage(callback: (msg: string) => void | Promise<void>) {
    try {
      this.channel.prefetch(1);
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
