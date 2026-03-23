import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetapiClient } from '../client.js';

function json(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerActionTools(server: McpServer, client: MetapiClient) {
  // T15 trigger_checkin
  server.registerTool(
    'trigger_checkin',
    {
      title: 'Trigger All Checkin',
      description: '触发全部账号签到',
      annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      const data = await client.triggerCheckin();
      return json(data);
    },
  );

  // T16 trigger_account_checkin
  server.registerTool(
    'trigger_account_checkin',
    {
      title: 'Trigger Account Checkin',
      description: '触发指定账号签到',
      inputSchema: z.object({
        accountId: z.number().describe('账号 ID'),
      }),
      annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ accountId }) => {
      const data = await client.triggerAccountCheckin(accountId);
      return json(data);
    },
  );

  // T17 refresh_account_balance
  server.registerTool(
    'refresh_account_balance',
    {
      title: 'Refresh Account Balance',
      description: '刷新指定账号余额',
      inputSchema: z.object({
        accountId: z.number().describe('账号 ID'),
      }),
      annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ accountId }) => {
      const data = await client.refreshAccountBalance(accountId);
      return json(data);
    },
  );

  // T18 refresh_account_models
  server.registerTool(
    'refresh_account_models',
    {
      title: 'Refresh Account Models',
      description: '刷新指定账号的模型列表',
      inputSchema: z.object({
        accountId: z.number().describe('账号 ID'),
      }),
      annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ accountId }) => {
      const data = await client.refreshAccountModels(accountId);
      return json(data);
    },
  );

  // T19 refresh_models_marketplace
  server.registerTool(
    'refresh_models_marketplace',
    {
      title: 'Refresh Models Marketplace',
      description: '触发模型广场数据刷新',
      annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      const data = await client.refreshModelsMarketplace();
      return json(data);
    },
  );

  // T20 rebuild_routes
  server.registerTool(
    'rebuild_routes',
    {
      title: 'Rebuild Routes',
      description: '重建路由表（根据当前账号和模型数据重新生成路由规则）',
      annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      const data = await client.rebuildRoutes();
      return json(data);
    },
  );

  // T21 mark_events_read
  server.registerTool(
    'mark_events_read',
    {
      title: 'Mark Events Read',
      description: '将所有系统事件标记为已读',
      annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
    },
    async () => {
      const data = await client.markEventsRead();
      return json(data);
    },
  );

  // T22 toggle_account
  server.registerTool(
    'toggle_account',
    {
      title: 'Toggle Account',
      description: '启用或禁用指定账号',
      inputSchema: z.object({
        accountId: z.number().describe('账号 ID'),
      }),
      annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ accountId }) => {
      const data = await client.toggleAccount(accountId);
      return json(data);
    },
  );

  // T23 toggle_site
  server.registerTool(
    'toggle_site',
    {
      title: 'Toggle Site',
      description: '启用或禁用指定上游站点',
      inputSchema: z.object({
        siteId: z.number().describe('站点 ID'),
      }),
      annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
    },
    async ({ siteId }) => {
      const data = await client.toggleSite(siteId);
      return json(data);
    },
  );
}
