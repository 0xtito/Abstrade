import { GithubSocialWallet } from "../interfaces/GithubSocialWallet";
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

export class GithubAbstradeAAConnector extends AbstractSocialWalletConnector {
  id: string;
  name: string;
  socialWallet: GithubSocialWallet;

  constructor(config: {
    chains: Chain[];
    options: SocialWalletConnectorOptions;
  }) {
    super(config);
    this.id = "github";
    this.name = "Github";
    this.socialWallet = new GithubSocialWallet();
  }
}
