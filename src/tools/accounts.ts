import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetapiClient } from '../client.js';

function json(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerAccountTools(server: McpServer, client: MetapiClient) {
  server.registerTool(
    'create_account',
    {
      title: 'Create Account',
      description: '手动添加账号（通过 accessToken 方式）',
      inputSchema: z.object({
        siteId: z.number().describe('关联站点 ID'),
        accessToken: z.string().describe('账号 Access Token'),
        username: z.string().optional().describe('用户名'),
        apiToken: z.string().optional().describe('API Token'),
        platformUserId: z.string().optional().describe('平台用户 ID'),
        checkinEnabled: z.boolean().optional().describe('是否启用自动签到'),
        credentialMode: z.string().optional().describe('凭证模式'),
      }),
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async (args) => {
      const data = await client.createAccount(args);
      return json(data);
    },
  );

  server.registerTool(
    'login_account',
    {
      title: 'Login Account',
      description: '通过用户名密码登录站点并创建/更新账号',
      inputSchema: z.object({
        siteId: z.number().describe('站点 ID'),
        username: z.string().describe('用户名'),
        password: z.string().describe('密码'),
      }),
      annotations: { readOnlyHint: false, openWorldHint: true },
    },
    async (args) => {
      const data = await client.loginAccount(args);
      return json(data);
    },
  );

  server.registerTool(
    'update_account',
    {
      title: 'Update Account',
      description: '更新账号配置',
      inputSchema: z.object({
        id: z.number().describe('账号 ID'),
        username: z.string().optional().describe('用户名'),
        status: z.enum(['active', 'disabled']).optional().describe('状态'),
        checkinEnabled: z.boolean().optional().describe('是否启用自动签到'),
        unitCost: z.number().optional().describe('单位成本'),
        isPinned: z.boolean().optional().describe('是否置顶'),
        sortOrder: z.number().optional().describe('排序权重'),
        proxyUrl: z.string().optional().describe('代理 URL'),
      }),
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async ({ id, ...rest }) => {
      const data = await client.updateAccount(id, rest);
      return json(data);
    },
  );

  server.registerTool(
    'delete_account',
    {
      title: 'Delete Account',
      description: '删除指定账号',
      inputSchema: z.object({
        id: z.number().describe('账号 ID'),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      const data = await client.deleteAccount(id);
      return json(data);
    },
  );

  server.registerTool(
    'get_account_models',
    {
      title: 'Account Models',
      description: '获取指定账号的可用模型列表',
      inputSchema: z.object({
        id: z.number().describe('账号 ID'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      const data = await client.getAccountModels(id);
      return json(data);
    },
  );

  server.registerTool(
    'refresh_account_health',
    {
      title: 'Refresh Account Health',
      description: '刷新账号运行时健康状态（不传 accountId 则刷新全部）',
      inputSchema: z.object({
        accountId: z.number().optional().describe('账号 ID，留空刷新全部'),
      }),
      annotations: { readOnlyHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ accountId }) => {
      const data = await client.refreshAccountHealth(accountId);
      return json(data);
    },
  );
}
