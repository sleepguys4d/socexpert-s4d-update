import { useEffect, useState } from 'react';
import { api, type Incident, type IncidentStatus } from '../api';
import { PageHead, Btn, Icon, SEV_COLOR } from '../components/ui';
import { copilotBus } from '../components/copilotBus';

const COLS: { k: IncidentStatus; l: string; dot: string }[] = [
  { k: 'new', l: 'Novo', dot: 'var(--crit)' },
  { k: 'prog', l: 'Em Análise', dot: 'var(--med)' },
  { k: 'cont', l: 'Contido', dot: 'var(--accent-2)' },
  { k: 'res', l: 'Resolvido', dot: 'var(--low)' },
];

export function Incidents() {
  const [inc, setInc] = useState<Incident[]>([]);
  const load = () => api.incidents().then((r) => setInc(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  async function create() {
    const res = await fetch('/api/incidents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Novo incidente manual', severity: 2 }) }).then((x) => x.json());
    alert(`Incidente criado: ${res.id}`);
    load();
  }

  return (
    <>
      <PageHead title="Gestão de Incidentes" sub="Case management unificado · SLA · atribuição · cadeia de eventos"
        actions={<>
          <Btn onClick={create}><Icon.plus /> Novo incidente</Btn>
          <Btn primary onClick={() => copilotBus.ask('Dá-me o resumo executivo dos incidentes críticos abertos e a recomendação de priorização.')}><Icon.spark /> Briefing IA</Btn>
        </>} />

      <div className="kanban">
        {COLS.map((c) => {
          const items = inc.filter((i) => i.status === c.k);
          return (
            <div className="kcol" key={c.k}>
              <div className="kcol-head">
                <div className="kt"><span className="sdot" style={{ background: c.dot, boxShadow: `0 0 8px ${c.dot}` }} />{c.l}</div>
                <span className="kc">{items.length}</span>
              </div>
              <div className="kcol-body">
                {items.length === 0 && <div className="kempty">sem casos</div>}
                {items.map((i) => (
                  <div className="kcard" key={i.id} onClick={() => copilotBus.ask(`Resume o incidente ${i.id} — ${i.title} — e indica os próximos passos.`)}>
                    <span className="sevbar" style={{ background: SEV_COLOR[i.severity] }} />
                    <div className="kid">{i.id}</div>
                    <div className="ktl">{i.title}</div>
                    <div className="kmeta">
                      <span className="assignee"><span className="ab">{i.assignee}</span></span>
                      <span className="ksla">{i.sla !== '—' ? <><Icon.clock /> SLA {i.sla}</> : <span style={{ color: 'var(--low)' }}>✓ fechado</span>}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
