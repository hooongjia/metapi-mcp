import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { MetapiClient } from '../client.js';

function json(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

export function registerSiteTools(server: McpServer, client: MetapiClient) {
  server.registerTool(
    'create_site',
    {
      title: 'Create Site',
      description: '创建上游站点',
      inputSchema: z.object({
        name: z.string().describe('站点名称'),
        url: z.string().url().describe('站点 URL'),
        platform: z.string().optional().describe('平台类型（new-api / one-api / onehub / done-hub / veloera / anyrouter / sub2api），留空自动探测'),
        proxyUrl: z.string().optional().describe('代理 URL'),
        useSystemProxy: z.boolean().optional().describe('是否使用系统代理'),
        customHeaders: z.string().optional().describe('自定义请求头（JSON 字符串）'),
        externalCheckinUrl: z.string().optional().describe('外部签到 URL'),
        status: z.enum(['active', 'disabled']).optional().describe('初始状态'),
        globalWeight: z.number().optional().describe('全局权重'),
      }),
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async (args) => {
      const data = await client.createSite(args);
      return json(data);
    },
  );

  server.registerTool(
    'update_site',
    {
      title: 'Update Site',
      description: '更新上游站点配置',
      inputSchema: z.object({
        id: z.number().describe('站点 ID'),
        name: z.string().optional().describe('站点名称'),
        url: z.string().url().optional().describe('站点 URL'),
        platform: z.string().optional().describe('平台类型'),
        proxyUrl: z.string().optional().describe('代理 URL'),
        useSystemProxy: z.boolean().optional().describe('是否使用系统代理'),
        customHeaders: z.string().optional().describe('自定义请求头（JSON 字符串）'),
        externalCheckinUrl: z.string().optional().describe('外部签到 URL'),
        status: z.enum(['active', 'disabled']).optional().describe('状态'),
        globalWeight: z.number().optional().describe('全局权重'),
      }),
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async ({ id, ...rest }) => {
      const data = await client.updateSite(id, rest);
      return json(data);
    },
  );

  server.registerTool(
    'delete_site',
    {
      title: 'Delete Site',
      description: '删除上游站点（会级联删除关联账号）',
      inputSchema: z.object({
        id: z.number().describe('站点 ID'),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      const data = await client.deleteSite(id);
      return json(data);
    },
  );

  server.registerTool(
    'detect_site_platform',
    {
      title: 'Detect Site Platform',
      description: '探测 URL 对应的平台类型',
      inputSchema: z.object({
        url: z.string().url().describe('站点 URL'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: true },
    },
    async ({ url }) => {
      const data = await client.detectSitePlatform(url);
      return json(data);
    },
  );

  server.registerTool(
    'get_site_disabled_models',
    {
      title: 'Site Disabled Models',
      description: '获取站点禁用的模型列表',
      inputSchema: z.object({
        id: z.number().describe('站点 ID'),
      }),
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ id }) => {
      const data = await client.getSiteDisabledModels(id);
      return json(data);
    },
  );

  server.registerTool(
    'update_site_disabled_models',
    {
      title: 'Update Site Disabled Models',
      description: '更新站点禁用的模型列表（全量替换）',
      inputSchema: z.object({
        id: z.number().describe('站点 ID'),
        models: z.array(z.string()).describe('禁用模型名称列表，传空数组清除全部禁用'),
      }),
      annotations: { readOnlyHint: false, openWorldHint: false },
    },
    async ({ id, models }) => {
      const data = await client.updateSiteDisabledModels(id, models);
      return json(data);
    },
  );
}
