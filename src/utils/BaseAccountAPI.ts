import { ethers, BigNumber } from "ethers";
import {
  EntryPoint__factory,
  EntryPoint,
} from "@account-abstraction/contracts";
import { PaymasterAPI } from "@zerodevapp/sdk/dist/src/PaymasterAPI";
import { calcPreVerificationGas } from "@zerodevapp/sdk/dist/src/calcPreVerificationGas";
import { resolveProperties } from "ethers/lib/utils.js";
import { packUserOp, getUserOpHash } from "@account-abstraction/utils";
import { BigNumberish } from "ethers";
import { Provider } from "@ethersproject/providers";

import {
  UserOperationStruct,
  BaseAccountAPIParams,
  DetailsForUserOp,
  PartialUserOp,
} from "../interfaces";

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
  provider: Provider;
  // overheads: { [key: string]: number };
  entryPointAddress: string;
  accountAddress?: string;
  paymasterAPI?: PaymasterAPI;
  delegateMode: boolean;
  entryPointView: EntryPoint;
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
    // Notes from ZeroDev
    // factory "connect" defines the contract address. the contract "connect" defines the "from" address.
    // properly need to alter this / create a entry point contract instance
    // instead of using the zero address, you would you the users address(?)
    this.entryPointView = EntryPoint__factory.connect(
      params.entryPointAddress,
      params.provider
    ).connect(ethers.constants.AddressZero);
  }

  // Add return types to all methods
  async init(): Promise<BaseAccountAPI> {
    if ((await this.provider.getCode(this.entryPointAddress)) === "0x") {
      throw new Error(`entryPoint not deployed at ${this.entryPointAddress}`);
    }
    await this.getAccountAddress();
    return this;
  }

  abstract encodeExecute(details: DetailsForUserOp): Promise<string>;

  abstract getAccountInitCode(): Promise<string>;

  abstract getNonce(): Promise<BigNumberish>;

  abstract signUserOpHash(userOpHash: string): Promise<string>;

  async checkAccountPhantom(): Promise<boolean> {
    if (!this.isPhantom) {
      // already deployed. no need to check anymore.
      return this.isPhantom;
    }
    const senderAddressCode = await this.provider.getCode(
      this.getAccountAddress()
    );
    if (senderAddressCode.length > 2) {
      this.isPhantom = false;
    } else {
      console.log(
        `SimpleAccount Contract is NOT YET deployed at ${this.senderAddress} - working in "phantom account" mode.`
      );
      this.isPhantom = true;
    }
    return this.isPhantom;
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

    // Not doing delegate mode, if we were we sending ops for the user we would need to use this(will implement depending on time)
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
      // Dummy values are required here (from ZeroDev)
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

  async signUserOp(userOp: UserOperationStruct): Promise<UserOperationStruct> {
    const userOpHash = await this.getUserOpHash(userOp);
    const signature = await this.signUserOpHash(userOpHash);
    return { ...userOp, signature };
  }

  async createSignedUserOp(
    info: DetailsForUserOp
  ): Promise<UserOperationStruct> {
    const unsignedUserOp = await this.createUnsignedUserOp(info);
    console.log('++++ unsignedUserOp ++++')
    console.log(unsignedUserOp);
    return await this.signUserOp(unsignedUserOp);
  }

  /**
   * get the transaction that has this userOpHash mined, or null if not found
   * @param userOpHash returned by sendUserOpToBundler (or by getUserOpHash..)
   * @param timeout stop waiting after this timeout
   * @param interval time to wait between polls.
   * @return the transactionHash this userOp was mined, or null if not found.
   *
   * @note implement in ZeroDev's BaseAccountAPI
   */
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
