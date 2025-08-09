// src/connectors/CloudflareConnectorV2.ts
import axios, { AxiosInstance } from 'axios';
import {
  Connector,
  AuthContext,
  Session,
  Resource,
  QueryParams,
  Capabilities,
} from './Connector';
import { getSecret, storeToken, refreshToken } from '../secrets/vault';
import { backoffRetry } from '../lib/retries';
import { getLastSync, setLastSync } from '../lib/syncStore';

type CFResourceType =
  | 'zones'
  | 'dns_records'
  | 'firewall_rules'
  | 'page_rules'
  | 'analytics';

interface CloudflareSession extends Session {
  apiClient: AxiosInstance;
}

export const CloudflareConnectorV2: Connector = {
  id: 'cloudflare-v2',

  async discover(): Promise<Capabilities> {
    return {
      name: 'Cloudflare (v2)',
      capabilities: [
        'zones',
        'dns_records',
        'firewall_rules',
        'page_rules',
        'analytics'
      ]
    };
  },

  async authenticate(ctx: AuthContext): Promise<CloudflareSession> {
    let token = await getSecret('cloudflare-api-token');
    const apiClient = axios.create({
      baseURL: 'https://api.cloudflare.com/client/v4',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    // Self-healing token refresh
    apiClient.interceptors.response.use(
      r => r,
      async err => {
        if (err.response?.status === 401) {
          token = await refreshToken();         // implement refreshToken()
          await storeToken('cloudflare-api-token', token);              // store back in Vault
          err.config.headers.Authorization = `Bearer ${token}`;
          return axios(err.config);             // retry once
        }
        throw err;
      }
    );

    // Validate
    await apiClient.get('/user/tokens/verify');
    return { user: ctx.user, apiClient };
  },

  async fetchResources(
    session: CloudflareSession,
    params: QueryParams & { types: CFResourceType[] }
  ): Promise<Resource[]> {
    const out: Resource[] = [];
    const since = getLastSync(this.id) || 0;
    const now = Date.now();

    for (const type of params.types) {
      // For analytics, use specialized endpoint
      const endpoint =
        type === 'analytics'
          ? `/zones/${params.zoneId}/analytics/dashboard`
          : `/${type}`;

      const res = await backoffRetry(() =>
        session.apiClient.get(endpoint, {
          params: type !== 'analytics' ? { per_page: 100 } : {}
        })
      );

      let items: any[] =
        type === 'analytics' ? [res.data] : res.data.result;

      // Delta sync: only new/updated since last run
      if (Array.isArray(items)) {
          items = items.filter(i => new Date(i.modified_on || i.timestamp || now).getTime() > since);
      }


      items.forEach(i =>
        out.push({
          connectorId: this.id,
          resourceType: type,
          payload: i
        })
      );
    }

    setLastSync(this.id, now);
    return out;
  },

  async returnToPlatform(data: Resource[]): Promise<void> {
    const webhookUrl = process.env.PLATFORM_BASE_URL
      ? `${process.env.PLATFORM_BASE_URL}/api/webhooks/receive-external`
      : 'http://localhost:9002/api/webhooks/receive-external'; // Fallback for local dev

    await axios.post(
      webhookUrl,
      {
        connectorId: this.id,
        payload: data
      },
      {
        headers: {
          'x-webhook-token': await getSecret('platform-webhook-token')
        }
      }
    );
  }
};
