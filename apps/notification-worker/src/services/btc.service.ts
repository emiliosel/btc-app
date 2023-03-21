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

  async getRawTransaction(txid: string) {
    // TODO: fix types
    return this.client.getRawTransaction(txid);
  }

  async getTransactionIdFromHex(txidHex: string) {
    // TODO: fix types
    const result = await this.client.decodeRawTransaction(txidHex);
    return result.txid as string;
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
    return this.client.getBalance();
  }

  async getAddresses() {
    // TODO: fix types
    const addressess = await this.client.getAddressesByLabel("");
    return Object.keys(addressess);
  }

}
