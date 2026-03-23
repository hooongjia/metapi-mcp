import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MetapiConfig } from './config.js';
import { MetapiClient } from './client.js';
import { registerQueryTools } from './tools/query.js';
import { registerActionTools } from './tools/action.js';
import { registerSiteTools } from './tools/sites.js';
import { registerAccountTools } from './tools/accounts.js';
import { registerDownstreamKeyTools } from './tools/downstream-keys.js';
import { registerStatsTools } from './tools/stats.js';

const PKG_VERSION = '1.0.0';

export function createServer(config: MetapiConfig): McpServer {
  const server = new McpServer(
    {
      name: 'metapi-mcp',
      version: PKG_VERSION,
    },
    {
      capabilities: {
        logging: {},
      },
    },
  );

  const client = new MetapiClient(config);

  registerQueryTools(server, client);
  registerActionTools(server, client);
  registerSiteTools(server, client);
  registerAccountTools(server, client);
  registerDownstreamKeyTools(server, client);
  registerStatsTools(server, client);

  return server;
}
