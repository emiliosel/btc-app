import { Transaction } from "./bitcoin-core.types";
import { RabbitMQPublisher } from "./rabbitmq.publisher";
import { AddressSubscriptionsRepository } from "./repositories/address-subscriptions.repository";
import { NotificationsRepository } from "./repositories/notification.repository";
import { TransactionSubscriptionsRepository } from "./repositories/transaction-subscriptions.repository";
import { UserConnectionsRepository } from "./repositories/user-connection.repository";
import { BTCService } from "./services/btc.service";

export class TransactionChangeWorker {

  constructor(
    private readonly btcService: BTCService,
    private readonly transactionSubRepo: TransactionSubscriptionsRepository,
    private readonly connectionsRepo: UserConnectionsRepository,
    private readonly notificationRepo: NotificationsRepository,
    private readonly rabbitmqPublisher: RabbitMQPublisher,
    private readonly addressesSubRepo: AddressSubscriptionsRepository,
  ) {}

  public async run(txid: string) {
    console.log(`[TransactionChangeWorker] running...`, { txid });
    txid = await this.btcService.getTransactionIdFromHex(txid);
    console.log({ txid })
    // get transaction info
    const transInfo = await this.btcService.getTransactionInfo(txid);

    // check if any subscriptions to transaction hash
    const transactionSubscriptions =
      await this.transactionSubRepo.findSubscriptions(transInfo.hash);

    for (const subscription of transactionSubscriptions) {
      // create database notification
      await this.notificationRepo.saveNotification({
        forUserId: subscription.userId,
        type: "transaction",
        data: transInfo,
      });

      // send event queue for notification
      await this.rabbitmqPublisher.publishMessage(
        JSON.stringify({
          type: "notification:transaction",
          payload: {
            forUserId: subscription.userId,
            type: "transaction",
            data: transInfo,
          },
        })
      );
    }

    if (Array.isArray(transInfo.vin)) {
      // Loop through the vin array to extract the addresses
      for (const input of transInfo.vin) {
        try {
          const scriptSig = await this.btcService.getRawTransaction(input.txid);
          const address = scriptSig.vout[input.vout].scriptPubKey.addresses[0];
          console.log(`Input address: ${address}`);
          await this.findSubscriptionsForAddressAndNotify(address, transInfo);
        } catch (er) {
          console.log(`[ERROR]: ${(er as Error).message}`);
        }
      }
    }

    if (Array.isArray((transInfo as any).details as any)) {
      for (const detail of (transInfo as any).details as {address: string}[]) {
        try {
          const address = detail.address;
          console.log(`Input address: ${address}`);
          await this.findSubscriptionsForAddressAndNotify(address, transInfo);
        } catch (er) {
          console.log(`[ERROR]: ${(er as Error).message}`);
        }
      }
    }

    // Loop through the vout array to extract the addresses
    if (Array.isArray(transInfo.vout)) {
      for (const output of transInfo.vout) {
        try {
          const address = output.scriptPubKey.addresses[0];

          // check if any subscriptions and if user online
          // if yes send events to rabbit queue to notify user with {userid, address | transaction }
          await this.findSubscriptionsForAddressAndNotify(address, transInfo);
          console.log(`Output address: ${address}`);
        } catch (er) {
          console.log(`[ERROR]: ${(er as Error).message}`);
        }
      }
    }
  }

  private async findSubscriptionsForAddressAndNotify(address: string, transInfo: Transaction) {
    const addressSubscriptions = await this.addressesSubRepo.findSubscriptions(
      address
    );

    for (const subscription of addressSubscriptions) {
      // create database notification
      await this.notificationRepo.saveNotification({
        forUserId: subscription.userId,
        type: "address",
        data: transInfo,
      });

      // send event queue for notification
      await this.rabbitmqPublisher.publishMessage(
        JSON.stringify({
          type: "notification:address",
          payload: {
            forUserId: subscription.userId,
            type: "address",
            data: transInfo,
          },
        })
      );
    }
  }
}