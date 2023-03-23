import { AbstractSocialWalletConnector } from "./AbstractSocialWalletConnector";
import { Chain } from "@wagmi/core";
import { Web3AuthConfig } from "../interfaces";
import { Signer } from "ethers";
import { DiscordSocialWallet } from "../interfaces/DiscordSocialWallet";

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

export class DiscordAbstradeAAConnector extends AbstractSocialWalletConnector {
  id: string;
  name: string;
  socialWallet: DiscordSocialWallet;

  constructor(config: {
    chains: Chain[];
    options: SocialWalletConnectorOptions;
  }) {
    super(config);
    this.id = "discord";
    this.name = "Discord";
    this.socialWallet = new DiscordSocialWallet();
  }
}
