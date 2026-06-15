import type {
  SecurityEvent, Incident, Integration, DashboardSummary,
} from '../types.js';

export const integrations: Integration[] = [
  { key: 'wazuh', name: 'Wazuh', type: 'SIEM / XDR', state: 'on', eps: '18.4k', version: '4.9.2', rules: '3 214', events: '1.18M' },
  { key: 'opnsense', name: 'OPNsense', type: 'Firewall / NGFW', state: 'on', eps: '9.2k', version: '24.7', rules: '842', events: '612k' },
  { key: 'firewall-syslog', name: 'Firewall · Syslog', type: 'Ingestão (push)', state: 'on', eps: '6/min', version: 'RFC 3164/5424', rules: '4 bloqueios', events: '6' },
  { key: 'malcolm', name: 'Malcolm / Zeek', type: 'NDR', state: 'on', eps: '6.7k', version: '24.04', rules: '—', events: '430k' },
  { key: 'velociraptor', name: 'Velociraptor', type: 'EDR', state: 'on', eps: '2.1k', version: '0.73', rules: '118 hunts', events: '88k' },
  { key: 'misp', name: 'MISP', type: 'Threat Intel', state: 'on', eps: '—', version: '2.4', rules: '42k IOCs', events: '—' },
  { key: 'thehive', name: 'TheHive / Cortex', type: 'Case Mgmt / SOAR', state: 'on', eps: '—', version: '5.2', rules: '30 analyzers', events: '—' },
  { key: 'suricata', name: 'Suricata', type: 'IDS / IPS', state: 'deg', eps: '4.1k', version: '7.0', rules: '34 120', events: '290k' },
  { key: 'graylog', name: 'Graylog', type: 'Log Pipeline', state: 'off', eps: '0', version: '6.0', rules: '—', events: '—' },
];

export const events: SecurityEvent[] = [
  { id: 'EVT-1', time: '14:42:08', severity: 'crit', source: 'Wazuh', rule: 'Possível execução de ransomware — shadow copies removidas', technique: 'T1490', host: 'FIN-WS-014', srcIp: '10.20.4.14', dstIp: '—', user: 'j.matamba' },
  { id: 'EVT-2', time: '14:39:51', severity: 'crit', source: 'Malcolm', rule: 'Beaconing C2 detetado (intervalo regular 60s)', technique: 'T1071', host: 'HR-WS-009', srcIp: '10.20.7.9', dstIp: '185.220.101.34', user: '—' },
  { id: 'EVT-3', time: '14:36:22', severity: 'high', source: 'OPNsense', rule: 'Múltiplas conexões bloqueadas para IP malicioso (MISP)', technique: 'T1071', host: '—', srcIp: '10.20.7.9', dstIp: '45.137.21.8', user: '—' },
  { id: 'EVT-4', time: '14:33:10', severity: 'high', source: 'Wazuh', rule: 'Movimento lateral via RDP entre estações', technique: 'T1021', host: 'IT-WS-002', srcIp: '10.20.1.2', dstIp: '10.20.4.14', user: 'admin_loc' },
  { id: 'EVT-5', time: '14:28:47', severity: 'high', source: 'Velociraptor', rule: 'LSASS access por processo não assinado', technique: 'T1003', host: 'FIN-WS-014', srcIp: '—', dstIp: '—', user: 'j.matamba' },
  { id: 'EVT-6', time: '14:21:33', severity: 'med', source: 'Suricata', rule: 'Tentativa de exploit SMB (EternalBlue signature)', technique: 'T1210', host: '—', srcIp: '185.220.101.34', dstIp: '10.20.4.14', user: '—' },
  { id: 'EVT-7', time: '14:18:05', severity: 'med', source: 'Wazuh', rule: 'Brute-force SSH — 240 tentativas em 2min', technique: 'T1110', host: 'SRV-LNX-01', srcIp: '45.137.21.8', dstIp: '10.20.0.10', user: 'root' },
  { id: 'EVT-8', time: '14:12:40', severity: 'med', source: 'OPNsense', rule: 'Tráfego de saída para Tor exit node', technique: 'T1090', host: '—', srcIp: '10.20.7.9', dstIp: '104.244.72.115', user: '—' },
  { id: 'EVT-9', time: '14:05:19', severity: 'low', source: 'Wazuh', rule: 'Novo utilizador local criado fora do horário', technique: 'T1136', host: 'IT-WS-002', srcIp: '—', dstIp: '—', user: 'admin_loc' },
  { id: 'EVT-10', time: '13:58:02', severity: 'low', source: 'Graylog', rule: 'Política de password alterada no AD', technique: 'T1098', host: 'DC-01', srcIp: '—', dstIp: '—', user: 'svc_backup' },
  { id: 'EVT-11', time: '13:51:44', severity: 'info', source: 'Velociraptor', rule: 'Hunt agendado concluído — 0 deteções', technique: '—', host: 'fleet', srcIp: '—', dstIp: '—', user: 'soc' },
  { id: 'EVT-12', time: '13:44:11', severity: 'high', source: 'Malcolm', rule: 'Exfiltração suspeita — 1.2GB para destino externo', technique: 'T1048', host: 'HR-WS-009', srcIp: '10.20.7.9', dstIp: '185.220.101.34', user: '—' },
];

export const incidents: Incident[] = [
  { id: 'INC-2026-0481', title: 'Suspeita de ransomware — estação financeira FIN-WS-014', severity: 'crit', status: 'new', assignee: 'SA', sla: '12m', events: 7 },
  { id: 'INC-2026-0479', title: 'Beaconing C2 + exfiltração em HR-WS-009', severity: 'crit', status: 'prog', assignee: 'PS', sla: '34m', events: 11 },
  { id: 'INC-2026-0476', title: 'Movimento lateral via RDP no segmento IT', severity: 'high', status: 'prog', assignee: 'SA', sla: '1h 20m', events: 5 },
  { id: 'INC-2026-0470', title: 'Brute-force SSH persistente em SRV-LNX-01', severity: 'high', status: 'cont', assignee: 'AJ', sla: '2h 10m', events: 4 },
  { id: 'INC-2026-0468', title: 'Conta de serviço svc_backup com comportamento anómalo', severity: 'med', status: 'prog', assignee: 'PS', sla: '3h 45m', events: 3 },
  { id: 'INC-2026-0465', title: 'Tráfego Tor a partir de estação corporativa', severity: 'med', status: 'cont', assignee: 'AJ', sla: '—', events: 2 },
  { id: 'INC-2026-0461', title: 'Phishing reportado — credenciais possivelmente comprometidas', severity: 'high', status: 'res', assignee: 'SA', sla: '—', events: 6 },
  { id: 'INC-2026-0457', title: 'Exploit SMB bloqueado no perímetro', severity: 'low', status: 'res', assignee: 'AJ', sla: '—', events: 1 },
];

export const dashboard: DashboardSummary = {
  threatLevel: 'ELEVADO',
  kpis: [
    { label: 'Eventos ingeridos (24h)', value: '3.2M', trend: 'down', note: '▼ 4%' },
    { label: 'Alertas em triagem', value: '47', trend: 'up', note: '▲ 12%', accent: true },
    { label: 'Incidentes ativos', value: '8', trend: 'flat', note: '— estável' },
    { label: 'MTTR (médio)', value: '38m', trend: 'down', note: '▼ 9m' },
    { label: 'Sensores online', value: '7/8', trend: 'up', note: '1 degradado' },
  ],
  eventVolume: [42, 55, 38, 61, 72, 48, 90, 66, 58, 74, 82, 95, 70, 63, 88, 52, 77, 91, 68, 84],
  severityCounts: [
    { sev: 'crit', count: 6 }, { sev: 'high', count: 13 }, { sev: 'med', count: 15 },
    { sev: 'low', count: 9 }, { sev: 'info', count: 4 },
  ],
  mitre: [
    { tactic: 'Initial Access', id: 'TA0001', count: 2, intensity: 0.2 },
    { tactic: 'Execution', id: 'TA0002', count: 5, intensity: 0.5 },
    { tactic: 'Persistence', id: 'TA0003', count: 3, intensity: 0.3 },
    { tactic: 'Priv. Esc.', id: 'TA0004', count: 4, intensity: 0.45 },
    { tactic: 'Defense Evasion', id: 'TA0005', count: 6, intensity: 0.7 },
    { tactic: 'Cred. Access', id: 'TA0006', count: 8, intensity: 0.95 },
    { tactic: 'Discovery', id: 'TA0007', count: 3, intensity: 0.3 },
    { tactic: 'Lateral Mov.', id: 'TA0008', count: 7, intensity: 0.8 },
    { tactic: 'Collection', id: 'TA0009', count: 2, intensity: 0.2 },
    { tactic: 'Command & Ctrl', id: 'TA0011', count: 9, intensity: 1 },
    { tactic: 'Exfiltration', id: 'TA0010', count: 5, intensity: 0.55 },
    { tactic: 'Impact', id: 'TA0040', count: 6, intensity: 0.65 },
  ],
  geo: [
    { flag: '🇷🇺', country: 'Rússia', count: 412, weight: 1 },
    { flag: '🇨🇳', country: 'China', count: 287, weight: 0.7 },
    { flag: '🇺🇸', country: 'EUA', count: 156, weight: 0.4 },
    { flag: '🇳🇱', country: 'Países Baixos', count: 98, weight: 0.25 },
    { flag: '🇧🇷', country: 'Brasil', count: 64, weight: 0.18 },
    { flag: '🇦🇴', country: 'Angola (interno)', count: 41, weight: 0.12 },
  ],
};

export const savedHunts = [
  { name: 'Credential Dumping (LSASS)', desc: 'RDP + acesso LSASS em 10min', tech: 'T1003', hosts: '18 hosts', hits: '3 hits' },
  { name: 'C2 Beaconing regular', desc: 'Conexões periódicas a destinos raros', tech: 'T1071', hosts: '—', hits: '2 hits' },
  { name: 'DNS Tunneling', desc: 'Queries TXT/NULL anómalas e volumosas', tech: 'T1048', hosts: '—', hits: '0 hits' },
  { name: 'Shadow Copy Deletion', desc: 'vssadmin / wmic delete shadows', tech: 'T1490', hosts: '22 hosts', hits: '1 hit' },
  { name: 'Persistência por Run Key', desc: 'Modificações em chaves Run/RunOnce', tech: 'T1547', hosts: '—', hits: '5 hits' },
];

export const responseActions = [
  { time: '14:43:02', action: 'Isolar endpoint', target: 'FIN-WS-014', incident: 'INC-2026-0481', source: 'Auto · SOAR', status: 'prog' },
  { time: '14:40:17', action: 'Bloquear IP', target: '185.220.101.34', incident: 'INC-2026-0479', source: 'Analista · SA', status: 'res' },
  { time: '14:35:50', action: 'Desativar conta', target: 'admin_loc', incident: 'INC-2026-0476', source: 'Analista · PS', status: 'res' },
  { time: '14:19:33', action: 'Bloquear IP', target: '45.137.21.8', incident: 'INC-2026-0470', source: 'Auto · SOAR', status: 'res' },
];
