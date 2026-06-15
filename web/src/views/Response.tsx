import { useEffect, useState } from 'react';
import { api } from '../api';
import { PageHead, Btn, Icon } from '../components/ui';
import { copilotBus } from '../components/copilotBus';

type Action = { time: string; action: string; target: string; incident: string; source: string; status: string };

const PLAYBOOKS = [
  { icon: <Icon.isolate />, t: 'Isolar endpoint', p: 'Corta a conectividade de rede do host mantendo o canal EDR para forense. Recomendado para FIN-WS-014.', steps: '4 passos', src: 'Velociraptor + OPNsense' },
  { icon: <Icon.block />, t: 'Bloquear IP / domínio', p: 'Propaga regra de bloqueio para firewall e DNS sinkhole em todos os segmentos.', steps: '3 passos', src: 'OPNsense + MISP' },
  { icon: <Icon.disable />, t: 'Desativar conta', p: 'Suspende a conta no AD, revoga sessões ativas e força reautenticação.', steps: '3 passos', src: 'Active Directory' },
  { icon: <Icon.quarantine />, t: 'Quarentena de ficheiro', p: 'Move o binário para sandbox, calcula hash e submete ao MISP/Cortex.', steps: '5 passos', src: 'Velociraptor + Cortex' },
  { icon: <Icon.key />, t: 'Reset de credenciais', p: 'Força mudança de password e rotaciona segredos da conta de serviço.', steps: '4 passos', src: 'AD + Vault' },
  { icon: <Icon.shield size={22} />, t: 'Modo contenção total', p: 'Aplica política restritiva ao segmento afetado e ativa monitorização reforçada.', steps: '6 passos', src: 'SOAR orquestrado' },
];

const stClass: Record<string, string> = { prog: 'st-prog', res: 'st-res', new: 'st-new', cont: 'st-cont' };
const stLabel: Record<string, string> = { prog: 'A executar', res: 'Concluído', new: 'Novo', cont: 'Contido' };

export function Response() {
  const [actions, setActions] = useState<Action[]>([]);
  useEffect(() => { api.responseActions().then((r) => setActions(r.data)).catch(() => {}); }, []);

  async function runPb(name: string) {
    const r = await api.runPlaybook(name, 'FIN-WS-014');
    alert(`Playbook "${name}" iniciado · ticket ${r.ticket}`);
  }

  return (
    <>
      <PageHead title="Resposta & Playbooks" sub="Orquestração e resposta automatizada · SOAR · ações de contenção"
        actions={<>
          <Btn onClick={() => alert('Histórico de ações de resposta')}><Icon.clock /> Histórico</Btn>
          <Btn primary onClick={() => copilotBus.ask('Constrói um playbook de resposta passo-a-passo para o incidente de ransomware INC-2026-0481, do isolamento à recuperação.')}><Icon.spark /> Playbook IA</Btn>
        </>} />

      <div className="pb-grid">
        {PLAYBOOKS.map((pb) => (
          <div className="playbook" key={pb.t}>
            <div className="pb-ic">{pb.icon}</div>
            <h4>{pb.t}</h4><p>{pb.p}</p>
            <div className="pb-foot">
              <span className="pb-steps">{pb.steps} · {pb.src}</span>
              <button className="pb-run" onClick={() => runPb(pb.t)}><Icon.play /> Executar</button>
            </div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 14 }}>
        <div className="panel-head"><h3><Icon.pulse size={15} /> Ações de resposta · em curso</h3><span className="meta">SOAR automático</span></div>
        <div className="tbl-wrap">
          <table className="dt">
            <thead><tr><th>Hora</th><th>Ação</th><th>Alvo</th><th>Incidente</th><th>Origem</th><th>Estado</th></tr></thead>
            <tbody>
              {actions.map((a, i) => (
                <tr className="row" key={i}>
                  <td className="mono dim">{a.time}</td><td>{a.action}</td>
                  <td className="mono">{a.target}</td><td className="id-cell">{a.incident}</td>
                  <td>{a.source}</td>
                  <td><span className={`status-pill ${stClass[a.status]}`}><span className="sd" />{stLabel[a.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
