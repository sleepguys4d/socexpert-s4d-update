import { Icon } from './icons';

export type ViewKey = 'dashboard' | 'events' | 'incidents' | 'investigation' | 'hunting' | 'response' | 'integrations';

const NAV: { key: ViewKey; label: string; icon: () => JSX.Element }[] = [
  { key: 'dashboard', label: 'Centro de Comando', icon: () => <Icon.dashboard /> },
  { key: 'events', label: 'Eventos & Alertas', icon: () => <Icon.pulse size={21} /> },
  { key: 'incidents', label: 'Incidentes', icon: () => <Icon.alert /> },
  { key: 'investigation', label: 'Investigação', icon: () => <Icon.search /> },
  { key: 'hunting', label: 'Threat Hunting', icon: () => <Icon.hunt /> },
  { key: 'response', label: 'Resposta & Playbooks', icon: () => <Icon.bolt /> },
];

export function Sidebar({ view, onChange, onCopilot }: { view: ViewKey; onChange: (v: ViewKey) => void; onCopilot: () => void }) {
  return (
    <nav className="sidebar">
      {NAV.map((n) => (
        <button key={n.key} className={`nav-item ${view === n.key ? 'active' : ''}`} onClick={() => onChange(n.key)}>
          {n.icon()}<span className="tip">{n.label}</span>
        </button>
      ))}
      <div className="nav-sep" />
      <button className={`nav-item ${view === 'integrations' ? 'active' : ''}`} onClick={() => onChange('integrations')}>
        <Icon.grid /><span className="tip">Integrações</span>
      </button>
      <div className="nav-spacer" />
      <button className="nav-item" onClick={onCopilot}>
        <Icon.cpu /><span className="tip">SOC Copilot · IA</span>
      </button>
      <button className="nav-item" onClick={() => alert('Definições do tenant SOC Xpert')}>
        <Icon.cog /><span className="tip">Definições</span>
      </button>
    </nav>
  );
}
