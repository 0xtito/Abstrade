import { ethers, Signer } from "ethers";
import { BaseAccountAPI } from "./BaseAccountAPI";
import SimpleAccountArtifact from "../contracts/artifacts/SimpleAccount.json";
import { PaymasterAPI } from "@zerodevapp/sdk/dist/src/PaymasterAPI";
import { AAProvider } from "../interfaces/AAProvider";
import { BaseProvider } from "@ethersproject/providers";

import { BaseAccount, SimpleAccount } from "@account-abstraction/contracts";

interface BaseAccountAPIParams {
  // provider: AAProvider;
  provider: BaseProvider;
  // overheads: { [key: string]: number };
  entryPointAddress: string;
  accountAddress?: string;
  paymasterAPI?: PaymasterAPI;
}

// Define the interface for the constructor parameters.
interface SimpleAccountAPIParams extends BaseAccountAPIParams {
  entryPointAddress: string;
  signer: Signer;

  // owner: string;
}

export class SimpleAccountAPI extends BaseAccountAPI {
  // basically telling typescript that this will be assigned before it is accessed
  owner!: string;
  signer: Signer;
  constructor(params: SimpleAccountAPIParams) {
    // removing overheads from params
    const { provider, entryPointAddress, signer } = params;
    super({ provider, entryPointAddress });
    this.signer = signer;
    // this.owner = params.owner;
    this.init();
  }

  async init(): Promise<SimpleAccountAPI> {
    if ((await this.provider.getCode(this.entryPointAddress)) === "0x") {
      throw new Error(`entryPoint not deployed at ${this.entryPointAddress}`);
    }
    this.owner = await this.getAccountAddress();
    return this;
  }

  async getNonce(): Promise<number> {
    const nonce = await this.provider.getTransactionCount(this.owner);
    return nonce;
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
