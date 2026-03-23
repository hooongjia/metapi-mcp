# Metapi MCP Server

将 [Metapi](https://github.com/cita-777/metapi) 的管理能力通过 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 暴露给 AI 客户端（Claude Desktop、Cursor 等）。

## 特性

- **独立项目** — 不修改 Metapi 源码，通过 HTTP 调用 Metapi REST API
- **23 个 MCP Tools** — 涵盖查询（仪表盘、模型、日志、路由等）和操作（签到、刷新余额、重建路由等）
- **双传输模式** — 支持 stdio（本地使用）和 Streamable HTTP（远程部署）
- **TypeScript** — 端到端类型安全
- **MCP SDK >= 1.24** — 基于 `@modelcontextprotocol/sdk` 1.27.x

## 快速开始

### 安装

```bash
npm install
npm run build
```

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `METAPI_BASE_URL` | Metapi 实例地址 | `http://localhost:4000` |
| `METAPI_AUTH_TOKEN` | Metapi 管理员令牌（用于 `/api/*` 接口） | — |
| `METAPI_PROXY_TOKEN` | Metapi 代理令牌（用于 `/v1/*` 接口） | — |
| `MCP_TRANSPORT` | 传输模式：`stdio` 或 `http` | `stdio` |
| `MCP_PORT` | HTTP 模式监听端口 | `3100` |

### stdio 模式（Claude Desktop / Cursor）

```json
{
  "mcpServers": {
    "metapi": {
      "command": "node",
      "args": ["/path/to/metapi-mcp/dist/index.js"],
      "env": {
        "METAPI_BASE_URL": "http://localhost:4000",
        "METAPI_AUTH_TOKEN": "your-admin-token",
        "METAPI_PROXY_TOKEN": "your-proxy-token"
      }
    }
  }
}
```

### HTTP 模式（远程部署）

```bash
export METAPI_BASE_URL=http://localhost:4000
export METAPI_AUTH_TOKEN=your-admin-token
export METAPI_PROXY_TOKEN=your-proxy-token
export MCP_TRANSPORT=http
export MCP_PORT=3100

node dist/index.js
```

### 测试

```bash
# MCP Inspector 图形化测试
npx @modelcontextprotocol/inspector node dist/index.js

# curl 测试 HTTP 模式
MCP_TRANSPORT=http node dist/index.js &

# 初始化会话
curl -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0.0"}}}'

# 列出所有 Tool（需要在请求头中加入上一步返回的 mcp-session-id）
curl -X POST http://localhost:3100/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "mcp-session-id: <session-id>" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}'
```

## Tool 清单

### 查询类 (14)

| # | Tool | 说明 |
|---|------|------|
| T1 | `list_models` | 获取所有可用模型列表 |
| T2 | `get_dashboard` | 仪表盘数据（余额、消费、签到、代理统计） |
| T3 | `get_proxy_logs` | 代理请求日志（支持筛选） |
| T4 | `get_proxy_log_detail` | 单条日志详情（含计费） |
| T5 | `get_models_marketplace` | 模型广场（覆盖率、定价对比） |
| T6 | `search` | 全局搜索 |
| T7 | `explain_route_decision` | 路由决策解释 |
| T8 | `list_routes` | 路由规则列表 |
| T9 | `get_route_channels` | 路由通道详情 |
| T10 | `list_accounts` | 账号列表 |
| T11 | `list_sites` | 上游站点列表 |
| T12 | `get_checkin_logs` | 签到日志 |
| T13 | `get_events` | 系统事件列表 |
| T14 | `get_unread_event_count` | 未读事件数量 |

### 操作类 (9)

| # | Tool | 说明 |
|---|------|------|
| T15 | `trigger_checkin` | 触发全部签到 |
| T16 | `trigger_account_checkin` | 触发指定账号签到 |
| T17 | `refresh_account_balance` | 刷新账号余额 |
| T18 | `refresh_account_models` | 刷新账号模型列表 |
| T19 | `refresh_models_marketplace` | 刷新模型广场 |
| T20 | `rebuild_routes` | 重建路由表 |
| T21 | `mark_events_read` | 标记所有事件已读 |
| T22 | `toggle_account` | 启用/禁用账号 |
| T23 | `toggle_site` | 启用/禁用站点 |

## 技术栈

- **Runtime**: Node.js >= 18
- **Language**: TypeScript
- **MCP SDK**: `@modelcontextprotocol/sdk` 1.27.x
- **HTTP Framework**: Express (HTTP 传输模式)
- **Validation**: Zod

## License

MIT
