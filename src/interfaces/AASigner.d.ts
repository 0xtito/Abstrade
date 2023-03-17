import { Call } from "@zerodevapp/sdk/dist/src/multisend";
import { UserOperationReceipt } from "@zerodevapp/sdk/dist/src/HttpRpcClient";
import { Signer } from "ethers";
import { Deferrable } from "ethers/lib/utils.js";
import {
  Provider,
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/providers";
import { BigNumber, Bytes, BigNumberish, ContractTransaction } from "ethers";
import { UserOperationStruct } from "@zerodevapp/contracts";
// import { ClientConfig } from "./ClientConfig";
import { Web3AuthConfig } from ".";
import { AAProvider } from "./AAProvider";
import { CustomHttpRpcClient } from "./CustomHttpRpcClient";
import { SimpleAccountAPI } from "../utils/SimpleAccountAPI";

/**
 * Based on ethers Signer and [ZeroDevApp's SDK](https://zerodev.app/)
 */
export declare class AASigner extends Signer {
  readonly config: Omit<Web3AuthConfig, "projectId">;
  readonly originalSigner: Signer;
  readonly AAProvider: AAProvider;
  readonly httpRpcClient: CustomHttpRpcClient;
  readonly smartAccountAPI: SimpleAccountAPI;
  constructor(
    config: Web3AuthConfig,
    originalSigner: Signer,
    AAProvider: AAProvider,
    CustomHttpRpcClient: CustomHttpRpcClient,
    smartAccountAPI: SimpleAccountAPI
  );
  address?: string;
  delegateCopy(): AASigner;
  sendTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionResponse>;
  unwrapError(errorIn: any): Error;
  estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber>;
  getUserOperationReceipt(hash: string): Promise<UserOperationReceipt>;
  verifyAllNecessaryFields(
    transactionRequest: TransactionRequest
  ): Promise<void>;
  connect(provider: Provider): Signer;
  getAddress(): Promise<string>;
  signMessage(message: Bytes | string): Promise<string>;
  signTypedData(typedData: any): Promise<string>;
  signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string>;
  signUserOperation(userOperation: UserOperationStruct): Promise<string>;
  execBatch(
    calls: Call[],
    options?: {
      gasLimit?: number;
      gasPrice?: BigNumberish;
      multiSendAddress?: string;
    }
  ): Promise<ContractTransaction>;
  enableModule(moduleAddress: string): Promise<ContractTransaction>;
  update(
    confirm: () => Promise<boolean>
  ): Promise<ContractTransaction | undefined>;
}
