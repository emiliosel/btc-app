import { BlockChangeWorker } from "./block.worker";
import { getConnection } from "./mongodb";
import { RabbitMQPublisher } from "./rabbitmq.publisher";
// import { RabbitMQClient } from "./rabbitmq.client";
import { RabbitMQClient } from "./rabbitmq.round.client";
// import { RabbitMQSubscriber } from './rabbitmq.subscriber';
// import { RabbitMQPublisher } from "./rabbitmq.publisher";
import { AddressSubscriptionsRepository } from "./repositories/address-subscriptions.repository";
import { NotificationsRepository } from "./repositories/notification.repository";
import { TransactionSubscriptionsRepository } from "./repositories/transaction-subscriptions.repository";
import { UserConnectionsRepository } from "./repositories/user-connection.repository";
import { BTCService } from "./services/btc.service";
import { TransactionChangeWorker } from "./transaction.worker";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const rabbitmqHost = process.env.RABBITMQ_HOST || "amqp://rabbitmq:5672";

async function main() {

  const dbConnection = await getConnection();
  const addressSubRepo = new AddressSubscriptionsRepository(dbConnection);
  const userConnectionsRepo = new UserConnectionsRepository(dbConnection);
  const transactionsSubRepo = new TransactionSubscriptionsRepository(dbConnection);
  const addressesSubRepo = new AddressSubscriptionsRepository(dbConnection);
  const notifiacationsRepo = new NotificationsRepository(
    dbConnection
  );

  await addressesSubRepo.init();
  await addressSubRepo.init();
  await userConnectionsRepo.init();
  await transactionsSubRepo.init();

  const transactionSubscriber = new RabbitMQClient("transaction-change");
  const blockSubscriber = new RabbitMQClient("block-change");

  const rabbitmqPublisher = new RabbitMQPublisher("notifications");

  // TODO: add config
  const btcService = new BTCService({
    host: "btc_node",
    username: "bitcoinrpc",
    password: "qDVRUlIJq/Tnq9xPObuhQ2dOWhZX1WEmgAcnrf9kqmtw",
    network: "regtest",
    port: 18443,
  });

  const transactionWorker = new TransactionChangeWorker(
    btcService,
    transactionsSubRepo,
    userConnectionsRepo,
    notifiacationsRepo,
    rabbitmqPublisher,
    addressSubRepo
  );

  const blockWorker = new BlockChangeWorker();

  await blockSubscriber.connect(rabbitmqHost);
  await transactionSubscriber.connect(rabbitmqHost);
  await rabbitmqPublisher.connect(rabbitmqHost);
  
  transactionSubscriber.startConsumingMessage((txid) => {
    console.log("[transaction-change]: ", txid);
    transactionWorker.run(txid);
  });

  blockSubscriber.startConsumingMessage((blockid) => {
    console.log("[block-change]", blockid);
    blockWorker.run(blockid);
  });
}

main();
