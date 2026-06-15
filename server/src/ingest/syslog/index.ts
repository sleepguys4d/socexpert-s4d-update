/**
 * Ingestão de syslog das firewalls — superfície pública do módulo.
 *
 * As firewalls enviam logs por syslog (UDP/TCP) para esta aplicação; o módulo
 * recebe, faz o parse, normaliza e disponibiliza os eventos à consola, a par
 * dos conectores que fazem polling (Wazuh, MISP, TheHive).
 */
export { startSyslog, stopSyslog } from './server.js';
export { recentEvents as syslogRecentEvents, syslogStats } from './store.js';
export { seedSyslogDemo } from './demo.js';
