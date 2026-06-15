import { useEffect, useState } from 'react';
import { api, type Dashboard as D, type Incident } from '../api';
import { PageHead, Panel, Tag, StatusPill, Btn, Icon, SEV_LABEL, SEV_COLOR, healthLabel } from '../components/ui';
import { integrationIcon } from '../components/icons';
import { copilotBus } from '../components/copilotBus';

export function Dashboard({ go }: { go: (v: string) => void }) {
  const [d, setD] = useState<D | null>(null);
  const [inc, setInc] = useState<Incident[]>([]);
  useEffect(() => {
    api.dashboard().then(setD).catch(() => {});
    api.incidents().then((r) => setInc(r.data)).catch(() => {});
  }, []);
  if (!d) return <div className="loading">A carregar centro de comando…</div>;

  const volMax = Math.max(...d.eventVolume);
  const sevTotal = d.severityCounts.reduce((a, b) => a + b.count, 0);

  return (
    <>
      <PageHead title="Centro de Comando" sub="Visão unificada · todos os sensores · tempo real"
        actions={<>
          <Btn onClick={() => alert('A exportar relatório de turno…')}><Icon.download /> Relatório de turno</Btn>
          <Btn primary onClick={() => copilotBus.ask('Dá-me o briefing do turno: principais ameaças, incidentes prioritários e recomendações.')}><Icon.spark /> Perguntar ao Copilot</Btn>
        </>} />

      <div className="kpi-row">
        {d.kpis.map((k) => (
          <div key={k.label} className={`kpi ${k.accent ? 'accent' : ''}`}>
            <div className="lbl">{k.label}</div>
            <div className="val">{k.value}</div>
            <div className={`trend ${k.trend}`}>{k.note}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <Panel title="Volume de eventos · últimas 20h" icon={<Icon.pulse />} meta="EPS médio 40.6k">
          <div className="vol">
            {d.eventVolume.map((v, i) => <div key={i} className="b" style={{ height: `${(v / volMax * 100).toFixed(0)}%` }} title={`${(v * 1000).toLocaleString()} eventos`} />)}
          </div>
          <div className="vol-x"><span>-20h</span><span>-15h</span><span>-10h</span><span>-5h</span><span>agora</span></div>
        </Panel>
        <Panel title="Alertas por severidade" icon={<Icon.layers />} meta={`${sevTotal} abertos`}>
          <div className="sev-list">
            {d.severityCounts.map((s) => (
              <div className="sev-row" key={s.sev}>
                <span className="nm" style={{ color: SEV_COLOR[s.sev] }}>{SEV_LABEL[s.sev]}</span>
                <span className="bar"><i style={{ width: `${(s.count / sevTotal * 100).toFixed(0)}%`, background: SEV_COLOR[s.sev], boxShadow: `0 0 8px ${SEV_COLOR[s.sev]}` }} /></span>
                <span className="ct">{s.count}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="dash-grid-3" style={{ marginBottom: 14 }}>
        <Panel title="MITRE ATT&CK · táticas observadas" icon={<Icon.grid />}>
          <div className="mitre">
            {d.mitre.map((m) => {
              const col = `rgba(255,${Math.round(160 - m.intensity * 120)},${Math.round(90 - m.intensity * 60)},${(0.12 + m.intensity * 0.6).toFixed(2)})`;
              return (
                <div className="cell" key={m.id} title={m.id}
                  style={{ background: m.intensity > 0.5 ? col : 'var(--elev)', borderColor: m.intensity > 0.7 ? 'rgba(255,59,92,.4)' : 'var(--line-soft)' }}>
                  <span className="t">{m.tactic}</span>
                  <span className="n" style={{ color: m.intensity > 0.7 ? 'var(--crit)' : m.intensity > 0.4 ? 'var(--high)' : 'var(--text)' }}>{m.count}</span>
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Saúde das integrações" icon={<Icon.plug />} meta={`${d.integrations.length} conectores`}>
          <div className="intg-list">
            {d.integrations.slice(0, 5).map((i) => {
              const Ico = integrationIcon[i.key] || Icon.shield;
              return (
                <div className="intg" key={i.key}>
                  <div className="ico">{Ico({})}</div>
                  <div className="info"><div className="nm">{i.name}</div><div className="ty">{i.type}</div></div>
                  <div className="eps"><b>{i.eps}</b> EPS<br /><span className="dim" style={{ fontSize: 9 }}>{healthLabel(i.state)}</span></div>
                  <span className={`sdot ${i.state}`} />
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="Origem das ameaças" icon={<Icon.globe />} meta="geo · 24h">
          {d.geo.map((g) => (
            <div className="geo-row" key={g.country}>
              <span className="fl">{g.flag}</span><span className="cn">{g.country}</span>
              <span className="gb"><i style={{ width: `${g.weight * 100}%` }} /></span>
              <span className="gn">{g.count}</span>
            </div>
          ))}
        </Panel>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3><Icon.alert size={15} /> Incidentes prioritários</h3>
          <button className="chip active" onClick={() => go('incidents')}>Ver todos →</button>
        </div>
        <div className="tbl-wrap">
          <table className="dt">
            <thead><tr><th>ID</th><th>Incidente</th><th>Severidade</th><th>Estado</th><th>Responsável</th><th>SLA</th></tr></thead>
            <tbody>
              {inc.slice(0, 5).map((i) => (
                <tr className="row" key={i.id} onClick={() => copilotBus.ask(`Resume o incidente ${i.id} — ${i.title} — e indica os próximos passos de resposta.`)}>
                  <td className="id-cell">{i.id}</td>
                  <td>{i.title}</td>
                  <td><Tag sev={i.severity}>{SEV_LABEL[i.severity]}</Tag></td>
                  <td><StatusPill status={i.status} /></td>
                  <td><span className="assignee"><span className="ab">{i.assignee}</span></span></td>
                  <td className={`mono ${i.sla === '—' ? 'dim' : ''}`}>{i.sla !== '—' ? i.sla : 'fechado'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
