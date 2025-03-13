# 🤖 MCP Server for [Partnr Vault](https://vault-dev.partnr.xyz/)



## 🎯 Use Cases

- 🤖 Creators: CRUD Vaults
- 📈 Creators: Approve / reject withdraw requests
- 🧠 Trading (Feature)

## 🚀 Quick Start

### Prerequisites

- [Node.js 23+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [npm](https://docs.npmjs.com/cli/v11/commands/npm)
- [Claude Desktop App](https://claude.ai/download)

### Installation

```bash
git clone https://github.com/sondn/mcp-partnr
cd mcp-partnr
npm i && npm run build
```

### [Configuring with Claude](https://modelcontextprotocol.io/quickstart/user)

> Create config file if not exists

```
macOS: ~/Library/Application Support/Claude/claude_desktop_config.json
Windows: %APPDATA%\Claude\claude_desktop_config.json
```

> Add this config to config file, change /path/to/mcp-partnr to your path on local machine.

```
{
    "mcpServers": {
        "partnr": {
            "command": "node",
            "args": [
        		"/path/to/mcp-partnr/dist/index.js"
            ],
            "env": {
        		"BASE_URL": "https://vault-api-dev.partnr.xyz",
                "EVM_PRIVATE_KEY": "0x...",
                "VAULT_FACTORY_EVM_ADDRESS": "0x272eb06953d92454215c1B050d14aeFC477451c7"
            }
        }
    }
}
```

### Note
   
	BASE_URL: Can change by Partnr System
	    - Dev: https://vault-api-dev.partnr.xyz
	    - Prod: https://vault-api.partnr.xyz
	EVM_PRIVATE_KEY: Wallet private key
	VAULT_FACTORY_EVM_ADDRESS: Partnr factory address, can change by Partnr System.

