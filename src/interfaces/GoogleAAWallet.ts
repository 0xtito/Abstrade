import { AbstractBaseSocialWallet } from "./AbstractBaseSocialWallet";

export class GoogleSocialWallet extends AbstractBaseSocialWallet {
  loginProvider: string;

  constructor() {
    super();
    this.loginProvider = "google";
  }
}
