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

/**
 * Custon Connector for [Safe AA Wallet](https://docs.gnosis-safe.io/learn/safe-core-account-abstraction-sdk)
 * @see {@link https://docs.gnosis-safe.io/learn/safe-core-account-abstraction-sdk/auth-kit}
 * @description This connector is used to connect to the Safe AA Wallet, but with a few modifications to let it work with wagmi
 * @info SafeConnector that is already in wagmi wont work with the Safe AA Wallet
 * @info Trying to change the return SafeAppProvider to a JsonRpcSigner, replace back if needed
 * @todo Figure out the source of the error "Uncaught (in promise) Error: method must be string" when trying to connect to the Safe AA Wallet
 */
export class SafeAuthAAConnector extends Connector<
  ethers.providers.Web3Provider,
  SafeOpts | undefined,
  providers.JsonRpcSigner
> {
  readonly id = "safeAA";
  readonly name = "Safe AA";
  readonly ready: boolean;
  // #safeAuth: SafeAuthKit;

  #provider?:
    | ethers.providers.ExternalProvider
    | ethers.providers.JsonRpcProvider
    | null;

  constructor(config: { chains?: Chain[]; options: SafeOpts }) {
    super(config);
    this.ready = true;
    this.onAccountsChanged = async (accounts: string[]) => {
      this.emit("change", {
        account: await this.getAccount(),
        chain: {
          id: await this.getChainId(),
          unsupported: false,
        },
      });
    };
    this.onChainChanged = async (chainId: string | number) => {
      this.emit("change", {
        account: await this.getAccount(),
        chain: {
          id: await this.getChainId(),
          unsupported: false,
        },
      });
    };
    this.onDisconnect = async () => {
      this.emit("disconnect");
    };

    // this.#safeAuth = this.init().then((safeAuth) => safeAuth);
  }
  /**
   * Testing init - not really needed, but might be useful
   */
  // async init(): Promise<SafeAuthKit> {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       const _safeAuth = await SafeAuthKit.init(
  //         SafeAuthProviderType.Web3Auth,
  //         {
  //           chainId: hexValue(this.chains[0].id),
  //           txServiceUrl: "https://safe-transaction-goerli.safe.global",
  //           authProviderConfig: {
  //             rpcTarget: this.chains[0].rpcUrls.default.http[0],
  //             clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
  //             network: "testnet",
  //             theme: "dark",
  //           },
  //         }
  //       );
  //       if (!_safeAuth) {
  //         throw new Error("Safe Auth not initialized");
  //       }
  //       return _safeAuth;
  //     } catch (error) {
  //       reject(error);
  //     }
  //   });
  // }
  // }

  connect({ chainId }: { chainId?: number }): Promise<{
    account: `0x${string}`;
    kit: SafeAuthKit;
    chain: {
      id: number;
      unsupported: boolean;
    };
    // provider: SafeAppProvider;
    provider: ethers.providers.Web3Provider;
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

        const rpcUrl = chain.rpcUrls.default.http[0];
        console.log(rpcUrl);
        // rpcTarget: this.chains[0].rpcUrls.default.http[0],

        const safeAuth = await SafeAuthKit.init(SafeAuthProviderType.Web3Auth, {
          chainId: hexValue(chain.id),
          txServiceUrl: "https://safe-transaction-goerli.safe.global",
          authProviderConfig: {
            rpcTarget: chain.rpcUrls.default.http[0],
            clientId: process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID as string,
            network: "testnet",
            theme: "dark",
          },
        });

        if (!safeAuth) {
          throw new Error("Safe Auth not initialized");
        } else {
          this.#provider = safeAuth.getProvider();
          await safeAuth.signIn();
          this.#provider = new ethers.providers.Web3Provider(
            safeAuth.getProvider() as ethers.providers.ExternalProvider
          );
          // const signer = this.#provider.getSigner();
          // console.log(signer);

          resolve({
            account: await this.getAccount(),
            kit: safeAuth,
            chain: {
              id: _chainId,
              unsupported: this.isChainUnsupported(_chainId),
            },
            provider: this.#provider as ethers.providers.Web3Provider,
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {}
  async getAccount(): Promise<`0x${string}`> {
    try {
      if (!this.#provider) {
        throw new Error("Provider not initialized");
      }
      const ethersProvider = new ethers.providers.Web3Provider(
        this.#provider as ethers.providers.ExternalProvider
      );
      const signer = ethersProvider.getSigner();

      // Get user's Ethereum public address
      const address = await signer.getAddress();

      return address as `0x${string}`;
    } catch (error) {
      return error as any;
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
  async getProvider(): Promise<ethers.providers.Web3Provider> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.#provider) {
          this.#provider = new ethers.providers.Web3Provider(
            this.#provider! as ethers.providers.ExternalProvider
          );
        }
        return this.#provider;
      } catch (error) {
        return error;
      }
    });
  }

  async getSigner(): Promise<providers.JsonRpcSigner> {
    try {
      // const ethersProvider = new ethers.providers.Web3Provider(this.#provider);
      const signer = (await this.getProvider()).getSigner();

      return signer;
    } catch (error) {
      return error as any;
    }
  }
  isAuthorized(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        const isAuthorized = !!this.#provider;
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
  protected onAccountsChanged: (accounts: `0x${string}`[]) => void;
  protected onChainChanged: (chainId: number | string) => void;
  protected onDisconnect: () => void;
}

// export { SafeAuthAAConnector };
