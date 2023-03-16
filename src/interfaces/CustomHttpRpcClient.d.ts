import { BigNumberish } from "ethers";
import { UserOperationStruct } from "./";
/**
 *
 * return value from estimateUserOpGas
 */
export interface EstimateUserOpGasResult {
  /**
   * the preVerification gas used by this UserOperation.
   */
  preVerificationGas: BigNumberish;
  /**
   * gas used for validation of this UserOperation, including account creation
   */
  verificationGas: BigNumberish;
  /**
   * the deadline after which this UserOperation is invalid (not a gas estimation parameter, but returned by validation
   */
  validUntil?: BigNumberish;
  /**
   * the deadline after which this UserOperation is valid (not a gas estimation parameter, but returned by validation
   */
  validAfter?: BigNumberish;
  /**
   * estimated cost of calling the account with the given callData
   */
  callGasLimit: BigNumberish;
}
export interface UserOperationReceipt {
  userOpHash: BigNumberish;
  entryPoint: string;
  sender: string;
  nonce: BigNumberish;
  paymaster: string;
  actualGasCost: BigNumberish;
  actualGasUsed: BigNumberish;
  success: boolean;
  reason: string;
  logs: any;
  receipt: any;
}
/**
 * HttpRpcClient is a client created by the [ZeroDev Team](https://zerodev.app/)
 */
export declare class CustomHttpRpcClient {
  readonly bundlerUrl: string;
  readonly entryPointAddress: string;
  readonly chainId: number;
  private readonly userOpJsonRpcProvider;
  initializing: Promise<void>;
  constructor(entryPointAddress: string, chainId: number, bundlerUrl?: string);
  validateChainId(): Promise<void>;
  /**
   * send a UserOperation to the entry point (usually would send to bundler)
   * @param userOp1
   * @return userOpHash the id of this operation, for getUserOperationTransaction
   * @note In our implementation, we are sending directly to the entrypoint, not to the bundler.
   */
  // sendUserOpToBundler(userOp1: UserOperationStruct): Promise<string>;
  sendUserOpToEntryPoint(userOp1: UserOperationStruct): Promise<string>;
  estimateUserOpGas(
    userOp1: Partial<UserOperationStruct>
  ): Promise<EstimateUserOpGasResult>;
  getUserOperationReceipt(hash: string): Promise<UserOperationReceipt>;
  private printUserOperation;
}
