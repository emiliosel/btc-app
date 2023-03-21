import zmq from 'zeromq'

type TransactionSubscription = {
  name: 'transaction'
  handler: (txid: string) => void
}

type BlockSubscription = {
  name: 'block'
  handler: (blockid: string) => void
}

type ZeromqSubscriberSubscriptions = (TransactionSubscription | BlockSubscription)[]

export class ZeromqSubscriber {
  private readonly socket: any;

  private subscribed: boolean = false;

  private subscribtions: ZeromqSubscriberSubscriptions = [];

  constructor({ host }: { host: string }) {
    this.socket = (zmq as any).socket("sub");
    this.socket.connect(host);
  }

  async subscribeToBlockChanges(handler: (blockId: string) => void) {
    this.subscribtions.push({
      name: "block",
      handler,
    });
    this.subscribeToBTCNode();
    this.socket.subscribe("hashtx");
  }

  subscribeToTransactionChange(handler: (txid: string) => void) {
    this.subscribtions.push({
      name: "transaction",
      handler,
    });
    this.subscribeToBTCNode();
    this.socket.subscribe("rawtx");
  }

  private subscribeToBTCNode() {
    if (this.subscribed) {
      return;
    }

    this.socket.on("message", (topic: Buffer, message: Buffer) => {
      const topicStr = topic.toString();
      if (topicStr === "rawtx") {
        const txid = message.toString("hex");

        const subscription = this.subscribtions.find(
          (sub) => sub.name === "transaction"
        );

        if (subscription) {
          subscription.handler(txid);
        }
      } else if (topicStr === "hashblock") {
        const blockId = message.toString("hex");
        console.log("New block mined:", blockId);
        const subscription = this.subscribtions.find(
          (sub) => sub.name === "block"
        );

        if (subscription) {
          subscription.handler(blockId);
        }
      }
    });

    this.subscribed = true;
  }
}

