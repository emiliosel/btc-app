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
    private readonly addressesSubRepo: AddressSubscriptionsRepository
  ) {}

  public async run(txid: string) {
    console.log(`[TransactionChangeWorker] running...`, { txid });
    txid = await this.btcService.getTransactionIdFromHex(txid);
    // get transaction info
    const transInfo = await this.btcService.getTransactionInfo(txid);
    const transRawInfo = await this.btcService.getRawTransaction(txid, true);

    await this.findSubscriptionsForTransactionAndNotify(transInfo.hash, transInfo);


    if (Array.isArray(transRawInfo.vin)) {
      // Loop through the vin array to extract the addresses
      for (const input of transRawInfo.vin) {
        try {
          const scriptSig = await this.btcService.getRawTransaction(input.txid);
          const address = scriptSig.vout[input.vout].scriptPubKey.addresses[0];
          await this.findSubscriptionsForAddressAndNotify(address, transInfo);
        } catch (er) {
          console.log(`[ERROR]: ${(er as Error).message}`);
        }
      }
    }

    // Loop through the vout array to extract the addresses
    if (Array.isArray(transRawInfo.vout)) {
      for (const output of transRawInfo.vout) {
        try {
          const address = output.scriptPubKey.addresses[0];

          // check if any subscriptions
          // if yes send events to rabbit queue to notify user with {userid, address | transaction }
          await this.findSubscriptionsForAddressAndNotify(address, transInfo);
          console.log(`Output address: ${address}`);
        } catch (er) {
          console.log(`[ERROR]: ${(er as Error).message}`);
        }
      }
    }
  }

  private async findSubscriptionsForTransactionAndNotify(
    txid: string,
    transInfo: Transaction
  ) {
    // check if any subscriptions to transaction hash
    const transactionSubscriptions =
      await this.transactionSubRepo.findSubscriptions(transInfo.txid);

    for (const subscription of transactionSubscriptions) {
      // create database notification
      await this.notificationRepo.saveNotification({
        forUserId: subscription.userId,
        type: "transaction",
        data: transInfo.txid,
      });

      // send event queue for notification
      await this.rabbitmqPublisher.publishMessage(
        JSON.stringify({
          type: "notification:transaction",
          payload: {
            forUserId: subscription.userId,
            type: "transaction",
            data: transInfo.txid,
          },
        })
      );
    }
  }

  private async findSubscriptionsForAddressAndNotify(
    address: string,
    transInfo: Transaction
  ) {
    const addressSubscriptions = await this.addressesSubRepo.findSubscriptions(
      address
    );

    for (const subscription of addressSubscriptions) {
      // create database notification
      await this.notificationRepo.saveNotification({
        forUserId: subscription.userId,
        type: "address",
        data: address,
      });

      // send event queue for notification
      await this.rabbitmqPublisher.publishMessage(
        JSON.stringify({
          type: "notification:address",
          payload: {
            forUserId: subscription.userId,
            type: "address",
            data: address,
          },
        })
      );
    }
  }
}