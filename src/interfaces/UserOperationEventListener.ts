import { EntryPoint } from "@zerodevapp/contracts";
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { BaseProvider } from "@ethersproject/providers";

export class UserOperationEventListener {
  private sender: string;
  private transactionHash: string;
  private timeout?: number;
  private resolve: (transactionReceipt: TransactionReceipt) => void;
  private reject: (error: Error) => void;
  private originalProvider: BaseProvider;
  private timer: NodeJS.Timeout | undefined;

  constructor(
    resolve: (transactionReceipt: TransactionReceipt) => void,
    reject: (error: Error) => void,
    sender: string,
    transactionHash: string,
    originalProvider: BaseProvider,
    timeout?: number
  ) {
    this.resolve = resolve;
    this.reject = reject;
    this.sender = sender;
    this.transactionHash = transactionHash;
    this.originalProvider = originalProvider;
    this.timeout = timeout;
  }

  async start(): Promise<void> {
    this.originalProvider.on("block", this.onNewBlock.bind(this));

    if (this.timeout) {
      this.timer = setTimeout(() => {
        this.originalProvider.off("block", this.onNewBlock.bind(this));
        this.reject(new Error("Transaction waiting timeout reached"));
      }, this.timeout);
    }
  }

  async onNewBlock(): Promise<void> {
    const transactionReceipt =
      await this.originalProvider.getTransactionReceipt(this.transactionHash);

    // check if the latest block included your transaction
    if (transactionReceipt && transactionReceipt.blockNumber) {
      this.resolve(transactionReceipt);
      this.originalProvider.on("block", this.onNewBlock.bind(this));

      if (this.timer) {
        clearTimeout(this.timer);
      }
    }
  }
}
