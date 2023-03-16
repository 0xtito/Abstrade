import { ethers, BigNumber, providers, Contract, BaseContract } from "ethers";
import {
  EntryPoint__factory,
  BaseAccount__factory,
} from "@zerodevapp/contracts";
import { PaymasterAPI } from "@zerodevapp/sdk/dist/src/PaymasterAPI";
import { calcPreVerificationGas } from "@zerodevapp/sdk/dist/src/calcPreVerificationGas";
import { resolveProperties } from "ethers/lib/utils.js";
import { packUserOp, getUserOpHash } from "@account-abstraction/utils";
import { BaseProvider } from "@ethersproject/providers";
// import { UserOperationStruct } from "@zerodevapp/contracts";
import { PromiseOrValue } from "@zerodevapp/contracts/dist/types/common";
import { BytesLike } from "@ethersproject/bytes";

// import { BaseAccountAPI } from "@zerodevapp/sdk/dist/src/BaseAccountAPI";
import { BigNumberish } from "ethers";
import { AAProvider } from "../interfaces/AAProvider";

export type UserOperationStruct = {
  sender: string;
  nonce: BigNumberish;
  initCode: BytesLike;
  callData: BytesLike;
  callGasLimit: BigNumberish;
  verificationGasLimit: BigNumberish;
  preVerificationGas: BigNumberish;
  maxFeePerGas: BigNumberish;
  maxPriorityFeePerGas: BigNumberish;
  paymasterAndData: BytesLike;
  signature: BytesLike;
};

interface BaseAccountAPIParams {
  // provider: AAProvider;
  provider: BaseProvider;
  // overheads: { [key: string]: number };
  entryPointAddress: string;
  accountAddress?: string;
  paymasterAPI?: PaymasterAPI;
}

interface DetailsForUserOp {
  target: string;
  value?: BigNumberish;
  data: string;
  gasLimit?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;
}

interface PartialUserOp {
  sender: string;
  nonce: BigNumberish;
  initCode: BytesLike;
  callData: BytesLike;
  callGasLimit: BigNumberish;
  verificationGasLimit: BigNumberish;
  maxFeePerGas: BigNumberish;
  maxPriorityFeePerGas: BigNumberish;
  paymasterAndData: BytesLike;
  signature: BytesLike;
  preVerificationGas?: BigNumberish;
}

const SIG_SIZE = 65;

/**
 * BaseAccountAPI is a base class for all account types and provides common functionality across accounts
 * @note
 */
/**
 * Base class for all Smart Wallet ERC-4337 Clients to implement.
 * Subclass should inherit 5 methods to support a specific wallet contract:
 *
 * - getAccountInitCode - return the value to put into the "initCode" field, if the account is not yet deployed. should create the account instance using a factory contract.
 * - getNonce - return current account's nonce value
 * - encodeExecute - encode the call from entryPoint through our account to the target contract.
 * - signUserOpHash - sign the hash of a UserOp.
 *
 * The user can use the following APIs:
 * - createUnsignedUserOp - given "target" and "calldata", fill userOp to perform that operation from the account.
 * - createSignedUserOp - helper to call the above createUnsignedUserOp, and then extract the userOpHash and sign it
 */
export abstract class BaseAccountAPI {
  // Define class properties and their types
  isPhantom: boolean;
  // provider: AAProvider;
  provider: BaseProvider;
  // overheads: { [key: string]: number };
  entryPointAddress: string;
  accountAddress?: string;
  paymasterAPI?: PaymasterAPI;
  delegateMode: boolean;
  entryPointView: Contract;
  senderAddress?: string;

  /**
   * Base constructor.
   * Subclass SHOULD add parameters that define the owner (signer) of this wallet
   */
  constructor(params: BaseAccountAPIParams) {
    this.isPhantom = true;
    this.provider = params.provider;
    // this.overheads = params.overheads;
    this.entryPointAddress = params.entryPointAddress;
    this.accountAddress = params.accountAddress;
    this.paymasterAPI = params.paymasterAPI;
    this.delegateMode = false;
    // factory "connect" defines the contract address. the contract "connect" defines the "from" address.
    // properly need to alter this / create a entry point contract instance
    this.entryPointView = EntryPoint__factory.connect(
      params.entryPointAddress,
      params.provider
    ).connect(params.provider);
  }

  // Add return types to all methods
  async init(): Promise<BaseAccountAPI> {
    if ((await this.provider.getCode(this.entryPointAddress)) === "0x") {
      throw new Error(`entryPoint not deployed at ${this.entryPointAddress}`);
    }
    await this.getAccountAddress();
    return this;
  }

  async checkAccountPhantom(): Promise<boolean> {
    if (!this.isPhantom) {
      // already deployed. no need to check anymore.
      return this.isPhantom;
    }
    const senderAddressCode = await this.provider.getCode(
      this.getAccountAddress()
    );
    if (senderAddressCode.length > 2) {
      // console.log(`SimpleAccount Contract already deployed at ${this.senderAddress}`)
      this.isPhantom = false;
    } else {
      // console.log(`SimpleAccount Contract is NOT YET deployed at ${this.senderAddress} - working in "phantom account" mode.`)
    }
    return this.isPhantom;
  }

  async encodeExecute(details: DetailsForUserOp): Promise<string> {
    const { target, value, data, gasLimit } = details;
    const encoded = await this.entryPointView.populateTransaction.execute(
      target,
      value,
      data,
      gasLimit
    );
    if (!encoded.data) {
      throw new Error("no data");
    }
    return encoded.data;
  }

  async getAccountInitCode(): Promise<string> {
    /**
     * Change this into an ethers contract call instead of doing callStatic
     * the signer prints out to the console, and shows methods that are available
     */
    const initCode = await this.entryPointView.callStatic.getInitCode();
    return initCode;
  }

  async getNonce(): Promise<number> {
    const nonce = await this.entryPointView.callStatic.getNonce();
    return nonce.toNumber();
  }

  async getCounterFactualAddress(): Promise<string> {
    const initCode = this.getAccountInitCode();
    // use entryPoint to query account address (factory can provide a helper method to do the same, but
    // this method attempts to be generic
    try {
      await this.entryPointView.callStatic.getSenderAddress(initCode);
    } catch (e: any) {
      if (e.errorArgs) {
        return e.errorArgs.sender;
      } else {
        throw e;
      }
    }
    throw new Error("must handle revert");
  }

  async getInitCode(): Promise<string> {
    if (await this.checkAccountPhantom()) {
      return await this.getAccountInitCode();
    }
    return "0x";
  }

  async getVerificationGasLimit(): Promise<BigNumberish> {
    return 100000;
  }

  async getPreVerificationGas(userOp: PartialUserOp): Promise<BigNumberish> {
    const properties = await resolveProperties(userOp);
    const preVerificationGas = BigNumber.from(
      // calcPreVerificationGas(properties, this.overheads)
      calcPreVerificationGas(properties)
    );
    return preVerificationGas;
  }

  packUserOp(userOp: UserOperationStruct): string {
    return packUserOp(userOp, false);
  }

  async encodeUserOpCallDataAndGasLimit(
    detailsForUserOp: DetailsForUserOp
  ): Promise<{ callData: string; callGasLimit: BigNumberish }> {
    let callData: string;
    const value = detailsForUserOp.value ?? BigNumber.from(0);

    // Not doing delegate mode
    // if (this.delegateMode) {
    //   callData = await this.encodeExecuteDelegate(
    //     detailsForUserOp.target,
    //     value,
    //     detailsForUserOp.data
    //   );
    // } else {
    //   callData = await this.encodeExecute({
    //     target: detailsForUserOp.target,
    //     value,
    //     data: detailsForUserOp.data,
    //   });
    // }

    callData = await this.encodeExecute({
      target: detailsForUserOp.target,
      value,
      data: detailsForUserOp.data,
    });

    const callGasLimit =
      detailsForUserOp.gasLimit ??
      ((await this.provider.estimateGas({
        from: this.entryPointAddress,
        to: this.getAccountAddress(),
        data: callData,
      })) as BigNumberish);

    return {
      callData,
      callGasLimit,
    };
  }

  async getUserOpHash(userOp: UserOperationStruct): Promise<string> {
    const op = await resolveProperties(userOp);
    const chainId = await this.provider.getNetwork().then((net) => net.chainId);
    return getUserOpHash(op, this.entryPointAddress, chainId);
  }

  async getAccountAddress(): Promise<string> {
    if (this.senderAddress == null) {
      if (this.accountAddress != null) {
        this.senderAddress = this.accountAddress;
      } else {
        this.senderAddress = await this.getCounterFactualAddress();
      }
    }
    return this.senderAddress;
  }

  async estimateCreationGas(initCode: string | null): Promise<BigNumber> {
    if (initCode == null || initCode === "0x") return BigNumber.from(0);
    const deployerAddress = initCode.substring(0, 42);
    const deployerCallData = "0x" + initCode.substring(42);
    return await this.provider.estimateGas({
      to: deployerAddress,
      data: deployerCallData,
    });
  }

  async createUnsignedUserOp(
    info: DetailsForUserOp
  ): Promise<UserOperationStruct> {
    const { callData, callGasLimit } =
      await this.encodeUserOpCallDataAndGasLimit(info);
    const initCode = await this.getInitCode();
    const initGas = await this.estimateCreationGas(initCode);
    const verificationGasLimit = BigNumber.from(
      await this.getVerificationGasLimit()
    ).add(initGas);
    let { maxFeePerGas, maxPriorityFeePerGas } = info;
    // at least one of these needs to be set
    if (!maxFeePerGas && !maxPriorityFeePerGas) {
      const feeData = await this.provider.getFeeData();
      maxFeePerGas = feeData.maxFeePerGas!;
      maxPriorityFeePerGas = feeData.maxPriorityFeePerGas!;
    }

    const partialUserOp: PartialUserOp = {
      sender: await this.getAccountAddress(),
      nonce: await this.getNonce(),
      initCode,
      callData,
      callGasLimit,
      verificationGasLimit,
      maxFeePerGas: maxFeePerGas ? maxFeePerGas : BigNumber.from(0),
      maxPriorityFeePerGas: maxPriorityFeePerGas
        ? maxPriorityFeePerGas
        : BigNumber.from(0),
      // Dummy values are required here ( from ZeroDev)
      paymasterAndData:
        "0xfe7dbcab8aaee4eb67943c1e6be95b1d065985c6000000000000000000000000000000000000000000000000000001869aa31cf400000000000000000000000000000000000000000000000000000000000000007dfe2190f34af27b265bae608717cdc9368b471fc0c097ab7b4088f255b4961e57b039e7e571b15221081c5dce7bcb93459b27a3ab65d2f8a889f4a40b4022801b",
      signature: ethers.utils.hexlify(Buffer.alloc(SIG_SIZE, 1)),
    };

    partialUserOp.preVerificationGas = await this.getPreVerificationGas(
      partialUserOp
    );
    let paymasterAndData: string | undefined;
    if (this.paymasterAPI != null) {
      try {
        paymasterAndData = await this.paymasterAPI.getPaymasterAndData(
          partialUserOp
        );
      } catch (err) {
        console.log("failed to get paymaster data", err);
        // if the paymaster runs into any issue, just ignore it and use
        // the account's own balance instead(???)
      }
    }
    partialUserOp.paymasterAndData = paymasterAndData ?? "0x";

    return {
      ...partialUserOp,
      signature: "",
      preVerificationGas: partialUserOp.preVerificationGas || BigNumber.from(0),
    };
  }

  // async signUserOpHash(userOpHash: string): Promise<string> {
  //   const signer = this.provider.getSigner();

  //   const signature = await signer.signMessage(userOpHash);
  //   return signature;
  // }

  abstract signUserOpHash(userOpHash: string): Promise<string>;

  async signUserOp(userOp: UserOperationStruct): Promise<UserOperationStruct> {
    const userOpHash = await this.getUserOpHash(userOp);
    const signature = await this.signUserOpHash(userOpHash);
    // const signature = await this.provider.
    return { ...userOp, signature };
  }

  async createSignedUserOp(
    info: DetailsForUserOp
  ): Promise<UserOperationStruct> {
    return await this.signUserOp(await this.createUnsignedUserOp(info));
  }

  async getUserOpReceipt(
    userOpHash: string,
    timeout = 30000,
    interval = 5000
  ): Promise<string | null> {
    const endtime = Date.now() + timeout;
    while (Date.now() < endtime) {
      const events = await this.entryPointView.queryFilter(
        this.entryPointView.filters.UserOperationEvent(userOpHash)
      );
      if (events.length > 0) {
        return events[0].transactionHash;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return null;
  }
}
