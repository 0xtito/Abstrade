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

/**
 * A variaiton of the SimpleAccount from @account-abstraction/contracts, just designed it
 * for the LimitOrderAccount
 */
export interface LimitOrderAccountInterface extends Interface {
  functions: {
    "addDeposit()": FunctionFragment;
    "entryPoint()": FunctionFragment;
    "execute(address,uint256,bytes)": FunctionFragment;
    "executeBatch(address[],bytes[])": FunctionFragment;
    "getDeposit()": FunctionFragment;
    "initialize(address)": FunctionFragment;
    "nonce()": FunctionFragment;
    "owner()": FunctionFragment;
    "proxiableUUID()": FunctionFragment;
    "upgradeTo(address)": FunctionFragment;
    "upgradeToAndCall(address,bytes)": FunctionFragment;
    "validateUserOp((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes),bytes32,uint256)": FunctionFragment;
    "withdrawDepositTo(address,uint256)": FunctionFragment;
    "limitOrder(address,address,uint256,uint256,uint256)": FunctionFragment;
    "cancelLimitOrder(bytes32)": FunctionFragment;
    "getLimitOrder(bytes32)": FunctionFragment;
  };
  getFunction(
    nameOrSignatureOrTopic:
      | "addDeposit"
      | "entryPoint"
      | "execute"
      | "executeBatch"
      | "getDeposit"
      | "initialize"
      | "nonce"
      | "owner"
      | "proxiableUUID"
      | "upgradeTo"
      | "upgradeToAndCall"
      | "validateUserOp"
      | "withdrawDepositTo"
      | "limitOrder"
      | "cancelLimitOrder"
      | "getLimitOrder"
  ): FunctionFragment;
  encodeFunctionData(
    functionFragment: "addDeposit",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "entryPoint",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "execute",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "executeBatch",
    values: [PromiseOrValue<string>[], PromiseOrValue<BytesLike>[]]
  ): string;
  encodeFunctionData(
    functionFragment: "getDeposit",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(functionFragment: "nonce", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "proxiableUUID",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeTo",
    values: [PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "upgradeToAndCall",
    values: [PromiseOrValue<string>, PromiseOrValue<BytesLike>]
  ): string;
  encodeFunctionData(
    functionFragment: "validateUserOp",
    values: [
      UserOperationStruct,
      PromiseOrValue<BytesLike>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawDepositTo",
    values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]
  ): string;
  encodeFunctionData(
    functionFragment: "createLimitOrder",
    values: [
      PromiseOrValue<string>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BigNumberish>
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "cancelLimitOrder",
    values: [PromiseOrValue<number>]
  ): string;
  encodeFunctionData(
    functionFragment: "fillLimitOrder",
    values: [
      PromiseOrValue<number>,
      PromiseOrValue<string>,
      PromiseOrValue<BigNumberish>,
      PromiseOrValue<BytesLike>
    ]
  ): string;
  decodeFunctionResult(functionFragment: "addDeposit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "entryPoint", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "execute", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "executeBatch",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getDeposit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "nonce", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "proxiableUUID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "upgradeTo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "upgradeToAndCall",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "validateUserOp",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "withdrawDepositTo",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "limitOrder", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "cancelLimitOrder",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLimitOrder",
    data: BytesLike
  ): Result;
  events: {
    "AdminChanged(address,address)": EventFragment;
    "BeaconUpgraded(address)": EventFragment;
    "Initialized(uint8)": EventFragment;
    "LimitOrderAccountInitialized(address,address)": EventFragment;
    "Upgraded(address)": EventFragment;
    "LimitOrderPlaced(bytes32,address,address,uint256,uint256,uint256)": EventFragment;
    "LimitOrderCancelled(bytes32)": EventFragment;
  };
  getEvent(nameOrSignatureOrTopic: "AdminChanged"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "BeaconUpgraded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Initialized"): EventFragment;
  getEvent(
    nameOrSignatureOrTopic: "LimitOrderAccountInitialized"
  ): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Upgraded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LimitOrderPlaced"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "LimitOrderCancelled"): EventFragment;
}

export interface LimitOrderAccount extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;
  interface: LimitOrderAccountInterface;

  // Add your LimitOrderAccount specific methods and events here
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
    nonce(overrides?: CallOverrides): Promise<[BigNumber]>;
    entryPoint(overrides?: CallOverrides): Promise<[string]>;
    limitOrders(
      orderId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[ILimitOrder]>;

    execute(
      dest: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      func: PromiseOrValue<BytesLike>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<ContractTransaction>;
    executeBatch(
      dest: PromiseOrValue<string>[],
      func: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<ContractTransaction>;

    createLimitOrder(
      tokenOut: PromiseOrValue<string>,
      tokenIn: PromiseOrValue<string>,
      expiry: PromiseOrValue<BigNumberish>,
      orderAmount: PromiseOrValue<BigNumberish>,
      rate: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<ContractTransaction>;
    cancelLimitOrder(
      orderId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<ContractTransaction>;
    fillLimitOrder(
      orderId: PromiseOrValue<BigNumberish>,
      filler: PromiseOrValue<string>,
      fillAmount: PromiseOrValue<BigNumberish>,
      params: PromiseOrValue<BytesLike>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<ContractTransaction>;

    getDeposit(overrides?: CallOverrides): Promise<[BigNumber]>;
    addDeposit(
      overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<ContractTransaction>;
    withdrawDepositTo(
      withdrawAddress: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<ContractTransaction>;
  };

  // Add your LimitOrderAccount specific methods and events here
  nonce(overrides?: CallOverrides): Promise<BigNumber>;
  entryPoint(overrides?: CallOverrides): Promise<string>;
  limitOrders(
    orderId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<ILimitOrder>;

  execute(
    dest: PromiseOrValue<string>,
    value: PromiseOrValue<BigNumberish>,
    func: PromiseOrValue<BytesLike>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    }
  ): Promise<ContractTransaction>;
  executeBatch(
    dest: PromiseOrValue<string>[],
    func: PromiseOrValue<BytesLike>[],
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    }
  ): Promise<ContractTransaction>;

  createLimitOrder(
    tokenOut: PromiseOrValue<string>,
    tokenIn: PromiseOrValue<string>,
    expiry: PromiseOrValue<BigNumberish>,
    orderAmount: PromiseOrValue<BigNumberish>,
    rate: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    }
  ): Promise<ContractTransaction>;
  cancelLimitOrder(
    orderId: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    }
  ): Promise<ContractTransaction>;
  fillLimitOrder(
    orderId: PromiseOrValue<BigNumberish>,
    filler: PromiseOrValue<string>,
    fillAmount: PromiseOrValue<BigNumberish>,
    params: PromiseOrValue<BytesLike>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    }
  ): Promise<ContractTransaction>;

  getDeposit(overrides?: CallOverrides): Promise<BigNumber>;
  addDeposit(
    overrides?: PayableOverrides & {
      from?: PromiseOrValue<string>;
    }
  ): Promise<ContractTransaction>;
  withdrawDepositTo(
    withdrawAddress: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & {
      from?: PromiseOrValue<string>;
    }
  ): Promise<ContractTransaction>;

  // Add your LimitOrderAccount specific events here
  filters: {
    LimitOrderCreated(orderId?: null): LimitOrderCreatedEventFilter;
    LimitOrderCanceled(orderId?: null): LimitOrderCanceledEventFilter;
    LimitOrderFilled(orderId?: null): LimitOrderFilledEventFilter;
  };

  estimateGas: {
    nonce(overrides?: CallOverrides): Promise<BigNumber>;
    entryPoint(overrides?: CallOverrides): Promise<BigNumber>;
    limitOrders(
      orderId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    execute(
      dest: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      func: PromiseOrValue<BytesLike>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<BigNumber>;
    executeBatch(
      dest: PromiseOrValue<string>[],
      func: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<BigNumber>;

    createLimitOrder(
      tokenOut: PromiseOrValue<string>,
      tokenIn: PromiseOrValue<string>,
      expiry: PromiseOrValue<BigNumberish>,
      orderAmount: PromiseOrValue<BigNumberish>,
      rate: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<BigNumber>;
    cancelLimitOrder(
      orderId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<BigNumber>;
    fillLimitOrder(
      orderId: PromiseOrValue<BigNumberish>,
      filler: PromiseOrValue<string>,
      fillAmount: PromiseOrValue<BigNumberish>,
      params: PromiseOrValue<BytesLike>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<BigNumber>;

    getDeposit(overrides?: CallOverrides): Promise<BigNumber>;
    addDeposit(
      overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<BigNumber>;
    withdrawDepositTo(
      withdrawAddress: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    nonce(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    entryPoint(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    limitOrders(
      orderId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    execute(
      dest: PromiseOrValue<string>,
      value: PromiseOrValue<BigNumberish>,
      func: PromiseOrValue<BytesLike>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<PopulatedTransaction>;
    executeBatch(
      dest: PromiseOrValue<string>[],
      func: PromiseOrValue<BytesLike>[],
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<PopulatedTransaction>;

    createLimitOrder(
      tokenOut: PromiseOrValue<string>,
      tokenIn: PromiseOrValue<string>,
      expiry: PromiseOrValue<BigNumberish>,
      orderAmount: PromiseOrValue<BigNumberish>,
      rate: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<PopulatedTransaction>;
    cancelLimitOrder(
      orderId: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<PopulatedTransaction>;
    fillLimitOrder(
      orderId: PromiseOrValue<BigNumberish>,
      filler: PromiseOrValue<string>,
      fillAmount: PromiseOrValue<BigNumberish>,
      params: PromiseOrValue<BytesLike>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<PopulatedTransaction>;

    getDeposit(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    addDeposit(
      overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<PopulatedTransaction>;
    withdrawDepositTo(
      withdrawAddress: PromiseOrValue<string>,
      amount: PromiseOrValue<BigNumberish>,
      overrides?: Overrides & {
        from?: PromiseOrValue<string>;
      }
    ): Promise<PopulatedTransaction>;
  };
}
