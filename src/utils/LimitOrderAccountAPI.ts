// import { SimpleAccountAPI } from "./SimpleAccountAPI";
import { SimpleAccountAPI } from "./SimpleAccountAPI";

import { SimpleAccountAPIParams, DetailsForUserOp } from "../interfaces";
import { BigNumberish, Contract, ethers } from "ethers";
import { hexConcat } from "ethers/lib/utils.js";

import { LimitOrderAccount } from "../interfaces/LimitOrderAccount";
import { LimitOrderAccount__factory } from "../interfaces/LimitOrderAccount__factory";
import { LimitOrderAccountFactory } from "../interfaces/LimitOrderAccountFactory";
import { LimitOrderAccountFactory__factory } from "../interfaces/LimitOrderAccountFactory__factory";

interface EncodeCreateLimitOrderParams {
  tokenOut: string;
  tokenIn: string;
  expiry: number;
  orderAmount: bigint;
  rate: bigint;
}

interface EncodeFillLimitOrderParams {
  id: number;
  filler: string;
  fillAmount: BigNumberish;
  params: string;
}

// import LimitOrderAccount from "../contracts/artifacts/LimitOrderAccount.json";

export class LimitOrderAccountAPI extends SimpleAccountAPI {
  accountContract?: LimitOrderAccount;
  factoryAddress?: string;
  factory?: LimitOrderAccountFactory;
  name: string;

  constructor(params: SimpleAccountAPIParams) {
    super(params);
    this.factoryAddress = params.factoryAddress;
    this.name = "LimitOrderAccountAPI";
  }

  async _getAccountContract(): Promise<LimitOrderAccount> {
    if (this.accountContract == null) {
      this.accountContract = LimitOrderAccount__factory.connect(
        await this.getAccountAddress(),
        this.provider
      );
    }
    return this.accountContract;
  }

  async getAccountInitCode(): Promise<string> {
    if (this.factory == null) {
      if (this.factoryAddress != null && this.factoryAddress !== "") {
        this.factory = LimitOrderAccountFactory__factory.connect(
          this.factoryAddress,
          this.provider
        );
        // .connect(ethers.constants.AddressZero);
      } else {
        throw new Error("no factory to get initCode");
      }
    }
    console.log("owner address", await this.owner.getAddress());
    console.log("factory address", this.factory.address);
    return hexConcat([
      this.factory.address,
      this.factory.interface.encodeFunctionData("createAccount", [
        await this.owner.getAddress(),
        this.index,
      ]),
    ]);
  }

  async encodeCreateLimitOrder({
    tokenOut,
    tokenIn,
    expiry,
    orderAmount,
    rate,
  }: EncodeCreateLimitOrderParams) {
    const accountContract = await this._getAccountContract();
    const encoded = accountContract.interface.encodeFunctionData(
      "createLimitOrder",
      [tokenOut, tokenIn, expiry, orderAmount, rate]
    );
    return encoded;
  }

  async encodeCancelLimitOrder(id: number) {
    const accountContract = await this._getAccountContract();
    const encoded = accountContract.interface.encodeFunctionData(
      "cancelLimitOrder",
      [id]
    );
    return encoded;
  }

  async encodeFillLimitOrder({
    id,
    filler,
    fillAmount,
    params,
  }: EncodeFillLimitOrderParams) {
    const accountContract = await this._getAccountContract();
    const encoded = accountContract.interface.encodeFunctionData(
      "fillLimitOrder",
      [id, filler, fillAmount, params]
    );
    return encoded;
  }
}
