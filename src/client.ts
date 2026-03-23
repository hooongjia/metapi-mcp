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

  // ─── Site Management ───

  async createSite(data: {
    name: string;
    url: string;
    platform?: string;
    proxyUrl?: string;
    useSystemProxy?: boolean;
    customHeaders?: string;
    externalCheckinUrl?: string;
    status?: string;
    globalWeight?: number;
  }) {
    return this.request('/api/sites', { method: 'POST', body: data });
  }

  async updateSite(id: number, data: Record<string, unknown>) {
    return this.request(`/api/sites/${id}`, { method: 'PUT', body: data });
  }

  async deleteSite(id: number) {
    return this.request(`/api/sites/${id}`, { method: 'DELETE' });
  }

  async detectSitePlatform(url: string) {
    return this.request('/api/sites/detect', { method: 'POST', body: { url } });
  }

  async getSiteDisabledModels(id: number) {
    return this.request(`/api/sites/${id}/disabled-models`);
  }

  async updateSiteDisabledModels(id: number, models: string[]) {
    return this.request(`/api/sites/${id}/disabled-models`, { method: 'PUT', body: { models } });
  }

  // ─── Account Management ───

  async createAccount(data: {
    siteId: number;
    accessToken: string;
    username?: string;
    apiToken?: string;
    platformUserId?: string;
    checkinEnabled?: boolean;
    credentialMode?: string;
  }) {
    return this.request('/api/accounts', { method: 'POST', body: data });
  }

  async loginAccount(data: { siteId: number; username: string; password: string }) {
    return this.request('/api/accounts/login', { method: 'POST', body: data });
  }

  async updateAccount(id: number, data: Record<string, unknown>) {
    return this.request(`/api/accounts/${id}`, { method: 'PUT', body: data });
  }

  async deleteAccount(id: number) {
    return this.request(`/api/accounts/${id}`, { method: 'DELETE' });
  }

  async getAccountModels(id: number) {
    return this.request(`/api/accounts/${id}/models`);
  }

  async refreshAccountHealth(accountId?: number) {
    return this.request('/api/accounts/health/refresh', {
      method: 'POST',
      body: accountId ? { accountId } : {},
    });
  }

  // ─── Downstream API Key Management ───

  async listDownstreamKeys() {
    return this.request('/api/downstream-keys');
  }

  async getDownstreamKeySummary(params?: {
    range?: string;
    status?: string;
    search?: string;
    group?: string;
    tags?: string;
  }) {
    return this.request('/api/downstream-keys/summary', {
      params: params as Record<string, string | undefined>,
    });
  }

  async getDownstreamKeyOverview(id: number) {
    return this.request(`/api/downstream-keys/${id}/overview`);
  }

  async getDownstreamKeyTrend(id: number, range?: string) {
    return this.request(`/api/downstream-keys/${id}/trend`, {
      params: range ? { range } : undefined,
    });
  }

  async createDownstreamKey(data: {
    name: string;
    key: string;
    description?: string;
    groupName?: string;
    tags?: string[];
    enabled?: boolean;
    expiresAt?: string;
    maxCost?: number;
    maxRequests?: number;
    supportedModels?: string[];
    allowedRouteIds?: number[];
  }) {
    return this.request('/api/downstream-keys', { method: 'POST', body: data });
  }

  async updateDownstreamKey(id: number, data: Record<string, unknown>) {
    return this.request(`/api/downstream-keys/${id}`, { method: 'PUT', body: data });
  }

  async deleteDownstreamKey(id: number) {
    return this.request(`/api/downstream-keys/${id}`, { method: 'DELETE' });
  }

  async resetDownstreamKeyUsage(id: number) {
    return this.request(`/api/downstream-keys/${id}/reset-usage`, { method: 'POST' });
  }

  async batchDownstreamKeys(ids: number[], action: string) {
    return this.request('/api/downstream-keys/batch', {
      method: 'POST',
      body: { ids, action },
    });
  }

  // ─── Usage Stats ───

  async getSiteDistribution() {
    return this.request('/api/stats/site-distribution');
  }

  async getSiteTrend(days?: number) {
    return this.request('/api/stats/site-trend', {
      params: days ? { days } : undefined,
    });
  }

  async getModelBySite(params?: { siteId?: number; days?: number }) {
    return this.request('/api/stats/model-by-site', {
      params: params as Record<string, string | number | undefined>,
    });
  }
}
