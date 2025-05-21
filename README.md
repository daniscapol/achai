# AchaAI - Cleaned MCP Tech Hub

This is a streamlined version of the AchaAI Tech Hub platform for Model Context Protocol (MCP) servers, clients, AI agents, and ready-to-use solutions. All unnecessary files, tests, and backups have been removed to create a clean, functional codebase.

## Features

- Modern React + TypeScript + Vite frontend
- PostgreSQL database for product storage
- RESTful API for product management
- Support for multiple product types:
  - MCP Servers
  - MCP Clients
  - AI Agents
  - Ready-to-use Solutions
  - Tutorials
  - News
- Responsive design with animation effects
- Advanced search and filtering
- Fixed navigation for all URL types

## Clean Version Improvements

- Removed all test and backup files
- Eliminated duplicate data files
- Removed Windows Zone.Identifier metadata files
- Fixed navigation between different URL formats
- Streamlined directory structure
- Eliminated development debugging utilities
- Added preloaded MCP data to work without an API server

## Quick Start

You can run the application with or without the API server:

### Option 1: Frontend Only (No API server needed)

```bash
# Install dependencies
npm install

# Start just the frontend
npm run dev
```

With this option, the application uses preloaded MCP data from JSON files and doesn't require a database.

### Option 2: Full Stack (Frontend + API Server)

```bash
# Install dependencies
npm install

# Start both frontend and API server
npm run dev:all
```

This option requires PostgreSQL to be installed and running.

## Database Structure

The platform uses AWS PostgreSQL RDS for data storage across multiple tables:

### Products Table
- Product types (MCP Server, MCP Client, AI Agent, Ready to Use)
- GitHub repository URLs
- Categories (stored as arrays)
- Technical specifications
- Installation commands

### Tutorials Table
- Title, slug, and description
- Content in Markdown format
- Structured sections for better organization
- Metadata like difficulty level, reading time
- Rating system with user feedback
- View counts and popularity metrics

### News Table
- Title, slug, and description
- Content in Markdown format
- Publication date and updates
- Categories and tags
- Featured image support

### AWS PostgreSQL Database Connection

The application requires a connection to the AWS PostgreSQL database:

```
Host: achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com
Port: 5432
Database: achai
Username: achai
Password: TrinityPW1
```

The database will be initialized automatically when you start the API server:
1. Creates the `products` table if it doesn't exist
2. Sets up necessary indexes
3. Imports sample data from JSON files if the database is empty

## Admin Panel

The platform includes an admin panel accessible at `/#/admin` with the following features:

### Server Management
- Review and approve community MCP server submissions
- Edit and update existing MCP servers
- Add new servers to the marketplace

### News Management
- Create, edit, and delete news articles
- Schedule publication of news articles
- Manage news categories and tags

### Tutorial Management
- Create and edit tutorials with rich Markdown content
- Organize tutorial content with structured sections
- Track tutorial metrics (views, ratings, feedback)
- Feature tutorials on the homepage

## Troubleshooting

### Handling AWS Database Connection Issues

If you encounter connection issues with the AWS database:

1. For browsing only, use frontend without API:
   - Run only the frontend with `npm run dev` (no API needed)
   - Frontend uses preloaded MCP data from JSON files

2. For full functionality, ensure AWS connection:
   - Verify your network allows connections to AWS RDS (port 5432)
   - Check if AWS RDS instance is running and accessible
   - Database connection settings are in `src/utils/db.js` 
   - Run with `npm run dev:all` to start both frontend and API

3. Common AWS connection issues:
   - Firewall blocking outbound connections
   - VPN or proxy interfering with AWS connectivity
   - AWS RDS service might be unavailable
   - Network issues affecting AWS connection

Note: The API server requires a working AWS database connection for creating, updating, and deleting products.

## Deployment

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory, ready for deployment to any static hosting service.

## Navigation Fix

A unified routing system has been implemented to ensure proper functionality with both URL formats:

1. **Hash-based routing** (`/#/products/server-02`): The traditional approach using fragment identifiers
2. **Direct path routing** (`/products/server-02`): The modern approach using clean URLs

The system automatically detects which format is being used and ensures all navigation works correctly regardless of the current URL type. Key features:

- Automatically converts between hash and direct path URLs as needed
- Consistent navigation experience across the entire site
- Handles both manually entered URLs and clicked links
- No page reloads when navigating within the same format

This unified routing fix is loaded by default in `index.html` and handles all navigation seamlessly.