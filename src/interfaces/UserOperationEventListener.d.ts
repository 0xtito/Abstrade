import { EntryPoint } from "@zerodevapp/contracts";
import { TransactionReceipt } from "@ethersproject/abstract-provider";
import { BaseProvider } from "@ethersproject/providers";

export declare class UserOperationEventListener {
  private entryPoint: EntryPoint;
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
    entryPoint: EntryPoint,
    sender: string,
    transactionHash: string,
    originalProvider: BaseProvider,
    timeout?: number
  );

  start(): Promise<void>;

  onNewBlock(blockNumber: number): Promise<void>;
}
