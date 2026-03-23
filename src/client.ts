import type { MetapiConfig } from './config.js';

export class MetapiClient {
  private baseUrl: string;
  private authToken: string;
  private proxyToken: string;

  constructor(config: MetapiConfig) {
    this.baseUrl = config.baseUrl;
    this.authToken = config.authToken;
    this.proxyToken = config.proxyToken;
  }

  private async request<T = unknown>(
    path: string,
    options: {
      method?: string;
      params?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
      useProxyToken?: boolean;
    } = {},
  ): Promise<T> {
    const { method = 'GET', params, body, useProxyToken = false } = options;
    const token = useProxyToken ? this.proxyToken : this.authToken;

    let url = `${this.baseUrl}${path}`;
    if (params) {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) qs.set(k, String(v));
      }
      const str = qs.toString();
      if (str) url += `?${str}`;
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(`Metapi API error ${res.status} ${res.statusText}: ${text}`);
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  // ─── Query Tools ───

  async listModels() {
    return this.request('/v1/models', { useProxyToken: true });
  }

  async getDashboard() {
    return this.request('/api/stats/dashboard');
  }

  async getProxyLogs(params: {
    limit?: number;
    offset?: number;
    status?: string;
    search?: string;
    siteId?: number;
    from?: string;
    to?: string;
  }) {
    return this.request('/api/stats/proxy-logs', {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async getProxyLogDetail(id: number) {
    return this.request(`/api/stats/proxy-logs/${id}`);
  }

  async getModelsMarketplace(includePricing?: boolean) {
    return this.request('/api/models/marketplace', {
      params: { includePricing: includePricing ?? false },
    });
  }

  async search(query: string, limit?: number) {
    return this.request('/api/search', {
      method: 'POST',
      body: { query, limit: limit ?? 20 },
    });
  }

  async explainRouteDecision(model: string) {
    return this.request('/api/routes/decision', {
      params: { model },
    });
  }

  async listRoutes() {
    try {
      return await this.request('/api/routes');
    } catch {
      return await this.request('/api/routes/summary');
    }
  }

  async getRouteChannels(routeId: number) {
    return this.request(`/api/routes/${routeId}/channels`);
  }

  async listAccounts() {
    return this.request('/api/accounts');
  }

  async listSites() {
    return this.request('/api/sites');
  }

  async getCheckinLogs(params: { limit?: number; offset?: number; accountId?: number }) {
    return this.request('/api/checkin/logs', {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async getEvents(params: { limit?: number; offset?: number; type?: string; read?: string }) {
    return this.request('/api/events', {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async getUnreadEventCount() {
    return this.request('/api/events/count');
  }

  // ─── Action Tools ───

  async triggerCheckin() {
    return this.request('/api/checkin/trigger', { method: 'POST' });
  }

  async triggerAccountCheckin(accountId: number) {
    return this.request(`/api/checkin/trigger/${accountId}`, { method: 'POST' });
  }

  async refreshAccountBalance(accountId: number) {
    return this.request(`/api/accounts/${accountId}/balance`, { method: 'POST' });
  }

  async refreshAccountModels(accountId: number) {
    return this.request(`/api/models/check/${accountId}`, { method: 'POST' });
  }

  async refreshModelsMarketplace() {
    return this.request('/api/models/marketplace', {
      params: { refresh: true },
    });
  }

  async rebuildRoutes() {
    return this.request('/api/routes/rebuild', { method: 'POST' });
  }

  async markEventsRead() {
    return this.request('/api/events/read-all', { method: 'POST' });
  }

  async toggleAccount(accountId: number) {
    return this.request('/api/accounts/batch', {
      method: 'POST',
      body: { action: 'toggle', ids: [accountId] },
    });
  }

  async toggleSite(siteId: number) {
    return this.request('/api/sites/batch', {
      method: 'POST',
      body: { action: 'toggle', ids: [siteId] },
    });
  }
}
