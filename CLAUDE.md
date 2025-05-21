# Using the MCP Marketplace with Claude Code

This document explains how to use the MCP servers from this marketplace with Claude Code.

## What is MCP?

Model Context Protocol (MCP) is an open protocol that enables LLMs to access external tools and data sources. MCP servers can provide three main types of capabilities:
- **Resources**: File-like data that can be read by clients (like API responses or file contents)
- **Tools**: Functions that can be called by the LLM (with user approval)
- **Prompts**: Pre-written templates that help users accomplish specific tasks

## Configuring MCP Servers in Claude Code

You can check MCP server status any time using the `/mcp` command within Claude Code. To add an MCP server:

```bash
# Add a local-scoped server (default)
claude mcp add server-name /path/to/server

# Explicitly specify local scope
claude mcp add server-name -s local /path/to/server

# Add a project-scoped server
claude mcp add shared-server -s project /path/to/server
```

## Examples

To add a server from this marketplace:

1. First, find and download the MCP server you want to use
2. Navigate to the folder containing the server
3. Run Claude Code and add the server:

```bash
cd /path/to/mcp-server
claude mcp add my-server .
```

## Security Considerations

Use third party MCP servers at your own risk. Make sure you trust the MCP servers, and be especially careful when using MCP servers that talk to the internet, as these can expose you to prompt injection risk.

Before using project-scoped servers from `.mcp.json`, Claude Code will prompt you to approve them for security. The `.mcp.json` file is intended to be checked into version control to share MCP servers with your team.

## Troubleshooting

If you see "No MCP servers configured" when running `claude mcp`, you need to add at least one MCP server using the commands above.

For more detailed information about MCP, refer to the official [Model Context Protocol documentation](https://modelcontextprotocol.io/)

## Website Development Guidelines

### Design & Animation Guidelines
- Maintain consistent color scheme based on purple/indigo gradients
- Ensure all animations have a purpose and enhance usability
- Keep animation durations short (300-800ms) for best user experience
- Use custom animations for page transitions, hover effects, and loading states
- Always include fallbacks for reduced motion preferences

### Performance Considerations
- Use hardware-accelerated properties for animations (transform, opacity)
- Debounce scroll and resize event handlers
- Ensure skeleton loaders are used during data loading
- Lazy load images and heavy components
- Implement proper cleanup for effects and animations

### Code Structure
- Place animation keyframes in tailwind.config.js
- Use custom hooks for complex animations
- Group related animation components in src/components/animations/
- Track animation performance using Chrome DevTools
- Run npm run dev for local development server

### Component Guidelines
- Prefer local component styles over global ones
- Use consistent animation durations and timing functions
- Add useful comments for complex animations
- Test on mobile and desktop viewports
- Ensure focus states are visible for accessibility