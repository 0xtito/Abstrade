import {
  BaseProvider,
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import { Signer } from "ethers";
import { Network } from "@ethersproject/networks";
import { AASigner } from "./AASigner";
import { CustomHttpRpcClient } from "./CustomHttpRpcClient";

import { ClientConfig } from "@zerodevapp/sdk/dist/src/ClientConfig";
import { UserOperationStruct } from "@zerodevapp/contracts";
import { SimpleAccountAPI } from "../utils/SimpleAccountAPI";

/**
 * Based on ethersproject's Base Provider and [ZeroDevApp's SDK](https://zerodev.app/)
 */
export declare class AAProvider extends BaseProvider {
  readonly chainId: number;
  readonly config: Omit<ClientConfig, "projectId">;
  readonly originalSigner: Signer;
  readonly originalProvider: BaseProvider;
  readonly httpRpcClient: CustomHttpRpcClient;
  // disregarding this for now
  // readonly entryPoint: EntryPoint;
  readonly entryPointAddress: string;
  readonly smartAccountAPI: SimpleAccountAPI;
  initializedBlockNumber: number;
  readonly signer: AASigner;
  constructor(
    chainId: number,
    config: Omit<ClientConfig, "projectId">,
    originalSigner: Signer,
    originalProvider: BaseProvider,
    httpRpcClient: CustomHttpRpcClient,
    // disregarding this for now
    // entryPoint: EntryPoint,
    entryPointAddress: string,
    smartAccountAPI: SimpleAccountAPI
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
