# Tech Hub API

This API provides endpoints for managing tech products in our hub, including MCP servers, MCP clients, AI agents, and ready-to-use solutions.

## Database Configuration

This API requires an AWS PostgreSQL database connection:

- Host: achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com
- Port: 5432
- Database: achai
- User: achai
- Password: TrinityPW1

## Setup Instructions

1. Ensure your AWS PostgreSQL database is set up and running
2. Start the API server:
   ```
   node src/api/server.js
   ```
3. The API server will:
   - Connect to the AWS database
   - Create necessary tables if they don't exist
   - Import initial data from JSON files if the database is empty

## Available Endpoints

### Basic CRUD Operations

- `GET /api/products` - Get all products with pagination
- `GET /api/products/id/:id` - Get a product by ID
- `GET /api/products/slug/:slug` - Get a product by slug
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Search and Filtering

- `GET /api/products/search?query=keyword` - Search products
- `GET /api/products/category/:category` - Filter products by category
- `GET /api/products/type/:productType` - Filter products by type (mcp_server, mcp_client, ai_agent, ready_to_use)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/official` - Get official products

### Bulk Operations

- `POST /api/products/bulk` - Create multiple products at once
- `PUT /api/products/bulk` - Update multiple products at once
- `DELETE /api/products/bulk` - Delete multiple products at once

### Status Information

- `GET /api/health` - Check API health status and data source information
- `GET /api/products/data-status` - Get data source information

## AWS Database Requirements

This API requires a direct connection to the AWS PostgreSQL database. There is no fallback mode available.

- If the AWS database is unavailable, the API will not start
- All database operations are performed against the AWS database
- No local data caching or storage is implemented

## Product Fields

| Field Name           | Type                 | Description                                            |
|----------------------|----------------------|--------------------------------------------------------|
| id                   | UUID                 | Unique identifier                                      |
| name                 | String               | Product name                                           |
| description          | String               | Product description                                    |
| image_url            | String               | URL to product image                                   |
| icon_url             | String               | URL to product icon                                    |
| category             | String               | Main category                                          |
| categories           | Array<String>        | Multiple categories                                    |
| sku                  | String               | Stock keeping unit                                     |
| product_type         | Enum                 | Type: mcp_server, mcp_client, ai_agent, ready_to_use   |
| github_url           | String               | GitHub repository URL                                  |
| official             | Boolean              | Whether this is an official product                    |
| docs_url             | String               | Documentation URL                                      |
| demo_url             | String               | Demo URL                                               |
| language             | String               | Programming language                                   |
| license              | String               | License type                                           |
| creator              | String               | Creator/author                                         |
| version              | String               | Current version                                        |
| installation_command | String               | Command to install                                     |
| tags                 | Array<String>        | Product tags                                           |
| is_featured          | Boolean              | Whether product is featured                            |
| is_active            | Boolean              | Whether product is active                              |
| slug                 | String               | URL-friendly identifier                                |
| stars_numeric        | Integer              | Number of GitHub stars                                 |

## Example Product

```json
{
  "name": "PostgreSQL MCP Server",
  "description": "An MCP server that provides access to PostgreSQL databases",
  "icon_url": "/assets/server-images/postgres.svg",
  "category": "Database",
  "categories": ["Database", "SQL", "Storage"],
  "product_type": "mcp_server",
  "github_url": "https://github.com/mcpland/postgres-server",
  "official": true,
  "language": "TypeScript",
  "license": "MIT",
  "creator": "MCP Project",
  "version": "1.2.0",
  "installation_command": "npm install mcp-server-postgres",
  "tags": ["database", "sql", "postgres", "storage"]
}
```

## Configuration

The following environment variables can be used to configure the API:

- `DB_USER` - AWS PostgreSQL username (default: achai)
- `DB_PASSWORD` - AWS PostgreSQL password (default: TrinityPW1)
- `DB_HOST` - AWS PostgreSQL host (default: achai.cn2ayqgqu2w8.us-east-2.rds.amazonaws.com)
- `DB_PORT` - AWS PostgreSQL port (default: 5432)
- `DB_NAME` - AWS PostgreSQL database name (default: achai)
- `API_PORT` - Port for the API server (default: 3001)
- `NODE_ENV` - Environment ('development' or 'production')