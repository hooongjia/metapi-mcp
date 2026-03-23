import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetapiClient } from '../client.js';

function json(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerDownstreamKeyTools(server: McpServer, client: MetapiClient) {
  server.registerTool(
    'list_downstream_keys',
    {
      title: 'List Downstream Keys',
      description: '列出所有下游 API Key',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const data = await client.listDownstreamKeys();
      return json(data);
    },
  );

  server.registerTool(
    'get_downstream_key_summary',
    {
      title: 'Downstream Key Summary',
      description: '获取下游 API Key 摘要列表（含用量统计）',
      inputSchema: z.object({
        range: z.string().optional().describe('时间范围（如 7d、30d）'),
        status: z.string().optional().describe('状态过滤'),
        search: z.string().optional().describe('搜索关键词'),
        group: z.string().optional().describe('分组过滤'),
        tags: z.string().optional().describe('标签过滤（逗号分隔）'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      const data = await client.getDownstreamKeySummary(args);
      return json(data);
    },
  );

  server.registerTool(
    'get_downstream_key_overview',
    {
      title: 'Downstream Key Overview',
      description: '获取单个下游 API Key 详情和用量概览',
      inputSchema: z.object({
        id: z.number().describe('下游 Key ID'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      const data = await client.getDownstreamKeyOverview(id);
      return json(data);
    },
  );

  server.registerTool(
    'get_downstream_key_trend',
    {
      title: 'Downstream Key Trend',
      description: '获取单个下游 API Key 的用量趋势',
      inputSchema: z.object({
        id: z.number().describe('下游 Key ID'),
        range: z.string().optional().describe('时间范围（如 7d、30d）'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ id, range }) => {
      const data = await client.getDownstreamKeyTrend(id, range);
      return json(data);
    },
  );

  server.registerTool(
    'create_downstream_key',
    {
      title: 'Create Downstream Key',
      description: '创建下游 API Key（供客户端调用代理网关使用）',
      inputSchema: z.object({
        name: z.string().describe('Key 名称'),
        key: z.string().describe('Key 值（建议 sk- 前缀）'),
        description: z.string().optional().describe('描述'),
        groupName: z.string().optional().describe('分组名称'),
        tags: z.array(z.string()).optional().describe('标签列表'),
        enabled: z.boolean().optional().describe('是否启用'),
        expiresAt: z.string().optional().describe('过期时间 (ISO 8601)'),
        maxCost: z.number().optional().describe('最大消费额度'),
        maxRequests: z.number().optional().describe('最大请求数'),
        supportedModels: z.array(z.string()).optional().describe('允许的模型列表'),
        allowedRouteIds: z.array(z.number()).optional().describe('允许的路由 ID 列表'),
      }),
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async (args) => {
      const data = await client.createDownstreamKey(args);
      return json(data);
    },
  );

  server.registerTool(
    'update_downstream_key',
    {
      title: 'Update Downstream Key',
      description: '更新下游 API Key 配置',
      inputSchema: z.object({
        id: z.number().describe('下游 Key ID'),
        name: z.string().optional().describe('Key 名称'),
        description: z.string().optional().describe('描述'),
        groupName: z.string().optional().describe('分组名称'),
        tags: z.array(z.string()).optional().describe('标签列表'),
        enabled: z.boolean().optional().describe('是否启用'),
        expiresAt: z.string().optional().describe('过期时间 (ISO 8601)'),
        maxCost: z.number().optional().describe('最大消费额度'),
        maxRequests: z.number().optional().describe('最大请求数'),
        supportedModels: z.array(z.string()).optional().describe('允许的模型列表'),
        allowedRouteIds: z.array(z.number()).optional().describe('允许的路由 ID 列表'),
      }),
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async ({ id, ...rest }) => {
      const data = await client.updateDownstreamKey(id, rest);
      return json(data);
    },
  );

  server.registerTool(
    'delete_downstream_key',
    {
      title: 'Delete Downstream Key',
      description: '删除下游 API Key',
      inputSchema: z.object({
        id: z.number().describe('下游 Key ID'),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      const data = await client.deleteDownstreamKey(id);
      return json(data);
    },
  );

  server.registerTool(
    'reset_downstream_key_usage',
    {
      title: 'Reset Downstream Key Usage',
      description: '重置下游 API Key 的已用量计数',
      inputSchema: z.object({
        id: z.number().describe('下游 Key ID'),
      }),
      annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      const data = await client.resetDownstreamKeyUsage(id);
      return json(data);
    },
  );
}
