import { config, connectorConfigured } from '../config.js';
import { httpClient, logConnectorError } from './http.js';
import type { HealthState } from '../types.js';

/** MISP connector — threat intelligence enrichment over the REST API. */

function client() {
  return httpClient(config.misp.url, config.misp.insecureTLS, {
    headers: {
      Authorization: config.misp.apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

export async function mispHealth(): Promise<HealthState> {
  if (!connectorConfigured.misp()) return 'off';
  try {
    const { data } = await client().get('/servers/getVersion');
    return data?.version ? 'on' : 'deg';
  } catch (err) {
    logConnectorError('misp-health', err);
    return 'deg';
  }
}

export interface MispMatch {
  value: string;
  type: string;
  category: string;
  event: string;
  threatLevel: string;
  tags: string[];
}

export async function mispLookup(ioc: string): Promise<MispMatch[] | null> {
  if (!connectorConfigured.misp()) return null;
  try {
    const { data } = await client().post('/attributes/restSearch', {
      returnFormat: 'json',
      value: ioc,
      limit: 20,
    });
    const attrs = data?.response?.Attribute || [];
    return attrs.map((a: any): MispMatch => ({
      value: a.value,
      type: a.type,
      category: a.category,
      event: a.Event?.info || a.event_id,
      threatLevel: a.Event?.threat_level_id || '—',
      tags: (a.Tag || []).map((t: any) => t.name),
    }));
  } catch (err) {
    logConnectorError('misp-lookup', err);
    return null;
  }
}

export async function mispIocCount(): Promise<number | null> {
  if (!connectorConfigured.misp()) return null;
  try {
    const { data } = await client().post('/attributes/restSearch', {
      returnFormat: 'json',
      limit: 1,
      page: 1,
    });
    // MISP does not return a global count cheaply; report events instead.
    const events = await client().get('/events/index');
    return Array.isArray(events.data) ? events.data.length : null;
  } catch (err) {
    logConnectorError('misp-count', err);
    return null;
  }
}
