import {
  SafeAuthKit,
  SafeAuthProviderType,
  SafeAuthConfig,
} from "@safe-global/auth-kit";
import { SafeAppProvider } from "@safe-global/safe-apps-provider";
import { Opts as SafeOpts } from "@safe-global/safe-apps-sdk";
import { Connector, Chain } from "wagmi";
import RPC from "../utils/ethersRPC";
import { ethers, providers } from "ethers";
import { Network } from "@ethersproject/networks";
import {
  AddChainError,
  ChainNotConfiguredError,
  SwitchChainError,
  UserRejectedRequestError,
  normalizeChainId,
} from "@wagmi/core";
import { getAddress, hexValue } from "ethers/lib/utils.js";
import { nanoid } from "nanoid";

import { BaseAccount__factory, BaseAccount } from "@zerodevapp/contracts";
import { BaseAccountAPI } from "@zerodevapp/sdk/dist/src/BaseAccountAPI";

import { AASigner } from "../interfaces/AASigner";
import { AAProvider } from "../interfaces/AAProvider";
import { ClientConfig } from "../interfaces/ClientConfig";
import { CustomHttpRpcClient } from "../interfaces/CustomHttpRpcClient";
import { PromiseOrValue } from "@account-abstraction/contracts/dist/types/common";

const entryPointAddress: string = "0x0576a174D229E3cFA37253523E645A78A0C91B57";
const accountFactoryAddress: string = "";

import { SimpleAccountAPI } from "../utils/SimpleAccountAPI";

interface SafeClientConfig extends ClientConfig {
  allowedDomains?: RegExp[];
  debug?: boolean;
}

import { web3AuthConfig } from "../interfaces";
import { IWeb3Auth  } from "@web3auth/base";
import { IWeb3AuthModal } from "@web3auth/modal";
import { Options } from "@web3auth/web3auth-wagmi-connector";

import { Signer } from "ethers";
import { BaseProvider } from "@ethersproject/providers";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";

const config = {
  projectId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
  entryPointAddress: entryPointAddress,
  accountFactoryAddress: accountFactoryAddress,
};

const IS_SERVER = typeof window === "undefined";

// import { CustomHttpRpcClient } from "../interfaces/CustomHttpRpcClient";
/**
 * Custom Connector for [Web3 Auth](https://docs.gnosis-safe.io/learn/safe-core-account-abstraction-sdk)
 * @note Atttempting to work around Safe Auth Kit, too buggy
 * @see {@link https://docs.gnosis-safe.io/learn/safe-core-account-abstraction-sdk/auth-kit}
 * @description This connector is used to connect to the Safe AA Wallet, but with a few modifications to let it work with wagmi
 * @info SafeConnector that is already in wagmi wont work with the Safe AA Wallet
 * @info Trying to change the return SafeAppProvider to a JsonRpcSigner, replace back if needed
 * @todo Figure out the source of the error "Uncaught (in promise) Error: method must be string" when trying to connect to the Safe AA Wallet
 */

// defineProperty_default()(this, "ready", !IS_SERVER);
// defineProperty_default()(this, "id", "web3auth");
// defineProperty_default()(this, "name", "Web3Auth");
// defineProperty_default()(this, "provider", null);
// defineProperty_default()(this, "web3AuthInstance", void 0);
// defineProperty_default()(this, "initialChainId", void 0);
// defineProperty_default()(this, "loginParams", void 0);
// defineProperty_default()(this, "modalConfig", void 0);
export class SafeAuthAAConnector extends Connector<
  AAProvider,
  web3AuthConfig,
  AASigner
> {
  readonly id = "web3auth";
  readonly name = "Web3Auth";
  readonly ready = !IS_SERVER;
  provider?: AAProvider;
  web3AuthInstance: IWeb3Auth | IWeb3AuthModal;
  initialChainId?: number;
  loginParams?: any;
  modalConfig?: any;

  web3Auth: PromiseOrValue<Web3Auth>;

  #defaultProvider?: ethers.providers.Web3Provider;

  constructor(config: { chains?: Chain[]; options: web3AuthConfig }) {
    super(config);
    this.web3Auth = this.init();
    this.web3AuthInstance = config.options.options.web3AuthInstance
    this.loginParams = config.options.loginParams || null;
    this.modalConfig = config.options.modalConfig || null;
    this.initialChainId = config.chains[0].id;
  }

  init(): Promise<Web3Auth> {
    return new Promise(async (resolve, reject) => {
      const _chainId = await this.getChainId();
      let chain: Chain | undefined = this.chains.find(
        (chain) => chain.id === _chainId
      );

      try {
        const web3auth = new Web3Auth({
          clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!,
          web3AuthNetwork: "testnet",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: _chainId.toString(16),
            rpcTarget: chain?.rpcUrls.default.http[0],
            displayName: chain?.name,
            ticker: chain?.nativeCurrency.symbol,
            tickerName: chain?.nativeCurrency.name,
          },
          uiConfig: {
            theme: "dark",
            loginMethodsOrder: ["google", "github", "discord"],
            appName: "Abstrade",
            appLogo: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
          },
        });

        const openloginAdapter = new OpenloginAdapter({
          loginSettings: {
            mfaLevel: "default",
          },
          adapterSettings: {
            whiteLabel: {
              name: "Abstrade",
              defaultLanguage: "end",
              logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
              logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
            },
          },
        });

        web3auth.configureAdapter(openloginAdapter);

        await web3auth.initModal({
          modalConfig: {
            [WALLET_ADAPTERS.OPENLOGIN]: {
              label: "Abstrade",
              loginMethods: {
                google: {
                  name: "google login",
                },
                github: {
                  name: "github login",
                },
                discord: {
                  name: "discord login",
                },
                facebook: {
                  name: "facebook login",
                  showOnModal: false,
                },
              },
              showOnModal: true,
            },
          },
        });

        resolve(web3auth);
        return web3auth;
      } catch (error: any) {
        reject(error);
        return error;
      }
    });
  }

  async connect({ chainId }: { chainId?: number } = {}): Promise<{
    account: `0x${string}`;
    web3auth: Web3Auth;
    chain: {
      id: number;
      unsupported: boolean;
    };
    provider: AAProvider;
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        const _chainId = chainId ? chainId : await this.getChainId();

        let chain: Chain | undefined = this.chains.find(
          (chain) => chain.id === _chainId
        );
        if (!chain) {
          throw new ChainNotConfiguredError({
            chainId: _chainId,
            connectorId: this.id,
          });
        }
        const _web3Auth = await this.web3Auth;
        // await _safeAuth.signIn();
        const web3AuthProvider = await _web3Auth.connect();
        // import { SafeEventEmitterProvider } from "@web3auth/base";
        // setting to any for testing reasons
        this.#defaultProvider = new ethers.providers.Web3Provider(
          web3AuthProvider as any
        );

        if (!_web3Auth) {
          throw new Error("Safe Auth not initialized");
        } else {
          this.provider = await this.getProvider();
          if (!this.provider) {
            throw new Error("Provider not initialized in connect");
          }

          resolve({
            account: await this.getAccount(),
            web3auth: await this.web3Auth,
            chain: {
              id: _chainId,
              unsupported: this.isChainUnsupported(_chainId),
            },
            provider: this.provider,
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // const _safeAuth = await this.safeAuth;
        const _web3auth = await this.web3Auth;
        await _web3auth.logout();
        // await _safeAuth.signOut();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
  async getAccount(): Promise<`0x${string}`> {
    try {
      if (!this.provider) {
        this.provider = await this.getProvider();
      }
      const _chainId = await this.getChainId();

      let chain: Chain | undefined = this.chains.find(
        (chain) => chain.id === _chainId
      );
      if (!chain) {
        throw new ChainNotConfiguredError({
          chainId: _chainId,
          connectorId: this.id,
        });
      }

      // const defaultProvider = new ethers.providers.Web3Provider(
      //   _safeAuth.getProvider() as ethers.providers.ExternalProvider
      // );

      const defaultSigner = this.#defaultProvider?.getSigner();

      // const signer = await this.getSigner();
      const address = await defaultSigner?.getAddress();

      return address as `0x${string}`;
    } catch (error: any) {
      return error;
    }
  }
  getChainId(): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const chainId = this.chains[0].id;
        resolve(chainId);
      } catch (error) {
        reject(error);
      }
    });
  }
  async getProvider(): Promise<AAProvider> {
    try {
      if (!this.provider) {
        throw new Error("Provider not initialized");
      }
      // const _safeAuth = await this.safeAuth;
      const _chainId = await this.getChainId();

      // const defaultProvider = new ethers.providers.Web3Provider(
      //   _safeAuth.getProvider() as ethers.providers.ExternalProvider
      // );
      const _web3auth = await this.web3Auth;
      // _web3auth

      _web3auth.

      const defaultSigner = this.#defaultProvider?.getSigner();

      const customHttpRpcClient = new CustomHttpRpcClient(
        entryPointAddress,
        _chainId,
        this.chains[0].rpcUrls.default.http[0]
        // hardcoding this for now
      );

      const simpleAccountAPI: SimpleAccountAPI = new SimpleAccountAPI({
        entryPointAddress,
        accountAddress: await defaultSigner?.getAddress(),
        provider: this.#defaultProvider!,
        signer: defaultSigner!,
      });

      let chain: Chain | undefined = this.chains.find(
        (chain) => chain.id === _chainId
      );

      if (!chain) {
        throw new Error("Chain not found");
      }

      const originalProvider = new ethers.providers.BaseProvider({
        name: chain.name,
        chainId: chain.id,
        _defaultProvider: (providers: any, options?: any) => {
          return this.#defaultProvider;
        },
      });

      // change the baseAccount to Simple Account (we are basing our contract off that)
      this.provider = new AAProvider(
        _chainId,
        config,
        await this.getSigner(),
        originalProvider,
        customHttpRpcClient,
        entryPointAddress,
        simpleAccountAPI
      );
      this.provider.init();
      return this.provider;
    } catch (error: any) {
      return error;
    }
  }

  async getSigner(): Promise<AASigner> {
    const [provider, account] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
    ]);
    const _web3auth = await this.web3Auth;

    // const defaultProvider = new ethers.providers.Web3Provider(
    //   this.#defaultProvider as ethers.providers.ExternalProvider
    // );

    const defaultSigner = this.#defaultProvider?.getSigner();
    const _chainId = await this.getChainId();

    let chain: Chain | undefined = this.chains.find(
      (chain) => chain.id === _chainId
    );

    if (!chain) {
      throw new Error("Chain not found");
    }

    const customHttpRpcClient = new CustomHttpRpcClient(
      entryPointAddress,
      _chainId,
      this.chains[0].rpcUrls.default.http[0]
    );

    const simpleAccountAPI: SimpleAccountAPI = new SimpleAccountAPI({
      entryPointAddress,
      accountAddress: await defaultSigner?.getAddress(),
      provider: this.#defaultProvider!,
      signer: defaultSigner!,
    });

    if (!this.provider) {
      throw new Error("Provider not initialized in getSigner");
    }

    return new AASigner(
      config,
      defaultSigner!,
      this.provider,
      customHttpRpcClient,
      simpleAccountAPI
    );

    // try {
    //   const signer = (await this.getProvider()).getSigner();
    //   return signer;
    // } catch (error) {
    //   return error as any;
    // }
  }
  isAuthorized(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const isAuthorized = !!this.provider;
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
