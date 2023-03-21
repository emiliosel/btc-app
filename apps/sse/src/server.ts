import { json } from "body-parser";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import { getConnection } from "./mongodb";
import { AddressSubscriptionsRepository } from "./repositories/address-subscriptions.repository";
import { TransactionSubscriptionsRepository } from "./repositories/transaction-subscriptions.repository";
import { UserConnectionsRepository } from "./repositories/user-connection.repository";
import { SSEConnectionService } from "./services/connections.service";
import { RabbitMQSubscriber } from "./rabbitmq.subscriber";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const rabbitmqHost = process.env.RABBITMQ_HOST || "amqp://rabbitmq:5672";

export const createServer = async () => {
  const app = express();

  const dbConnection = await getConnection();
  const addressSubscRepo = new AddressSubscriptionsRepository(dbConnection);
  const transactionSubscRepo = new TransactionSubscriptionsRepository(
    dbConnection
  );
  const connectionsRepo = new UserConnectionsRepository(dbConnection);

  await transactionSubscRepo.init();
  await addressSubscRepo.init();
  await connectionsRepo.init();

  const notificationsSubscriber = new RabbitMQSubscriber("notifications");
  await notificationsSubscriber.connect(rabbitmqHost);

  const connectionsService = new SSEConnectionService(connectionsRepo);

  notificationsSubscriber.startConsumingMessage(async (msg) => {
    const notification = JSON.parse(msg);
    console.log({ notification });

    const connections = await connectionsService.getUserConnections(notification.payload.forUserId);

    console.log(
      `Trying to send with sse for user: ${notification.payload.forUserId} found connections: ${connections.length}`
    );

    for (const connection of connections) {
      if (typeof connection !== 'undefined') {
        console.log(`Sending data for connnection: ${connection.id}`);
        connection.res.write(`id: ${Math.random().toString()}\n`);
        connection.res.write(`data: ${JSON.stringify({...notification.payload})}\n\n`)
      }
    }
  })

  app.disable("x-powered-by")
    .use(morgan("dev"))
    .use(json())
    .use(cors())
    .get("/sse", async (req, res) => {
      // Set headers for SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Create a new connection object
      const connection = {
        id: Math.random().toString(),
        res,
      };

      const userId = req.query.userId as string;

      await connectionsService.add(userId, connection)
      console.log(`Connections: ${connectionsService.connections.size}`)

      req.on("close", async () => {
        await connectionsService.remove(connection.id);
        res.end();
      });
    });

  return app;
};
