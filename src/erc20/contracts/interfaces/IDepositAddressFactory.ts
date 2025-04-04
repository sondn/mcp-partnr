/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumber,
  BigNumberish,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import type {
  FunctionFragment,
  Result,
  EventFragment,
} from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
  PromiseOrValue,
} from "../../common";

export declare namespace IDepositAddressFactory {
  export type CollectRequestStruct = {
    from: PromiseOrValue<string>;
    to: PromiseOrValue<string>[];
    data: PromiseOrValue<BytesLike>[];
    values: PromiseOrValue<BigNumberish>[];
  };

  export type CollectRequestStructOutput = [
    string,
    string[],
    string[],
    BigNumber[]
  ] & { from: string; to: string[]; data: string[]; values: BigNumber[] };
}

export interface IDepositAddressFactoryInterface extends utils.Interface {
  functions: {
    "collect((address,address[],bytes[],uint256[]))": FunctionFragment;
    "deployDepositAddress(address,string)": FunctionFragment;
    "getDepositAddress(address,string)": FunctionFragment;
  };

  getFunction(
    nameOrSignatureOrTopic:
      | "collect"
      | "deployDepositAddress"
      | "getDepositAddress"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "collect",
    values: [IDepositAddressFactory.CollectRequestStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "deployDepositAddress",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;
  encodeFunctionData(
    functionFragment: "getDepositAddress",
    values: [PromiseOrValue<string>, PromiseOrValue<string>]
  ): string;

  decodeFunctionResult(functionFragment: "collect", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "deployDepositAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDepositAddress",
    data: BytesLike
  ): Result;

  events: {
    "DepositAddressCreated(address,address,string)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "DepositAddressCreated"): EventFragment;
}

export interface DepositAddressCreatedEventObject {
  depositAddress: string;
  userOrApp: string;
  extra: string;
}
export type DepositAddressCreatedEvent = TypedEvent<
  [string, string, string],
  DepositAddressCreatedEventObject
>;

export type DepositAddressCreatedEventFilter =
  TypedEventFilter<DepositAddressCreatedEvent>;

export interface IDepositAddressFactory extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: IDepositAddressFactoryInterface;

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
    collect(
      request: IDepositAddressFactory.CollectRequestStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    deployDepositAddress(
      userOrApp: PromiseOrValue<string>,
      extra: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<ContractTransaction>;

    getDepositAddress(
      userOrApp: PromiseOrValue<string>,
      extra: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<[string]>;
  };

  collect(
    request: IDepositAddressFactory.CollectRequestStruct,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  deployDepositAddress(
    userOrApp: PromiseOrValue<string>,
    extra: PromiseOrValue<string>,
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<ContractTransaction>;

  getDepositAddress(
    userOrApp: PromiseOrValue<string>,
    extra: PromiseOrValue<string>,
    overrides?: CallOverrides
  ): Promise<string>;

  callStatic: {
    collect(
      request: IDepositAddressFactory.CollectRequestStruct,
      overrides?: CallOverrides
    ): Promise<void>;

    deployDepositAddress(
      userOrApp: PromiseOrValue<string>,
      extra: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<void>;

    getDepositAddress(
      userOrApp: PromiseOrValue<string>,
      extra: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<string>;
  };

  filters: {
    "DepositAddressCreated(address,address,string)"(
      depositAddress?: null,
      userOrApp?: null,
      extra?: null
    ): DepositAddressCreatedEventFilter;
    DepositAddressCreated(
      depositAddress?: null,
      userOrApp?: null,
      extra?: null
    ): DepositAddressCreatedEventFilter;
  };

  estimateGas: {
    collect(
      request: IDepositAddressFactory.CollectRequestStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    deployDepositAddress(
      userOrApp: PromiseOrValue<string>,
      extra: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<BigNumber>;

    getDepositAddress(
      userOrApp: PromiseOrValue<string>,
      extra: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    collect(
      request: IDepositAddressFactory.CollectRequestStruct,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    deployDepositAddress(
      userOrApp: PromiseOrValue<string>,
      extra: PromiseOrValue<string>,
      overrides?: Overrides & { from?: PromiseOrValue<string> }
    ): Promise<PopulatedTransaction>;

    getDepositAddress(
      userOrApp: PromiseOrValue<string>,
      extra: PromiseOrValue<string>,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
