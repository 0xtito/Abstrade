import { AbstractSocialWallet } from "./AbstractSocialWallet";
import { Web3AuthCore } from "@web3auth/core";
// import { CHAIN_ID_TO_INFURA_NAME } from "@zerodevapp/sdk/dist/src/constants";
import { OpenloginAdapterOptions } from "@web3auth/openlogin-adapter";
import { ADAPTER_STATUS, WALLET_ADAPTERS } from "@web3auth/base";

export abstract class AbstractBaseSocialWallet extends AbstractSocialWallet {
  abstract loginProvider: string;

  async connect(
    chainId: number,
    adapterSettings?: Partial<OpenloginAdapterOptions>
  ) {
    await this.init(chainId, adapterSettings);
    if (this.web3Auth && this.web3Auth instanceof Web3AuthCore) {
      try {
        if (this.web3Auth.status === ADAPTER_STATUS.NOT_READY) {
          await this.web3Auth.init();
        }
        let { provider } = this.web3Auth;

        if (!provider) {
          provider = await this.web3Auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
            loginProvider: this.loginProvider,
          });
        }
        return provider;
      } catch (error) {
        console.log(error);
      }
    }
  }
}
