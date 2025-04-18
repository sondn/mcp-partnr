/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type {
  TestProtocolFactory,
  TestProtocolFactoryInterface,
} from "../../../../contracts/utils/TestProtocolFactory.sol/TestProtocolFactory";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_underlying",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Burned",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Minted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "burn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "underlying",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60a06040523480156200001157600080fd5b5060405162000cfd38038062000cfd8339810160408190526200003491620000ad565b6040518060400160405280600d81526020016c15195cdd08141c9bdd1bd8dbdb609a1b815250604051806040016040528060058152602001641e151154d560da1b815250816003908162000089919062000184565b50600462000098828262000184565b5050506001600160a01b031660805262000250565b600060208284031215620000c057600080fd5b81516001600160a01b0381168114620000d857600080fd5b9392505050565b634e487b7160e01b600052604160045260246000fd5b600181811c908216806200010a57607f821691505b6020821081036200012b57634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156200017f57600081815260208120601f850160051c810160208610156200015a5750805b601f850160051c820191505b818110156200017b5782815560010162000166565b5050505b505050565b81516001600160401b03811115620001a057620001a0620000df565b620001b881620001b18454620000f5565b8462000131565b602080601f831160018114620001f05760008415620001d75750858301515b600019600386901b1c1916600185901b1785556200017b565b600085815260208120601f198616915b82811015620002215788860151825594840194600190910190840162000200565b5085821015620002405787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b608051610a836200027a600039600081816101480152818161030501526103810152610a836000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c80636f307dc3116100715780636f307dc31461014357806370a082311461018257806395d89b41146101ab578063a0712d68146101b3578063a9059cbb146101c6578063dd62ed3e146101d957600080fd5b806306fdde03146100b9578063095ea7b3146100d757806318160ddd146100fa57806323b872dd1461010c578063313ce5671461011f57806342966c681461012e575b600080fd5b6100c1610212565b6040516100ce9190610873565b60405180910390f35b6100ea6100e53660046108dd565b6102a4565b60405190151581526020016100ce565b6002545b6040519081526020016100ce565b6100ea61011a366004610907565b6102be565b604051601281526020016100ce565b61014161013c366004610943565b6102e2565b005b61016a7f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020016100ce565b6100fe61019036600461095c565b6001600160a01b031660009081526020819052604090205490565b6100c1610365565b6101416101c1366004610943565b610374565b6100ea6101d43660046108dd565b6103f8565b6100fe6101e736600461097e565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b606060038054610221906109b1565b80601f016020809104026020016040519081016040528092919081815260200182805461024d906109b1565b801561029a5780601f1061026f5761010080835404028352916020019161029a565b820191906000526020600020905b81548152906001019060200180831161027d57829003601f168201915b5050505050905090565b6000336102b2818585610406565b60019150505b92915050565b6000336102cc858285610418565b6102d785858561049c565b506001949350505050565b6102ec33826104fb565b61032c336102fb836002610a01565b6001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169190610535565b60405181815233907f696de425f79f4a40bc6d2122ca50507f0efbeabbff86a84871b7196ab8ea8df7906020015b60405180910390a250565b606060048054610221906109b1565b6103a96001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016333084610594565b6103bd336103b8600284610a18565b6105cd565b337f30385c845b448a36257a6a1716e6ad2e1bc2cbe333cde1e69fe849ad6511adfe6103ea600284610a18565b60405190815260200161035a565b6000336102b281858561049c565b6104138383836001610603565b505050565b6001600160a01b03838116600090815260016020908152604080832093861683529290522054600019811015610496578181101561048757604051637dc7a0d960e11b81526001600160a01b038416600482015260248101829052604481018390526064015b60405180910390fd5b61049684848484036000610603565b50505050565b6001600160a01b0383166104c657604051634b637e8f60e11b81526000600482015260240161047e565b6001600160a01b0382166104f05760405163ec442f0560e01b81526000600482015260240161047e565b6104138383836106d8565b6001600160a01b03821661052557604051634b637e8f60e11b81526000600482015260240161047e565b610531826000836106d8565b5050565b6040516001600160a01b0383811660248301526044820183905261041391859182169063a9059cbb906064015b604051602081830303815290604052915060e01b6020820180516001600160e01b038381831617835250505050610802565b6040516001600160a01b0384811660248301528381166044830152606482018390526104969186918216906323b872dd90608401610562565b6001600160a01b0382166105f75760405163ec442f0560e01b81526000600482015260240161047e565b610531600083836106d8565b6001600160a01b03841661062d5760405163e602df0560e01b81526000600482015260240161047e565b6001600160a01b03831661065757604051634a1406b160e11b81526000600482015260240161047e565b6001600160a01b038085166000908152600160209081526040808320938716835292905220829055801561049657826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040516106ca91815260200190565b60405180910390a350505050565b6001600160a01b0383166107035780600260008282546106f89190610a3a565b909155506107759050565b6001600160a01b038316600090815260208190526040902054818110156107565760405163391434e360e21b81526001600160a01b0385166004820152602481018290526044810183905260640161047e565b6001600160a01b03841660009081526020819052604090209082900390555b6001600160a01b038216610791576002805482900390556107b0565b6001600160a01b03821660009081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516107f591815260200190565b60405180910390a3505050565b600080602060008451602086016000885af180610825576040513d6000823e3d81fd5b50506000513d9150811561083d57806001141561084a565b6001600160a01b0384163b155b1561049657604051635274afe760e01b81526001600160a01b038516600482015260240161047e565b600060208083528351808285015260005b818110156108a057858101830151858201604001528201610884565b506000604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b03811681146108d857600080fd5b919050565b600080604083850312156108f057600080fd5b6108f9836108c1565b946020939093013593505050565b60008060006060848603121561091c57600080fd5b610925846108c1565b9250610933602085016108c1565b9150604084013590509250925092565b60006020828403121561095557600080fd5b5035919050565b60006020828403121561096e57600080fd5b610977826108c1565b9392505050565b6000806040838503121561099157600080fd5b61099a836108c1565b91506109a8602084016108c1565b90509250929050565b600181811c908216806109c557607f821691505b6020821081036109e557634e487b7160e01b600052602260045260246000fd5b50919050565b634e487b7160e01b600052601160045260246000fd5b80820281158282048414176102b8576102b86109eb565b600082610a3557634e487b7160e01b600052601260045260246000fd5b500490565b808201808211156102b8576102b86109eb56fea26469706673582212205657d4da5205f65198ec91560d97a975fc0c77039764d0e37f21065c90b1b8b164736f6c63430008140033";

type TestProtocolFactoryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TestProtocolFactoryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TestProtocolFactory__factory extends ContractFactory {
  constructor(...args: TestProtocolFactoryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    _underlying: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(_underlying, overrides || {});
  }
  override deploy(
    _underlying: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(_underlying, overrides || {}) as Promise<
      TestProtocolFactory & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(
    runner: ContractRunner | null
  ): TestProtocolFactory__factory {
    return super.connect(runner) as TestProtocolFactory__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TestProtocolFactoryInterface {
    return new Interface(_abi) as TestProtocolFactoryInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): TestProtocolFactory {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as TestProtocolFactory;
  }
}
