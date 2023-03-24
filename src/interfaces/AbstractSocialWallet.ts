import { Web3AuthCore, Web3AuthCoreOptions } from "@web3auth/core";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { SafeEventEmitterProvider } from "@web3auth/base";
// import { CHAIN_ID_TO_INFURA_NAME } from "@zerodevapp/sdk/dist/src/constants";
import {
  OpenloginAdapter,
  OpenloginAdapterOptions,
} from "@web3auth/openlogin-adapter";
// import {
//   getWeb3AuthConfig,
//   getOpenloginAdapterConfig,
// } from "@zerodevapp/sdk/dist/src";
import { getWeb3AuthConfig } from "../utils/getWeb3AuthConfig";
import { getOpenloginAdapterConfig } from "../utils/getOpenloginAdapterConfig";

export abstract class AbstractSocialWallet {
  protected web3Auth: Web3AuthCore | Web3Auth | undefined;
  protected web3AuthConfig: Web3AuthCoreOptions | Web3AuthOptions | undefined;
  options: Partial<Web3AuthOptions | Web3AuthCoreOptions>;

  abstract connect(
    chainId: number,
    adapterSettings?: Partial<OpenloginAdapterOptions>
  ): Promise<SafeEventEmitterProvider | null | undefined>;

  constructor(options: Partial<Web3AuthOptions | Web3AuthCoreOptions> = {}) {
    this.options = options;
  }

  async init(
    chainId: number,
    adapterSettings?: Partial<OpenloginAdapterOptions>,
    Web3AuthClass?: typeof Web3Auth | typeof Web3AuthCore
  ) {
    console.log(chainId);
    // getWeb3AuthConfig and getOpenloginAdapterConfig are custom functions to retrieve the config
    this.web3AuthConfig = { ...getWeb3AuthConfig(chainId), ...this.options };
    this.web3Auth = new (Web3AuthClass || Web3AuthCore)(this.web3AuthConfig);
    const openLoginAdapter = new OpenloginAdapter(getOpenloginAdapterConfig());
    this.web3Auth.configureAdapter(openLoginAdapter);
    if (adapterSettings) {
      openLoginAdapter.setAdapterSettings(adapterSettings);
    }
  }

  async disconnect() {
    if (this.web3Auth) {
      await this.web3Auth.logout();
    }
  }
}
