
import { RabbitMQClient } from "./rabbitmq.publisher";
import { ZeromqSubscriber } from "./zeromq.subscriber";

const rabbitmqHost = process.env.RABBITMQ_HOST || "amqp://rabbitmq:5672";

async function main() {
  const btcSubscriber = new ZeromqSubscriber({ host: 'tcp://btc_node:29000' });
  const transactionPublisher = new RabbitMQClient("transaction-change");
  const blockPublisher = new RabbitMQClient("block-change");

  await blockPublisher.connect(rabbitmqHost);
  await transactionPublisher.connect(rabbitmqHost);

  btcSubscriber.subscribeToBlockChanges((blockId) => {
    blockPublisher.sendMessage(blockId);
  });

  btcSubscriber.subscribeToTransactionChange((txid) => {
    transactionPublisher.sendMessage(txid);
  });
}

main();