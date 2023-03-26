// testing to add modalConfig to the safe wallet (there implementation is not in prod yet)
import { WALLET_ADAPTER_TYPE } from "@web3auth/base";
import { Signer } from "ethers";
import { BytesLike } from "ethers/lib/utils.js";
import { BigNumberish } from "ethers";
import { Chain } from "wagmi";
import type { IWeb3Auth } from "@web3auth/base";
import type { IWeb3AuthModal, ModalConfig, Web3Auth } from "@web3auth/modal";
import type { OpenloginLoginParams } from "@web3auth/openlogin-adapter";
export interface Options {
  web3AuthInstance: Web3Auth;
  loginParams?: OpenloginLoginParams;
  modalConfig?: Record<WALLET_ADAPTER_TYPE, ModalConfig>;
}
import { Provider } from "@ethersproject/providers";

import { BaseProvider } from "@ethersproject/providers";
import { PaymasterAPI } from "@zerodevapp/sdk/dist/src/PaymasterAPI";
import {
  SessionProposal,
  TransactionInfo,
} from "@zerodevapp/sdk/dist/src/types";
export interface Hooks {
  transactionStarted?: (tx: TransactionInfo) => void;
  transactionConfirmed?: (txHash: string) => void;
  transactionReverted?: (txHash: string) => void;
  walletConnectSessionProposal?: (proposal: SessionProposal) => void;
}
import { ExternalProvider } from "@ethersproject/providers";
import { GasOverheads } from "@account-abstraction/sdk";
import { JsonRpcProvider } from "@ethersproject/providers";
import {
  Dispatch,
  SetStateAction,
  SVGProps,
  ForwardRefExoticComponent,
} from "react";

/**
 * configuration params for wrapProvider and ZeroDev's ClientConfig
 * @note there is no active bundler on Gnosis Chain, so we must either create a custom bundler or work without it
 *     so if there is no bundler, we don't need to include the bundlerUrl in the config
 *
 */
export interface Web3AuthConfig extends Options {
  /**
   * Needed to track gas usage
   */
  projectId: string;
  /**
   * the entry point to use
   */
  entryPointAddress: string;
  accountFactoryAddress: string;
  /**
   * url to the bundler
   * @note there is no active bundler on Gnosis Chain, so we must either create a custom bundler or work without it
   */
  bundlerUrl?: string;
  /**
   * if set, use this pre-deployed wallet.
   * (if not set, use getSigner().getAddress() to query the "counterfactual" address of wallet.
   *  you may need to fund this address so the wallet can pay for its own creation)
   */
  walletAddress?: string;
  /**
   * if set, call just before signing.
   */
  paymasterAPI?: PaymasterAPI;
  /**
   * hooks are functions invoked during the lifecycle of transactions
   */
  hooks?: Hooks;
}

export interface ClientConfig {
  /**
   * Needed to track gas usage
   */
  projectId: string;
  /**
   * the entry point to use
   */
  entryPointAddress: string;
  accountFactoryAddress: string;
  /**
   * url to the bundler
   * there is no bunder on gnosis chain, so we will work around it
   */
  bundlerUrl?: string;
  /**
   * if set, use this pre-deployed wallet.
   * (if not set, use getSigner().getAddress() to query the "counterfactual" address of wallet.
   *  you may need to fund this address so the wallet can pay for its own creation)
   */
  walletAddress?: string;
  /**
   * if set, call just before signing.
   */
  paymasterAPI?: PaymasterAPI;
  /**
   * hooks are functions invoked during the lifecycle of transactions
   */
  hooks?: Hooks;
}

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

export interface DetailsForUserOp {
  target: string;
  value?: BigNumberish;
  data: string;
  gasLimit?: BigNumberish;
  maxFeePerGas?: BigNumberish;
  maxPriorityFeePerGas?: BigNumberish;
}

export interface BaseAccountAPIParams {
  provider: JsonRpcProvider;
  entryPointAddress: string;
  accountAddress?: string;
  overheads?: Partial<GasOverheads>;
  paymasterAPI?: PaymasterAPI;
}

// Define the interface for the constructor parameters.
export interface SimpleAccountAPIParams extends BaseAccountAPIParams {
  factoryAddress?: string;
  index?: number;
  owner: Signer;
}

export interface PartialUserOp {
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

/**
 * For the src/pages section
 */

/**
 * Interfaces/types
 *
 *
 */

export interface BarNavItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  current: boolean;
}

export interface SidebarNavigationProps {
  sidebarNavigation: BarNavItem[];
  mainNavigation: BarNavItem[];
  userSettingsNav: BarNavItem[];
  setSidebarNavigation: React.Dispatch<
    React.SetStateAction<
      {
        name: string;
        href: string;
        icon: React.ForwardRefExoticComponent<
          React.SVGProps<SVGSVGElement> & {
            title?: string | undefined;
            titleId?: string | undefined;
          }
        >;
        current: boolean;
      }[]
    >
  >;
}

export interface DashboardLayoutProps {
  children: JSX.Element;
}

export interface handleSideBarToggleArgs {
  item: BarNavItem;
  sidebarNavigation: BarNavItem[];
  setSidebarNavigation: React.Dispatch<
    React.SetStateAction<
      {
        name: string;
        href: string;
        icon: React.ForwardRefExoticComponent<
          React.SVGProps<SVGSVGElement> & {
            title?: string | undefined;
            titleId?: string | undefined;
          }
        >;
        current: boolean;
      }[]
    >
  >;
}

export interface DividerProps {
  Icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  setSidebarExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarExpanded: boolean;
}

export interface Asset {
  id: number;
  name: string;
  symbol: string;
  tvInfo: {
    id: string;
    symbol: string;
  };
}

export interface MainPageContextInterface {
  sidebar: {
    sidebarNavigation: {
      name: string;
      href: string;
      icon: ForwardRefExoticComponent<
        SVGProps<SVGSVGElement> & {
          title?: string | undefined;
          titleId?: string | undefined;
        }
      >;
      current: boolean;
    }[];
    setSidebarNavigation: React.Dispatch<
      React.SetStateAction<
        {
          name: string;
          href: string;
          icon: ForwardRefExoticComponent<
            SVGProps<SVGSVGElement> & {
              title?: string | undefined;
              titleId?: string | undefined;
            }
          >;
          current: boolean;
        }[]
      >
    >;
  };
  modal: {
    openModal: boolean;
    setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  };
  confirmed: {
    confirmed: boolean;
    setConfirmed: Dispatch<SetStateAction<boolean>>;
  };
  order: {
    order: {
      pair: string;
      price: number;
      amount: number;
      total: number;
    };
    setOrder: React.Dispatch<
      React.SetStateAction<{
        pair: string;
        price: number;
        amount: number;
        total: number;
      }>
    >;
  };
  asset: {
    selectedAsset: {
      id: number;
      name: string;
      symbol: string;
      tvInfo: {
        id: string;
        symbol: string;
      };
    };
    setSelectedAsset: React.Dispatch<
      React.SetStateAction<{
        id: number;
        name: string;
        symbol: string;
        tvInfo: {
          id: string;
          symbol: string;
        };
      }>
    >;
  };
}

export interface IconProp {
  className?: string;
}
