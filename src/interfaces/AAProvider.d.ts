import {
  BaseProvider,
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import { Signer } from "ethers";
import { Network } from "@ethersproject/networks";
// import { ClientConfig } from "./ClientConfig";
import { AASigner } from "./AASigner";
// import { ZeroDevSigner } from "./ZeroDevSigner";
import { HttpRpcClient } from "@zerodevapp/sdk/dist/src/HttpRpcClient";
// import { HttpRpcClient } from "./HttpRpcClient";
import { ClientConfig } from "@zerodevapp/sdk/dist/src/ClientConfig";
import { EntryPoint, UserOperationStruct } from "@zerodevapp/contracts";
import { BaseAccountAPI } from "@zerodevapp/sdk/dist/src/BaseAccountAPI";

/**
 * Based on ethersproject's Base Provider and [ZeroDevApp's SDK](https://zerodev.app/)
 */
export declare class AAProvider extends BaseProvider {
  readonly chainId: number;
  readonly config: Omit<ClientConfig, "projectId">;
  readonly originalSigner: Signer;
  readonly originalProvider: BaseProvider;
  readonly httpRpcClient: HttpRpcClient;
  readonly entryPoint: EntryPoint;
  readonly smartAccountAPI: BaseAccountAPI;
  initializedBlockNumber: number;
  readonly signer: AASigner;
  constructor(
    chainId: number,
    config: ClientConfig,
    originalSigner: Signer,
    originalProvider: BaseProvider,
    httpRpcClient: HttpRpcClient,
    entryPoint: EntryPoint,
    smartAccountAPI: BaseAccountAPI
  );
  /**
   * finish intializing the provider.
   * MUST be called after construction, before using the provider.
   */
  init(): Promise<this>;
  getSigner(): AASigner;
  perform(method: string, params: any): Promise<any>;
  getTransaction(
    transactionHash: string | Promise<string>
  ): Promise<TransactionResponse>;
  getTransactionReceipt(
    transactionHash: string | Promise<string>
  ): Promise<TransactionReceipt>;
  getSenderAccountAddress(): Promise<string>;
  waitForTransaction(
    transactionHash: string,
    confirmations?: number,
    timeout?: number
  ): Promise<TransactionReceipt>;
  constructUserOpTransactionResponse(
    userOp1: UserOperationStruct
  ): Promise<TransactionResponse>;
  detectNetwork(): Promise<Network>;
}
