import { useEffect, useState } from 'react';
import { api, type Integration } from '../api';
import { PageHead, Btn, Icon, healthLabel } from '../components/ui';
import { integrationIcon } from '../components/icons';

export function Integrations() {
  const [list, setList] = useState<Integration[]>([]);
  const [mode, setMode] = useState('demo');
  useEffect(() => { api.integrations().then((r) => { setList(r.data); setMode(r.mode); }).catch(() => {}); }, []);

  const stateColor = (s: string) => (s === 'on' ? 'var(--low)' : s === 'deg' ? 'var(--med)' : 'var(--crit)');

  return (
    <>
      <PageHead title="Integrações" sub={`Conectores de telemetria e resposta · modo ${mode.toUpperCase()} · uma única consola para todo o stack`}
        actions={<>
          <Btn onClick={() => alert('A testar conectividade de todos os conectores…')}><Icon.pulse size={15} /> Testar tudo</Btn>
          <Btn primary onClick={() => alert('Catálogo de conectores aberto')}><Icon.plus /> Adicionar conector</Btn>
        </>} />

      <div className="conn-grid">
        {list.map((i) => {
          const Ico = integrationIcon[i.key] || Icon.shield;
          return (
            <div className="conn" key={i.key}>
              <div className="top">
                <div className="ci">{Ico({})}</div>
                <div className="cmeta"><div className="cn">{i.name}</div><div className="cc">{i.type}</div></div>
                <span className={`sdot ${i.state}`} style={{ marginTop: 6 }} />
              </div>
              <div className="crow"><span className="k">Estado</span><span className="v" style={{ color: stateColor(i.state) }}>{healthLabel(i.state)}</span></div>
              <div className="crow"><span className="k">Versão</span><span className="v mono">{i.version}</span></div>
              <div className="crow"><span className="k">EPS</span><span className="v mono" style={{ color: 'var(--accent)' }}>{i.eps}</span></div>
              <div className="crow"><span className="k">Regras / IOCs</span><span className="v mono">{i.rules}</span></div>
              <div className="crow" style={{ borderBottom: 'none' }}><span className="k">Eventos (24h)</span><span className="v mono">{i.events}</span></div>
            </div>
          );
        })}
      </div>
    </>
  );
}
