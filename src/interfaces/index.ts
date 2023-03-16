// testing to add modalConfig to the safe wallet (there implementation is not in prod yet)
import { WALLET_ADAPTER_TYPE } from "@web3auth/base";
import { Signer } from "ethers";
import { Hooks } from "./ClientConfig";
import { BytesLike } from "ethers/lib/utils.js";
import { BigNumberish } from "ethers";
// import { ModalConfig } from "@web3auth/modal";

import { Options } from "@web3auth/web3auth-wagmi-connector";

import { ClientConfig } from "./ClientConfig";

// export interface Web3AuthProviderConfig {
//   rpcTarget: string;
//   clientId: string;
//   network: "mainnet" | "aqua" | "celeste" | "cyan" | "testnet";
//   theme: "light" | "dark" | "auto";
//   appLogo?: string;
//   modalConfig?: Record<WALLET_ADAPTER_TYPE, ModalConfig>;
// }

export type AccountParams = {
  projectId: string;
  owner: Signer;
  rpcProviderUrl?: string;
  bundlerUrl?: string;
  factoryAddress?: string;
  hooks?: Hooks;
  disconnect?: () => Promise<any>;
};

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

export interface web3AuthClientConfig extends ClientConfig {
  options: Options;
}

export interface web3AuthConfig extends web3AuthClientConfig {
  options: Options;
}
