// import { HttpRpcClient, UserOperationReceipt } from './HttpRpcClient';
// import { BaseAccountAPI } from './BaseAccountAPI';
// import { Call } from './multisend';
// BasAccountAPI will eventually be replaced with Abstrades Smart Account API
import { BaseAccountAPI } from "@zerodevapp/sdk/dist/src/BaseAccountAPI";
import { Call } from "@zerodevapp/sdk/dist/src/multisend";
import {
  HttpRpcClient,
  UserOperationReceipt,
} from "@zerodevapp/sdk/dist/src/HttpRpcClient";
import { Signer } from "ethers";
import { Deferrable } from "ethers/lib/utils.js";
import {
  Provider,
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/providers";
import { BigNumber, Bytes, BigNumberish, ContractTransaction } from "ethers";
import { UserOperationStruct } from "@zerodevapp/contracts";
import { ClientConfig } from "./ClientConfig";
import { AAProvider } from "./AAProvider";

/**
 * Based on ethers Signer and [ZeroDevApp's SDK](https://zerodev.app/)
 */
export declare class AASigner extends Signer {
  readonly config: ClientConfig;
  readonly originalSigner: Signer;
  readonly zdProvider: AAProvider;
  readonly httpRpcClient: HttpRpcClient;
  readonly smartAccountAPI: BaseAccountAPI;
  constructor(
    config: ClientConfig,
    originalSigner: Signer,
    AAProvider: AAProvider,
    httpRpcClient: HttpRpcClient,
    smartAccountAPI: BaseAccountAPI
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
