import {
  BaseProvider,
  TransactionReceipt,
  TransactionResponse,
} from "@ethersproject/providers";
import { Signer, BigNumber } from "ethers";
import { Network } from "@ethersproject/networks";
import { ClientConfig } from "./ClientConfig";
import { AASigner } from "./AASigner";
// import { ZeroDevSigner } from "./ZeroDevSigner";
import { HttpRpcClient } from "@zerodevapp/sdk/dist/src/HttpRpcClient";
// import { HttpRpcClient } from "./HttpRpcClient";
// import { ClientConfig } from "@zerodevapp/sdk/dist/src/ClientConfig";
import { EntryPoint, UserOperationStruct } from "@zerodevapp/contracts";
import { BaseAccountAPI } from "@zerodevapp/sdk/dist/src/BaseAccountAPI";
import { CustomHttpRpcClient } from "./CustomHttpRpcClient";
import debug from "debug";
import { hexValue, resolveProperties } from "ethers/lib/utils.js";
import { getUserOpHash } from "@account-abstraction/utils";
const log = debug("AAProvider");

import { UserOperationEventListener } from "./UserOperationEventListener";
import { SimpleAccountAPI } from "../utils/SimpleAccountAPI";
import { ethers } from "ethers";
import { ExternalProvider } from "@ethersproject/providers";

/**
 * Based on ethersproject's Base Provider and [ZeroDevApp's SDK](https://zerodev.app/)
 */
export class AAProvider extends BaseProvider {
  readonly chainId: number;
  readonly config: Omit<ClientConfig, "projectId">;
  readonly originalSigner: Signer;
  readonly originalProvider: BaseProvider;
  readonly httpRpcClient: CustomHttpRpcClient;
  // goinn to try only stored the entry point address, and not the whole type entry point?
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
    customHttpRpcClient: CustomHttpRpcClient,
    entryPointAddress: string,
    smartAccountAPI: SimpleAccountAPI
  ) {
    super({
      chainId: chainId,
      name: "ERC-4337 Custom Network",
    });
    this.chainId = chainId;
    this.config = config;
    this.originalSigner = originalSigner;
    this.originalProvider = originalProvider;
    this.httpRpcClient = customHttpRpcClient;
    this.entryPointAddress = entryPointAddress;
    this.smartAccountAPI = smartAccountAPI;
    this.initializedBlockNumber = 0;
    this.signer = new AASigner(
      config,
      originalSigner,
      this,
      customHttpRpcClient,
      new SimpleAccountAPI({
        provider: this,
        entryPointAddress: entryPointAddress,
        signer: originalSigner,
      })
    );
  }
  /**
   * finish intializing the provider.
   * MUST be called after construction, before using the provider.
   */
  async init(): Promise<this> {
    this.initializedBlockNumber = await this.originalProvider.getBlockNumber();
    await this.smartAccountAPI.init();

    return this;
  }

  getSigner(): AASigner {
    return this.signer;
  }

  async perform(method: string, params: any): Promise<any> {
    log("perform", method, params);
    if (method === "sendTransaction" || method === "getTransactionReceipt") {
      throw new Error(
        "sendTransaction and getTransactionReceipt should not be called directly on AAProvider. Use getSigner().sendTransaction() or getSigner().getTransactionReceipt()"
      );
    }
    return await this.originalProvider.perform(method, params);
  }

  async getTransaction(
    transactionHash: string | Promise<string>
  ): Promise<TransactionResponse> {
    return await super.getTransaction(transactionHash);
  }

  async getTransactionReceipt(
    transactionHash: string | Promise<string>
  ): Promise<TransactionReceipt> {
    return await super.getTransactionReceipt(transactionHash);
  }

  async getSenderAccountAddress(): Promise<string> {
    return await this.smartAccountAPI.getAccountAddress();
  }

  // may not need this, since wagmi has the hook useWaitForTransaction
  // async waitForTransaction(
  //   transactionHash: string,
  //   confirmations?: number,
  //   timeout?: number
  // ): Promise<TransactionReceipt> {
  //   const sender = await this.getSenderAccountAddress();
  //   return await new Promise((resolve, reject) => {
  //     const resolveWithHooks = async (receipt: TransactionReceipt) => {
  //       this.config.hooks?.transactionConfirmed?.call(
  //         this.config,
  //         transactionHash
  //       );
  //       resolve(receipt);
  //     };
  //     const rejectWithHooks = (err: any) => {
  //       this.config.hooks?.transactionReverted?.call(
  //         this.config,
  //         transactionHash
  //       );
  //       reject(err);
  //     };
  //     // const interval = setInterval(async () => {
  //     //   const receipt = await this.getTransactionReceipt(transactionHash);
  //     //   if (receipt) {
  //     //     clearInterval(interval);
  //     //     resolve(receipt);
  //     //   }
  //     // }, 1000);
  //   });
  // }

  /** Also may not need this, since wagmi has the hook useWaitForTransaction
   *
   */
  async constructUserOpTransactionResponse(
    userOp1: UserOperationStruct
  ): Promise<TransactionResponse> {
    const userOp = await resolveProperties(userOp1);

    const userOpHash = getUserOpHash(
      userOp,
      this.config.entryPointAddress,
      this.chainId
    );

    const waitForTxPromise = new Promise<TransactionReceipt>(
      (resolve, reject) => {
        const resolveWithHooks = (receipt: TransactionReceipt) => {
          this.config.hooks?.transactionConfirmed?.(userOpHash);
          resolve(receipt);
        };

        const rejectWithHooks = (err: any) => {
          this.config.hooks?.transactionReverted?.(userOpHash);
          reject(err);
        };

        const listener = new UserOperationEventListener(
          resolveWithHooks,
          rejectWithHooks,
          userOp.sender,
          userOpHash,
          this.originalProvider
        );
        listener.start();
      }
    );

    return {
      hash: userOpHash,
      from: userOp.sender,
      value: BigNumber.from(0),
      gasLimit: BigNumber.from(userOp.callGasLimit),
      gasPrice: BigNumber.from(userOp.maxFeePerGas),
      data: hexValue(userOp.callData),
      nonce: BigNumber.from(userOp.nonce).toNumber(),
      confirmations: 0,
      chainId: this.chainId,
      wait: async () => {
        const txReceipt = await waitForTxPromise;

        if (userOp.initCode.length !== 0) {
          await this.smartAccountAPI.checkAccountPhantom();
        }
        return txReceipt;
      },
    };

    // return new Promise((resolve, reject) => {
    //   const resolveWithHooks = async (receipt: TransactionReceipt) => {
    //     this.config.hooks?.transactionConfirmed?.call(
    //       this.config,
    //       userOp1.txHash
    //     );
    //     resolve(receipt);
    //   };
    //   const rejectWithHooks = (err: any) => {
    //     this.config.hooks?.transactionReverted?.call(this.config, userOp1.txHash);
    //     reject(err);
    //   };
    //   const interval = setInterval(async () => {
    //     const receipt = await this.getTransactionReceipt(userOp1.txHash);
    //     if (receipt) {
    //       clearInterval(interval);
    //       resolveWithHooks(receipt);
    //     }
    //   }, 1000);
    // });
  }

  detectNetwork(): Promise<Network> {
    return this.originalProvider.detectNetwork();
  }
}
