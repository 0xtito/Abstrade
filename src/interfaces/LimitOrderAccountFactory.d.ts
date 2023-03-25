import { BigNumberish } from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import {
  Interface,
  Result,
  FunctionFragment,
  ParamType,
} from "@ethersproject/abi";

import {
  Listener,
  TypedListener,
  TypedEventFilter,
  TypedEvent,
} from "@account-abstraction/contracts/dist/types/common";

import {
  BaseContract,
  ContractTransaction,
  PopulatedTransaction,
  CallOverrides,
  Overrides,
  ContractInterface,
} from "@ethersproject/contracts";

import { Provider, Signer } from "@ethersproject/abstract-provider";

export interface LimitOrderAccountFactoryInterface extends Interface {
  functions: {
    "accountImplementation()": FunctionFragment;
    "createAccount(address,uint256)": FunctionFragment;
    "getAddress(address,uint256)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "accountImplementation"
      | "createAccount"
      | "getAddress"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "accountImplementation",
    values?: undefined
  ): string;

  encodeFunctionData(
    functionFragment: "createAccount",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;

  encodeFunctionData(
    functionFragment: "getAddress",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;

  decodeFunctionResult(
    functionFragment: "accountImplementation",
    data: BytesLike
  ): Result;

  decodeFunctionResult(
    functionFragment: "createAccount",
    data: BytesLike
  ): Result;

  decodeFunctionResult(functionFragment: "getAddress", data: BytesLike): Result;

  events: {
    "newAccount(address)": TypedEventFilter<[string], { newAccount: string }>;
  };
}

export interface LimitOrderAccountFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;
  interface: LimitOrderAccountFactoryInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    accountImplementation(overrides?: CallOverrides): Promise<[string]>;

    createAccount(
      owner: PromiseOrValue<string>,
      salt: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getAddress(
      owner: PromiseOrValue<string>,
      salt: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  accountImplementation(overrides?: CallOverrides): Promise<string>;

  createAccount(
    owner: PromiseOrValue<string>,
    salt: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getAddress(
    owner: PromiseOrValue<string>,
    salt: PromiseOrValue<BigNumberish>,
    overrides?: CallOverrides
  ): Promise<string>;

  callStatic: {
    accountImplementation(overrides?: CallOverrides): Promise<string>;
    createAccount(
      owner: PromiseOrValue<string>,
      salt: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;
    getAddress(
      owner: PromiseOrValue<string>,
      salt: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {
    newAccount(
      newAccount?: string | null
    ): TypedEventFilter<[string], { newAccount: string }>;
  };

  estimateGas: {
    accountImplementation(overrides?: CallOverrides): Promise<BigNumber>;
    createAccount(
      owner: PromiseOrValue<string>,
      salt: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;
    getAddress(
      owner: PromiseOrValue<string>,
      salt: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    accountImplementation(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
    createAccount(
      owner: PromiseOrValue<string>,
      salt: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;
    getAddress(
      owner: PromiseOrValue<string>,
      salt: PromiseOrValue<BigNumberish>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
