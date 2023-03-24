import { AbstractBaseSocialWallet } from "./AbstractBaseSocialWallet";

export class DiscordSocialWallet extends AbstractBaseSocialWallet {
  loginProvider: string;

  constructor() {
    super();
    this.loginProvider = "discord";
  }
}
