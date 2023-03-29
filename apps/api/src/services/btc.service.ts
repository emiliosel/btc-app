import type {
  BitcoinCore,
  ClientOptions,
  GetNewAddressOptions,
  WalletOptions,
  bitcoinCore,
} from "../bitcoin-core.types";

const BitcoinClient = require("bitcoin-core") as bitcoinCore;

export class BTCService {
  private client: BitcoinCore;

  private readonly clientOptions: ClientOptions;

  constructor(clientOptions: ClientOptions) {
    this.clientOptions = clientOptions;
    this.client = new BitcoinClient(clientOptions);
  }

  setClient(client: BitcoinCore) {
    this.client = client;
  }

  async getTransactionInfo(txid: string) {
    return this.client.getTransaction(txid);
  }

  async apiGetTransactionInfo(txid: string) {
    const info: any = await this.client.getTransaction(txid);
    const rawInfo = await this.client.getRawTransaction(txid, true);

    // Loop through all the inputs to the transaction and sum up their values
    let totalInputs = 0;

    if (rawInfo && Array.isArray(rawInfo.vin)) {
      for (const vin of rawInfo.vin) {
        const inputTxid = vin.txid;
        const inputVout = vin.vout;
        if (!inputTxid || !inputVout) {
          continue;
        }
        const input = await this.client.getTxOut(inputTxid, inputVout);
        if (input) {
          totalInputs += input.value;
        }
      }
    }

    const totalInputsVout =
      rawInfo.vin &&
      rawInfo.vin.reduce((total, input) => total + input.vout, 0);
    const totalOutputs =
      rawInfo.vout &&
      rawInfo.vout.reduce((total, output) => total + output.value, 0);

    return {
      hash: txid,
      receivedTime: new Date(info.time * 1000).toISOString(),
      status: info.confirmations > 0 ? "Confirmed" : "Unconfirmed",
      size: rawInfo.size,
      totalInputs,
      totalInputsVout,
      totalOutputs,
      fees: info.fee,
      transaction: info,
      rawTransaction: rawInfo,
      confirmations: info.confirmations
    };
  }

  async getAddressInfo(address: string) {
    return this.client.getAddressInfo(address);
  }

  async createWallet(name: string, options?: WalletOptions) {
    return this.client.createWallet(name, options);
  }

  async getNewAddress(options?: GetNewAddressOptions): Promise<string> {
    const address = await this.client.getNewAddress(options);
    return address;
  }

  async generateToAddress(address: string, numBlocks: number) {
    // TODO: fix types
    const blockHashes = await this.client.generateToAddress(numBlocks, address);
    console.log({ blockHashes });
  }

  async getWalletBalance() {
    // TODO: fix types
    return this.client.getBalance();
  }

  async getAddresses() {
    // TODO: fix types
    const addressess = await this.client.getAddressesByLabel("");
    return Object.keys(addressess);
  }

  async transferBitcoin(
    toAddress: string,
    amount: number
  ) {
    const txid = await this.client.sendToAddress(
      toAddress,
      amount,
    );

    return txid;
  }

  async getAddressBalance(address: string): Promise<number> {
    const balance = await this.client.getBalance('*', 0);
    return balance
  }

  async getAddressTotalUnspent(address: string): Promise<number> {
    const unspent = await this.client.listUnspent(1, 9999999, [address], true);
    const unspentTotal = unspent.reduce((total, u) => total + u.amount, 0);

    return unspentTotal
  }

  async getAddressTotalReceive(address: string) {
    const received = await this.client.getReceivedByAddress(address);

    return received
  }

  async getAddressTotalSpent(address: string) {
    const transactions = await this.client.listTransactions("*", 1000, 0, true);
    const spent = transactions.reduce((total, tx) => {
      if (tx.category === "send" && tx.address === address) {
        return total + tx.amount;
      } else {
        return total;
      }
    }, 0);

    return spent;
  }

  async getAddressNumberOfConfirmedTransations(address: string): Promise<number> {
    const transactions = await this.client.listTransactions("*", 1000, 0, true)
    const confirmed = transactions.filter(
      (tx) => tx.confirmations > 0 && tx.address === address
    ).length;
  
    return confirmed;
  }

  async apiGetAddressInfo(address: string) {
    const [confirmedTransactionsNumber, balance, totalReceive, totalSpent, totalUnspent] = await Promise.all([
      this.getAddressNumberOfConfirmedTransations(address),
      this.getAddressBalance(address),
      this.getAddressTotalReceive(address),
      this.getAddressTotalSpent(address),
      this.getAddressTotalUnspent(address)
    ])


    return {
      confirmedTransactionsNumber,
      balance,
      totalReceive,
      totalSpent,
      totalUnspent
    }
  } 
}
