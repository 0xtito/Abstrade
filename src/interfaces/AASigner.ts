import { UserOperationReceipt } from "@zerodevapp/sdk/dist/src/HttpRpcClient";
import { Signer } from "ethers";
import { Deferrable } from "ethers/lib/utils.js";
import {
  Provider,
  TransactionRequest,
  TransactionResponse,
} from "@ethersproject/providers";
import { BigNumber, Bytes, BigNumberish, ContractTransaction } from "ethers";
// import { ClientConfig } from "./ClientConfig";
import { Web3AuthConfig } from ".";
import { AAProvider } from "./AAProvider";
// dont need to include (now)
// import { Hooks } from "./ClientConfig";
import { defineReadOnly } from "ethers/lib/utils.js";

import { CustomHttpRpcClient } from "./CustomHttpRpcClient";
import ethers_eip712_1 from "ethers-eip712";
import { SimpleAccountAPI } from "../utils/SimpleAccountAPI";
import { UserOperationStruct } from ".";
import { ClientConfig } from ".";

/**
 * Based on ethers Signer and [ZeroDevApp's SDK](https://zerodev.app/)
 */
export class AASigner extends Signer {
  readonly config: ClientConfig;
  readonly originalSigner: Signer;
  readonly AAProvider: AAProvider;
  readonly httpRpcClient: CustomHttpRpcClient;
  readonly smartAccountAPI: SimpleAccountAPI;
  address?: string;

  constructor(
    config: ClientConfig,
    originalSigner: Signer,
    AAProvider: AAProvider,
    CustomHttpRpcClient: CustomHttpRpcClient,
    smartAccountAPI: SimpleAccountAPI
  ) {
    super();
    this.config = config;
    this.originalSigner = originalSigner;
    this.AAProvider = AAProvider;
    this.httpRpcClient = CustomHttpRpcClient;
    this.smartAccountAPI = smartAccountAPI;
    // making AAProvider the provider property from Signer
    defineReadOnly(this, "provider", AAProvider);
  }
  // delegate call is not a priority
  // delegateCopy(): AASigner {
  //   return new AASigner(
  //     this.config,
  //     this.originalSigner,
  //     this.AAProvider,
  //     this.httpRpcClient,
  //     this.smartAccountAPI
  //   );
  // }

  async sendTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<TransactionResponse> {
    // Set the gas price to 0 to ensure that estimateGas works even if the wallet has no ETH
    if (transaction.maxFeePerGas || transaction.maxPriorityFeePerGas) {
      transaction.maxFeePerGas = 0;
      transaction.maxPriorityFeePerGas = 0;
    } else {
      transaction.gasPrice = 0;
    }

    // `populateTransaction` internally calls `estimateGas`
    const tx = await this.populateTransaction(transaction);

    await this.verifyAllNecessaryFields(tx);

    // Create a signed user operation using the transaction data
    const userOperation = await this.smartAccountAPI.createSignedUserOp({
      target: tx.to || "",
      data: tx.data?.toString() || "",
      value: tx.value ? BigNumber.from(tx.value) : BigNumber.from(0),
      gasLimit: tx.gasLimit ? BigNumber.from(tx.gasLimit) : BigNumber.from(0),
      maxFeePerGas: tx.maxFeePerGas
        ? BigNumber.from(tx.maxFeePerGas)
        : BigNumber.from(0),
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas
        ? BigNumber.from(tx.maxPriorityFeePerGas)
        : BigNumber.from(0),
    });

    // Construct a transaction response from the signed user operation
    const transactionResponse =
      await this.AAProvider.constructUserOpTransactionResponse(userOperation);

    // Log the transaction receipt when the transaction is complete
    // transactionResponse÷
    //   .wait()
    //   .then(api_1.logTransactionReceipt(this.config.projectId));

    // Invoke the transactionStarted hook if it's provided in the config
    this.config.hooks?.transactionStarted?.({
      hash: transactionResponse.hash,
      from: tx.from || "",
      to: tx.to as `0x${string}`,
      value: tx.value || BigNumber.from(0),
      sponsored: userOperation.paymasterAndData !== "0x",
      //   module: types_1.getModuleInfo(tx),
    });

    // Send the signed user operation to the entry point (usually would send to bundler)
    try {
      // we have no bundler in our implementation, instead we send the user operation to the entry point
      //   await this.httpRpcClient.sendUserOpToBundler(userOperation);
      await this.httpRpcClient.sendUserOpToEntryPoint(userOperation);
    } catch (error) {
      // If sending the user operation to the bundler fails, unwrap the error and throw it
      throw this.unwrapError(error);
    }

    // Return the transaction response
    return transactionResponse;
  }
  unwrapError(errorIn: any): Error {
    if (!errorIn.body) {
      const parsedError = JSON.parse(errorIn.body);
      return parsedError;
    }
    const error = errorIn as Error;
    if (error.message) {
      return error;
    }
    return new Error(error.message);
  }
  estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber> {
    return this.originalSigner.estimateGas(transaction);
  }
  async getUserOperationReceipt(hash: string): Promise<UserOperationReceipt> {
    return this.httpRpcClient.getUserOperationReceipt(hash);
  }

  async verifyAllNecessaryFields(
    transactionRequest: TransactionRequest
  ): Promise<void> {
    if (!transactionRequest.to) {
      throw new Error("Missing 'to' field in the transaction request");
    }
    if (!transactionRequest.data) {
      throw new Error("Missing 'data' field in the transaction request");
    }
    if (!transactionRequest.value) {
      throw new Error("Missing 'value' field in the transaction request");
    }
  }

  connect(provider: Provider): Signer {
    // this is going to error out right now, so just return the original signer
    // return this.originalSigner.connect(provider);
    return this.originalSigner;
  }
  async getAddress(): Promise<string> {
    return this.originalSigner.getAddress();
  }
  async signMessage(message: Bytes | string): Promise<string> {
    return this.originalSigner.signMessage(message);
  }
  async signTypedData(typedData: any): Promise<string> {
    const digest = ethers_eip712_1.TypedDataUtils.encodeDigest(typedData);
    return this.originalSigner.signMessage(digest);
  }
  async signTransaction(
    transaction: Deferrable<TransactionRequest>
  ): Promise<string> {
    return this.originalSigner.signTransaction(transaction);
  }
  async signUserOperation(userOperation: UserOperationStruct): Promise<string> {
    const msg = await this.smartAccountAPI.getUserOpHash(userOperation);
    return this.originalSigner.signMessage(msg);
  }
  // very cool feature, but not imperitive for our application (execBatch)
  //   execBatch(
  //     calls: Call[],
  //     options?: {
  //       gasLimit?: number;
  //       gasPrice?: BigNumberish;
  //       multiSendAddress?: string;
  //     }
  //   ): Promise<ContractTransaction> {
  //     const batchTxs = await this.smartAccountAPI.
  //   }
  //   enableModule(moduleAddress: string): Promise<ContractTransaction>;
  /**
   * Only interesting feature, but, again, not imperative for our application ( update)
   * @param confirm 
   * 
   *   update(
    confirm: () => Promise<boolean>
  ): Promise<ContractTransaction | undefined>;
   */
}
