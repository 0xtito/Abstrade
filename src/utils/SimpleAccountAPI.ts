import { ethers, Signer } from "ethers";
import { BaseAccountAPI } from "./BaseAccountAPI";
import SimpleAccountArtifact from "../contracts/artifacts/SimpleAccount.json";
import { PaymasterAPI } from "@zerodevapp/sdk/dist/src/PaymasterAPI";
import { ContractTransaction } from "ethers";
import { IStakeManager } from "@account-abstraction/contracts";
import { BytesLike } from "ethers/lib/utils.js";

import {
  SimpleAccountFactory,
  SimpleAccount__factory,
  SimpleAccountFactory__factory,
  SimpleAccount,
} from "@account-abstraction/contracts";
import { arrayify, hexConcat } from "ethers/lib/utils.js";

import { SimpleAccountAPIParams, DetailsForUserOp } from "../interfaces";
import { LimitOrderAccount } from "../interfaces/LimitOrderAccount";

/**
 * @note Since the LimitOrderAccount is based off of the SimpleAccount, we can use the SimpleAccountAPI as a abstract class, which then the LimitOrderAccountAPI can extend
 * @note thanks eth-infinitism for the api
 */
export abstract class SimpleAccountAPI extends BaseAccountAPI {
  owner: Signer;
  index: number;

  constructor(params: SimpleAccountAPIParams) {
    super(params);
    const { owner, index } = params;
    this.owner = owner;
    this.index = index || 0;
  }

  abstract _getAccountContract(): Promise<LimitOrderAccount>;

  abstract getAccountInitCode(): Promise<string>;

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

  async encodeExecuteBatch(
    addresses: string[],
    data: BytesLike[]
  ): Promise<string> {
    // const { target, value, data } = details;
    const accountContract = await this._getAccountContract();
    return accountContract.interface.encodeFunctionData("executeBatch", [
      addresses,
      data,
    ]);
  }

  /**
   * @note to retrieve the contracts deposit information, if any
   * @returns a object with: the deposit amount, a boolean value determining if the address has a stake, the staked amount, the withdraw time, and the unstake delay
   */
  // Get the current deposit balance of the SimpleAccount in the EntryPoint.
  async getDeposit(): Promise<IStakeManager.DepositInfoStructOutput> {
    return await this.entryPointView.getDepositInfo(
      await this.getAccountAddress()
    );
  }

  /**
   * @note this most likely wont work, could be worth configuring later, but for now, we will just use the execute method if need be
   * @param value value to deposit into the entry point
   */
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

  /**
   * @note a simple function to sign the user operation hash, with the signer being the owner of the account
   * @param userOpHash the hash of the user operation
   * @returns the signature of the user operation
   */
  async signUserOpHash(userOpHash: string): Promise<string> {
    // const signer = this.provider.originalSigner;
    console.log(this.owner);
    const signature = await this.owner.signMessage(arrayify(userOpHash));
    return signature;
  }

  /**
   * @note this most likely wont work, could be worth configuring later, but for now, we will just use the execute method if need be
   * @param withdrawAddress address to withdraw the deposit to
   * @param amount amount to withdraw
   */
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
