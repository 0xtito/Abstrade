import { Connector, Chain } from "wagmi";
// should implement errors from wagmi
import {
  AddChainError,
  ChainNotConfiguredError,
  SwitchChainError,
  UserRejectedRequestError,
  normalizeChainId,
} from "@wagmi/core";
// could be used to generate a userID for users (if/when needed)
import { ExternalProvider } from "@ethersproject/providers";

import { AASigner } from "../interfaces/AASigner";
import { AAProvider } from "../interfaces/AAProvider";
import { Web3AuthConfig } from "../interfaces";

import { getAAProvider } from "../utils/getAAProvider";
import { getAASigner } from "../utils/getAASigner";

const entryPointAddress: string = "0x0576a174D229E3cFA37253523E645A78A0C91B57";
// const simpleAccountFactoryAddress =
//   "0x6C583EE7f3a80cB53dDc4789B0Af1aaFf90e55F3";
import { limitOrderAccountFactoryAddress } from "../utils/constants";

const aaConfig = {
  projectId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
  entryPointAddress: entryPointAddress,
  accountFactoryAddress: limitOrderAccountFactoryAddress,
};
import { Signer } from "ethers";

import { getZeroDevSigner } from "@zerodevapp/sdk";

const IS_SERVER = typeof window === "undefined";

interface TestWeb3AuthCOnfig extends Web3AuthConfig {
  defaultProvider: ExternalProvider;
}

/**
 * @note derived version from ZeroDev
 * @description removed hooks and bundlerURL(no bundler on gnosis chain) from config
 */
type AccountParams = {
  projectId: string; // fill this with random characters
  owner: Signer;
  rpcProviderUrl?: string;
  // bundlerUrl?: string;
  factoryAddress?: string;
  // hooks?: Hooks;
  disconnect?: () => Promise<any>;
};

// import { CustomHttpRpcClient } from "../interfaces/CustomHttpRpcClient";
/**
 * Custom Connector for [Web3 Auth](https://web3auth.io/docs/) with influence from ZeroDev
 * @note Atttempting to work around Safe Auth Kit, too constrained
 * @description This connector is used to connect to the Safe AA Wallet, but with a few modifications to let it work with wagmi
 * @info SafeConnector that is already in wagmi wont work with the Safe AA Wallet
 * @info Trying to change the return SafeAppProvider to a JsonRpcSigner, replace back if needed
 * @todo Add Social Login funtionality
 */
export class AbstradeAAConnector<Options = AccountParams> extends Connector<
  AAProvider,
  Options,
  AASigner
> {
  id = "abstrade";
  name = "Abstrade";
  readonly ready = !IS_SERVER;
  provider: AAProvider | null;
  chains: Chain[];
  initialChainId: number;

  constructor(config: { chains: Chain[]; options: Options }) {
    super(config);
    this.provider = null;
    this.chains = config.chains;
    this.initialChainId = config.chains[0].id;
  }

  async connect({ chainId }: { chainId?: number } = {}): Promise<{
    account: `0x${string}`;
    chain: {
      id: number;
      unsupported: boolean;
    };
    provider: AAProvider;
  }> {
    try {
      this.emit("message", {
        type: "connecting",
      });

      const provider = await this.getProvider();
      const accountAddress = await this.getAccount();
      const chainId = await this.getChainId();

      console.log(this.provider);
      return {
        account: accountAddress,
        chain: {
          id: chainId,
          unsupported: false,
        },
        provider: provider,
      };
    } catch (error) {
      // loglevel.error("error while connecting", error);
      // console.log(error);
      throw new UserRejectedRequestError(error);
    }
  }

  async disconnect(): Promise<void> {
    const options = await this.getOptions();
    if (options.disconnect) {
      options.disconnect();
    }
  }
  async getAccount(): Promise<`0x${string}`> {
    try {
      // this sends the address conntected to the original Signer
      // const address = await (await this.getProvider()).signer.getAddress();

      // this sends the counterfactual address connected to the SimpleAccountAPI
      const address = (await this.getProvider()).smartAccountAPI.senderAddress;

      return address as `0x${string}`;
    } catch (error: any) {
      return error;
    }
  }
  async getChainId(): Promise<number> {
    if (!this.provider) {
      return this.initialChainId as number;
    }
    // const provider = await this.getProvider();
    const _chainId = this.provider?.chainId;

    return _chainId as any;
  }

  async getOptions(): Promise<AccountParams> {
    // return this.options as AccountParams;
    return this.options as any;
  }
  async getProvider(): Promise<AAProvider> {
    try {
      console.log(
        "getting provider",
        await this.getOptions(),
        this.initialChainId
      );
      if (!this.provider) {
        this.provider = await getAAProvider(
          await this.getOptions(),
          this.initialChainId
        );
      }

      return this.provider as AAProvider;
    } catch (error: any) {
      return error;
    }
  }

  async getSigner(): Promise<AASigner> {
    const signer = await getAASigner(
      await this.getOptions(),
      this.initialChainId
    );
    return signer as AASigner;
  }

  isAuthorized(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const account = await this.getAccount();
        const isAuthorized = !!(account && this.provider);
        resolve(isAuthorized);
      } catch (error) {
        reject(error);
      }
    });
  }
  switchChain(chainId: number): Promise<Chain> {
    return new Promise((resolve, reject) => {
      try {
        const chain = this.chains.find((c) => c.id === chainId);
        if (!chain) {
          throw new Error(`Chain ${chainId} not supported`);
        }
        resolve(chain);
      } catch (error) {
        reject(error);
      }
    });
  }

  protected isChainUnsupported(chainId: number): boolean {
    return !this.chains.find((c) => c.id === chainId);
  }
  protected onAccountsChanged: (accounts: `0x${string}`[]) => void = async (
    accounts: string[]
  ) => {
    this.emit("change", {
      account: await this.getAccount(),
      chain: {
        id: await this.getChainId(),
        unsupported: false,
      },
    });
  };
  protected onChainChanged: (chainId: number) => void = async (
    chainId: number
  ) => {
    this.emit("change", {
      account: await this.getAccount(),
      chain: {
        id: await this.getChainId(),
        unsupported: false,
      },
    });
  };
  protected onDisconnect: () => void = async () => {
    this.emit("disconnect");
  };
}
