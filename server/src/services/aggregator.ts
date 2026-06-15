import { useReal, config } from '../config.js';
import * as mock from '../mock/data.js';
import { wazuhAlerts, wazuhHealth } from '../connectors/wazuh.js';
import { mispHealth, mispLookup } from '../connectors/misp.js';
import { thehiveCases, thehiveHealth } from '../connectors/thehive.js';
import { syslogRecentEvents, syslogStats } from '../ingest/syslog/index.js';
import type { SecurityEvent, Incident, Integration } from '../types.js';

/**
 * The aggregator is the single source of truth for the UI. It prefers live
 * connector data and transparently falls back to the bundled demo dataset so
 * the platform is always populated.
 */

export async function getEvents(): Promise<{ data: SecurityEvent[]; live: boolean }> {
  // Eventos de firewall recebidos por syslog (push). Aparecem no topo do
  // stream porque são, por natureza, os mais recentes.
  const fw = syslogRecentEvents(undefined, 40);
  const fwLive = config.syslog.enabled && !config.demoMode && fw.length > 0;

  if (useReal('wazuh')) {
    const live = await wazuhAlerts(60);
    if (live && live.length) return { data: [...fw, ...live].slice(0, 100), live: true };
  }
  return { data: [...fw, ...mock.events].slice(0, 100), live: fwLive };
}

export async function getIncidents(): Promise<{ data: Incident[]; live: boolean }> {
  if (useReal('thehive')) {
    const live = await thehiveCases(40);
    if (live && live.length) return { data: live, live: true };
  }
  return { data: mock.incidents, live: false };
}

export async function getIntegrations(): Promise<Integration[]> {
  const list = mock.integrations.map((i) => ({ ...i }));
  if (!config.demoMode) {
    const [wz, ms, th] = await Promise.all([wazuhHealth(), mispHealth(), thehiveHealth()]);
    const patch: Record<string, typeof wz> = { wazuh: wz, misp: ms, thehive: th };
    for (const i of list) if (patch[i.key]) i.state = patch[i.key];
  }
  // Reflete o recetor de syslog com dados reais de ingestão.
  const fw = list.find((i) => i.key === 'firewall-syslog');
  if (fw) {
    const s = syslogStats();
    if (s.enabled) {
      fw.state = 'on';
      fw.eps = s.eps >= 1 ? `${s.eps.toFixed(1)}/s` : `${s.epsLastMinute}/min`;
      fw.events = String(s.total);
      fw.rules = `${s.blocked} bloqueios`;
    } else if (!config.demoMode) {
      fw.state = 'off';
    }
  }
  return list;
}

export async function getDashboard() {
  const integrations = await getIntegrations();
  const online = integrations.filter((i) => i.state === 'on').length;
  const summary = structuredClone(mock.dashboard);
  summary.kpis = summary.kpis.map((k) =>
    k.label.startsWith('Sensores') ? { ...k, value: `${online}/${integrations.length}` } : k,
  );
  return { ...summary, integrations, mode: config.demoMode ? 'demo' : 'live' };
}

export async function enrichIoc(ioc: string) {
  if (useReal('misp')) {
    const matches = await mispLookup(ioc);
    if (matches) return { ioc, matches, live: true };
  }
  return { ioc, matches: [], live: false };
}
