#!/usr/bin/env node

import { loadConfig } from './config.js';
import { createServer } from './server.js';
import { startStdio } from './transport/stdio.js';
import { startHttp } from './transport/http.js';

const transport = process.env.MCP_TRANSPORT ?? 'stdio';
const config = loadConfig();

if (transport === 'http') {
  const port = parseInt(process.env.MCP_PORT ?? '3100', 10);
  startHttp(config, port);
} else {
  const server = createServer(config);
  startStdio(server);
}
