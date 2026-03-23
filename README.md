# Metapi MCP Server

将 [Metapi](https://github.com/cita-777/metapi) 的管理能力通过 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) 暴露给 AI 客户端（Claude Desktop、Cursor 等）。

## 特性

- **独立项目** — 不修改 Metapi 源码，通过 HTTP 调用 Metapi REST API
- **23 个 MCP Tools** — 涵盖查询（仪表盘、模型、日志、路由等）和操作（签到、刷新余额、重建路由等）
- **双传输模式** — 支持 stdio（本地使用）和 Streamable HTTP（远程部署）
- **TypeScript** — 端到端类型安全，基于 `@modelcontextprotocol/sdk` 1.27.x

## 启动指南

### 1. 安装与构建

```bash
git clone git@github.com:hooongjia/metapi-mcp.git
cd metapi-mcp
npm install
npm run build
```

### 2. 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `METAPI_BASE_URL` | Metapi 实例地址 | `http://localhost:4000` |
| `METAPI_AUTH_TOKEN` | Metapi 管理员令牌（用于 `/api/*` 接口） | — |
| `METAPI_PROXY_TOKEN` | Metapi 代理令牌（用于 `/v1/*` 接口） | — |
| `MCP_TRANSPORT` | 传输模式：`stdio` 或 `http` | `stdio` |
| `MCP_PORT` | HTTP 模式监听端口 | `3100` |

### 3. 接入 Claude Desktop

编辑 Claude Desktop 配置文件（macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`）：

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

将 `/path/to/metapi-mcp` 替换为实际路径，保存后重启 Claude Desktop 即可在对话中使用 Metapi 管理功能。

### 4. 接入 Cursor

编辑项目根目录 `.cursor/mcp.json` 或全局配置 `~/.cursor/mcp.json`：

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

### 5. HTTP 模式（远程部署）

适用于需要远程访问 MCP Server 的场景：

```bash
export METAPI_BASE_URL=http://your-metapi-host:4000
export METAPI_AUTH_TOKEN=your-admin-token
export METAPI_PROXY_TOKEN=your-proxy-token
export MCP_TRANSPORT=http
export MCP_PORT=3100

node dist/index.js
# => Metapi MCP Server (HTTP) listening on http://0.0.0.0:3100/mcp
```

客户端通过 `http://your-server:3100/mcp` 连接。

## Tool 概览

### 查询类

| Tool | 说明 |
|------|------|
| `list_models` | 获取所有可用模型列表 |
| `get_dashboard` | 仪表盘数据（余额、消费、签到、代理统计） |
| `get_proxy_logs` | 代理请求日志（支持按状态/模型/站点/时间筛选） |
| `get_proxy_log_detail` | 单条日志详情（含计费明细） |
| `get_models_marketplace` | 模型广场（跨站覆盖率、定价对比） |
| `search` | 全局搜索（站点、账号、Token、模型、日志） |
| `explain_route_decision` | 路由决策解释（匹配路由、候选通道、概率分配） |
| `list_routes` | 路由规则列表 |
| `get_route_channels` | 指定路由的通道详情 |
| `list_accounts` | 账号列表（关联站点、余额、状态） |
| `list_sites` | 上游站点列表 |
| `get_checkin_logs` | 签到日志 |
| `get_events` | 系统事件列表 |
| `get_unread_event_count` | 未读事件数量 |

### 操作类

| Tool | 说明 |
|------|------|
| `trigger_checkin` | 触发全部账号签到 |
| `trigger_account_checkin` | 触发指定账号签到 |
| `refresh_account_balance` | 刷新指定账号余额 |
| `refresh_account_models` | 刷新指定账号模型列表 |
| `refresh_models_marketplace` | 刷新模型广场数据 |
| `rebuild_routes` | 重建路由表 |
| `mark_events_read` | 标记所有事件已读 |
| `toggle_account` | 启用/禁用指定账号 |
| `toggle_site` | 启用/禁用指定站点 |

## License

MIT
