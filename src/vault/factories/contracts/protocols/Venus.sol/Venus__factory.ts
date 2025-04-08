/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type {
  Venus,
  VenusInterface,
} from "../../../../contracts/protocols/Venus.sol/Venus";

const _abi = [
  {
    inputs: [],
    name: "InvalidInitialization",
    type: "error",
  },
  {
    inputs: [],
    name: "NotInitializing",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "underlying",
        type: "address",
      },
      {
        internalType: "contract VBep20Interface",
        name: "vToken",
        type: "address",
      },
    ],
    name: "addVToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IEVMVault",
        name: "vault",
        type: "address",
      },
    ],
    name: "getPricePerShare",
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
        internalType: "contract IEVMVault",
        name: "vault",
        type: "address",
      },
    ],
    name: "getVaultValue",
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
        name: "_owner",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IEVMVault",
        name: "vault",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "onDeposit",
    outputs: [
      {
        internalType: "address[]",
        name: "targets",
        type: "address[]",
      },
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IEVMVault",
        name: "vault",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "onWithdraw",
    outputs: [
      {
        internalType: "address[]",
        name: "targets",
        type: "address[]",
      },
      {
        internalType: "bytes[]",
        name: "data",
        type: "bytes[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "underlying",
        type: "address",
      },
    ],
    name: "removeVToken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "vTokens",
    outputs: [
      {
        internalType: "contract VBep20Interface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50611051806100206000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c80638da5cb5b116100715780638da5cb5b146101895780639566433a146101b9578063c4d66de8146101cc578063ccad973d146101df578063ec422afd146101f2578063f2fde38b1461020557600080fd5b80632ad391ec146100b95780632bf9518c146100ce5780633fc0b8a7146100f85780635371f1f81461010b578063715018a61461014c57806375b238fc14610154575b600080fd5b6100cc6100c7366004610e15565b610218565b005b6100e16100dc366004610e32565b610247565b6040516100ef929190610e5e565b60405180910390f35b6100cc610106366004610f2e565b6106a3565b610134610119366004610e15565b6000602081905290815260409020546001600160a01b031681565b6040516001600160a01b0390911681526020016100ef565b6100cc6106d9565b61017b7fa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c2177581565b6040519081526020016100ef565b7f9016d09d72d40fdae2fd8ceac6b6234c7706214fd39c1cd1e609a0528c199300546001600160a01b0316610134565b61017b6101c7366004610e15565b6106ed565b6100cc6101da366004610e15565b610869565b6100e16101ed366004610e32565b610979565b61017b610200366004610e15565b610b19565b6100cc610213366004610e15565b610c94565b610220610cd2565b6001600160a01b0316600090815260208190526040902080546001600160a01b0319169055565b6060806000846001600160a01b0316636f307dc36040518163ffffffff1660e01b8152600401602060405180830381865afa15801561028a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102ae9190610f67565b6001600160a01b0380821660009081526020819052604090205491925016806103135760405162461bcd60e51b8152602060048201526012602482015271496e76616c696420756e6465726c79696e6760701b60448201526064015b60405180910390fd5b6040516370a0823160e01b81526001600160a01b038781166004830152600091908416906370a0823190602401602060405180830381865afa15801561035d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103819190610f84565b9050858110156103ca5760405162461bcd60e51b8152602060048201526014602482015273496e73756666696369656e742062616c616e636560601b604482015260640161030a565b604051636eb1769f60e11b81526001600160a01b03888116600483015283811660248301526000919085169063dd62ed3e90604401602060405180830381865afa15801561041c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104409190610f84565b9050868110156105ca5760408051600280825260608201835290916020830190803683370190505060408051600280825260608201909252919750816020015b606081526020019060019003908161048057905050945083866000815181106104ab576104ab610f9d565b6001600160a01b039092166020928302919091019091015263095ea7b360e01b836104d6838a610fc9565b6040516001600160a01b0390921660248301526044820152606401604051602081830303815290604052906001600160e01b0319166020820180516001600160e01b0383818316178352505050508560008151811061053757610537610f9d565b6020026020010181905250828660018151811061055657610556610f9d565b6001600160a01b03929092166020928302919091018201526040805160248082018b905282518083039091018152604490910190915290810180516001600160e01b031663140e25ad60e31b1790528551869060019081106105ba576105ba610f9d565b6020026020010181905250610698565b604080516001808252818301909252906020808301908036833701905050604080516001808252818301909252919750816020015b60608152602001906001900390816105ff579050509450828660008151811061062a5761062a610f9d565b6001600160a01b03929092166020928302919091018201526040805160248082018b905282518083039091018152604490910190915290810180516001600160e01b031663140e25ad60e31b1790528551869060009061068c5761068c610f9d565b60200260200101819052505b505050509250929050565b6106ab610cd2565b6001600160a01b03918216600090815260208190526040902080546001600160a01b03191691909216179055565b6106e1610cd2565b6106eb6000610d2d565b565b600080600080846001600160a01b0316636f307dc36040518163ffffffff1660e01b8152600401602060405180830381865afa158015610731573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107559190610f67565b6001600160a01b0390811682526020820192909252604090810160009081205491516370a0823160e01b8152868416600482015291909216925082906370a0823190602401602060405180830381865afa1580156107b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906107db9190610f84565b90506000826001600160a01b031663182df0f56040518163ffffffff1660e01b8152600401602060405180830381865afa15801561081d573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108419190610f84565b9050670de0b6b3a76400006108568284610fe2565b6108609190610ff9565b95945050505050565b7ff0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a008054600160401b810460ff16159067ffffffffffffffff166000811580156108af5750825b905060008267ffffffffffffffff1660011480156108cc5750303b155b9050811580156108da575080155b156108f85760405163f92ee8a960e01b815260040160405180910390fd5b845467ffffffffffffffff19166001178555831561092257845460ff60401b1916600160401b1785555b61092b86610d9e565b831561097157845460ff60401b19168555604051600181527fc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d29060200160405180910390a15b505050505050565b6060806000806000866001600160a01b0316636f307dc36040518163ffffffff1660e01b8152600401602060405180830381865afa1580156109bf573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109e39190610f67565b6001600160a01b03908116825260208201929092526040016000205416905080610a445760405162461bcd60e51b8152602060048201526012602482015271496e76616c696420756e6465726c79696e6760701b604482015260640161030a565b604080516001808252818301909252906020808301908036833701905050604080516001808252818301909252919450816020015b6060815260200190600190039081610a795790505091508083600081518110610aa457610aa4610f9d565b6001600160a01b039290921660209283029190910182015260408051602480820188905282518083039091018152604490910190915290810180516001600160e01b031663852a12e360e01b17905282518390600090610b0657610b06610f9d565b6020026020010181905250509250929050565b600080600080846001600160a01b0316636f307dc36040518163ffffffff1660e01b8152600401602060405180830381865afa158015610b5d573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610b819190610f67565b6001600160a01b03166001600160a01b0316815260200190815260200160002060009054906101000a90046001600160a01b03169050826001600160a01b03166318160ddd6040518163ffffffff1660e01b8152600401602060405180830381865afa158015610bf5573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c199190610f84565b6040516370a0823160e01b81526001600160a01b0385811660048301528316906370a0823190602401602060405180830381865afa158015610c5f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c839190610f84565b610c8d9190610ff9565b9392505050565b610c9c610cd2565b6001600160a01b038116610cc657604051631e4fbdf760e01b81526000600482015260240161030a565b610ccf81610d2d565b50565b33610d047f9016d09d72d40fdae2fd8ceac6b6234c7706214fd39c1cd1e609a0528c199300546001600160a01b031690565b6001600160a01b0316146106eb5760405163118cdaa760e01b815233600482015260240161030a565b7f9016d09d72d40fdae2fd8ceac6b6234c7706214fd39c1cd1e609a0528c19930080546001600160a01b031981166001600160a01b03848116918217845560405192169182907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a3505050565b610da6610daf565b610ccf81610df8565b7ff0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a0054600160401b900460ff166106eb57604051631afcd79f60e31b815260040160405180910390fd5b610c9c610daf565b6001600160a01b0381168114610ccf57600080fd5b600060208284031215610e2757600080fd5b8135610c8d81610e00565b60008060408385031215610e4557600080fd5b8235610e5081610e00565b946020939093013593505050565b604080825283519082018190526000906020906060840190828701845b82811015610ea05781516001600160a01b031684529284019290840190600101610e7b565b50505083810382850152845180825282820190600581901b8301840187850160005b83811015610f1f57601f19808785030186528251805180865260005b81811015610ef9578281018b01518782018c01528a01610ede565b5060008682018b015296890196601f019091169093018701925090860190600101610ec2565b50909998505050505050505050565b60008060408385031215610f4157600080fd5b8235610f4c81610e00565b91506020830135610f5c81610e00565b809150509250929050565b600060208284031215610f7957600080fd5b8151610c8d81610e00565b600060208284031215610f9657600080fd5b5051919050565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b81810381811115610fdc57610fdc610fb3565b92915050565b8082028115828204841417610fdc57610fdc610fb3565b60008261101657634e487b7160e01b600052601260045260246000fd5b50049056fea26469706673582212200c6f7e7404449db50009332fc69d200aa39cede3c772d94278d0b5a1501d2e3a64736f6c63430008140033";

type VenusConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VenusConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Venus__factory extends ContractFactory {
  constructor(...args: VenusConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      Venus & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): Venus__factory {
    return super.connect(runner) as Venus__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VenusInterface {
    return new Interface(_abi) as VenusInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): Venus {
    return new Contract(address, _abi, runner) as unknown as Venus;
  }
}
