import { GoogleSocialWallet } from "../interfaces/GoogleAAWallet";
import { AbstractSocialWalletConnector } from "./AbstractSocialWalletConnector";
import { Chain } from "@wagmi/core";
import { Web3AuthConfig } from "../interfaces";
import { Signer } from "ethers";

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

export class GoogleAbstradeAAConnector extends AbstractSocialWalletConnector {
  id: string;
  name: string;
  socialWallet: GoogleSocialWallet;

  constructor(config: {
    chains: Chain[];
    options: SocialWalletConnectorOptions;
  }) {
    super(config);
    this.id = "google";
    this.name = "Google";
    this.socialWallet = new GoogleSocialWallet();
  }
}
