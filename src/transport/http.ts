import express from 'express';
import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { MetapiConfig } from '../config.js';
import { createServer } from '../server.js';

export async function startHttp(config: MetapiConfig, port: number) {
  const app = express();
  app.use(express.json());

  const sessions = new Map<string, { transport: StreamableHTTPServerTransport; server: McpServer }>();

  app.all('/mcp', async (req, res) => {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;

    if (req.method === 'GET' || req.method === 'DELETE') {
      if (!sessionId || !sessions.has(sessionId)) {
        res.status(400).json({ error: 'Invalid or missing session ID' });
        return;
      }
      const session = sessions.get(sessionId)!;
      await session.transport.handleRequest(req, res, req.body);
      if (req.method === 'DELETE') {
        await session.server.close();
        sessions.delete(sessionId);
      }
      return;
    }

    // POST — existing session
    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId)!;
      await session.transport.handleRequest(req, res, req.body);
      return;
    }

    // POST — new session
    const server = createServer(config);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id) => {
        sessions.set(id, { transport, server });
      },
    });

    transport.onclose = () => {
      const sid = transport.sessionId;
      if (sid) sessions.delete(sid);
    };

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', sessions: sessions.size });
  });

  app.listen(port, '0.0.0.0', () => {
    console.error(`Metapi MCP Server (HTTP) listening on http://0.0.0.0:${port}/mcp`);
  });
}
