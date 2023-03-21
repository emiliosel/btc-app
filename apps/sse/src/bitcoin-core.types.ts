export interface TransactionInput {
  txid: string
  vout: number
  scriptSig: {
    asm: string
    hex: string
  }
  sequence: number
}

export interface TransactionOutput {
  value: number
  n: number
  scriptPubKey: {
    asm: string
    hex: string
    reqSigs: number
    type: string
    addresses: string[]
  }
}

export interface Transaction {
  txid: string
  hash: string
  version: number
  size: number
  vsize: number
  weight: number
  locktime: number
  vin: TransactionInput[]
  vout: TransactionOutput[]
  hex: string
}

export interface AddressInfo {
  address: string
  scriptPubKey: string
  ismine: boolean
  iswatchonly: boolean
  solvable: boolean
  desc?: string
  pubkey?: string
  iscompressed?: boolean
  account?: string
  labels?: string[]
  timestamp?: number
  hdkeypath?: string
  hdseedid?: string
  hdmasterfingerprint?: string
}

export interface WalletOptions {
  // The passphrase used to encrypt the wallet. If not provided, the wallet is not encrypted.
  passphrase?: string;

  // If true, creates a wallet that does not use the HD protocol. Default: false.
  avoidReuse?: boolean;

  // The number of addresses to generate beyond the gap limit. Default: 0.
  extraGap?: number;

  // The number of signatures required to redeem funds from the wallet. Default: 1.
  requiredSignatures?: number;

  // If true, disables private key filtering. Default: false.
  privateKeysDisabled?: boolean;

  // If true, disables the use of the change address. Default: false.
  blank?: boolean;
}

export interface GetNewAddressOptions {
  // The label to assign to the address. Default: empty string.
  label?: string;

  // If true, the address will be created as a bech32 (segwit) address. Default: false.
  bech32?: boolean;
}

interface SendToAddressOptions {
  // A comment to associate with the transaction. Default: ''.
  comment?: string;

  // A comment to associate with the transaction that is not visible to other parties. Default: ''.
  commentTo?: string;

  // The transaction fee to include with the transaction. Default: undefined (will use wallet's default fee).
  fee?: number;

  // The number of blocks the transaction should wait before being confirmed. Default: 0.
  minConf?: number;

  // If true, the transaction will be sent with replace-by-fee (RBF) enabled. Default: false.
  replaceable?: boolean;

  // The ID of the transaction to use as the parent of this transaction. Default: undefined.
  parentTxId?: string;

  // The address that should be used to receive the change from the transaction. Default: undefined (will use a new address from the wallet).
  changeAddress?: string;

  // A flag that indicates whether to subtract the fee from the amount being sent. Default: false.
  subtractFeeFromAmount?: boolean;

  // The address to send the transaction to.
  address: string;

  // The amount of bitcoins to send to the address.
  amount: number;
}

interface SendToAddressResult {
  // The ID of the transaction that was created.
  txid: string;
}

interface GetReceivedByAddressOptions {
  minconf?: number;
}

type GetReceivedByAddressResult = number | null;

export interface BitcoinCore {
  getTransaction(
    txid: string,
    includeWatchonly?: boolean
  ): Promise<Transaction>;

  getAddressInfo(address: string): Promise<AddressInfo>;

  createWallet(
    name: string,
    options?: WalletOptions,
  ): Promise<void>;

  getNewAddress(
    options?: GetNewAddressOptions,
  ): Promise<string>;

  sendToAddress(
    address: string,
    amount: number,
    comment?: string,
    commentTo?: string,
    subtractFeeFromAmount?: boolean,
    replaceable?: boolean,
    confTarget?: number,
    estimateMode?: string,
    fee?: number,
    options?: SendToAddressOptions,
  ): Promise<SendToAddressResult>;

  getReceivedByAddress(
    address: string,
    options?: GetReceivedByAddressOptions,
  ): Promise<GetReceivedByAddressResult>;
}

export interface ClientOptions {
  username: string
  password: string
  port?: number
  host?: string
  network?: string
  version?: string
  timeout?: number
}

export type bitcoinCore = new (options: ClientOptions) => BitcoinCore
// }
