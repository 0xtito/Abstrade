import { Connector, Chain } from "wagmi";
import { ethers } from "ethers";
// should implement errors from wagmi
import {
  AddChainError,
  ChainNotConfiguredError,
  SwitchChainError,
  UserRejectedRequestError,
  normalizeChainId,
} from "@wagmi/core";
import { hexValue } from "ethers/lib/utils.js";
// could be used to generate a userID for users (if/when needed)
import { nanoid } from "nanoid";
import { ADAPTER_STATUS, SafeEventEmitterProvider } from "@web3auth/base";
import { IWeb3AuthModal } from "@web3auth/modal";
import { Web3Auth } from "@web3auth/modal";

import { AASigner } from "../interfaces/AASigner";
import { AAProvider } from "../interfaces/AAProvider";
import { Web3AuthConfig } from "../interfaces";
import { SimpleAccountAPI } from "../utils/SimpleAccountAPI";
import { CustomHttpRpcClient } from "../interfaces/CustomHttpRpcClient";

const entryPointAddress: string = "0x0576a174D229E3cFA37253523E645A78A0C91B57";
const accountFactoryAddress: string = "";
const aaConfig = {
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
export class Web3AuthAAConnector extends Connector<
  AAProvider,
  Web3AuthConfig,
  AASigner
> {
  readonly id = "web3auth";
  readonly name = "Web3Auth";
  readonly ready = !IS_SERVER;
  provider?: AAProvider | null;
  web3AuthInstance: Web3Auth;
  initialChainId?: number;
  loginParams?: any;
  modalConfig?: any;

  constructor(config: { chains: Chain[]; options: Web3AuthConfig }) {
    super(config);
    // this.web3Auth = this.init();
    this.web3AuthInstance = config.options.web3AuthInstance;
    this.loginParams = config.options.loginParams || null;
    this.modalConfig = config.options.modalConfig || null;
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
    // Helper function to check if an object is of type IWeb3AuthModal
    function isIWeb3AuthModal(obj: any): obj is IWeb3AuthModal {
      return typeof obj.initModal !== "undefined";
    }

    try {
      this.emit("message", {
        type: "connecting",
      });

      if (this.web3AuthInstance.status === ADAPTER_STATUS.NOT_READY) {
        if (isIWeb3AuthModal(this.web3AuthInstance)) {
          await this.web3AuthInstance.initModal({
            modalConfig: this.modalConfig,
          });
          await this.web3AuthInstance.init();
        } else if (this.loginParams) {
          // await this.web3AuthInstance.init();
        } else {
          // loglevel.error("please provide a valid loginParams when not using @web3auth/modal");
          throw new UserRejectedRequestError(
            "please provide a valid loginParams when not using @web3auth/modal"
          );
        }
      }

      // await this.web3AuthInstance.init();

      let provider = this.web3AuthInstance.provider as SafeEventEmitterProvider;

      if (!provider) {
        if (isIWeb3AuthModal(this.web3AuthInstance)) {
          provider =
            (await this.web3AuthInstance.connect()) as SafeEventEmitterProvider;
        } else if (this.loginParams) {
          // provider = (await this.web3AuthInstance.connectTo(
          //   WALLET_ADAPTERS.OPENLOGIN,
          //   this.loginParams
          // )) as SafeEventEmitterProvider;
        } else {
          // loglevel.error("please provide a valid loginParams when not using @web3auth/modal");
          throw new UserRejectedRequestError(
            "please provide a valid loginParams when not using @web3auth/modal"
          );
        }
      }

      const defaultProvider = new ethers.providers.Web3Provider(provider);
      const defaultSigner = defaultProvider.getSigner();

      const signer = await this.getSigner();
      const account = (await signer.getAddress()) as `0x${string}`;
      provider.on("accountsChanged", this.onAccountsChanged.bind(this));
      provider.on("chainChanged", this.onChainChanged.bind(this));
      const chainId = await this.getChainId();
      const unsupported = this.isChainUnsupported(chainId);

      const customHttpRpcClient = new CustomHttpRpcClient(
        entryPointAddress,
        chainId ? chainId : await this.getChainId(),
        this.chains[0].rpcUrls.default.http[0]
        // hardcoding this for now
      );

      const simpleAccountAPI: SimpleAccountAPI = new SimpleAccountAPI({
        entryPointAddress,
        accountAddress: await signer.getAddress(),
        provider: defaultProvider!,
        signer: signer,
      });

      const _AAProvider = new AAProvider(
        chainId ? chainId : await this.getChainId(),
        { ...aaConfig, web3AuthInstance: this.web3AuthInstance },
        defaultSigner,
        defaultProvider,
        customHttpRpcClient,
        entryPointAddress,
        simpleAccountAPI
      );
      _AAProvider.init();

      return {
        account,
        chain: {
          id: chainId,
          unsupported,
        },
        provider: _AAProvider,
      };
    } catch (error) {
      // loglevel.error("error while connecting", error);
      throw new UserRejectedRequestError("Something went wrong");
    }

    // return new Promise(async (resolve, reject) => {
    //   try {
    //     const _chainId = chainId ? chainId : await this.getChainId();

    //     let chain: Chain | undefined = this.chains.find(
    //       (chain) => chain.id === _chainId
    //     );
    //     if (!chain) {
    //       throw new ChainNotConfiguredError({
    //         chainId: _chainId,
    //         connectorId: this.id,
    //       });
    //     }
    //     const _web3Auth = await this.web3Auth;
    //     // await _safeAuth.signIn();
    //     const web3AuthProvider = await _web3Auth.connect();
    //     // import { SafeEventEmitterProvider } from "@web3auth/base";
    //     // setting to any for testing reasons
    //     this.#defaultProvider = new ethers.providers.Web3Provider(
    //       web3AuthProvider as any
    //     );

    //     if (!_web3Auth) {
    //       throw new Error("Safe Auth not initialized");
    //     } else {
    //       this.provider = await this.getProvider();
    //       if (!this.provider) {
    //         throw new Error("Provider not initialized in connect");
    //       }

    //       resolve({
    //         account: await this.getAccount(),
    //         web3auth: await this.web3Auth,
    //         chain: {
    //           id: _chainId,
    //           unsupported: this.isChainUnsupported(_chainId),
    //         },
    //         provider: this.provider,
    //       });
    //     }
    //   } catch (error) {
    //     reject(error);
    //   }
    // });
  }

  async disconnect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // const _safeAuth = await this.safeAuth;
        await this.web3AuthInstance.logout();
        this.provider = null;
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
        this.provider = (await this.getProvider()) as AAProvider;
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

      const signer = this.provider.getSigner();

      // const defaultProvider = new ethers.providers.Web3Provider(
      //   _safeAuth.getProvider() as ethers.providers.ExternalProvider
      // );

      // const defaultSigner = this.#defaultProvider?.getSigner();

      // const signer = await this.getSigner();
      const address = await signer.getAddress();

      return address as `0x${string}`;
    } catch (error: any) {
      return error;
    }
  }
  async getChainId(): Promise<number> {
    return new Promise(async (resolve, reject) => {
      try {
        let provider = this.web3AuthInstance
          .provider as SafeEventEmitterProvider;
        const _chainId = await provider.request({
          method: "eth_chainId",
        });

        const chainId = Number(hexValue(this.chains[0].id));
        resolve(chainId);
      } catch (error) {
        reject(error);
      }
    });
  }
  async getProvider(): Promise<AAProvider> {
    try {
      if (this.provider) {
        return this.provider;
      }
      function isIWeb3AuthModal(obj: any): obj is IWeb3AuthModal {
        return typeof obj.initModal !== "undefined";
      }

      let provider = this.web3AuthInstance.provider as SafeEventEmitterProvider;

      if (!provider) {
        if (isIWeb3AuthModal(this.web3AuthInstance)) {
          provider =
            (await this.web3AuthInstance.connect()) as SafeEventEmitterProvider;
        } else if (this.loginParams) {
          // provider = (await this.web3AuthInstance.connectTo(
          //   WALLET_ADAPTERS.OPENLOGIN,
          //   this.loginParams
          // )) as SafeEventEmitterProvider;
        } else {
          // loglevel.error("please provide a valid loginParams when not using @web3auth/modal");
          throw new UserRejectedRequestError(
            "please provide a valid loginParams when not using @web3auth/modal"
          );
        }
      }

      const defaultProvider = new ethers.providers.Web3Provider(provider);
      const _defaultSigner = defaultProvider.getSigner();

      const signer = await this.getSigner();
      const account = (await signer.getAddress()) as `0x${string}`;
      provider.on("accountsChanged", this.onAccountsChanged.bind(this));
      provider.on("chainChanged", this.onChainChanged.bind(this));
      const chainId = await this.getChainId();
      const unsupported = this.isChainUnsupported(chainId);

      const _customHttpRpcClient = new CustomHttpRpcClient(
        entryPointAddress,
        chainId ? chainId : await this.getChainId(),
        this.chains[0].rpcUrls.default.http[0]
        // hardcoding this for now
      );

      const _simpleAccountAPI: SimpleAccountAPI = new SimpleAccountAPI({
        entryPointAddress,
        accountAddress: await signer.getAddress(),
        provider: defaultProvider!,
        signer: signer,
      });

      this.provider = new AAProvider(
        chainId ? chainId : await this.getChainId(),
        { ...aaConfig, web3AuthInstance: this.web3AuthInstance },
        _defaultSigner,
        defaultProvider,
        _customHttpRpcClient,
        entryPointAddress,
        _simpleAccountAPI
      );

      this.provider.init();

      return this.provider;
    } catch (error: any) {
      return error;
    }
  }

  async getSigner(): Promise<AASigner> {
    function isIWeb3AuthModal(obj: any): obj is IWeb3AuthModal {
      return typeof obj.initModal !== "undefined";
    }

    let provider = this.web3AuthInstance.provider as SafeEventEmitterProvider;

    if (!provider) {
      if (isIWeb3AuthModal(this.web3AuthInstance)) {
        provider =
          (await this.web3AuthInstance.connect()) as SafeEventEmitterProvider;
      } else if (this.loginParams) {
        // TODO: configure this
        // provider = (await this.web3AuthInstance.connectTo(
        //   WALLET_ADAPTERS.OPENLOGIN,
        //   this.loginParams
        // )) as SafeEventEmitterProvider;
      } else {
        // loglevel.error("please provide a valid loginParams when not using @web3auth/modal");
        throw new UserRejectedRequestError(
          "please provide a valid loginParams when not using @web3auth/modal"
        );
      }
    }

    const defaultProvider = new ethers.providers.Web3Provider(provider);
    const _defaultSigner = defaultProvider.getSigner();

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
      accountAddress: await _defaultSigner.getAddress(),
      provider: defaultProvider!,
      signer: _defaultSigner,
    });

    if (!this.provider) {
      function isIWeb3AuthModal(obj: any): obj is IWeb3AuthModal {
        return typeof obj.initModal !== "undefined";
      }

      let provider = this.web3AuthInstance.provider as SafeEventEmitterProvider;

      if (!provider) {
        if (isIWeb3AuthModal(this.web3AuthInstance)) {
          provider =
            (await this.web3AuthInstance.connect()) as SafeEventEmitterProvider;
        } else if (this.loginParams) {
          // TODO: configure this
          // provider = (await this.web3AuthInstance.connectTo(
          //   WALLET_ADAPTERS.OPENLOGIN,
          //   this.loginParams
          // )) as SafeEventEmitterProvider;
        } else {
          // loglevel.error("please provide a valid loginParams when not using @web3auth/modal");
          throw new UserRejectedRequestError(
            "please provide a valid loginParams when not using @web3auth/modal"
          );
        }

        const defaultProvider = new ethers.providers.Web3Provider(provider);
        const _defaultSigner = defaultProvider.getSigner();

        this.provider = new AAProvider(
          _chainId,
          { ...aaConfig, web3AuthInstance: this.web3AuthInstance },
          _defaultSigner,
          defaultProvider,
          customHttpRpcClient,
          entryPointAddress,
          simpleAccountAPI
        ) as AAProvider;
      }
    }

    return new AASigner(
      { ...aaConfig, web3AuthInstance: this.web3AuthInstance },
      _defaultSigner,
      this.provider!,
      customHttpRpcClient,
      simpleAccountAPI
    );
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
