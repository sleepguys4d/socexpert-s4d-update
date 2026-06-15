import { PageHead, Panel, Btn, Icon, SEV_COLOR } from '../components/ui';
import { copilotBus } from '../components/copilotBus';

function Entity({ icon, a, b, risk, score }: { icon: React.ReactNode; a: string; b: string; risk: 'crit' | 'high' | 'med'; score: number }) {
  const dim = { crit: 'var(--crit-dim)', high: 'var(--high-dim)', med: 'var(--med-dim)' }[risk];
  return (
    <div className="entity">
      <div className="ec">{icon}</div>
      <div className="ev"><div className="a">{a}</div><div className="b">{b}</div></div>
      <span className="risk" style={{ color: SEV_COLOR[risk], background: dim }}>{score}</span>
    </div>
  );
}

function TL({ time, crit, title, desc, tag }: { time: string; crit?: boolean; title: string; desc: React.ReactNode; tag: string }) {
  return (
    <div className={`tl-item ${crit ? 'crit' : ''}`}>
      <div className="tl-time">{time} · {tag}</div>
      <div className="tl-title">{title}</div>
      <div className="tl-desc">{desc}</div>
    </div>
  );
}
const HL = ({ children }: { children: React.ReactNode }) => <span className="hl">{children}</span>;

export function Investigation() {
  return (
    <>
      <PageHead title="Investigação" sub="Caso INC-2026-0481 · Suspeita de ransomware · FIN-WS-014"
        actions={<>
          <Btn onClick={() => alert('Exportado para TheHive')}><Icon.case /> Exportar caso</Btn>
          <Btn primary onClick={() => copilotBus.ask('Com base na timeline e nas entidades do caso INC-2026-0481, qual é a hipótese mais provável e que evidências faltam recolher?')}><Icon.spark /> Hipótese IA</Btn>
        </>} />

      <div className="inv-grid">
        <div>
          <div style={{ marginBottom: 14 }}>
            <Panel title="Entidades" icon={<Icon.target />} meta="6 observáveis">
              <Entity icon={<Icon.host />} a="FIN-WS-014" b="Endpoint comprometido" risk="crit" score={95} />
              <Entity icon={<Icon.user />} a="j.matamba" b="Conta de utilizador" risk="high" score={72} />
              <Entity icon={<Icon.ip />} a="185.220.101.34" b="C2 / Tor exit (MISP)" risk="crit" score={98} />
              <Entity icon={<Icon.ip />} a="45.137.21.8" b="IP de origem bruteforce" risk="high" score={64} />
              <Entity icon={<Icon.file />} a="svchost_2.exe" b="Binário não assinado" risk="crit" score={91} />
              <Entity icon={<Icon.host />} a="IT-WS-002" b="Pivô lateral RDP" risk="med" score={55} />
            </Panel>
          </div>
          <Panel title="Threat Intel · MISP" icon={<Icon.intel />}>
            <div className="intel-box">
              <div><span className="dim">Família</span><span style={{ color: 'var(--crit)' }}>LockBit 3.0 (provável)</span></div>
              <div><span className="dim">Confiança</span><span>87%</span></div>
              <div><span className="dim">IOCs correlac.</span><span style={{ color: 'var(--accent)' }}>14</span></div>
              <div><span className="dim">Galaxy</span><span>APT · ransomware</span></div>
            </div>
          </Panel>
        </div>

        <Panel title="Linha temporal do ataque" icon={<Icon.pulse />} meta="reconstruída de 7 fontes">
          <div className="timeline">
            <TL time="14:18:05" crit tag="T1110 · Suricata" title="Acesso inicial — bruteforce SSH"
              desc={<>240 tentativas a partir de <HL>45.137.21.8</HL> contra <HL>SRV-LNX-01</HL>. Credencial <HL>root</HL> comprometida.</>} />
            <TL time="14:21:33" tag="T1210 · Wazuh" title="Exploração SMB lateral"
              desc={<>Assinatura <HL>EternalBlue</HL> direcionada a FIN-WS-014. Movimento a partir do servidor pivô.</>} />
            <TL time="14:28:47" crit tag="T1003 · Velociraptor" title="Acesso a credenciais"
              desc={<>Processo não assinado <HL>svchost_2.exe</HL> acede a <HL>LSASS</HL> em FIN-WS-014.</>} />
            <TL time="14:33:10" tag="T1021 · Wazuh" title="Movimento lateral RDP"
              desc={<>Sessão RDP <HL>IT-WS-002 → FIN-WS-014</HL> com conta <HL>admin_loc</HL>.</>} />
            <TL time="14:39:51" crit tag="T1071 · Malcolm" title="Comando & Controlo"
              desc={<>Beaconing regular (60s) para <HL>185.220.101.34</HL> — Tor exit confirmado por MISP.</>} />
            <TL time="14:42:08" crit tag="T1490 · Wazuh" title="Impacto — preparação de ransomware"
              desc={<><HL>vssadmin delete shadows</HL> executado. Shadow copies removidas. Cifragem iminente.</>} />
          </div>
        </Panel>
      </div>
    </>
  );
}
