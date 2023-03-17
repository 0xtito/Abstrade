import { ethers, Signer } from "ethers";
import { BaseAccountAPI } from "./BaseAccountAPI";
import SimpleAccountArtifact from "../contracts/artifacts/SimpleAccount.json";
import { PaymasterAPI } from "@zerodevapp/sdk/dist/src/PaymasterAPI";
import { AAProvider } from "../interfaces/AAProvider";
import { BaseProvider } from "@ethersproject/providers";

import {
  SimpleAccountFactory,
  SimpleAccount__factory,
  SimpleAccountFactory__factory,
  SimpleAccount,
} from "@account-abstraction/contracts";
import { hexConcat } from "ethers/lib/utils.js";
import { BigNumberish } from "ethers";

import { SimpleAccountAPIParams, DetailsForUserOp } from "../interfaces";
const simpleAccountAddress = "0x0576a174D229E3cFA37253523E645A78A0C91B57";

export class SimpleAccountAPI extends BaseAccountAPI {
  // basically telling typescript that this will be assigned before it is accessed
  name: string;
  owner!: string;
  signer: Signer;

  factoryAddress?: `0x${string}`;
  factory?: SimpleAccountFactory;
  accountContract?: SimpleAccount;

  constructor(params: SimpleAccountAPIParams) {
    // removing overheads from params
    const { provider, entryPointAddress, signer } = params;
    super({ provider, entryPointAddress });
    this.factoryAddress = simpleAccountAddress;
    this.signer = signer;
    // this.owner = params.owner;
    this.init();
    this.name = "SimpleAccountAPI";
  }

  async _getAccountContract(): Promise<SimpleAccount> {
    if (this.accountContract == null) {
      this.accountContract = SimpleAccount__factory.connect(
        await this.getAccountAddress(),
        this.provider
      );
    }
    return this.accountContract;
  }

  /**
   * encode a method call from entryPoint to our contract
   * @param target
   * @param value
   * @param data
   */
  async encodeExecute(details: DetailsForUserOp): Promise<string> {
    const { target, value, data } = details;
    const accountContract = await this._getAccountContract();
    return accountContract.interface.encodeFunctionData("execute", [
      target,
      value!,
      data,
    ]);
  }

  async getAccountInitCode(): Promise<string> {
    if (this.factory == null) {
      if (this.factoryAddress != null) {
        this.factory = SimpleAccountFactory__factory.connect(
          this.factoryAddress,
          this.provider
        );
      } else {
        throw new Error("no factory to get initCode");
      }
    }
    return hexConcat([
      this.factory.address,
      this.factory.interface.encodeFunctionData("createAccount", [
        await this.signer.getAddress(),
        0,
      ]),
    ]);
  }

  async init(): Promise<SimpleAccountAPI> {
    if ((await this.provider.getCode(this.entryPointAddress)) === "0x") {
      throw new Error(`entryPoint not deployed at ${this.entryPointAddress}`);
    }
    this.owner = await this.getAccountAddress();
    return this;
  }

  async getNonce(): Promise<ethers.BigNumber> {
    if (await this.checkAccountPhantom()) {
      return ethers.BigNumber.from(0);
    }
    const accountContract = await this._getAccountContract();
    return await accountContract.nonce();
  }

  // Execute a transaction on behalf of the SimpleAccount
  async execute(
    dest: string,
    value: ethers.BigNumberish,
    func: ethers.utils.BytesLike
  ): Promise<void> {
    const simpleAccountContract = new ethers.Contract(
      this.owner,
      SimpleAccountArtifact.abi,
      this.provider
    );
    await simpleAccountContract.execute(dest, value, func);
  }

  // Execute a batch of transactions on behalf of the SimpleAccount
  async executeBatch(
    dest: string[],
    func: ethers.utils.BytesLike[]
  ): Promise<void> {
    const simpleAccountContract = new ethers.Contract(
      this.owner,
      SimpleAccountArtifact.abi,
      this.provider
    );
    await simpleAccountContract.executeBatch(dest, func);
  }

  // Get the current deposit balance of the SimpleAccount in the EntryPoint.
  async getDeposit(): Promise<ethers.BigNumber> {
    const simpleAccountContract = new ethers.Contract(
      this.owner,
      SimpleAccountArtifact.abi,
      this.provider
    );
    return await simpleAccountContract.getDeposit();
  }

  // Add a deposit to the SimpleAccount in the EntryPoint.
  async addDeposit(value: ethers.BigNumberish): Promise<void> {
    const simpleAccountContract = new ethers.Contract(
      this.owner,
      SimpleAccountArtifact.abi,
      this.provider
    );
    await simpleAccountContract.addDeposit({ value });
  }

  async signUserOpHash(userOpHash: string): Promise<string> {
    // const signer = this.provider.originalSigner;
    const signature = await this.signer.signMessage(userOpHash);
    return signature;
  }

  // Withdraw a specified amount from the SimpleAccount's deposit in the EntryPoint to a given address.
  async withdrawDepositTo(
    withdrawAddress: string,
    amount: ethers.BigNumberish
  ): Promise<void> {
    const simpleAccountContract = new ethers.Contract(
      this.owner,
      SimpleAccountArtifact.abi,
      this.signer
    );
    await simpleAccountContract.withdrawDepositTo(withdrawAddress, amount);
  }
}

export default SimpleAccountAPI;
