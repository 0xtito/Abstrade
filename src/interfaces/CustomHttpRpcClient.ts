import { ethers, Signer } from "ethers";
import {
  EntryPoint,
  EntryPoint__factory,
} from "@account-abstraction/contracts";
import {
  UserOperationStruct,
  EstimateUserOpGasResult,
  UserOperationReceipt,
} from "./";
import { deepHexlify } from "@account-abstraction/utils";
import { resolveProperties } from "ethers/lib/utils.js";
import { JsonRpcProvider } from "@ethersproject/providers";

const EntryPointAbi = EntryPoint__factory.abi;

/**
 * Based off of Zero Dev's implementation
 */
export class CustomHttpRpcClient {
  readonly bundlerUrl: string;
  readonly entryPointAddress: string;
  readonly chainId: number;
  private readonly userOpJsonRpcProvider: ethers.providers.JsonRpcProvider;
  private readonly originalSigner: Signer;
  private readonly entryPointContract: EntryPoint;
  initializing: Promise<void>;

  constructor(
    entryPointAddress: string,
    chainId: number,
    provider: JsonRpcProvider,
    signer: Signer,
    bundlerUrl?: string
  ) {
    this.entryPointAddress = entryPointAddress;
    this.chainId = chainId;
    this.bundlerUrl = bundlerUrl || "default_bundler_url";
    this.userOpJsonRpcProvider = provider;
    this.originalSigner = signer;
    // providerUrl = providerUrl || "http://localhost:8545";
    // this.userOpJsonRpcProvider = new ethers.providers.JsonRpcProvider(
    //   providerUrl
    // );

    // Create an instance of the EntryPoint contract
    // this.entryPointContract = new ethers.Contract(
    //   entryPointAddress,
    //   EntryPointAbi,
    //   this.userOpJsonRpcProvider
    // );

    this.entryPointContract = EntryPoint__factory.connect(
      this.entryPointAddress,
      this.originalSigner
    ).connect(ethers.constants.AddressZero);
    // console.log(this.entryPointView.address);

    this.initializing = this.validateChainId();
  }

  /**
   * Validates the chain ID to ensure the client is connected to the correct network.
   */
  async validateChainId(): Promise<void> {
    const providerChainId = await this.userOpJsonRpcProvider
      .getNetwork()
      .then((network) => network.chainId);
    if (providerChainId !== this.chainId) {
      throw new Error(
        `Connected to the wrong network. Expected ${this.chainId}, but got ${providerChainId}`
      );
    }
  }

  /**
   * Sends a UserOperation to the entry point.
   * @param userOp1 The UserOperation to send.
   * @return The hash of the UserOperation as a string.
   */
  async sendUserOpToEntryPoint(userOp1: UserOperationStruct): Promise<string> {
    // Send the UserOperation to the entry point
    // const tx = await this.entryPointContract.sendUserOp(userOp1);
    await this.initializing;

    console.log("sendUserOpToEntryPoint", userOp1);
    // const gasEstimate = await this.entryPointContract.estimateGas.handleOps(
    //   [userOp1],
    //   "0x361Da2Ca3cC6C1f37d2914D5ACF02c4D2cCAC43b"
    // );

    const gasData = await this.userOpJsonRpcProvider.getFeeData();

    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = gasData;

    // console.log(gasEstimate);
    const GAS_SETTINGS = {
      gasLimit: 1000000,
      maxFeePerGas: ethers.utils.parseUnits("3", "gwei"),
      maxPriorityFeePerGas: ethers.utils.parseUnits("1", "gwei"),
    };

    // const GAS_SETTINGS = {
    //   gasLimit: 1000000,
    //   maxFeePerGas: maxFeePerGas!,
    //   maxPriorityFeePerGas: maxPriorityFeePerGas!,
    // };

    /**
     * @dev Send a UserOperation to the entry point.
     * @note KEEPS FAILING WITH THE ERROR
     * @error AA32:
     */
    console.log("before handleOps");
    const tx = await this.entryPointContract
      .connect(this.originalSigner)
      .handleOps(
        [userOp1],
        "0x361Da2Ca3cC6C1f37d2914D5ACF02c4D2cCAC43b",
        GAS_SETTINGS
      );
    console.log("after handleOps");

    // Wait for the transaction to be mined and get its receipt
    const receipt = await tx.wait();

    // Return the transaction hash as a string
    return receipt.transactionHash;
    // return "";
  }

  /**
   * Estimates the gas required for a UserOperation.
   * @param userOp1 A partial UserOperation object.
   * @return An EstimateUserOpGasResult object containing gas estimates.
   */
  async estimateUserOpGas(
    userOp1: Partial<UserOperationStruct>
  ): Promise<EstimateUserOpGasResult> {
    await this.initializing;
    const hexifiedUserOp = deepHexlify(await resolveProperties(userOp1));
    const jsonRequestData = [hexifiedUserOp, this.entryPointAddress];
    await this.printUserOperation(
      "eth_estimateUserOperationGas",
      jsonRequestData
    );
    const res = await this.userOpJsonRpcProvider.send(
      "eth_estimateUserOperationGas",
      [hexifiedUserOp, this.entryPointAddress]
    );
    return res;
  }

  /**
   * Retrieves the UserOperationReceipt for a given UserOperation hash.
   * @param hash The hash of the UserOperation.
   * @return A UserOperationReceipt object containing details of the User
   * @return A UserOperationReceipt object containing details of the UserOperation.
   */
  async getUserOperationReceipt(hash: string): Promise<UserOperationReceipt> {
    // Retrieve the transaction receipt for the given UserOperation hash
    const receipt = await this.userOpJsonRpcProvider.getTransactionReceipt(
      hash
    );

    // Process the receipt data and return a UserOperationReceipt object
    return {
      userOpHash: receipt.transactionHash,
      entryPoint: this.entryPointAddress,
      sender: receipt.from,
      nonce: await this.userOpJsonRpcProvider.getTransactionCount(receipt.from),
      paymaster: "", // if you were to go through a paymaster, the address would show here
      actualGasCost: receipt.gasUsed,
      actualGasUsed: receipt.gasUsed,
      success: receipt.status === 1,
      reason: "", // extract from receipt logs?
      logs: receipt.logs,
      receipt,
    };
  }

  /**
   * Utility function to print the UserOperation data for debugging purposes.
   * @param userOp The UserOperation to print.
   */
  private async printUserOperation(
    method: string,
    [userOp, entryPointAddress]: any
  ): Promise<void> {
    const _userOp = await resolveProperties(userOp);
    console.log(`Sending ${method} request to ${entryPointAddress}:`);
    console.log("UserOperation data:");
    console.log(JSON.stringify(userOp, null, 2));
  }
}
