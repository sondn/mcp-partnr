import axios from "axios";
import { ethers, Wallet, utils, BigNumber } from "ethers";

// Onchain
import { VaultFactory__factory } from "./vault/index"; 
import { VaultParametersStruct } from "./vault/VaultFactory";
import { ERC20__factory } from "./erc20/index";


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


export class PartnrClient {
  private headers: { Authorization: string; "Content-Type": string };
  private baseUrl: string;
  private vaultFactoryEvmAddress: string;
  private profile: Profile = {
        id: "",
  };
  private wallet: Wallet;
  private accessToken: string = "";
  private refreshToken: string = "";

  constructor(baseUrl: string, vaultFactoryEvmAddress: string, evmPrivateKey: string) {
    // Authentication here
    this.wallet = new Wallet(evmPrivateKey);
    this.baseUrl = baseUrl;
    this.vaultFactoryEvmAddress = vaultFactoryEvmAddress;
    this.headers = {
            Authorization: "",
            "Content-Type": "application/json"
    }
  }


  async connect(){
    var challengeCode = await this.authGetChallengeCode();
    if(!challengeCode) {
        console.error("connect error: can not get challengeCode", this.wallet.address);
        return false;
    }
    var signature = await this.authGenerateSignature(challengeCode);
    if (signature == ""){
        console.error("connect error: signature empty", challengeCode, signature);
        return false;
    }
    var login = await this.authLogin(challengeCode, signature);
    if (login){
        this.accessToken = login.accessToken;
        this.refreshToken = login.refreshToken;
        if (this.profile.id == ""){
            var profile = await this.getProfileByAccessToken();
            if (profile) {
                this.profile = profile;
            }
        }
    }
    console.error({accessToken: this.accessToken, refreshToken: this.refreshToken, profile: this.profile});
    this.headers.Authorization = `Bearer ${this.accessToken}`;
    return true;
}


  async listChains(): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/api/chain`,
      { headers: this.headers },
    );
    return response.json();
  }
  async listVaults() {
    const params = new URLSearchParams({
      creatorId: this.profile.id,
    });
    const response = await fetch(
      `${this.baseUrl}/api/creator/vault?${params}`,
      { headers: this.headers },
    );

    var result = await response.json();
    
    var mcpResponse:any[] = [];
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
        withdrawTerm: WithdrawTerm
    ): Promise<any> {
    const body = {
        name: name,
        logo: logo,
        description: description,
        symbol: symbol,
        tokenId: tokenId,
        protocolIds: protocolIds,
        defaultProtocolId: defaultProtocolId,
        depositInit: {
            amountDeposit: 50000000
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
        try{
            const response = await axios.get(
                this.baseUrl + `/api/user/profile`,
                {
                    headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${this.accessToken}`
                    },
                }
            );
            if (response.data.statusCode == 200){
                return response.data.data;
            }
            console.error("getProfile Error:", response.data);
            return false;
        } catch (error) {
            console.error("getProfile Error:", error);
            return false;
        }
    }
    // Auth functions
    async authGetChallengeCode() {
        try{
            const response = await axios.get(
                this.baseUrl + `/api/auth/challengeCode/` + this.wallet.address,
                {
                    headers: {
                        accept: "application/json",
                    },
                }
            );
            return response.data.data.challengeCode;
        } catch (error) {
            console.error("authGetChallengeCode Error:", error);
            return false;
        }
    }

    async authGenerateSignature(challengeCode: string) {
        try {
            const signature = await this.wallet.signMessage(utils.toUtf8Bytes(challengeCode));
            return signature;
        } catch (error) {
            console.error("authGenerateSignature Error signing message:", error);
            return "";
        }
    }

    async authLogin(challengeCode: string, signature: string) {
        try{
            var params = {
                challengeCode: challengeCode,
                signature: signature,
                address: this.wallet.address,
            };

            const response = await axios.post(
                this.baseUrl + `/api/auth/login`,
                params,
                {
                    headers: {
                        accept: "application/json",
                    },
                }
            );
            return response.data.data;
        } catch (error) {
            console.error("authLogin Error:", error);
            return false;
        }
    }

    // Return txHash if success
    async createVaultOnchain(payload, chainId: number, chainRpc: string) {
        const provider = new ethers.providers.StaticJsonRpcProvider(chainRpc, {
            name: 'unknown',
            chainId: chainId,
        });
        const signer = this.wallet.connect(provider);

        // First, check allowance
        const allowance = await this.getAllowance(signer, payload.params.underlying);
        if (allowance < payload.params.initialAgentDeposit) {
            const allowed = await this.approveErc20Onchain(signer, payload.params.underlying);
            if (!allowed) {
                return;
            }
        }

        // Call createVault onchain
        const vaultFactory = VaultFactory__factory.connect(this.vaultFactoryEvmAddress, signer);
        const params: VaultParametersStruct = {
            agent: this.wallet.address,
            underlying: payload.params.underlying,
            name: payload.params.name,
            symbol: payload.params.symbol,
            initialAgentDeposit: payload.params.initialAgentDeposit,
            minDeposit: payload.params.minDeposit,
            maxDeposit: payload.params.maxDeposit
        };
        
        const tx = await vaultFactory.createVault(params, payload.strategy, {
            gasLimit: 10000000
        });
        const receipt = await tx.wait();
        return receipt;
    }

    async getAllowance(signer, underlyingAddress){
        const underlyingContract = ERC20__factory.connect(underlyingAddress, signer);
        const allowance = await underlyingContract.allowance(this.wallet.address, this.vaultFactoryEvmAddress);
        return ethers.utils.formatUnits(allowance, 0);
    }
    async approveErc20Onchain(signer, underlyingAddress){
        const underlyingContract = ERC20__factory.connect(underlyingAddress, signer);
        const tx = await underlyingContract.approve(this.vaultFactoryEvmAddress, ethers.constants.MaxUint256);
        const receipt = await tx.wait();
        if (receipt.status === 1){
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
        if (result.statusCode == 200) {
            delete result.data.creator;
            delete result.data.token;
            delete result.data.chain;
            delete result.data.depositInit;
            delete result.data.depositRule;
            delete result.data.withdrawTerm;
            // if (result.data.aiAgent == null){
            //     result.data.aiAgent = {};
            // }
        }
        return result;
    }

    async updateVault(vaultId: string, logo: string, description: string, lockUpPeriod: number, delay: number, performanceFee: number, recipientAddress: string, protocolIds: string[]) {
        var body = {
            logo: logo,
            description: description,
            withdrawTerm: {
                lockUpPeriod,
                delay
            },
            fee: {
                performanceFee,
                recipientAddress
            }
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

    async listWithdrawRequests(vaultId: string): Promise<any> {
        const params = new URLSearchParams({
            status: "AWAITING",
        });
        const response = await fetch(
          `${this.baseUrl}/api/creator/vault/${vaultId}/transactions?${params}`,
          { headers: this.headers },
        );

        var result = await response.json();
    
        var mcpResponse:any[] = [];
        if (result.statusCode == 200 && result.data.items.length > 0) {
            result.data.items.forEach((item) => {
                mcpResponse.push({
                    id: item.id,
                    userId: item.userId,
                    amount: BigNumber.from(item.amount).div(BigNumber.from("10").pow(item.vault.token.decimals)),
                    tokenName: item.vault.token.name,
                    tokenSymbol: item.vault.token.symbol,
                    deadline: new Date(item.deadline * 1000),
                    status: item.status,
                    createdAt: item.createdAt,
                });
            });
        }
        return mcpResponse;
    }

    async approveWithdraw(withdrawId: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/creator/vault/approve/withdraw/${withdrawId}`, {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify({}),
        });
        return response.json();
    }

    async approveAllWithdraw(vaultId: string): Promise<any> {
        const response = await fetch(`${this.baseUrl}/api/creator/vault/approve/withdraw/all/${vaultId}`, {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify({}),
        });
        return response.json();
    }

    getWalletAddress(): string{
        return this.wallet.address;
    }
}