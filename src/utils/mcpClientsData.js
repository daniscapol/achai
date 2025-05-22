/**
 * MCP Clients data
 */

// MCP Clients data for displaying on the homepage
export const mcpClientProducts = [
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    description: 'Official desktop application for Claude with MCP integration',
    type: 'client',
    categoryType: 'mcp-client',
    category: 'Desktop Applications',
    tags: ['desktop', 'anthropic', 'claude', 'mcp-client'],
    official: true,
    stars_numeric: 8750,
    local_image_path: '/assets/client-logos/claude-desktop.png'
  },
  {
    id: 'vscode-mcp-extension',
    name: 'VSCode MCP Extension',
    description: 'Integrate Claude and MCP servers directly into your VSCode environment',
    type: 'client',
    categoryType: 'mcp-client',
    category: 'IDE Extensions',
    tags: ['vscode', 'extension', 'plugin', 'ide', 'development'],
    official: false,
    stars_numeric: 5200,
    local_image_path: '/assets/client-logos/vscode.png'
  },
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'AI-first code editor with built-in MCP support',
    type: 'client',
    categoryType: 'mcp-client',
    category: 'Code Editors',
    tags: ['code-editor', 'development', 'ai'],
    official: false,
    stars_numeric: 19850,
    local_image_path: '/assets/client-logos/cursor.png'
  },
  {
    id: 'claude-cli',
    name: 'Claude CLI',
    description: 'Command line interface for interacting with Claude and MCP servers',
    type: 'client',
    categoryType: 'mcp-client',
    category: 'CLI Tools',
    tags: ['cli', 'terminal', 'command-line'],
    official: true,
    stars_numeric: 6540,
    local_image_path: '/assets/client-logos/mcp-cli.png'
  }
];