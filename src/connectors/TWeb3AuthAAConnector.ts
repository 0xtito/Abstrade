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
import { ExternalProvider } from "@ethersproject/providers";
import { Web3Provider } from "@ethersproject/providers";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";

import { AASigner } from "../interfaces/AASigner";
import { AAProvider } from "../interfaces/AAProvider";
import { Web3AuthConfig } from "../interfaces";
import { SimpleAccountAPI } from "../utils/SimpleAccountAPI";
import { CustomHttpRpcClient } from "../interfaces/CustomHttpRpcClient";
import { PromiseOrValue } from "@account-abstraction/contracts/dist/types/common";

const entryPointAddress: string = "0x0576a174D229E3cFA37253523E645A78A0C91B57";
const accountFactoryAddress: string = "";
const aaConfig = {
  projectId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
  entryPointAddress: entryPointAddress,
  accountFactoryAddress: accountFactoryAddress,
};

const IS_SERVER = typeof window === "undefined";

interface TestWeb3AuthCOnfig extends Web3AuthConfig {
  defaultProvider: ExternalProvider;
}

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
  //   defaultProvider: ExternalProvider;
  provider?: AAProvider;
  web3AuthProvider?: SafeEventEmitterProvider;
  web3AuthInstance: Web3Auth;
  initialChainId?: number;
  loginParams?: any;
  modalConfig?: any;
  simpleAccountAPI?: SimpleAccountAPI;

  constructor(config: { chains: Chain[]; options: Web3AuthConfig }) {
    super(config);
    // this.web3Auth = this.init();
    // this.defaultProvider = config.options.defaultProvider;
    this.web3AuthInstance = config.options.web3AuthInstance;
    this.loginParams = config.options.loginParams || null;
    this.modalConfig = config.options.modalConfig || null;
    this.initialChainId = config.chains[0].id;
  }

  async initWeb3AuthProvider(): Promise<SafeEventEmitterProvider> {
    function isWeb3AuthModal(obj: any): obj is Web3Auth {
      return typeof obj.initModal !== "undefined";
    }

    if (this.web3AuthProvider) {
      console.log(this.web3AuthProvider);
      return this.web3AuthProvider;
    }

    let provider = this.web3AuthInstance.provider;

    console.log(this.web3AuthInstance.status);
    if (this.web3AuthInstance.status === ADAPTER_STATUS.NOT_READY) {
      console.log("1st check", isWeb3AuthModal(this.web3AuthInstance));
      if (isWeb3AuthModal(this.web3AuthInstance)) {
        // would put Modal Config i wasnt using the Modal SDK
        await this.web3AuthInstance.initModal();
        // await this.web3AuthInstance.init();
      } else if (this.loginParams) {
        // would only use if using the No Modal SDK
        // await this.web3AuthInstance.init();
      } else {
        // loglevel.error("please provide a valid loginParams when not using @web3auth/modal");
        throw new UserRejectedRequestError(
          "please provide a valid loginParams when not using @web3auth/modal"
        );
      }
    }

    provider = this.web3AuthInstance.provider;

    if (!provider) {
      console.log("2st check", isWeb3AuthModal(this.web3AuthInstance));

      if (isWeb3AuthModal(this.web3AuthInstance)) {
        provider = await this.web3AuthInstance.connect();
      } else if (this.loginParams) {
        // would only use if using the No Modal SDK
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
    if (!provider) {
      throw new Error("Failing to init the web3Instance Provider");
    }

    return provider;
  }

  async getSimpleAccountAPI(): Promise<SimpleAccountAPI> {
    if (this.simpleAccountAPI) {
      return this.simpleAccountAPI;
    }

    const provider = this.web3AuthInstance.provider;

    const web3Provider = new ethers.providers.Web3Provider(provider!);

    const signer = web3Provider.getSigner();

    // const _simpleAccountAPI = await new SimpleAccountAPI({
    //   entryPointAddress,
    //   // accountAddress: await signer.getAddress(),
    //   provider: web3Provider,
    //   signer: signer,
    // }).init();

    this.simpleAccountAPI = new SimpleAccountAPI({
      entryPointAddress,
      // accountAddress: await signer.getAddress(),
      provider: web3Provider,
      signer: signer,
    });

    return this.simpleAccountAPI;
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
    function isWeb3AuthModal(obj: any): obj is Web3Auth {
      return typeof obj.initModal !== "undefined";
    }

    try {
      this.emit("message", {
        type: "connecting",
      });
      this.provider = await this.getProvider();
      console.log(this.provider);

      // if (!this.provider) {
      //   this.provider = await this.getProvider();
      // }

      this.web3AuthProvider = await this.initWeb3AuthProvider();

      if (!this.web3AuthProvider) {
        throw new Error("Failing to init web3AuthProvider");
      }

      // console.log(this.web3AuthInstance.status);
      // if (this.web3AuthInstance.status === ADAPTER_STATUS.NOT_READY) {
      //   console.log("1st check", isWeb3AuthModal(this.web3AuthInstance));
      //   if (isWeb3AuthModal(this.web3AuthInstance)) {
      //     // would put Modal Config i wasnt using the Modal SDK
      //     await this.web3AuthInstance.initModal();
      //     // await this.web3AuthInstance.init();
      //   } else if (this.loginParams) {
      //     // would only use if using the No Modal SDK
      //     // await this.web3AuthInstance.init();
      //   } else {
      //     // loglevel.error("please provide a valid loginParams when not using @web3auth/modal");
      //     throw new UserRejectedRequestError(
      //       "please provide a valid loginParams when not using @web3auth/modal"
      //     );
      //   }
      // }

      // this.web3AuthProvider = this.web3AuthInstance.provider;

      // if (!provider) {
      //   console.log("2st check", isWeb3AuthModal(this.web3AuthInstance));

      //   if (isWeb3AuthModal(this.web3AuthInstance)) {
      //     this.web3AuthProvider = await this.web3AuthInstance.connect();
      //   } else if (this.loginParams) {
      //     // would only use if using the No Modal SDK
      //     // provider = (await this.web3AuthInstance.connectTo(
      //     //   WALLET_ADAPTERS.OPENLOGIN,
      //     //   this.loginParams
      //     // )) as SafeEventEmitterProvider;
      //   } else {
      //     // loglevel.error("please provide a valid loginParams when not using @web3auth/modal");
      //     throw new UserRejectedRequestError(
      //       "please provide a valid loginParams when not using @web3auth/modal"
      //     );
      //   }
      // }

      const _provider = new ethers.providers.Web3Provider(
        this.web3AuthProvider
      );

      // const web3Provider = new ethers.providers.Web3Provider(provider!);
      // const defaultSigner = web3Provider.getSigner();

      // const signer = await this.getSigner();
      // const account = (await signer.getAddress()) as `0x${string}`;
      _provider?.on("accountsChanged", this.onAccountsChanged.bind(this));
      _provider?.on("chainChanged", this.onChainChanged.bind(this));
      const chainId = await this.getChainId();
      const unsupported = this.isChainUnsupported(chainId);

      // const customHttpRpcClient = new CustomHttpRpcClient(
      //   entryPointAddress,
      //   chainId,
      //   this.chains[0].rpcUrls.default.http[0]
      //   // hardcoding this for now
      // );

      // const _simpleAccountAPI = await this.getSimpleAccountAPI();

      // this.simpleAccountAPI = new SimpleAccountAPI({
      //   entryPointAddress,
      //   // accountAddress: await signer.getAddress(),
      //   provider: web3Provider,
      //   signer: signer,
      // });

      // const simpleAccountAPI: SimpleAccountAPI = new SimpleAccountAPI({
      //   entryPointAddress,
      //   accountAddress: await signer.getAddress(),
      //   provider: defaultProvider!,
      //   signer: signer,
      // });

      // const simpleAccountAPIInit = await this.simpleAccountAPI.init();
      // this.simpleAccountAPI = await this.simpleAccountAPI.init();

      // return your smart wallet address
      const accountAddress =
        (await this.simpleAccountAPI?.getAccountAddress()) as `0x${string}`;
      console.log("accountAddress", accountAddress);

      // const aaProvider = await this.getProvider();

      // const _AAProvider = new AAProvider(
      //   chainId,
      //   { ...aaConfig, web3AuthInstance: this.web3AuthInstance },
      //   defaultSigner,
      //   web3Provider,
      //   customHttpRpcClient,
      //   entryPointAddress,
      //   _simpleAccountAPI
      // );
      // const __AAProvider = await _AAProvider.init();
      console.log(this.provider);
      return {
        account: accountAddress,
        chain: {
          id: chainId,
          unsupported,
        },
        provider: this.provider,
      };
    } catch (error) {
      // loglevel.error("error while connecting", error);
      // console.log(error);
      throw new UserRejectedRequestError(error);
    }
  }

  async disconnect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // const _safeAuth = await this.safeAuth;
        await this.web3AuthInstance.logout();
        this.provider = undefined;
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

      let provider = this.web3AuthInstance.provider as SafeEventEmitterProvider;

      const defaultProvider = new ethers.providers.Web3Provider(provider);

      const signer = this.provider.getSigner();

      // const simpleAccountAPI: SimpleAccountAPI = new SimpleAccountAPI({
      //   entryPointAddress,
      //   provider: defaultProvider!,
      //   signer: signer,
      // });

      // const acc = await this.simpleAccountAPI.init();

      // return your smart wallet address
      const accountAddress =
        (await this.simpleAccountAPI?.getAccountAddress()) as `0x${string}`;
      console.log("accountAddress", accountAddress);
      return accountAddress;

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
      function isWeb3AuthModal(obj: any): obj is Web3Auth {
        return typeof obj.initModal !== "undefined";
      }
      try {
        let provider = this.web3AuthInstance.provider;

        // only returning first chain for now
        return this.chains[0].id;

        if (!provider) {
          if (isWeb3AuthModal(this.web3AuthInstance)) {
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

        const _chainId = await provider!.request({
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
      // if (!this.web3AuthProvider) {
      //   this.web3AuthProvider = await this.initWeb3AuthProvider();
      // }

      function isWeb3AuthModal(obj: any): obj is Web3Auth {
        return typeof obj.initModal !== "undefined";
      }

      // if (!provider) {
      //   if (isWeb3AuthModal(this.web3AuthInstance)) {
      //     provider =
      //       (await this.web3AuthInstance.connect()) as SafeEventEmitterProvider;
      //   } else if (this.loginParams) {
      //     // provider = (await this.web3AuthInstance.connectTo(
      //     //   WALLET_ADAPTERS.OPENLOGIN,
      //     //   this.loginParams
      //     // )) as SafeEventEmitterProvider;
      //   } else {
      //     // loglevel.error("please provide a valid loginParams when not using @web3auth/modal");
      //     throw new UserRejectedRequestError(
      //       "please provide a valid loginParams when not using @web3auth/modal"
      //     );
      //   }
      // }

      const defaultProvider = new ethers.providers.Web3Provider(
        this.web3AuthProvider!
      );
      const _defaultSigner = defaultProvider.getSigner();

      // const signer = await this.getSigner();
      // const account = (await signer.getAddress()) as `0x${string}`;
      // provider!.on("accountsChanged", this.onAccountsChanged.bind(this));
      // provider!.on("chainChanged", this.onChainChanged.bind(this));
      const chainId = await this.getChainId();
      const unsupported = this.isChainUnsupported(chainId);

      const _customHttpRpcClient = new CustomHttpRpcClient(
        entryPointAddress,
        chainId,
        this.chains[0].rpcUrls.default.http[0]
        // hardcoding this for now
      );

      // const _simpleAccountAPI: SimpleAccountAPI = new SimpleAccountAPI({
      //   entryPointAddress,
      //   accountAddress: await signer.getAddress(),
      //   provider: defaultProvider!,
      //   signer: signer,
      // });

      const _provider = new AAProvider(
        chainId,
        { ...aaConfig, web3AuthInstance: this.web3AuthInstance },
        _defaultSigner,
        defaultProvider,
        _customHttpRpcClient,
        entryPointAddress,
        this.simpleAccountAPI!
      );

      console.log(_provider);

      const postInitProvider = await _provider.init();

      return postInitProvider;
    } catch (error: any) {
      return error;
    }
  }

  async getSigner(): Promise<AASigner> {
    function isWeb3AuthModal(obj: any): obj is Web3Auth {
      return typeof obj.initModal !== "undefined";
    }
    console.log(this.web3AuthInstance.provider);
    const p = await this.getProvider();
    // if (p) {
    //   return p.getSigner();
    // }

    return p.getSigner();

    // return new AASigner(
    //   { ...aaConfig, web3AuthInstance: this.web3AuthInstance },
    //   _defaultSigner,
    //   this.provider!,
    //   customHttpRpcClient,
    //   this.simpleAccountAPI!
    // );

    // let provider = this.web3AuthInstance.provider;

    // if (!provider) {
    //   if (isWeb3AuthModal(this.web3AuthInstance)) {
    //     provider =
    //       (await this.web3AuthInstance.connect()) as SafeEventEmitterProvider;
    //   } else if (this.loginParams) {
    //     // TODO: configure this
    //     // provider = (await this.web3AuthInstance.connectTo(
    //     //   WALLET_ADAPTERS.OPENLOGIN,
    //     //   this.loginParams
    //     // )) as SafeEventEmitterProvider;
    //   } else {
    //     // loglevel.error("please provide a valid loginParams when not using @web3auth/modal");
    //     throw new UserRejectedRequestError(
    //       "please provide a valid loginParams when not using @web3auth/modal"
    //     );
    //   }
    // }

    // const defaultProvider = new ethers.providers.Web3Provider(provider);
    // const _defaultSigner = defaultProvider.getSigner();

    // const _chainId = await this.getChainId();

    // let chain: Chain | undefined = this.chains.find(
    //   (chain) => chain.id === _chainId
    // );

    // if (!chain) {
    //   throw new Error("Chain not found");
    // }

    // const customHttpRpcClient = new CustomHttpRpcClient(
    //   entryPointAddress,
    //   _chainId,
    //   this.chains[0].rpcUrls.default.http[0]
    // );

    // const simpleAccountAPI: SimpleAccountAPI = new SimpleAccountAPI({
    //   entryPointAddress,
    //   accountAddress: await _defaultSigner.getAddress(),
    //   provider: defaultProvider!,
    //   signer: _defaultSigner,
    // });

    // return new AASigner(
    //   { ...aaConfig, web3AuthInstance: this.web3AuthInstance },
    //   _defaultSigner,
    //   this.provider!,
    //   customHttpRpcClient,
    //   this.simpleAccountAPI!
    // );
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
