import axios from 'axios';
import { config, connectorConfigured } from '../config.js';

const SYSTEM = `Tu és o SOC Xpert Copilot, o assistente de IA da plataforma de segurança unificada da Sec4data (empresa angolana de cibersegurança, sec4data.com).

O teu papel é apoiar analistas de um SOC ao longo de todo o ciclo: triagem de alertas, investigação de incidentes, threat hunting e resposta. Respondes SEMPRE em português (de Angola/europeu), de forma técnica, concisa e acionável, como um analista SOC sénior.

Contexto operacional (plataforma integra Wazuh SIEM, OPNsense Firewall, Malcolm/Zeek NDR, Velociraptor EDR, MISP Threat Intel, TheHive/Cortex SOAR, Suricata IDS). Postura atual ELEVADO. Incidente crítico em curso INC-2026-0481: suspeita de ransomware (provável LockBit 3.0) na estação FIN-WS-014, utilizador j.matamba, C2 185.220.101.34 (Tor), binário svchost_2.exe, movimento lateral via RDP, shadow copies removidas.

Capacidades a demonstrar: explicar alertas e mapeá-los a MITRE ATT&CK; gerar queries de hunting (Sigma, Wazuh QL, KQL) em blocos de código; resumir incidentes e propor contenção/erradicação/recuperação; sugerir playbooks de resposta. Usa títulos com ###, listas e blocos \`\`\`. Sê direto e operacional. Não inventes que executaste ações — propõe-nas.`;

interface ChatMessage { role: 'user' | 'assistant'; content: string; }

export async function copilotChat(messages: ChatMessage[]): Promise<{ reply: string; live: boolean }> {
  if (connectorConfigured.anthropic()) {
    try {
      const { data } = await axios.post(
        'https://api.anthropic.com/v1/messages',
        { model: config.anthropic.model, max_tokens: 1024, system: SYSTEM, messages: messages.slice(-10) },
        {
          headers: {
            'x-api-key': config.anthropic.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          timeout: 40000,
        },
      );
      const reply = (data.content || []).map((c: any) => (c.type === 'text' ? c.text : '')).join('\n').trim();
      if (reply) return { reply, live: true };
    } catch (err) {
      console.warn('[copilot] Anthropic indisponível, a usar fallback —', (err as Error).message);
    }
  }
  return { reply: fallback(messages[messages.length - 1]?.content || ''), live: false };
}

function fallback(q: string): string {
  const l = q.toLowerCase();
  if (l.includes('hunting') || l.includes('query') || l.includes('lateral') || l.includes('dns')) {
    return `### Query de threat hunting
Proposta em **Sigma** + **Wazuh QL**:
\`\`\`yaml
title: Movimento lateral RDP + credential access
logsource: { product: windows, service: security }
detection:
  rdp_logon: { EventID: 4624, LogonType: 10 }
  lsass_access: { EventID: 4656, ObjectName|endswith: '\\\\lsass.exe' }
  timeframe: 10m
  condition: rdp_logon and lsass_access
level: high
\`\`\`
**Próximo passo:** executar no data lake e promover hits a incidente.`;
  }
  if (l.includes('incidente') || l.includes('0481') || l.includes('resum')) {
    return `### Resumo · INC-2026-0481
**Severidade:** Crítica · **Host:** FIN-WS-014 · **Utilizador:** j.matamba

Cadeia: T1110 (bruteforce SSH) → T1210 (SMB) → T1003 (LSASS) → T1021 (RDP) → T1071 (C2 Tor) → T1490 (shadow copies removidas).

### Próximos passos
- Isolar FIN-WS-014 (manter canal EDR)
- Bloquear 185.220.101.34 e 45.137.21.8
- Desativar j.matamba, quarentenar svchost_2.exe
- Validar backups offline antes de restaurar`;
  }
  if (l.includes('resposta') || l.includes('ransomware') || l.includes('playbook')) {
    return `### Playbook — Ransomware (endpoint Windows)
1. **Isolar** o endpoint via EDR mantendo telemetria.
2. **Conter** — bloquear C2/IPs no firewall + sinkhole DNS.
3. **Identificar** família via MISP e alcance lateral.
4. **Erradicar** — terminar processo, quarentenar binário, remover persistência.
5. **Credenciais** — reset forçado + rotação de segredos.
6. **Recuperar** — restaurar de backup offline validado.`;
  }
  return `Recebido. Com o contexto atual posso **explicar** um alerta (MITRE), **gerar** uma query de hunting, **resumir** um incidente ou **sugerir** um playbook de resposta. Indica o host, IOC ou incidente.

*(IA em tempo real em modo fallback — define ANTHROPIC_API_KEY para respostas completas.)*`;
}
