import { ethers, Wallet } from "ethers";

import { EVMVaultFactory__factory, ERC20__factory, EVMVault__factory } from "./vault/index";

// Solana
import * as web3solana from '@solana/web3.js';
import nacl from "tweetnacl";
import bs58 from 'bs58';

import {
    getBase58Decoder,
} from "@solana/kit";
import { all } from "axios";

export enum VaultStatus {
    ACTIVE = "ACTIVE",
    PAUSE = "PAUSE",
    CLOSE = "drift"
}

export enum Protocol {
    VENUS = "venus",
    APEX = "apex",
    DRIFT = "drift"
}

export enum ActivityType {
    STAKING = "STAKING",
    UNSTAKING = "UNSTAKING",
    BORROW = "BORROW",
    REPAY = "REPAY",
    TRADING = "TRADING",
    SWAP = "SWAP",
    BUY = "BUY",
    SELL = "SELL"
}

export enum ActivityStatus {
    //PENDING, PROCESSING, COMPLETED, FAILED, OPEN, FILLED, CANCELED, EXPIRED, UNTRIGGERED, SUCCESS, SUCCESS_L2_APPROVED
    SUCCESS = "SUCCESS",
    SUCCESS_L2_APPROVED = "SUCCESS_L2_APPROVED",
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    OPEN = "OPEN",
    FILLED = "FILLED",
    CANCELED = "CANCELED",
    EXPIRED = "EXPIRED",
    UNTRIGGERED = "UNTRIGGERED"
}

interface Profile {
    id: string;
    name?: string;
    address?: string;
    chainType?: string;
    role?: string;
}

export interface Fee {
    performanceFee: number;
    recipientAddress: string;
    exitFee?: number;
    exitFeeLocate?: any;
}

export interface WithdrawTerm {
    lockUpPeriod: number;
    delay: number;
    isMultiSig?: boolean;
}

export interface DepositRule {
    min: number;
    max: number;
    LimitWallets?: number;
}


interface WithdrawData {
    withdrawId: string;
    receiverAddress: string;
    amount: string;
    vaultTvl: string;
    vaultFee: string;
    creatorFee: string;
    signature: string;
    deadline: string;
}

export class PartnrClient {
    private headers: { Authorization: string; "Content-Type": string };
    private baseUrl: string;

    private profile: Profile = {
        id: "",
    };
    private evmWallet!: Wallet;
    private solanaKeypair!: web3solana.Keypair;

    private accessToken: string = "";
    private refreshToken: string = "";
    public networkType: string = "EVM";

    constructor(evmPrivateKey: string, solanaPrivateKey: string) {
        this.baseUrl = process.env.BASE_URL || "https://vault-api.partnr.xyz";
        this.headers = {
            Authorization: "",
            "Content-Type": "application/json"
        }
        // Authentication here
        if (evmPrivateKey != "") {
            this.evmWallet = new Wallet(evmPrivateKey);
            this.networkType = "EVM";
        } else if (solanaPrivateKey != "") {
            this.networkType = "SOLANA";
            // Load wallet
            try {
                const decodedPrivateKey = bs58.decode(solanaPrivateKey);
                this.solanaKeypair = web3solana.Keypair.fromSecretKey(Uint8Array.from(decodedPrivateKey));
                console.error("publicKey", this.solanaKeypair.publicKey.toBase58(), process.env.SOLANA_RPC_URL);

            } catch (error) {
                console.error('Solana wallet init error', solanaPrivateKey, error);
                throw error;
            }
        }
    }


    async connect() {
        try {
            if (this.networkType == "EVM") {
                var challengeCode = await this.authGetChallengeCode(this.evmWallet.address);
                if (!challengeCode) {
                    console.error("connect error: can not get challengeCode", this.evmWallet.address);
                    return false;
                }
                var signature = await this.authGenerateSignature(challengeCode);
                if (signature == "") {
                    console.error("connect error: signature empty", challengeCode, signature);
                    return false;
                }
                var loginData = await this.authLogin(challengeCode, this.evmWallet.address, signature);
                if (loginData) {
                    this.accessToken = loginData.accessToken;
                    this.refreshToken = loginData.refreshToken;
                    if (this.profile.id == "") {
                        var profile = await this.getProfileByAccessToken();
                        if (profile) {
                            this.profile = profile;
                        }
                    }
                    this.headers.Authorization = `Bearer ${this.accessToken}`;
                }
                console.error({ accessToken: this.accessToken, refreshToken: this.refreshToken, profile: this.profile });
                return true;
            } else if (this.networkType == "SOLANA") {
                // Authentication with solana wallet
                const walletAddress = this.solanaKeypair.publicKey.toBase58();
                var challengeCode = await this.authGetChallengeCode(walletAddress);
                if (!challengeCode) {
                    console.error("connect error: can not get challengeCode", walletAddress);
                    return false;
                }

                const messageBytes: Uint8Array = new TextEncoder().encode(challengeCode);
                const signedBytes = nacl.sign.detached(messageBytes, this.solanaKeypair.secretKey);
                const signature = getBase58Decoder().decode(signedBytes);
                console.error({ walletAddress, challengeCode, signature });
                var loginData = await this.authLogin(challengeCode, walletAddress, signature);
                if (loginData) {
                    this.accessToken = loginData.accessToken;
                    this.refreshToken = loginData.refreshToken;
                    if (this.profile.id == "") {
                        var profile = await this.getProfileByAccessToken();
                        if (profile) {
                            this.profile = profile;
                        }
                    }
                    this.headers.Authorization = `Bearer ${this.accessToken}`;
                }
                console.error({ accessToken: this.accessToken, refreshToken: this.refreshToken, profile: this.profile });
                return true;
            }
        } catch (error) {
            console.error("Solana wallet connect error", error);
            return false;
        }
    }

    async listVaultActivities(vaultId: string, query): Promise<any> {
        const params = new URLSearchParams(query);
        const response = await fetch(
            `${this.baseUrl}/api/vault/activities/${vaultId}?${params}`,
            { headers: this.headers },
        );
        return response.json();
    }
    async listVaultDepositors(vaultId: string, query): Promise<any> {
        const params = new URLSearchParams(query);
        const response = await fetch(
            `${this.baseUrl}/api/vault/depositor/${vaultId}?${params}`,
            { headers: this.headers },
        );
        const result = await response.json();
        var mcpResponse: any[] = [];
        if (result.statusCode == 200 && result.data.items.length > 0) {
            const tokenId = result.data.items[0].vault.tokenId;
            const tokenDetail = await this.getTokenDetail(tokenId);
            result.data.items.forEach((item) => {
                console.error(item);
                mcpResponse.push({
                    id: item.id,
                    userAddress: item.user.address,
                    userPnL: item.allTimePnl,
                    age: item.holdDay,
                    amount: (BigInt(item.amount) / (10n ** BigInt(tokenDetail.data.decimals))).toString(),
                    tokenName: tokenDetail.data.name,
                    tokenSymbol: tokenDetail.data.symbol
                });
            });
        }
        console.error(mcpResponse);
        return mcpResponse;
    }

    async listChains(): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/api/chain`,
            { headers: this.headers },
        );
        return response.json();
    }

    async listCreatorVaults() {
        const params = new URLSearchParams({
            creatorId: this.profile.id,
        });
        const response = await fetch(
            `${this.baseUrl}/api/creator/vault?${params}`,
            { headers: this.headers },
        );

        var result = await response.json();
        if (result.statusCode == 401 || result.errorCode == 401) {
            return result;
        }

        var mcpResponse: any[] = [];
        if (result.statusCode == 200 && result.data.length > 0) {
            result.data.forEach((item) => {
                mcpResponse.push({
                    id: item.id,
                    name: item.name,
                    symbol: item.symbol,
                    logo: item.logo,
                    description: item.description,
                    tvl: item.tvl,
                    age: item.age,
                    apr: item.apr,
                    allTimePnl: item.allTimePnl,
                    yourDeposit: item.yourDeposit,
                    yourPnl: item.yourPnl
                });
            });
        }
        return mcpResponse;
    }

    async listVaults(status: string) {
        const params = new URLSearchParams({
            filterStatus: status,
        });
        const response = await fetch(
            `${this.baseUrl}/api/vault/list?${params}`,
            { headers: this.headers },
        );

        var result = await response.json();
        if (result.statusCode == 401 || result.errorCode == 401) {
            return result;
        }
        var mcpResponse: any[] = [];
        if (result.statusCode == 200 && result.data.length > 0) {
            result.data.forEach((item) => {
                mcpResponse.push({
                    id: item.id,
                    name: item.name,
                    symbol: item.symbol,
                    logo: item.logo,
                    description: item.description,
                    tvl: item.tvl,
                    age: item.age,
                    apr: item.apr,
                    allTimePnl: item.allTimePnl,
                    yourDeposit: item.yourDeposit,
                    yourPnl: item.yourPnl
                });
            });
        }
        return mcpResponse;
    }
    async listProtocols(): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/api/protocol`,
            { headers: this.headers },
        );
        return response.json();
    }

    async listTokens(chainId: string): Promise<any> {
        const params = new URLSearchParams({
            chainId: chainId,
        });

        const response = await fetch(
            `${this.baseUrl}/api/token?${params}`,
            { headers: this.headers },
        );
        return response.json();
    }

    async createVault(
        name: string,
        logo: string,
        description: string,
        symbol: string,
        tokenId: string,
        protocolIds: string[],
        defaultProtocolId: string,
        depositRule: DepositRule,
        fee: Fee,
        withdrawTerm: WithdrawTerm,
        amountDeposit: BigInt,
    ): Promise<any> {
        // Validate rules
        if (depositRule.min < 0) {
            return {
                isError: true,
                message: "minimum desposit can not lower than 0"
            }
        }
        if (depositRule.max > 0 && depositRule.min > depositRule.max) {
            return {
                isError: true,
                message: "maximum desposit must greater than minimum deposit"
            }
        }
        // Validate name
        const checkNameResponse = await fetch(`${this.baseUrl}/api/creator/vault/check-name/${name}`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({}),
        });
        const checkName = await checkNameResponse.json();
        if (checkName.statusCode == 200 || checkName.statusCode == 201) {
            if (checkName.data.isExist) {
                return {
                    isError: true,
                    message: "Vault name already exists, please select other name and try again!"
                };
            }
        }
        const body = {
            name: name,
            logo: logo,
            description: description,
            symbol: symbol,
            tokenId: tokenId,
            protocolIds: protocolIds,
            defaultProtocolId: defaultProtocolId,
            depositInit: {
                amountDeposit: amountDeposit.toString()
            },
            depositRule: depositRule,
            fee: fee,
            withdrawTerm: withdrawTerm
        };
        console.error("createVault body: ", body);
        const response = await fetch(`${this.baseUrl}/api/creator/vault`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        });
        return response.json();
    }

    async getProfileByAccessToken() {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/user/profile`,
                {
                    headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${this.accessToken}`
                    }
                },
            );

            const result = await response.json();
            if (result.statusCode == 200) {
                return result.data;
            }
            console.error("getProfile Error:", result);
            return false;
        } catch (error) {
            console.error("getProfile Error:", error);
            return false;
        }
    }
    // Auth functions
    async authGetChallengeCode(address: string) {
        try {
            const response = await fetch(
                `${this.baseUrl}/api/auth/challengeCode/${address}`,
                {
                    headers: {
                        accept: "application/json"
                    }
                },
            );
            const result = await response.json();
            return result.data.challengeCode;
        } catch (error) {
            console.error("authGetChallengeCode Error:", error);
            return false;
        }
    }

    async authGenerateSignature(challengeCode: string) {
        try {
            const signature = await this.evmWallet.signMessage(ethers.toUtf8Bytes(challengeCode));
            return signature;
        } catch (error) {
            console.error("authGenerateSignature Error signing message:", error);
            return "";
        }
    }

    async authLogin(challengeCode: string, address: string, signature: string) {
        try {
            const body = {
                challengeCode: challengeCode,
                signature: signature,
                address: address,
            };
            const response = await fetch(`${this.baseUrl}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body),
            });
            const result = await response.json();
            console.log(body, result);
            if (result.statusCode == 200 || result.statusCode == 201) {
                return result.data;
            }
            console.error("authLogin Error:", result);
            return false;
        } catch (error) {
            console.error("authLogin Error:", error);
            return false;
        }
    }

    // Return txHash if success
    async createVaultOnchain(vaultFactoryAddress: string, payload, chainId: number, chainRpc: string) {
        const provider = new ethers.JsonRpcProvider(chainRpc, {
            name: 'unknown',
            chainId: chainId,
        });
        const signer = this.evmWallet.connect(provider);

        // First, check allowance
        const initDeposit = BigInt(payload.vaultParam.initialAgentDeposit);
        const allowance = await this.getAllowance(payload.vaultParam.underlying, signer, vaultFactoryAddress);
        console.error({
            initDeposit,
            allowance
        });
        if (allowance < initDeposit) {
            const additionAllowance = initDeposit - allowance;
            const allowed = await this.approveErc20Onchain(signer, payload.vaultParam.underlying, vaultFactoryAddress, additionAllowance);
            if (!allowed) {
                return;
            }
        }

        // Call createVault onchain
        const vaultFactory = EVMVaultFactory__factory.connect(vaultFactoryAddress, signer);

        const vaultParams = {
            authority: this.evmWallet.address,
            deadline: payload.signature.deadline,
            protocolHelper: payload.vaultParam.protocolHelper,
            underlying: payload.vaultParam.underlying,
            name: payload.vaultParam.name,
            symbol: payload.vaultParam.symbol,
            initDepositAmount: payload.vaultParam.initialAgentDeposit,
            minDepositAmount: payload.vaultParam.minDeposit,
            maxDepositAmount: payload.vaultParam.maxDeposit
        };
        

        console.error(vaultParams, payload)
        const tx = await vaultFactory.createNewVault(vaultParams, payload.signature.signature, {
            gasLimit: 10000000
        });
        const receipt = await tx.wait();
        console.error(receipt);
        return receipt;
    }

    async getAllowance(underlyingAddress: string, signer, spender: string):Promise<bigint> {
        const underlyingContract = ERC20__factory.connect(underlyingAddress, signer);
        const allowance = await underlyingContract.allowance(this.evmWallet.address, spender);
        return allowance;
    }
    async approveErc20Onchain(signer, underlyingAddress: string, spender: string, allowance: bigint) {
        const underlyingContract = ERC20__factory.connect(underlyingAddress, signer);
        const tx = await underlyingContract.approve(spender, allowance);
        const receipt = await tx.wait();
        if (receipt && receipt.status === 1) {
            return true;
        }
        return false;
    }

    async hookVaultCreated(chainId: number, txHash: string): Promise<any> {
        const body = {};
        const response = await fetch(`${this.baseUrl}/api/webhook/create-vault/${chainId}/${txHash}`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        });
        return response.json();
    }

    async hookVaultDeposit(vaultId: string, txHash: string): Promise<any> {
        const body = {};
        const response = await fetch(`${this.baseUrl}/api/webhook/deposit/${vaultId}/${txHash}`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        });
        return response.json();
    }

    async hookVaultWithdraw(vaultId: string, txHash: string): Promise<any> {
        const body = {};
        const response = await fetch(`${this.baseUrl}/api/webhook/withdraw/${vaultId}/${txHash}`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify(body),
        });
        return response.json();
    }

    async getTokenDetail(tokenId: string): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/api/token/${tokenId}`,
            { headers: this.headers },
        );
        return response.json();
    }

    async getVaultDetail(vaultId: string) {
        const params = new URLSearchParams({
            vaultId: vaultId,
        });
        const response = await fetch(
            `${this.baseUrl}/api/vault/detail?${params}`,
            { headers: this.headers },
        );
        var result = await response.json();
        console.error("vaultDetail", result);
        // if (result.statusCode == 200) {
        //     delete result.data.creator;
        //     delete result.data.token;
        //     delete result.data.chain;
        //     delete result.data.depositInit;
        //     if (result.data.aiAgent == null) {
        //         result.data.aiAgent = {};
        //     }
        // }
        return result;
    }

    async updateVault(vaultId: string, logo: string, description: string, depositRule: DepositRule, fee: Fee, withdrawTerm: WithdrawTerm, protocolIds: string[]) {
        var body = {
            logo: logo,
            description: description,
            withdrawTerm: withdrawTerm,
            fee: fee,
            depositRule: depositRule
        };

        if (protocolIds.length > 0) {
            body["protocolIds"] = protocolIds;
        }
        const response = await fetch(`${this.baseUrl}/api/creator/vault/${vaultId}`, {
            method: "PATCH",
            headers: this.headers,
            body: JSON.stringify(body),
        });
        return response.json();
    }

    async creatorListVaultTransactions(vaultId: string, query): Promise<any> {
        const params = new URLSearchParams(query);
        const response = await fetch(
            `${this.baseUrl}/api/creator/vault/${vaultId}/transactions?${params}`,
            { headers: this.headers },
        );

        var result = await response.json();
        console.error("creatorListVaultTransactions", result);

        var mcpResponse: any[] = [];
        if (result.statusCode == 200 && result.data.items.length > 0) {
            result.data.items.forEach((item) => {
                mcpResponse.push({
                    id: item.id,
                    userId: item.userId,
                    amount: (BigInt(item.amount) / (10n ** BigInt(item.vault.token.decimals))).toString(),
                    tokenName: item.vault.token.name,
                    tokenSymbol: item.vault.token.symbol,
                    deadline: new Date(item.deadline * 1000),
                    type: item.type,
                    status: item.status,
                    createdAt: item.createdAt,
                });
            });
        }
        return mcpResponse;
    }

    // async approveWithdraw(withdrawId: string) {
    //     const response = await fetch(`${this.baseUrl}/api/creator/vault/approve/withdraw/${withdrawId}`, {
    //         method: "POST",
    //         headers: this.headers,
    //         body: JSON.stringify({}),
    //     });
    //     const result = await response.json();
    //     console.error("approveWithdraw", result);
    //     // Process for Apex withdraw
    //     if ((result.statusCode == 200 || result.statusCode == 201) && result.data.service == Protocol.APEX) {
    //         if (result.data.chainInfo.rpc.length == 0) {
    //             return {
    //                 isError: true,
    //                 message: "chainRPC empty, please try again or contact admin if this error perisstent."
    //             }
    //         }
    //         // Call vault onchain
    //         const params = {
    //             withdrawId: withdrawId,
    //             amount: result.data.params.assets,
    //             shareOwner: result.data.params.shareOwner,
    //             signature: result.data.params.signature
    //         };
    //         var receipt = await this.requestWithdrawOnchain(params, result.data.chainInfo.chainId, result.data.chainInfo.rpc[0]);
    //         if (receipt && receipt.status !== 1) { // try again
    //             await this.requestWithdrawOnchain(params, result.data.chainInfo.chainId, result.data.chainInfo.rpc[0]);
    //         }
    //     }
    //     return result;
    // }

    async approveAllWithdraw(vaultId: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/creator/vault/approve/withdraw/all/${vaultId}`, {
            method: "POST",
            headers: this.headers,
            body: JSON.stringify({}),
        });
        return response.json();
    }

    getWalletAddress(): string {
        return this.evmWallet.address;
    }

    async getMyPnL(): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/api/user/pnl`,
            { headers: this.headers },
        );
        return response.json();
    }

    async depositVault(vaultId: string, amount: number): Promise<any> {
        const res = await this.getVaultDetail(vaultId);
        // 1. Validate amount & check user balance
        // 2. Call backend api
        // 3. Call vault contract onchain
        if (res.statusCode == 200) {
            const vault = res.data;
            const token = vault.token;
            const chain = vault.chain;

            // Validate deposit rule
            if (amount < vault.depositRule.min) {
                return {
                    isError: true,
                    message: `deposit amount must greater than ${vault.depositRule.min}`
                }
            }
            if (vault.depositRule.max > 0 && amount > vault.depositRule.max) {
                return {
                    isError: true,
                    message: `deposit amount must lower than ${vault.depositRule.max}`
                }
            }

            // Validate balance
            if(chain.rpc.length < 0){
                return {
                    isError: true,
                    message: "Chain RPC empty, check partnr backend for fix this issue!"
                }
            }
            const provider = new ethers.JsonRpcProvider(chain.rpc[0]);
            const signer = this.evmWallet.connect(provider);
            const depositAmountDecimals = BigInt((amount * Math.pow(10, token.decimals)).toFixed(0));

            console.error({
                address: token.address,
                user: this.evmWallet.address,
                rpc: chain.rpc[0],
            })
            const balance = await this.getTokenBalance(token.address, this.evmWallet.address, chain.rpc[0]);
            console.error({
                balance,
                amount
            });
            if(balance < depositAmountDecimals) {
                return {
                    isError: true,
                    message: "Balance not enought!"
                }
            }
            // Validate allowance
            console.error({
                address: token.address,
                signer,
                vaultContract: vault.contractAddress
            })
            const allowance = await this.getAllowance(token.address, signer, vault.contractAddress);
            console.log("allowance", allowance)
            console.error("depositAmountDecimals", depositAmountDecimals)
            if (allowance < depositAmountDecimals) {
                const additionAllowance = depositAmountDecimals - allowance;
                const allowed = await this.approveErc20Onchain(signer, token.address, vault.contractAddress, additionAllowance);
                if (!allowed) {
                    return {
                        isError: true,
                        message: "Apporve spender error, check native token balance for gas fee!"
                    }
                }
            }
            // Call backend api
            const body = {
                vaultId,
                amount: depositAmountDecimals.toString()
            };
            console.error("deposit body: ", body);
            const apiResponse = await fetch(`${this.baseUrl}/api/vault/depositor/deposit`, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify(body),
            });
            const apiResult = await apiResponse.json();
            console.error("deposit api result", apiResult);
            if (apiResult.statusCode != 200 && apiResult.statusCode != 201) {
                return {
                    isError: true,
                    message: apiResult.message
                }
            }
            // Call vault contract
            const receipt = await this.depositVaultOnchain(apiResult.data, vault.contractAddress, chain.rpc[0]);
            if(receipt?.status == 1){
                const hookResponse = await this.hookVaultDeposit(vaultId, receipt.hash);
                console.error("hookDepositResponse", hookResponse);
                return {
                    isError: false,
                    message: "Success",
                    data: {
                        transactionHash: receipt?.hash,
                        explorers: chain.explorers
                    }
                }
            } else {
                return {
                    isError: true,
                    message: "Fail to execute transaction, check for onchain activities",
                    data: {
                        trasactionHash: receipt?.hash,
                        explorers: chain.explorers
                    }
                }
            }
        }
        return {
            isError: true,
            message: "Get vault detail error, check if vault exist or not."
        }
    }

    async depositVaultOnchain(payload, vaultAddress: string, providerUrl: string) {
        const provider = new ethers.JsonRpcProvider(providerUrl);
        const signer = this.evmWallet.connect(provider);
        const vaultContract = EVMVault__factory.connect(vaultAddress, signer);
        const tx = await vaultContract.deposit(payload.vaultParam.amount, payload.vaultParam.userAddress, payload.vaultParam.vaultTvl, payload.signature.deadline, payload.signature.signature);
        const receipt = await tx.wait();
        console.error(receipt);
        return receipt;
    }

    async withdrawVault(vaultId: string, amount: number): Promise<any> {
        const res = await this.getVaultDetail(vaultId);
        if (res.statusCode == 200) {
            const vault = res.data;
            const token = vault.token;
            const chain = vault.chain;
            // Validate balance
            if(chain.rpc.length < 0){
                return {
                    isError: true,
                    message: "Chain RPC empty, check partnr backend for fix this issue!"
                }
            }
            // Call backend api
            const withdrawAmountDecimals = BigInt(amount) * (10n ** BigInt(token.decimals))
            const body = {
                vaultId,
                amount: withdrawAmountDecimals.toString()
            };
            console.error("withdraw body: ", body);
            const apiResponse = await fetch(`${this.baseUrl}/api/vault/depositor/withdraw`, {
                method: "POST",
                headers: this.headers,
                body: JSON.stringify(body),
            });
            const apiResult = await apiResponse.json();
            console.error("withdraw api result", apiResult);
            if (apiResult.statusCode != 200) {
                return {
                    isError: true,
                    message: apiResult.message
                }
            }
            switch(apiResult.data.service) {
                case Protocol.APEX:
                    return apiResult;
                case Protocol.VENUS:
                    // Call vault contract
                    const withdrawData: WithdrawData = {
                        withdrawId: apiResult.data.payload.withdrawId,
                        receiverAddress: apiResult.data.payload.user,
                        amount: apiResult.data.payload.amountOut,
                        vaultTvl: apiResult.data.payload.vaultTvl,
                        vaultFee: apiResult.data.payload.vaultFee,
                        creatorFee: apiResult.data.payload.creatorFee,
                        deadline: apiResult.data.signature.deadline,
                        signature: apiResult.data.signature.signature
                    }
                    const receipt = await this.evmWithdrawVaultOnchain(vault.contractAddress, withdrawData, chain.rpc[0]);
                    if(receipt?.status == 1){
                        const hookResponse = await this.hookVaultWithdraw(vaultId, receipt.hash);
                        console.error("hookWithdrawResponse", hookResponse);
                        return {
                            isError: false,
                            message: "Success",
                            data: {
                                transactionHash: receipt?.hash,
                                explorers: chain.explorers
                            }
                        }
                    } else {
                        return {
                            isError: true,
                            message: "Fail to execute transaction, check for onchain activities",
                            data: {
                                trasactionHash: receipt?.hash,
                                explorers: chain.explorers
                            }
                        }
                    }
                default:
                    return apiResult;
            }
        }
        return {
            isError: true,
            message: "Get vault detail error, check if vault exist or not."
        }
    }

    async evmWithdrawVaultOnchain(vaultAddress: string, payload: WithdrawData, providerUrl: string) {
        const provider = new ethers.JsonRpcProvider(providerUrl);
        const signer = this.evmWallet.connect(provider);
        const vaultContract = EVMVault__factory.connect(vaultAddress, signer);

        const tx = await vaultContract.withdraw(payload.withdrawId, payload.receiverAddress, payload.amount, payload.vaultTvl, payload.vaultFee, payload.creatorFee, payload.deadline, payload.signature);
        const receipt = await tx.wait();
        console.error("evmWithdrawVaultOnchain", receipt);
        return receipt;
    }

    async getTokenBalance(tokenAddress: string, userAddress: string, providerUrl: string): Promise<bigint> {
        const provider = new ethers.JsonRpcProvider(providerUrl);
        const tokenAbi = [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)"
        ];

        const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, provider);

        try {
            const balance = await tokenContract.balanceOf(userAddress);
            return balance;

        } catch (error) {
            console.error("Error getting token balance:", error);
            return BigInt('0');
        }
    }
}