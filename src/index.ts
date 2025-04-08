#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequest,
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

import { PartnrClient, Fee, WithdrawTerm, DepositRule, ActivityStatus } from "./PartnrClient";
import { parseUnits } from "ethers";
import * as Interfaces from './interfaces';
import * as Tools from './tools';

async function main() {
  const evmPrivateKey = process.env.EVM_PRIVATE_KEY || "";
  const solanaPrivateKey = process.env.SOLANA_PRIVATE_KEY || "";

  if (evmPrivateKey == "" && solanaPrivateKey == "") {
    console.error(
      "Please set EVM_PRIVATE_KEY or SOLANA_PRIVATE_KEY environment variables",
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

  const partnrClient = new PartnrClient(evmPrivateKey, solanaPrivateKey);
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
            const args = request.params.arguments as unknown as Interfaces.ListTokenArgs;
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

          case "creator_create_vault": {
            const args = request.params.arguments as unknown as Interfaces.CreateVaultArgs;
            if (!args.name || !args.symbol || !args.tokenId || !args.tokenDecimals || !args.protocolIds || !args.defaultProtocolId || !args.initDeposit) {
              throw new Error(
                "Missing required arguments: name, symbol, initDeposit, tokenId or protocolIds",
              );
            }
            const initDepositAmount = parseUnits(args.initDeposit.toString(), args.tokenDecimals);

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
              depositRule, fee, withdrawTerm,
              initDepositAmount
            );

            if (response.statusCode == 401 || response.errorCode == 401) {
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
                depositRule, fee, withdrawTerm,
                initDepositAmount
              );
            }
            console.error("CreateVaultResponse", response);
            if (response.statusCode == 200) {
              // Call onchain
              const tokenDetail = await partnrClient.getTokenDetail(args.tokenId);
              if (tokenDetail && tokenDetail.statusCode == 200) {
                const chainId = tokenDetail.data.chain.chainId;
                if (tokenDetail.data.chain.rpc.length == 0) {
                  return {
                    content: [{ type: "text", text: `Chain rpc empty, not supported!` }],
                  };
                }
                const chainRpc = tokenDetail.data.chain.rpc[0];
                const factoryAddress = response.data?.vaultParam?.vaultFactory;
                const onchainResponse = await partnrClient.createVaultOnchain(factoryAddress, response.data, chainId, chainRpc);
                if (onchainResponse && onchainResponse.status === 1) { // Onchain transaction success
                  const hookResponse = await partnrClient.hookVaultCreated(chainId, onchainResponse.hash);
                  console.error("hookResponse", hookResponse);
                  if (hookResponse.statusCode != 200 && hookResponse.statusCode != 201) {
                    // Try webhook again
                    partnrClient.hookVaultCreated(chainId, onchainResponse.hash);
                  }
                }
                return {
                  content: [{
                    type: "text", text: JSON.stringify({
                      status: onchainResponse ? onchainResponse.status : 0,
                      transactionHash: onchainResponse ? onchainResponse.hash : "",
                      vaultId: response.data.vaultId
                    })
                  }],
                };
              } else {
                return {
                  content: [{
                    type: "text", text: JSON.stringify({
                      isError: true,
                      message: 'Get token detail error!'
                    })
                  }],
                };
              }
            } else {
              return {
                content: [{ type: "text", text: JSON.stringify(response) }],
              };
            }

          }

          case "creator_list_created_vaults": {
            var response = await partnrClient.listCreatorVaults();
            if (response.statusCode == 401 || response.errorCode == 401) {
              await partnrClient.connect();
              response = await partnrClient.listCreatorVaults();
            }
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "partnr_list_vaults": {
            const args = request.params.arguments as unknown as Interfaces.ListVaultArgs;
            if (!args.status) {
              throw new Error(
                "Missing required arguments: status",
              );
            }
            var response = await partnrClient.listVaults(args.status);
            if (response.statusCode == 401 || response.errorCode == 401) {
              await partnrClient.connect();
              response = await partnrClient.listVaults(args.status);
            }
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          case "partnr_vault_detail": {
            const args = request.params.arguments as unknown as Interfaces.VaultDetailArgs;
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
          case "creator_update_vault": {
            const args = request.params.arguments as unknown as Interfaces.VaultUpdateArgs;
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
            if (response.statusCode == 401 || response.errorCode == 401) {
              await partnrClient.connect();
              response = await partnrClient.updateVault(
                args.vaultId,
                args.logo || vaultDetail.data.logo,
                args.description || vaultDetail.data.description,
                depositRule, fee, withdrawTerm,
                args.protocolIds || []
              );
            }
            if (response.statusCode == 200) {
              return {
                content: [{ type: "text", text: JSON.stringify(response) }],
              };
            }
          }

          // Withdraw
          case "creator_list_vault_transactions": {
            const args = request.params.arguments as unknown as Interfaces.ListTransactionArgs;
            if (!args.vaultId) {
              throw new Error(
                "Missing required arguments: vaultId",
              );
            }
            let query = {
              limit: args.limit?.toString() || "20",
              page: args.page?.toString() || "1"
            };
            if (args.type) {
              query["type"] = args.type;
            }
            if (args.status) {
              query["status"] = args.status;
            }
            const response = await partnrClient.creatorListVaultTransactions(args.vaultId, query);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }

          // case "creator_approve_withdraw_request": {
          //   const args = request.params.arguments as unknown as Interfaces.ApproveWithdrawArgs;
          //   if (!args.withdrawId) {
          //     throw new Error(
          //       "Missing required arguments: withdrawId",
          //     );
          //   }
          //   const response = await partnrClient.approveWithdraw(args.withdrawId);
          //   return {
          //     content: [{ type: "text", text: JSON.stringify(response) }],
          //   };
          // }
          case "creator_list_vault_activities": {
            const args = request.params.arguments as unknown as Interfaces.ListVaultActivitiesArgs;
            if (!args.vaultId) {
              throw new Error(
                "Missing required arguments: vaultId",
              );
            }
            let query = {
              limit: args.limit || "20",
              page: args.page || "1"
            };
            if (args.type) {
              query["type"] = args.type;
            }
            if (args.protocol) {
              query["protocol"] = args.protocol;
            }

            const response = await partnrClient.listVaultActivities(args.vaultId, query);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "creator_list_open_positions": {
            const args = request.params.arguments as unknown as Interfaces.ListOpenPositionsArgs;
            if (!args.vaultId) {
              throw new Error(
                "Missing required arguments: vaultId",
              );
            }
            let query = {
              status: ActivityStatus.SUCCESS, // Open positions
              limit: args.limit || "20",
              page: args.page || "1"
            };
            if (args.protocol) {
              query["protocol"] = args.protocol;
            }
            console.error(query);
            const response = await partnrClient.listVaultActivities(args.vaultId, query);
            console.error(response);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "partnr_list_depositors": {
            const args = request.params.arguments as unknown as Interfaces.ListDepositorArgs;
            if (!args.vaultId) {
              throw new Error(
                "Missing required arguments: vaultId",
              );
            }
            let query = {
              limit: args.limit?.toString() || "20",
              page: args.page?.toString() || "1"
            };

            const response = await partnrClient.listVaultDepositors(args.vaultId, query);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "partnr_get_my_pnl": {
            const response = await partnrClient.getMyPnL();
            console.error(response);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "partnr_deposit_vault": {
            const args = request.params.arguments as unknown as Interfaces.DepositArgs;
            if (!args.vaultId || !args.amount) {
              throw new Error(
                "Missing required arguments: vaultId and amount",
              );
            }

            const response = await partnrClient.depositVault(args.vaultId, args.amount);
            return {
              content: [{ type: "text", text: JSON.stringify(response) }],
            };
          }
          case "partnr_withdraw_vault": {
            const args = request.params.arguments as unknown as Interfaces.WithdrawArgs;
            if (!args.vaultId || !args.amount) {
              throw new Error(
                "Missing required arguments: vaultId and amount",
              );
            }

            const response = await partnrClient.withdrawVault(args.vaultId, args.amount);
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
    if (process.env.IS_CREATOR === "1") {
      return {
        tools: [
          Tools.listChainsTool,
          Tools.listProtocolsTool,
          Tools.listTokensTool,
          Tools.createVaultTool,
          Tools.creatorListCreatedVaultsTool,
          //Tools.listWithdrawRequestsTool,
          //Tools.approveWithdrawRequestsTool,
          
          Tools.vaultDetailTool,
          Tools.vaultUpdateTool,
          Tools.listVaultActivitiesTool,
          Tools.listOpenPositionsTool,

          Tools.depositTool,
          Tools.withdrawTool,
          //Tools.listDepositedVaultsTool,
          Tools.listDepositorsTool,
          Tools.getMyPnLTool,
        ],
      };
    } else {
      return {
        tools: [
          Tools.listChainsTool,
          Tools.listProtocolsTool,
          Tools.listTokensTool,

          Tools.listVaultsTool,
          Tools.vaultDetailTool,
          Tools.listVaultActivitiesTool,

          Tools.depositTool,
          Tools.withdrawTool,
          //Tools.listDepositedVaultsTool,
          Tools.listDepositorsTool,
          Tools.getMyPnLTool,
        ],
      };
    }

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