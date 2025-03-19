#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

import { PartnrClient, Fee, WithdrawTerm, DepositRule } from "./PartnrClient";

// Type definitions for tool arguments
interface ListTokenArgs {
  id?: string;
  name?: string;
  symbol?: string;
  address?: string;
  chainId?: string;
  protocol?: string;
  status?: number;
  assetId?: string;
}

// interface ListVaultArgs {
//   name?: string;
//   creatorId?: string;
//   filterStatus?: string;
//   contractAddress?: string;
// }

interface VaultDetailArgs {
  vaultId: string;
}
interface ListWithdrawArgs {
  vaultId: string;
}
interface ApproveWithdrawArgs {
  withdrawId: string;
}
interface ApproveAllWithdrawArgs {
  vaultId: string;
}

interface VaultUpdateArgs {
    vaultId: string;
    logo?: string;
    description?: string;
    withdrawLockUpPeriod?: number;
    withdrawDelay?: number;
    performanceFee?: number;
    feeRecipientAddress?: string;
    protocolIds?: string[];
    depositMin?: number;
    depositMax?: number;
}

interface CreateVaultArgs {
  name: string;
  symbol: string;
  tokenId: string;
  // Deposit Rule
  depositMin: number;
  depositMax: number;
  limitWallets?: number;

  // Fee
  performanceFee: number;
  feeRecipientAddress: string;
  exitFee?: number;
  exitFeeLocate?: any;

  // Withdraw Term
  withdrawLockUpPeriod: number; // Withdraw lock after deposit, by second
  withdrawDelay: number; // Withdraw delay by second
  isMultiSig?: boolean;
  
  protocolIds: string[];
  defaultProtocolId: string;

  aiAgent?: any;
  depositInit?: {
    networkId: string;
    amountDeposit: number;
  };
  logo?: string;
  description?: string;
}

// Tool definitions
const listChainsTool: Tool = {
  name: "partnr_list_chains",
  description: "List supported chains on Partnr Backend",
  inputSchema: {
    type: "object",
    properties: {
      chainType: {
        type: "string",
        description: "Chain type EVM, SOLANA, APTOS, TON",
        default: "EVM",
      },
    },
  },
};

const listProtocolsTool: Tool = {
  name: "partnr_list_protocols",
  description: "List supported protocols on Partnr Backend",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "number",
        description: "Status of protocol",
        default: 1
      },
    },
  },
};

const listTokensTool: Tool = {
  name: "partnr_list_tokens",
  description: "List supported tokens on Partnr Backend by chainId",
  inputSchema: {
    type: "object",
    properties: {
      chainId: {
        type: "string",
        description: "The ID of the chain to list",
      },
    },
    required: ["chainId"],
  },
};

const createVaultTool: Tool = {
  name: "partnr_create_vault",
  description: "Create new Vault on Partnr Backend, name, symbol, tokenId, protocolIds input by user",
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the Vault to create",
      },
      logo: {
        type: "string",
        description: "Logo of the Vault to create, image url",
      },
      description: {
        type: "string",
        description: "Description of the Vault to create",
      },
      symbol: {
        type: "string",
        description: "Token symbol of the Vault to create",
      },
      tokenId: {
        type: "string",
        description: "tokenId of the Vault to create, format UUID, get from id field of tool list tokens",
      },
      protocolIds: {
        type: "array",
        items: { type: "string" },
        description: "List protocolIds of the Vault to create, can select multiple protocols"
      },
      defaultProtocolId: {
        type: "string",
        description: "default protocolId of the Vault to create"
      },
      depositMin: {
        type: "number",
        description: "Minimum deposit to Vault, without token decimals",
        default: 0,
      },
      depositMax: {
        type: "number",
        description: "Maximum deposit to Vault, without token decimals",
        default: 1000
      },
      performanceFee: {
        type: "number",
        description: "performance fee",
        default: 5,
        minimum: 5
      },
      feeRecipientAddress: {
        type: "string",
        description: "wallet address to receive fee",
        default: ""
      },
      exitFee: {
        type: "number",
        description: "exit fee",
        default: 0
      },
      withdrawLockUpPeriod: {
        type: "number",
        description: "Withdraw lock period after deposit, second unit",
        default: 0
      },
      withdrawDelay: {
        type: "number",
        description: "Withdraw delay time, second unit",
        default: 3600
      },
    },
    required: ["name", "symbol", "tokenId", "protocolIds", "defaultProtocolId", "depositMin", "depositMax", "performanceFee", "feeRecipientAddress", "withdrawLockUpPeriod", "withdrawDelay"],
  },
};

const listVaultsTool: Tool = {
  name: "partnr_list_vaults",
  description: "List your created vaults on Partnr Backend",
  inputSchema: {
    type: "object",
    properties: {},
  },
};

const vaultDetailTool: Tool = {
  name: "partnr_vault_detail",
  description: "Get detail of Vault by id on Partnr System",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "The ID of the vault to get detail",
      },
    },
    required: ["vaultId"],
  },
};

const vaultUpdateTool: Tool = {
  name: "partnr_update_vault",
  description: "Update exist Vault on Partnr System",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "Id of the Vault to update",
      },
      logo: {
        type: "string",
        description: "Logo of the Vault to update, image url",
      },
      description: {
        type: "string",
        description: "Description of the Vault to update",
      },
      withdrawLockUpPeriod: {
        type: "number",
        description: "Withdraw lock-up period of the Vault to update",
      },
      withdrawDelay: {
        type: "number",
        description: "Withdraw delay of the Vault to update",
      },
      performanceFee: {
        type: "number",
        description: "performance fee",
        minimum: 5
      },
      feeRecipientAddress: {
        type: "string",
        description: "wallet address to receive fee"
      },
      depositMin: {
        type: "number",
        description: "Minimal deposit of the Vault",
      },
      depositMax: {
        type: "number",
        description: "Maximum deposit of the Vault",
      },
      protocolIds: {
        type: "array",
        items: { type: "string" },
        description: "List protocolIds of the Vault to create, can select multiple protocols"
      },
    },
    required: ["vaultId"],
  },
};

const approveWithdrawRequestsTool: Tool = {
  name: "partnr_approve_withdraw_request",
  description: "Approve withdraw by withdrawId on Partnr System",
  inputSchema: {
    type: "object",
    properties: {
      withdrawId: {
        type: "string",
        description: "The ID of the withdraw to approve",
      },
    },
    required: ["withdrawId"],
  },
};

const approveAllWithdrawRequestTool: Tool = {
  name: "partnr_approve_all_withdraw",
  description: "Approve all withdraw requests from a Vault on Partnr System",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "The ID of the vault to approve all withdraw requests",
      },
    },
    required: ["vaultId"],
  },
};

const listWithdrawRequestsTool: Tool = {
  name: "partnr_list_withdraw_requests",
  description: "List all withdraw requests from a Vault on Partnr System",
  inputSchema: {
    type: "object",
    properties: {
      vaultId: {
        type: "string",
        description: "The ID of the vault to approve all withdraw requests",
      },
      status: {
        type: "string",
        description: "Status of requests",
        //default: ""
      },
    },
    required: ["vaultId"],
  },
};

async function main() {
  const evmPrivateKey = process.env.EVM_PRIVATE_KEY;
  const baseUrl = process.env.BASE_URL || "https://vault-api.partnr.xyz";
  const vaultFactoryEvmAddress = process.env.VAULT_FACTORY_EVM_ADDRESS || "0x272eb06953d92454215c1B050d14aeFC477451c7";

  if (!evmPrivateKey || !baseUrl || !vaultFactoryEvmAddress) {
    console.error(
      "Please set EVM_PRIVATE_KEY, BASE_URL and VAULT_FACTORY_EVM_ADDRESS environment variables",
    );
    process.exit(1);
  }

  console.error("Starting Partnr MCP Server...");
  const server = new Server(
    {
      name: "Partnr MCP Server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const partnrClient = new PartnrClient(baseUrl, vaultFactoryEvmAddress, evmPrivateKey);
  await partnrClient.connect();

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      console.error("Received CallToolRequest:", request);
      try {
        if (!request.params.arguments) {
          throw new Error("No arguments provided");
        }

        switch (request.params.name) {
          case "partnr_list_chains": {
            const response = await partnrClient.listChains();
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "partnr_list_protocols": {
            const response = await partnrClient.listProtocols();
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "partnr_list_tokens": {
            const args = request.params.arguments as unknown as ListTokenArgs;
            if (!args.chainId) {
              throw new Error(
                "Missing required arguments: chainId",
              );
            }
            const response = await partnrClient.listTokens(args.chainId);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "partnr_create_vault": {
            const args = request.params.arguments as unknown as CreateVaultArgs;
            if (!args.name || !args.symbol || !args.tokenId || !args.protocolIds || !args.defaultProtocolId) {
              throw new Error(
                "Missing required arguments: name, symbol, tokenId or protocolIds",
              );
            }

            // Set default values
            if (args.feeRecipientAddress == "") {
                args.feeRecipientAddress = partnrClient.getWalletAddress();
            }

            console.error("CreateVaultArgs", args);
            const depositRule: DepositRule = {
                min: args.depositMin || 0,
                max: args.depositMax || 1000,
            }
            const fee: Fee = {
                performanceFee: args.performanceFee || 5,
                recipientAddress: args.feeRecipientAddress || partnrClient.getWalletAddress(),
                exitFee: args.exitFee || 0,
            }
            const withdrawTerm: WithdrawTerm = {
                lockUpPeriod: args.withdrawLockUpPeriod || 0,
                delay: args.withdrawDelay || 3600,
                isMultiSig: false,
            }

            var response = await partnrClient.createVault(
              args.name,
              args.logo || '',
              args.description || '',
              args.symbol,
              args.tokenId,
              args.protocolIds,
              args.defaultProtocolId,
              depositRule, fee, withdrawTerm
            );

            if (response.statusCode == 401) {
                // Reconnect and try again
                await partnrClient.connect();
                response = await partnrClient.createVault(
                  args.name,
                  args.logo || '',
                  args.description || '',
                  args.symbol,
                  args.tokenId,
                  args.protocolIds,
                  args.defaultProtocolId,
                  depositRule, fee, withdrawTerm
                );
            }
            if (response.statusCode == 200){
                // Call onchain
                const tokenDetail = await partnrClient.getTokenDetail(args.tokenId);
                if (tokenDetail && tokenDetail.statusCode == 200){
                    const chainId = tokenDetail.data.chain.chainId;
                    if (tokenDetail.data.chain.rpc.length == 0){
                        return {
                            content: [{ type: "text", text: `Chain rpc empty, not supported!` }],
                        };
                    }
                    const chainRpc = tokenDetail.data.chain.rpc[0];
                    const onchainResponse = await partnrClient.createVaultOnchain(response.data, chainId, chainRpc);
                    if (onchainResponse && onchainResponse.status === 1){ // Onchain transaction success
                        const hookResponse = await partnrClient.hookVaultCreated(chainId, onchainResponse.transactionHash);
                        console.error("hookResponse", hookResponse);
                        if (hookResponse.statusCode != 200 && hookResponse.statusCode != 201){
                            // Try webhook again
                            partnrClient.hookVaultCreated(chainId, onchainResponse.transactionHash);
                        }
                    }
                    return {
                        content: [{ type: "text", text: JSON.stringify({
                                status: onchainResponse ? onchainResponse.status : 0,
                                transactionHash: onchainResponse ? onchainResponse.transactionHash : "",
                                vaultId: response.data.vaultId
                            })
                        }],
                    };
                } else {
                    return {
                        content: [{ type: "text", text: JSON.stringify({
                          isError: true,
                          message: 'Get token detail error!'
                        }) }],
                    };
                }
            } else {
                return {
                  content: [{ type: "text", text: JSON.stringify(response) }],
                };
            }
            
          }

            case "partnr_list_vaults": {
                //const args = request.params.arguments as unknown as ListVaultArgs;
                var response = await partnrClient.listVaults();
                if (response.statusCode == 401) {
                  await partnrClient.connect();
                  response = await partnrClient.listVaults();
                }
                return {
                    content: [{ type: "text", text: JSON.stringify(response) }],
                };
            }
            case "partnr_vault_detail": {
                const args = request.params.arguments as unknown as VaultDetailArgs;
                if (!args.vaultId) {
                  throw new Error(
                    "Missing required arguments: vaultId",
                  );
                }
                const response = await partnrClient.getVaultDetail(args.vaultId);
                return {
                    content: [{ type: "text", text: JSON.stringify(response) }],
                };
            }
            case "partnr_update_vault": {
                const args = request.params.arguments as unknown as VaultUpdateArgs;
                if (!args.vaultId) {
                  throw new Error(
                    "Missing required arguments: vaultId",
                  );
                }

                const vaultDetail = await partnrClient.getVaultDetail(args.vaultId);
                console.error(vaultDetail.data);
                const depositRule: DepositRule = {
                    min: args.depositMin || vaultDetail.data.depositRule.min,
                    max: args.depositMax || vaultDetail.data.depositRule.max,
                }
                const fee: Fee = {
                    performanceFee: args.performanceFee || vaultDetail.data.fee.performanceFee,
                    recipientAddress: args.feeRecipientAddress || vaultDetail.data.fee.recipientAddress,
                    exitFee: vaultDetail.data.fee.exitFee,
                }
                const withdrawTerm: WithdrawTerm = {
                    lockUpPeriod: args.withdrawLockUpPeriod || vaultDetail.data.withdrawTerm.lockUpPeriod,
                    delay: args.withdrawDelay || vaultDetail.data.withdrawTerm.delay,
                    isMultiSig: vaultDetail.data.withdrawTerm.isMultiSig,
                }

                var response = await partnrClient.updateVault(
                  args.vaultId,
                  args.logo || vaultDetail.data.logo,
                  args.description || vaultDetail.data.description,
                  depositRule, fee, withdrawTerm,
                  args.protocolIds || []
                );
                if (response.statusCode == 401) {
                    await partnrClient.connect();
                    response = await partnrClient.updateVault(
                      args.vaultId,
                      args.logo || vaultDetail.data.logo,
                      args.description || vaultDetail.data.description,
                      depositRule, fee, withdrawTerm,
                      args.protocolIds || []
                    );
                }
                if (response.statusCode == 200){
                    return {
                        content: [{ type: "text", text: JSON.stringify(response) }],
                    };
                }
            }

            // Withdraw
            case "partnr_list_withdraw_requests": {
                const args = request.params.arguments as unknown as ListWithdrawArgs;
                if (!args.vaultId) {
                  throw new Error(
                    "Missing required arguments: vaultId",
                  );
                }
                const response = await partnrClient.listWithdrawRequests(args.vaultId);
                return {
                    content: [{ type: "text", text: JSON.stringify(response) }],
                };
            }

            case "partnr_approve_withdraw_request": {
                const args = request.params.arguments as unknown as ApproveWithdrawArgs;
                if (!args.withdrawId) {
                  throw new Error(
                    "Missing required arguments: withdrawId",
                  );
                }
                const response = await partnrClient.approveWithdraw(args.withdrawId);
                return {
                    content: [{ type: "text", text: JSON.stringify(response) }],
                };
            }
            case "partnr_approve_all_withdraw": {
                const args = request.params.arguments as unknown as ApproveAllWithdrawArgs;
                if (!args.vaultId) {
                  throw new Error(
                    "Missing required arguments: vaultId",
                  );
                }
                const response = await partnrClient.approveAllWithdraw(args.vaultId);
                return {
                    content: [{ type: "text", text: JSON.stringify(response) }],
                };
            }
          default:
            throw new Error(`Unknown tool: ${request.params.name}`);
        }
      } catch (error) {
        console.error("Error executing tool:", error);
        return {
            isError: true,
            content: [
                {
                  type: "text",
                  text: JSON.stringify({
                        error: error instanceof Error ? error.message : String(error),
                  }),
                },
            ],
        };
      }
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    console.error("Received ListToolsRequest");
    return {
      tools: [
        listChainsTool,
        listProtocolsTool,
        listTokensTool,
        createVaultTool,
        listVaultsTool,
        vaultDetailTool,
        vaultUpdateTool,
        listWithdrawRequestsTool,
        approveWithdrawRequestsTool,
        //approveAllWithdrawTool,
      ],
    };
  });

  const transport = new StdioServerTransport();
  console.error("Connecting server to transport...");
  await server.connect(transport);
  console.error("Partnr MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});