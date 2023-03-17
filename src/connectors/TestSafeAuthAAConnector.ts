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

import { Signer } from "ethers";
import { BaseProvider } from "@ethersproject/providers";

const config = {
  projectId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
  entryPointAddress: entryPointAddress,
  accountFactoryAddress: accountFactoryAddress,
};

// import { CustomHttpRpcClient } from "../interfaces/CustomHttpRpcClient";
/**
 * Custom Connector for [Safe Auth Kit Wallet](https://docs.gnosis-safe.io/learn/safe-core-account-abstraction-sdk)
 * @note Implementing the Safe Auth Kit Wallet as a Smart Account Wallet INACTIVE
 * @see {@link https://docs.gnosis-safe.io/learn/safe-core-account-abstraction-sdk/auth-kit}
 * @description This connector is used to connect to the Safe AA Wallet, but with a few modifications to let it work with wagmi
 * @info SafeConnector that is already in wagmi wont work with the Safe AA Wallet
 * @info Trying to change the return SafeAppProvider to a JsonRpcSigner, replace back if needed
 * @todo Figure out the source of the error "Uncaught (in promise) Error: method must be string" when trying to connect to the Safe AA Wallet
 */
export class SafeAuthAAConnector extends Connector<
  AAProvider,
  SafeClientConfig,
  AASigner
> {
  readonly id = "safeAA";
  readonly name = "Safe AA";
  readonly ready: true;

  safeAuth: PromiseOrValue<SafeAuthKit>;

  provider?: AAProvider;

  constructor(config: { chains?: Chain[]; options: SafeClientConfig }) {
    super(config);
    this.safeAuth = this.init();
    this.ready = true;
  }

  init(): Promise<SafeAuthKit> {
    return new Promise(async (resolve, reject) => {
      const _chainId = await this.getChainId();
      let chain: Chain | undefined = this.chains.find(
        (chain) => chain.id === _chainId
      );

      try {
        const _safeAuth = await SafeAuthKit.init(
          SafeAuthProviderType.Web3Auth,
          {
            chainId: hexValue(_chainId),
            txServiceUrl: "https://safe-transaction-goerli.safe.global",
            authProviderConfig: {
              rpcTarget: chain
                ? chain.rpcUrls.default.http[0]
                : this.chains[0].rpcUrls.default.http[0],
              clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
              network: "testnet",
              theme: "dark",
            },
          }
        );
        if (!_safeAuth) {
          throw new Error("Safe Auth not initialized");
        }
        // this.provider = await this.getProvider();

        // this.ready = true;
        resolve(_safeAuth);
        return _safeAuth;
      } catch (error) {
        reject(error);
      }
    });
  }

  async connect({ chainId }: { chainId?: number } = {}): Promise<{
    account: `0x${string}`;
    kit: SafeAuthKit;
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

        const _safeAuth = await this.safeAuth;
        await _safeAuth.signIn();

        if (!_safeAuth) {
          throw new Error("Safe Auth not initialized");
        } else {
          this.provider = await this.getProvider();
          if (!this.provider) {
            throw new Error("Provider not initialized in connect");
          }

          resolve({
            account: await this.getAccount(),
            kit: await this.safeAuth,
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
        const _safeAuth = await this.safeAuth;
        await _safeAuth.signOut();
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
      const _safeAuth = await this.safeAuth;

      const defaultProvider = new ethers.providers.Web3Provider(
        _safeAuth.getProvider() as ethers.providers.ExternalProvider
      );

      const defaultSigner = defaultProvider.getSigner();

      // const signer = await this.getSigner();
      const address = await defaultSigner.getAddress();

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
      const _safeAuth = await this.safeAuth;
      const _chainId = await this.getChainId();

      const defaultProvider = new ethers.providers.Web3Provider(
        _safeAuth.getProvider() as ethers.providers.ExternalProvider
      );

      const defaultSigner = defaultProvider.getSigner();

      const customHttpRpcClient = new CustomHttpRpcClient(
        entryPointAddress,
        _chainId,
        this.chains[0].rpcUrls.default.http[0]
        // hardcoding this for now
      );

      const simpleAccountAPI: SimpleAccountAPI = new SimpleAccountAPI({
        entryPointAddress,
        accountAddress: await defaultSigner.getAddress(),
        provider: defaultProvider,
        signer: defaultSigner,
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
          return defaultProvider;
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
    const _safeAuth = await this.safeAuth;
    const defaultProvider = new ethers.providers.Web3Provider(
      _safeAuth.getProvider() as ethers.providers.ExternalProvider
    );

    const defaultSigner = defaultProvider.getSigner();
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
      accountAddress: await defaultSigner.getAddress(),
      provider: defaultProvider,
      signer: defaultSigner,
    });

    if (!this.provider) {
      throw new Error("Provider not initialized in getSigner");
    }

    return new AASigner(
      config,
      defaultSigner,
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
