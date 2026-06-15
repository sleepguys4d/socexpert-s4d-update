export type Severity = 'crit' | 'high' | 'med' | 'low' | 'info';
export type IncidentStatus = 'new' | 'prog' | 'cont' | 'res';
export type HealthState = 'on' | 'deg' | 'off';

export interface SecurityEvent {
  id: string; time: string; severity: Severity; source: string; rule: string;
  technique: string; host: string; srcIp: string; dstIp: string; user: string;
}
export interface Incident {
  id: string; title: string; severity: Severity; status: IncidentStatus;
  assignee: string; sla: string; events: number;
}
export interface Integration {
  key: string; name: string; type: string; state: HealthState;
  eps: string; version: string; rules: string; events: string;
}
export interface Dashboard {
  threatLevel: string; mode: string;
  kpis: { label: string; value: string; trend: 'up' | 'down' | 'flat'; note: string; accent?: boolean }[];
  eventVolume: number[];
  severityCounts: { sev: Severity; count: number }[];
  mitre: { tactic: string; id: string; count: number; intensity: number }[];
  geo: { flag: string; country: string; count: number; weight: number }[];
  integrations: Integration[];
}

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}
async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

export const api = {
  health: () => get<{ status: string; mode: string }>('/health'),
  dashboard: () => get<Dashboard>('/dashboard'),
  events: (sev = 'all') => get<{ data: SecurityEvent[]; live: boolean }>(`/events?severity=${sev}`),
  incidents: () => get<{ data: Incident[]; live: boolean }>('/incidents'),
  integrations: () => get<{ data: Integration[]; mode: string }>('/integrations'),
  savedHunts: () => get<{ data: { name: string; desc: string; tech: string; hosts: string; hits: string }[] }>('/hunting/saved'),
  runHunt: () => post<{ elapsed: string; scanned: number; hits: { host: string; rdp: string; lsass: string; delta: string; severity: Severity }[] }>('/hunting/run', {}),
  responseActions: () => get<{ data: { time: string; action: string; target: string; incident: string; source: string; status: string }[] }>('/response/actions'),
  runPlaybook: (playbook: string, target?: string) => post<{ started: boolean; ticket: string }>('/response/run', { playbook, target }),
  copilot: (messages: { role: 'user' | 'assistant'; content: string }[]) => post<{ reply: string; live: boolean }>('/copilot', { messages }),
};
