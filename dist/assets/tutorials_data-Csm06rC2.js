const e=[{id:"tutorial-01",title:"Getting Started with MCP Servers",description:"Learn how to set up and use MCP servers with Claude",author:"AchaAI Team",datePublished:"2025-04-15",category:"Beginner",tags:["mcp","servers","setup"],image:"/assets/tutorial-images/getting-started.jpg",content:`# Getting Started with MCP Servers

This tutorial will guide you through setting up your first MCP server with Claude.

## What is MCP?

Model Context Protocol (MCP) is an open protocol that enables LLMs to access external tools and data sources. With MCP, you can extend Claude's capabilities to interact with databases, APIs, files, and more.

## Installation

To get started, you need to install Claude Code CLI:

\`\`\`bash
npm install -g @anthropic/claude-code
\`\`\`

## Adding an MCP Server

Once installed, you can add an MCP server using the following command:

\`\`\`bash
claude mcp add server-name /path/to/server
\`\`\`

## Using MCP Servers

After adding an MCP server, you can start using it in your conversations with Claude. Here's an example:

\`\`\`
User: Use the postgres MCP server to query my database
Claude: I'll help you query your PostgreSQL database using the MCP server...
\`\`\`

## Next Steps

Now that you've set up your first MCP server, you might want to:

1. Explore our catalog of available MCP servers
2. Learn how to develop your own MCP server
3. See advanced usage patterns for MCP`},{id:"tutorial-02",title:"Creating Your Own MCP Server",description:"A step-by-step guide to building custom MCP servers",author:"AchaAI Team",datePublished:"2025-04-18",category:"Advanced",tags:["mcp","development","custom"],image:"/assets/tutorial-images/custom-mcp-server.jpg",content:`# Creating Your Own MCP Server

This tutorial walks you through creating a custom MCP server for Claude.

## Prerequisites

- Node.js 18+
- Basic JavaScript knowledge
- Claude Code CLI installed

## Setting Up Your Project

Create a new directory for your MCP server and initialize it:

\`\`\`bash
mkdir my-mcp-server
cd my-mcp-server
npm init -y
\`\`\`

## Install Dependencies

\`\`\`bash
npm install @anthropic/mcp-sdk typescript ts-node
\`\`\`

## Create the Server Code

Create a file named \`index.ts\` with the following content:

\`\`\`typescript
import { MCPServer } from '@anthropic/mcp-sdk';

// Create a new MCP server
const server = new MCPServer();

// Register a resource
server.registerResource('hello', async () => {
  return 'Hello, world!';
});

// Register a tool
server.registerTool('greet', async ({ name }) => {
  return \`Hello, \${name}!\`;
});

// Start the server
server.start();
\`\`\`

## Testing Your Server

You can now build and test your server:

\`\`\`bash
npx ts-node index.ts
\`\`\`

## Using Your Custom Server

In another terminal, add your server to Claude Code:

\`\`\`bash
claude mcp add my-server ./
\`\`\`

Now you can use your custom server with Claude:

\`\`\`
User: Use my-server to greet Claude
Claude: I'll use the custom server to greet...
\`\`\`

## Next Steps

- Add more complex tools and resources
- Implement authentication
- Share your MCP server with others`},{id:"tutorial-03",title:"Using MCP Clients Effectively",description:"How to get the most out of your MCP clients",author:"AchaAI Team",datePublished:"2025-04-22",category:"Intermediate",tags:["mcp","clients","productivity"],image:"/assets/tutorial-images/mcp-clients.jpg",content:`# Using MCP Clients Effectively

This tutorial will help you maximize productivity with different MCP clients.

## What are MCP Clients?

MCP clients are applications that can connect to MCP servers and let you interact with Claude. They come in various forms such as desktop apps, web applications, CLI tools, and IDE extensions.

## Popular MCP Clients

### 1. Claude Desktop

Claude Desktop is a full-featured desktop application that provides a rich interface for working with Claude and MCP servers.

**Key Features:**
- Visual interface for MCP server management
- Conversation history
- Document upload and analysis
- Export capabilities

### 2. VSCode MCP Extension

The VSCode extension integrates Claude directly into your coding workflow.

**Key Features:**
- Code completion and explanation
- In-editor chat with context awareness
- MCP server integration for tool access

### 3. MCP CLI Client

The command-line interface client is perfect for terminal users and automation.

**Key Features:**
- Scriptable interactions
- Pipeline integration
- Automation capabilities

## Best Practices

1. **Choose the Right Client** - Select a client that matches your workflow.
2. **Configure MCP Servers Consistently** - Use the same servers across clients.
3. **Leverage Client-Specific Features** - Take advantage of the unique features each client offers.

## Client Comparison

Here's a quick comparison of popular clients:

| Client | Interface | Best For | MCP Integration |
|--------|-----------|----------|----------------|
| Claude Desktop | GUI | General use | Full |
| VSCode Extension | IDE | Coding | Code-focused |
| CLI Client | Terminal | Automation | Scriptable |

## Conclusion

Choosing the right MCP client and configuring it properly can significantly enhance your productivity with Claude and MCP servers.`}];export{e as default};
