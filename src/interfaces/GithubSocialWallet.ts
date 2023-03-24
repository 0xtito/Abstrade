import { AbstractBaseSocialWallet } from "./AbstractBaseSocialWallet";

export class GithubSocialWallet extends AbstractBaseSocialWallet {
  loginProvider: string;

  constructor() {
    super();
    this.loginProvider = "github";
  }
}
