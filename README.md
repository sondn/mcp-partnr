# 🤖 MCP Server for [Partnr Vault](https://vault-dev.partnr.xyz/)



## 🎯 Use Cases

- 🤖 Creators: CRUD Vaults
- 📈 Creators: Approve / reject withdraw requests
- 🧠 Trading (Feature)

## 🚀 Quick Start

### Prerequisites

- [Node.js 20+](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [npm](https://docs.npmjs.com/cli/v11/commands/npm)
- [Claude Desktop App](https://claude.ai/download) OR [Continue for VSCode](https://marketplace.visualstudio.com/items?itemName=Continue.continue) or any MCP Clients (n8n, Cursor, ...)

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
            "command": "npx",
            "args": [
                 "-y",
                "partnrvault-mcpserver"
            ],
            "env": {
                "IS_CREATOR": "1",
        		"BASE_URL": "https://vault-api.partnr.xyz",
                "EVM_PRIVATE_KEY": "0x...",
            }
        }
    }
}
```

### [Configuring with Continue Extension](https://continue.dev)

> Add this config to config.json file of continue extension

```
"experimental": {
    "modelContextProtocolServers": [
        {
            "transport": {
                "type": "stdio",
                "command": "npx",
                "args": [
                    "-y",
                    "partnrvault-mcpserver"
                ],
                "env": {
                    "IS_CREATOR": "1",
                    "BASE_URL": "https://vault-api.partnr.xyz",
                    "EVM_PRIVATE_KEY": "0x...",
                }
            }
        }
    ]
}
```


### [Configuring with n8n](https://www.npmjs.com/package/n8n-nodes-mcp)

>Install n8n-nodes-mcp: https://www.npmjs.com/package/n8n-nodes-mcp

To enable community nodes as tools, you need to set the `N8N_COMMUNITY_PACKAGES_ALLOW_TOOL_USAGE` environment variable to `true`

```bash
export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
n8n start
```

Connection config:

    - Command: npx
    - Arguments: -y partnrvault-mcpserver
    - Environments: IS_CREATOR=1,BASE_URL=https://vault-api-dev.partnr.xyz,EVM_PRIVATE_KEY=***


### Note
    IS_CREATOR: set to 1 if you want create and manager your Vaults, set to 0 if you only using created Vaults. Suported tools will be different.
	BASE_URL: Can change by Partnr System
	    - Dev: https://vault-api-dev.partnr.xyz
	    - Prod: https://vault-api.partnr.xyz
	EVM_PRIVATE_KEY: Wallet private key