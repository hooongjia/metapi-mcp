import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetapiClient } from '../client.js';

function json(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerStatsTools(server: McpServer, client: MetapiClient) {
  server.registerTool(
    'get_site_distribution',
    {
      title: 'Site Distribution',
      description: '获取各站点的余额分布、消费和账号数统计',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const data = await client.getSiteDistribution();
      return json(data);
    },
  );

  server.registerTool(
    'get_site_trend',
    {
      title: 'Site Trend',
      description: '获取按站点维度的消费与调用趋势（按天）',
      inputSchema: z.object({
        days: z.number().min(1).max(90).default(7).describe('天数范围'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ days }) => {
      const data = await client.getSiteTrend(days);
      return json(data);
    },
  );

  server.registerTool(
    'get_model_by_site',
    {
      title: 'Model Stats by Site',
      description: '按模型聚合的调用次数、消费、Token 用量统计',
      inputSchema: z.object({
        siteId: z.number().optional().describe('站点 ID 过滤'),
        days: z.number().min(1).max(90).default(7).describe('天数范围'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      const data = await client.getModelBySite(args);
      return json(data);
    },
  );
}
