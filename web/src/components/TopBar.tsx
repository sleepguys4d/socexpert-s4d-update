import { useEffect, useState } from 'react';
import { XpertLogo, Sec4dataSignature } from './Logo';
import { Icon } from './icons';

export function TopBar({ threat, mode }: { threat: string; mode: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const p = (n: number) => String(n).padStart(2, '0');
  const time = `${p(now.getUTCHours())}:${p(now.getUTCMinutes())}:${p(now.getUTCSeconds())}`;
  const date = now.toISOString().slice(0, 10) + ' UTC';

  return (
    <header className="topbar">
      <div className="brand">
        <Sec4dataSignature height={30} label={false} />
      </div>
      <XpertLogo />
      <div className="tb-spacer" />
      <div className="search">
        <Icon.search size={14} />
        <input placeholder="Procurar IOC, host, IP, incidente, CVE..." />
        <kbd>⌘K</kbd>
      </div>
      <div className="threat-pill">
        <span className="dot" />
        <div><div className="tl">POSTURA</div><div className="tv">{threat}</div></div>
      </div>
      <div className="mode-pill" title="Origem dos dados">
        <span className={`md ${mode}`} />{mode === 'live' ? 'LIVE' : 'DEMO'}
      </div>
      <div className="clock"><b>{time}</b><br /><span>{date}</span></div>
      <button className="tb-btn" title="Alertas"><Icon.bell /><span className="badge">9</span></button>
      <div className="avatar" title="Analista SOC · Sec4data">SA</div>
    </header>
  );
}
