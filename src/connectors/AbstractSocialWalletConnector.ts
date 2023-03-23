import { Signer } from "ethers";
import { AbstradeAAConnector } from "./AbstradeAAConnector";
import { AbstractSocialWallet } from "../interfaces/AbstractSocialWallet";
import { ethers } from "ethers";

import { SafeEventEmitterProvider } from "@web3auth/base";
import { getSocialWalletOwner } from "@zerodevapp/sdk";

type AccountParams = {
  projectId: string; // fill this with random characters
  owner: Signer;
  rpcProviderUrl?: string;
  // bundlerUrl?: string;
  factoryAddress?: string;
  // hooks?: Hooks;
  disconnect?: () => Promise<any>;
};

type SocialWalletConnectorOptions = Omit<AccountParams, "owner" | "disconnect">;

// const provider = new ethers_1.ethers.providers.Web3Provider(await socialWallet.connect(response.chainId, openloginAdapterSettings));

export abstract class AbstractSocialWalletConnector extends AbstradeAAConnector<SocialWalletConnectorOptions> {
  abstract socialWallet: AbstractSocialWallet;
  owner: Signer | undefined;

  async connect({ chainId }: { chainId: number }) {
    console.log(chainId);
    if (!this.owner) {
      /**
       * by making it this.initialChainId, it will always connect to the first chain in the list
       * @todo make it so that it connects to the chain that the user is on (with time)
       */
      const _provider = (await this.socialWallet.connect(
        this.initialChainId
      )) as SafeEventEmitterProvider;

      const provider = new ethers.providers.Web3Provider(_provider);
      console.log(
        "within AbstractSocialWalletConnector",
        await provider.getSigner().getAddress()
      );

      this.owner = provider.getSigner();
    }
    // hardcoding chainId to initialChainId for now

    return await super.connect({ chainId: this.initialChainId });
  }

  async getOptions() {
    const options = await super.getOptions();
    options.disconnect = this.socialWallet.disconnect.bind(this.socialWallet);
    if (this.owner) {
      options.owner = this.owner;
    }
    return options;
  }
}
