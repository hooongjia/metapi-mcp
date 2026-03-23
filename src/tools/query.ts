import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetapiClient } from '../client.js';

function json(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

function error(msg: string) {
  return { content: [{ type: 'text' as const, text: msg }], isError: true };
}

export function registerQueryTools(server: McpServer, client: MetapiClient) {
  // T1 list_models
  server.registerTool(
    'list_models',
    {
      title: 'List Models',
      description: '获取所有可用模型列表（通过代理网关）',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const data = await client.listModels();
      return json(data);
    },
  );

  // T2 get_dashboard
  server.registerTool(
    'get_dashboard',
    {
      title: 'Dashboard',
      description: '获取仪表盘数据：总余额、今日消费、签到情况、24h 代理统计、站点可用性',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const data = await client.getDashboard();
      return json(data);
    },
  );

  // T3 get_proxy_logs
  server.registerTool(
    'get_proxy_logs',
    {
      title: 'Proxy Logs',
      description: '查询代理请求日志，支持按状态、模型、站点、时间范围筛选',
      inputSchema: z.object({
        limit: z.number().min(1).max(100).default(20).describe('每页条数 (1-100)'),
        offset: z.number().min(0).default(0).describe('偏移量'),
        status: z.enum(['all', 'success', 'failed']).default('all').describe('状态过滤'),
        search: z.string().optional().describe('搜索关键词（模型名等）'),
        siteId: z.number().optional().describe('站点 ID 过滤'),
        from: z.string().optional().describe('起始时间 (ISO 8601)'),
        to: z.string().optional().describe('结束时间 (ISO 8601)'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      const data = await client.getProxyLogs(args);
      return json(data);
    },
  );

  // T4 get_proxy_log_detail
  server.registerTool(
    'get_proxy_log_detail',
    {
      title: 'Proxy Log Detail',
      description: '获取单条代理请求日志详情（含计费明细）',
      inputSchema: z.object({
        id: z.number().describe('日志 ID'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      const data = await client.getProxyLogDetail(id);
      return json(data);
    },
  );

  // T5 get_models_marketplace
  server.registerTool(
    'get_models_marketplace',
    {
      title: 'Models Marketplace',
      description: '获取模型广场数据：跨站模型覆盖率、定价对比',
      inputSchema: z.object({
        includePricing: z.boolean().default(false).describe('是否包含定价信息'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ includePricing }) => {
      const data = await client.getModelsMarketplace(includePricing);
      return json(data);
    },
  );

  // T6 search
  server.registerTool(
    'search',
    {
      title: 'Global Search',
      description: '全局搜索：站点、账号、Token、模型、日志',
      inputSchema: z.object({
        query: z.string().describe('搜索关键词'),
        limit: z.number().min(1).max(100).default(20).describe('返回条数'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ query, limit }) => {
      const data = await client.search(query, limit);
      return json(data);
    },
  );

  // T7 explain_route_decision
  server.registerTool(
    'explain_route_decision',
    {
      title: 'Explain Route Decision',
      description:
        '解释某个模型的路由选择过程（匹配的路由、候选通道、概率分配）。注意：此接口可能需要 Metapi v1.2+ 支持',
      inputSchema: z.object({
        model: z.string().describe('模型名称，例如 gpt-4o'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ model }) => {
      try {
        const data = await client.explainRouteDecision(model);
        return json(data);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('404') || msg.includes('Not Found')) {
          return error(
            `路由决策解释接口 (/api/routes/decision) 在当前 Metapi 版本中不可用。` +
            `请升级 Metapi 至支持此功能的版本。原始错误: ${msg}`,
          );
        }
        throw e;
      }
    },
  );

  // T8 list_routes
  server.registerTool(
    'list_routes',
    {
      title: 'List Routes',
      description: '获取路由规则列表（模型匹配模式、通道数、启用状态）',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const data = await client.listRoutes();
      return json(data);
    },
  );

  // T9 get_route_channels
  server.registerTool(
    'get_route_channels',
    {
      title: 'Route Channels',
      description: '获取指定路由下的所有通道详情',
      inputSchema: z.object({
        routeId: z.number().describe('路由 ID'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ routeId }) => {
      const data = await client.getRouteChannels(routeId);
      return json(data);
    },
  );

  // T10 list_accounts
  server.registerTool(
    'list_accounts',
    {
      title: 'List Accounts',
      description: '获取所有账号列表及其关联站点、余额、状态',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const data = await client.listAccounts();
      return json(data);
    },
  );

  // T11 list_sites
  server.registerTool(
    'list_sites',
    {
      title: 'List Sites',
      description: '获取所有上游站点列表',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const data = await client.listSites();
      return json(data);
    },
  );

  // T12 get_checkin_logs
  server.registerTool(
    'get_checkin_logs',
    {
      title: 'Checkin Logs',
      description: '获取签到日志',
      inputSchema: z.object({
        limit: z.number().min(1).max(100).default(30).describe('每页条数'),
        offset: z.number().min(0).default(0).describe('偏移量'),
        accountId: z.number().optional().describe('按账号 ID 过滤'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      const data = await client.getCheckinLogs(args);
      return json(data);
    },
  );

  // T13 get_events
  server.registerTool(
    'get_events',
    {
      title: 'System Events',
      description: '获取系统事件列表（余额告警、签到结果、代理异常等）',
      inputSchema: z.object({
        limit: z.number().min(1).max(100).default(30).describe('每页条数'),
        offset: z.number().min(0).default(0).describe('偏移量'),
        type: z.string().optional().describe('事件类型过滤'),
        read: z.enum(['true', 'false']).optional().describe('已读状态过滤'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async (args) => {
      const data = await client.getEvents(args);
      return json(data);
    },
  );

  // T14 get_unread_event_count
  server.registerTool(
    'get_unread_event_count',
    {
      title: 'Unread Event Count',
      description: '获取未读系统事件数量',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => {
      const data = await client.getUnreadEventCount();
      return json(data);
    },
  );
}
