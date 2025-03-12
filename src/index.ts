#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import { ethers, Wallet, utils } from "ethers";

import { PartnrClient } from "./PartnrClient";

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

interface ListVaultArgs {
  name?: string;
  creatorId?: string;
  filterStatus?: string;
  contractAddress?: string;
}

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
    lockUpPeriod?: number;
    delay?: number;
    performanceFee?: number;
    recipientAddress?: number;
    protocolIds?: string[];
}

interface CreateVaultArgs {
  name: string;
  logo?: string;
  description?: string;
  symbol: string;
  chainId?: string;
  tokenId: string;
  tokenDecimals?: number;
  depositMin?: number;
  depositMax?: number;
  withdrawTerm?: {
    lockUpPeriod: number;
    delay: number;
  };
  fee?: {
    performanceFee: number;
    recipientAddress: string;
  };
  aiAgent?: any;
  depositInit?: {
    networkId: string;
    amountDeposit: number;
  };
  protocolIds: string[];
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
        type: "string[]",
        description: "List protocolIds of the Vault to create"
      },
      tokenDecimals: {
        type: "number",
        description: "decimals of selected token, format number, get from decimals field of tool list tokens",
      },
      depositMin: {
        type: "number",
        description: "Minimum deposit to Vault, without token decimals",
        default: 0,
      },
      depositMax: {
        type: "number",
        description: "Maximum deposit to Vault, without token decimals",
        default: 1000000
      },
    },
    required: ["name", "symbol", "tokenId", "protocolIds"],
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
      name: {
        type: "string",
        description: "Name of the Vault to update",
      },
      logo: {
        type: "string",
        description: "Logo of the Vault to update, image url",
      },
      description: {
        type: "string",
        description: "Description of the Vault to update",
      },
      symbol: {
        type: "string",
        description: "Symbol of the Vault to update",
      },
      depositMin: {
        type: "number",
        description: "Minimum deposit of the Vault, value with decimals format of tokenId decimals",
      },
      depositMax: {
        type: "number",
        description: "Maximum deposit of the Vault, value with decimals format of tokenId decimals",
      }
    },
    required: ["vaultId"],
  },
};

const approveWithdrawTool: Tool = {
  name: "partnr_approve_withdraw",
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

const approveAllWithdrawTool: Tool = {
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

const listWithdrawTool: Tool = {
  name: "partnr_list_withdraw",
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
  const baseUrl = process.env.BASE_URL;

  if (!evmPrivateKey || !baseUrl) {
    console.error(
      "Please set EVM_PRIVATE_KEY and BASE_URL environment variables",
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

  const partnrClient = new PartnrClient(baseUrl, evmPrivateKey);
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
            if (!args.name || !args.symbol || !args.tokenId || !args.protocolIds) {
              throw new Error(
                "Missing required arguments: name, symbol, tokenId or protocolIds",
              );
            }
            console.error("CreateVaultArgs", args);

            var depositMin = 0;
            var depositMax = 1000000 * Math.pow(10, 18);

            if (args.tokenDecimals) {
                if (args.depositMin) {
                    depositMin = args.depositMin * Math.pow(10, args.tokenDecimals);
                } 
                if (args.depositMax) {
                    depositMax = args.depositMax * Math.pow(10, args.tokenDecimals);
                } else {
                    depositMax = 1000000 * Math.pow(10, args.tokenDecimals);
                }
            }

            var response = await partnrClient.createVault(
              args.name,
              args.logo || '',
              args.description || '',
              args.symbol,
              args.tokenId,
              args.protocolIds,
              depositMin,
              depositMax
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
                  depositMin,
                  depositMax
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
                            })
                        }],
                    };
                } else {
                    return {
                        content: [{ type: "text", text: `Get token detail error!` }],
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
                const response = await partnrClient.listVaults();
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

                var lockUpPeriod = args.lockUpPeriod || ((vaultDetail.data.withdrawTerm != null && vaultDetail.data.withdrawTerm.lockUpPeriod) ? vaultDetail.data.withdrawTerm.lockUpPeriod : 0);
                var delay = args.delay || ((vaultDetail.data.withdrawTerm != null && vaultDetail.data.withdrawTerm.delay) ? vaultDetail.data.withdrawTerm.delay : 0);
                var performanceFee = args.performanceFee || ((vaultDetail.data.fee != null && vaultDetail.data.fee.performanceFee) ? vaultDetail.data.fee.performanceFee : 0);
                var recipientAddress = args.performanceFee || ((vaultDetail.data.fee != null && vaultDetail.data.fee.recipientAddress) ? vaultDetail.data.fee.recipientAddress : "");
                

                var response = await partnrClient.updateVault(
                  args.vaultId,
                  args.logo || vaultDetail.data.logo,
                  args.description || vaultDetail.data.description,
                  lockUpPeriod,
                  delay,
                  performanceFee,
                  recipientAddress,
                  args.protocolIds || []
                );
                if (response.statusCode == 401) {
                    await partnrClient.connect();
                    response = await partnrClient.updateVault(
                      args.vaultId,
                      args.logo || vaultDetail.data.logo,
                      args.description || vaultDetail.data.description,
                      lockUpPeriod,
                      delay,
                      performanceFee,
                      recipientAddress,
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
            case "partnr_list_withdraw": {
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

            case "partnr_approve_withdraw": {
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
        listWithdrawTool,
        approveWithdrawTool,
        approveAllWithdrawTool,
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