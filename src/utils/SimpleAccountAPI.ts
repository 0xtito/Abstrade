import { ethers, Signer } from "ethers";
import { BaseAccountAPI } from "./BaseAccountAPI";
import SimpleAccountArtifact from "../contracts/artifacts/SimpleAccount.json";
import { PaymasterAPI } from "@zerodevapp/sdk/dist/src/PaymasterAPI";
import { ContractTransaction } from "ethers";
import { IStakeManager } from "@account-abstraction/contracts";

import {
  SimpleAccountFactory,
  SimpleAccount__factory,
  SimpleAccountFactory__factory,
  SimpleAccount,
} from "@account-abstraction/contracts";
import { hexConcat } from "ethers/lib/utils.js";

import { SimpleAccountAPIParams, DetailsForUserOp } from "../interfaces";

export class SimpleAccountAPI extends BaseAccountAPI {
  name: string;
  owner: Signer;
  index: number;

  factoryAddress?: string;
  factory?: SimpleAccountFactory;
  accountContract?: SimpleAccount;

  constructor(params: SimpleAccountAPIParams) {
    // removing overheads from params
    super(params);
    const { owner, factoryAddress } = params;
    this.factoryAddress = factoryAddress;
    this.owner = owner;
    // this.init();
    this.index = params.index || 0;
    this.name = "SimpleAccountAPI";
  }

  // async init(): Promise<SimpleAccountAPI> {
  //   if ((await this.provider.getCode(this.entryPointAddress)) === "0x") {
  //     throw new Error(`entryPoint not deployed at ${this.entryPointAddress}`);
  //   }
  //   await this.getAccountAddress();
  //   return this;
  // }

  async _getAccountContract(): Promise<SimpleAccount> {
    if (this.accountContract == null) {
      this.accountContract = SimpleAccount__factory.connect(
        await this.getAccountAddress(),
        this.provider
      );
    }
    return this.accountContract;
  }

  async getAccountInitCode(): Promise<string> {
    if (this.factory == null) {
      if (this.factoryAddress != null && this.factoryAddress !== "") {
        this.factory = SimpleAccountFactory__factory.connect(
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

  async getNonce(): Promise<ethers.BigNumber> {
    if (await this.checkAccountPhantom()) {
      return ethers.BigNumber.from(0);
    }
    const accountContract = await this._getAccountContract();
    return await accountContract.nonce();
  }

  /**
   * FOR ALL FUNCTIONS BELOW, STILL NEED TO TEST / CONFIGURE
   * @note maining seeing whether to create a contract instance, or use the _getAccountContract() method
   * @note also need to see whether to use the SimpleAccountFactory or the SimpleAccount contract
   */

  /**
   *
   * @param dest address to send the transaction to
   * @param value if ether is required to perform the tx
   * @param func  the encoded function call
   * @returns either the contract transaction or the tx hash
   */
  // Execute a transaction on behalf of the SimpleAccount (this would currently make the user pay for the gas)
  async execute(
    dest: string,
    value: ethers.BigNumberish,
    func: ethers.utils.BytesLike
  ): Promise<string> {
    const accountContract = await this._getAccountContract();
    // return await this.execute(target, value!, data);
    return accountContract.interface.encodeFunctionData("execute", [
      dest,
      value!,
      func,
    ]);

    // return await simpleAccountContract.execute(dest, value, func);
  }

  // Execute a batch of transactions on behalf of the SimpleAccount
  /**
   * encode a method call from entryPoint to our contract
   * @param target
   * @param value
   * @param data
   */
  async encodeExecute(details: DetailsForUserOp): Promise<string> {
    const { target, value, data } = details;
    const accountContract = await this._getAccountContract();
    // return await this.execute(target, value!, data);
    return accountContract.interface.encodeFunctionData("execute", [
      target,
      value!,
      data,
    ]);
  }

  // Get the current deposit balance of the SimpleAccount in the EntryPoint.
  async getDeposit(): Promise<IStakeManager.DepositInfoStructOutput> {
    // const simpleAccountContract = new ethers.Contract(
    //   await this.owner.getAddress(),
    //   SimpleAccountArtifact.abi,
    //   this.provider
    // );
    return await this.entryPointView.getDepositInfo(
      await this.getAccountAddress()
    );
    // return await simpleAccountContract.getDeposit();
  }

  // Add a deposit to the SimpleAccount in the EntryPoint.
  async addDeposit(value: ethers.BigNumberish): Promise<void> {
    const simpleAccountContract = new ethers.Contract(
      await this.owner.getAddress(),
      SimpleAccountArtifact.abi,
      this.provider
    );
    // return await this.entryPointView.addStake(
    //   await this.getAccountAddress()
    // );

    await simpleAccountContract.addDeposit({ value });
  }

  async signUserOpHash(userOpHash: string): Promise<string> {
    // const signer = this.provider.originalSigner;
    console.log(this.owner);
    const signature = await this.owner.signMessage(userOpHash);
    return signature;
  }

  // Withdraw a specified amount from the SimpleAccount's deposit in the EntryPoint to a given address.
  async withdrawDepositTo(
    withdrawAddress: string,
    amount: ethers.BigNumberish
  ): Promise<void> {
    const simpleAccountContract = new ethers.Contract(
      await this.owner.getAddress(),
      SimpleAccountArtifact.abi,
      this.owner
    );
    await simpleAccountContract.withdrawDepositTo(withdrawAddress, amount);
  }
}

export default SimpleAccountAPI;
