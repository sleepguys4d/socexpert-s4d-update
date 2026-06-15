import { useEffect, useState } from 'react';
import { api } from '../api';
import { PageHead, Panel, Btn, Tag, Icon, SEV_LABEL } from '../components/ui';
import { copilotBus } from '../components/copilotBus';

type Hunt = { name: string; desc: string; tech: string; hosts: string; hits: string };
type HuntResult = Awaited<ReturnType<typeof api.runHunt>>;

const QUERY = (
  <>
    <span className="cm"># Hunt: Movimento lateral via RDP + acesso a LSASS (T1021 + T1003)</span>{'\n'}
    <span className="kw">title</span>: Detecao de movimento lateral RDP seguido de credential dumping{'\n'}
    <span className="kw">logsource</span>:{'\n'}{'  '}<span className="kw">product</span>: <span className="str">windows</span>{'\n'}{'  '}<span className="kw">service</span>: <span className="str">security</span>{'\n'}
    <span className="kw">detection</span>:{'\n'}{'  '}<span className="fn">rdp_logon</span>:{'\n'}{'    '}EventID: <span className="num">4624</span>{'\n'}{'    '}LogonType: <span className="num">10</span>{'\n'}{'  '}<span className="fn">lsass_access</span>:{'\n'}{'    '}EventID: <span className="num">4656</span>{'\n'}{'    '}ObjectName|endswith: <span className="str">'\lsass.exe'</span>{'\n'}{'  '}<span className="kw">timeframe</span>: <span className="num">10m</span>{'\n'}{'  '}<span className="kw">condition</span>: rdp_logon <span className="kw">and</span> lsass_access{'\n'}
    <span className="kw">level</span>: <span className="str">high</span>{'\n'}
    <span className="cm"># Wazuh equivalent ↓</span>{'\n'}
    <span className="fn">index</span>=wazuh data.win.eventID=<span className="str">"4624"</span> | join host <span className="fn">[search</span> data.win.eventID=<span className="str">"4656"</span> ObjectName=<span className="str">"*lsass*"</span><span className="fn">]</span>
  </>
);

export function Hunting() {
  const [hunts, setHunts] = useState<Hunt[]>([]);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<HuntResult | null>(null);
  useEffect(() => { api.savedHunts().then((r) => setHunts(r.data)).catch(() => {}); }, []);

  async function run() {
    setRunning(true); setResult(null);
    try { setResult(await api.runHunt()); } finally { setRunning(false); }
  }

  return (
    <>
      <PageHead title="Threat Hunting" sub="Console de caça proativa · Sigma · Wazuh QL · KQL · MITRE-driven"
        actions={<>
          <Btn onClick={() => alert('Hunt guardado na biblioteca')}><Icon.save /> Guardar hunt</Btn>
          <Btn primary onClick={() => copilotBus.ask('Gera uma query de threat hunting em Sigma e no formato Wazuh para detetar exfiltração de dados via DNS tunneling.')}><Icon.spark /> Gerar com IA</Btn>
        </>} />

      <div className="hunt-grid">
        <div>
          <div className="console">
            <div className="console-head">
              <div className="dots"><i /><i /><i /></div>
              <span className="ct">hunt_lateral_lsass.sigma</span>
              <span className="lang">SIGMA · WAZUH QL</span>
            </div>
            <div className="editor">{QUERY}</div>
            <div className="console-foot">
              <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--dim)' }}>Cobertura: 1.18M eventos · 14 hosts no scope</span>
              <Btn primary onClick={run}><Icon.play /> Executar hunt</Btn>
            </div>
          </div>

          <Panel title="Resultados" icon={<Icon.target />} meta={result ? `${result.hits.length} deteções · ${result.elapsed}` : running ? 'a executar…' : 'aguardando execução'}>
            {!result && !running && (
              <div className="hunt-empty"><Icon.play size={20} /><br /><br />Carrega em <b style={{ color: 'var(--accent)' }}>Executar hunt</b> para correr a query no data lake unificado.</div>
            )}
            {running && (
              <div className="hunt-empty"><div className="typing" style={{ justifyContent: 'center' }}><i /><i /><i /></div><div style={{ marginTop: 12 }}>A correr query em 1.18M eventos…</div></div>
            )}
            {result && (
              <>
                <div className="tbl-wrap">
                  <table className="dt">
                    <thead><tr><th>Host</th><th>RDP Logon</th><th>LSASS Access</th><th>Δ tempo</th><th>Sev</th></tr></thead>
                    <tbody>
                      {result.hits.map((h) => (
                        <tr className="row" key={h.host}>
                          <td className="mono">{h.host}</td>
                          <td className="mono dim">{h.rdp}</td>
                          <td className="mono dim">{h.lsass}</td>
                          <td className="mono" style={{ color: h.severity === 'crit' ? 'var(--crit)' : 'var(--high)' }}>{h.delta}</td>
                          <td><Tag sev={h.severity}>{SEV_LABEL[h.severity]}</Tag></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 9 }}>
                  <Btn primary onClick={() => copilotBus.ask('Analisa estes 3 hits do hunt de credential dumping e diz quais criar como incidente.')}><Icon.spark /> Analisar com Copilot</Btn>
                  <Btn onClick={() => alert('3 observáveis promovidos a incidente')}><Icon.plus /> Criar incidente</Btn>
                </div>
              </>
            )}
          </Panel>
        </div>

        <Panel title="Hunts guardados" icon={<Icon.layers />}>
          {hunts.map((h) => (
            <div className="saved-hunt" key={h.name} onClick={() => copilotBus.ask(`Explica e otimiza este hunt: ${h.name} (${h.tech}).`)}>
              <div className="sh-t">{h.name}<Tag sev="ghost">{h.tech}</Tag></div>
              <div className="sh-d">{h.desc}</div>
              <div className="sh-m"><span>⌖ {h.hosts}</span><span style={{ color: h.hits.startsWith('0') ? 'var(--dim)' : 'var(--high)' }}>● {h.hits}</span></div>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}
