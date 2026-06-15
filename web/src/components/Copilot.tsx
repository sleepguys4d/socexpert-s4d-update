import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { Icon } from './icons';
import { copilotBus } from './copilotBus';

interface Msg { role: 'user' | 'assistant'; content: string; }

const QUICK = [
  { label: 'Explicar alerta crítico', q: 'Explica-me o alerta crítico mais recente e o seu risco para o negócio.' },
  { label: 'Gerar query de hunting', q: 'Gera uma query de threat hunting (Sigma + Wazuh) para detetar movimento lateral via RDP.' },
  { label: 'Resumir incidente', q: 'Resume o incidente INC-2026-0481 e indica os próximos passos de contenção.' },
  { label: 'Sugerir resposta', q: 'Sugere um playbook de resposta para uma suspeita de ransomware num endpoint Windows.' },
];

const GREETING = `### Olá, sou o **SOC Copilot** 🛡️
Estou ligado a todo o stack da Sec4data. Postura atual **ELEVADO**, **8 incidentes ativos** — o mais crítico é o **INC-2026-0481** (suspeita de ransomware em FIN-WS-014).

Posso ajudar-te a:
- Explicar e triar alertas
- Investigar e correlacionar entidades
- Gerar queries de **threat hunting**
- Sugerir **playbooks de resposta**

Em que queres que comece?`;

function mdToHtml(md: string): string {
  let h = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/```([\s\S]*?)```/g, (_m, c) => `<pre>${c.trim()}</pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^###\s*(.+)$/gm, '<h4>$1</h4>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/^[-•]\s*(.+)$/gm, '<li>$1</li>');
  h = h.replace(/(<li>[\s\S]*?<\/li>)/g, (m) => `<ul>${m}</ul>`).replace(/<\/ul>\s*<ul>/g, '');
  return h.split(/\n{2,}/).map((p) => /^<(h4|ul|pre)/.test(p.trim()) ? p : `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

export function Copilot({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const history = useRef<Msg[]>([]);

  useEffect(() => {
    if (open && !greeted) {
      setMsgs([{ role: 'assistant', content: GREETING }]);
      setGreeted(true);
    }
  }, [open, greeted]);

  useEffect(() => { bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight); }, [msgs, busy]);

  useEffect(() => copilotBus.subscribe((text) => { void send(text); }), []);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    setInput('');
    const userMsg: Msg = { role: 'user', content: t };
    history.current.push(userMsg);
    setMsgs((m) => [...m, userMsg]);
    setBusy(true);
    try {
      const { reply } = await api.copilot(history.current.slice(-8));
      const botMsg: Msg = { role: 'assistant', content: reply };
      history.current.push(botMsg);
      setMsgs((m) => [...m, botMsg]);
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', content: 'Não foi possível contactar o serviço Copilot. Verifica o backend.' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className={`copilot ${open ? 'open' : ''}`}>
      <div className="cp-head">
        <div className="cp-ava"><Icon.cpu size={21} /><span className="live" /></div>
        <div className="cp-ti">
          <div className="n">SOC Copilot <span className="v">IA</span></div>
          <div className="s">Análise · Investigação · Hunting · Resposta</div>
        </div>
        <button className="cp-close" onClick={onClose}><Icon.close /></button>
      </div>

      <div className="cp-body" ref={bodyRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'bot'}`}>
            <div className="m-ava">{m.role === 'user' ? 'SA' : 'AI'}</div>
            {m.role === 'user'
              ? <div className="m-body">{m.content}</div>
              : <div className="m-body" dangerouslySetInnerHTML={{ __html: mdToHtml(m.content) }} />}
          </div>
        ))}
        {busy && (
          <div className="msg bot">
            <div className="m-ava">AI</div>
            <div className="m-body"><div className="typing"><i /><i /><i /></div></div>
          </div>
        )}
      </div>

      <div className="cp-quick">
        {QUICK.map((q) => <button key={q.label} className="q" onClick={() => send(q.q)}>{q.label}</button>)}
      </div>

      <div className="cp-input">
        <textarea
          rows={1} value={input} placeholder="Pergunta ao Copilot sobre eventos, IOCs, hunting, resposta..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(input); } }}
        />
        <button className="cp-send" disabled={busy} onClick={() => void send(input)}><Icon.send /></button>
      </div>
    </aside>
  );
}
