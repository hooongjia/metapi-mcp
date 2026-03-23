export interface MetapiConfig {
  baseUrl: string;
  authToken: string;
  proxyToken: string;
}

export function loadConfig(): MetapiConfig {
  const baseUrl = (process.env.METAPI_BASE_URL ?? 'http://localhost:4000').replace(/\/+$/, '');
  const authToken = process.env.METAPI_AUTH_TOKEN ?? '';
  const proxyToken = process.env.METAPI_PROXY_TOKEN ?? '';

  if (!authToken) {
    console.error('Warning: METAPI_AUTH_TOKEN is not set. Admin API calls will fail.');
  }
  if (!proxyToken) {
    console.error('Warning: METAPI_PROXY_TOKEN is not set. Proxy API calls (e.g. list_models) will fail.');
  }

  return { baseUrl, authToken, proxyToken };
}
