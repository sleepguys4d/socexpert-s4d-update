<div align="center">

# SOC Xpert
### Plataforma de Operações de Segurança Unificada · by Sec4data

*Uma única consola para SIEM, NDR, EDR, Firewall, Threat Intel e SOAR — com Copilot de IA em todo o ciclo de deteção e resposta.*

</div>

---

## O que é

O **SOC Xpert** unifica a telemetria e a resposta de um SOC moderno numa só interface: ingestão de eventos (Wazuh), análise de rede (Malcolm/Zeek), endpoint (Velociraptor), perímetro (OPNsense), inteligência de ameaças (MISP) e gestão de casos/SOAR (TheHive/Cortex). Inclui um **Copilot** que apoia o analista na triagem, investigação, *threat hunting* e resposta.

Foi desenhado com **degradação graciosa**: arranca imediatamente em **modo DEMO** (dados simulados realistas) e passa a **modo LIVE** assim que configuras os conectores reais — sem alterar código.

### Módulos
- **Centro de Comando** — KPIs, volume de eventos, severidade, heatmap MITRE ATT&CK, saúde dos sensores, origem geográfica das ameaças.
- **Eventos & Alertas** — stream unificado e filtrável de todas as fontes.
- **Incidentes** — gestão de casos em *kanban* (Novo → Em Análise → Contido → Resolvido).
- **Investigação** — entidades, *threat intel* e linha temporal do ataque reconstruída.
- **Threat Hunting** — consola de caça (Sigma / Wazuh QL) com execução e *hunts* guardados.
- **Resposta & Playbooks** — orquestração SOAR (isolar, bloquear, desativar, quarentena…).
- **Integrações** — estado e métricas de cada conector.
- **SOC Copilot** — assistente de IA (Anthropic Claude) com *fallback* local.

---

## Arranque rápido (Docker)

Pré-requisitos: **Docker** + **Docker Compose**.

```bash
# 1. (opcional) criar o ficheiro de configuração
cp .env.example .env

# 2. construir e arrancar
docker compose up --build
```

Abre **http://localhost:4000** — a plataforma arranca em **modo DEMO**, totalmente navegável.

> Um único contentor serve a API **e** o frontend compilado na mesma porta (4000).

---

## Passar a produção (modo LIVE)

Edita o `.env`, coloca `DEMO_MODE=false` e preenche os conectores que tens:

```env
DEMO_MODE=false

# Wazuh
WAZUH_API_URL=https://wazuh.tua-rede:55000
WAZUH_API_USER=wazuh-wui
WAZUH_API_PASSWORD=********
WAZUH_INDEXER_URL=https://wazuh.tua-rede:9200
WAZUH_INDEXER_USER=admin
WAZUH_INDEXER_PASSWORD=********

# MISP
MISP_URL=https://misp.tua-rede
MISP_API_KEY=********

# TheHive
THEHIVE_URL=http://thehive.tua-rede:9000
THEHIVE_API_KEY=********

# Copilot
ANTHROPIC_API_KEY=sk-ant-********
```

Volta a subir: `docker compose up --build -d`. Cada conector é avaliado de forma **independente** — os que estiverem configurados passam a LIVE; os restantes mantêm dados de demonstração, para nunca teres uma consola vazia.

### Mapeamento dos conectores

| Conector | Usa | Para quê |
|----------|-----|----------|
| **Wazuh** | API do manager (`:55000`) + Indexer/OpenSearch (`:9200`) | Saúde, agentes e pesquisa de alertas `wazuh-alerts-*` |
| **MISP** | REST `/attributes/restSearch` | Enriquecimento de IOCs |
| **TheHive 5** | `/api/v1` | Listar e criar casos (incidentes) |
| **Anthropic** | `/v1/messages` | Respostas do Copilot |

---

## Fase 03 · Base de dados e identidade

A partir da Fase 03, o SOC Xpert tem uma **fundação de persistência e identidade** —
base para autenticação, perfis, papéis (RBAC) e multitenancy. A sub-fase **03.1**
entregue aqui é a **fundação** e é totalmente **aditiva**: sem `DATABASE_URL`, a app
continua a arrancar como antes (modo legado, `.env` / demo).

O que a fundação inclui:

- **PostgreSQL + Prisma** — esquema com organizações (tenants), utilizadores,
  papéis, conectores por tenant, preferências, sessões e auditoria.
- **Cifragem de credenciais** — as credenciais dos conectores são guardadas
  **cifradas** (AES-256-GCM), nunca em texto simples.
- **Seed idempotente** — no primeiro arranque cria o tenant por defeito, o
  administrador (se definires a palavra-passe) e migra os conectores do `.env`
  para a base de dados, já cifrados.

O `docker-compose` já inclui o serviço **PostgreSQL**; só precisas de definir
duas variáveis no `.env`:

```bash
cp .env.example .env

# 1. chave de cifragem (32 bytes)
openssl rand -base64 32      # → cola em APP_ENCRYPTION_KEY

# 2. palavra-passe do administrador inicial
#    define ADMIN_PASSWORD no .env

docker compose up --build
```

No arranque verás o estado da fundação nos logs:

```
· Base de dados: ligada
· Origem dos conectores: base de dados (por tenant)
```

> O **login** ainda não está ligado — chega na sub-fase **03.2** (autenticação
> local: sessões, ecrã de entrada, recuperação de palavra-passe). Nesta fase é
> criado o **registo** do administrador; ainda não há ecrã de login.

## Firewalls · ingestão de syslog

Além dos conectores que fazem *polling* às APIs (Wazuh, MISP, TheHive), o SOC
Xpert recebe **logs de firewall por syslog** (modelo *push*). As firewalls
enviam para o IP deste host e os eventos aparecem no *stream* de **Eventos**, a
par dos restantes, com a saúde do recetor visível em **Integrações**.

Formatos reconhecidos: **OPNsense / pfSense** (`filterlog` CSV), **FortiGate**
(`key=value`), **Cisco ASA** (`%ASA-…`) e **Palo Alto / genérico** (CSV / regex),
com enquadramento **RFC 3164** e **RFC 5424**, em UDP e TCP.

Com `docker compose`, o host escuta na porta **514** (padrão de syslog) e
encaminha para o contentor. Aponta a firewall para `IP_DO_HOST:514`:

| Firewall | Onde configurar |
|----------|-----------------|
| **OPNsense** | *System → Settings → Logging / Remote* → servidor remoto `IP:514`, protocolo UDP |
| **pfSense** | *Status → System Logs → Settings* → *Remote Logging* → `IP:514` |
| **FortiGate** | `config log syslogd setting` → `set server IP`, `set port 514` |
| **Cisco ASA** | `logging host inside IP`, `logging trap informational` |

Variáveis em `.env`: `SYSLOG_ENABLED`, `SYSLOG_HOST_PORT` (porta no host),
`SYSLOG_UDP` / `SYSLOG_TCP`, `SYSLOG_MAX_EVENTS`. Em modo DEMO são injetadas
linhas de exemplo para a funcionalidade ser visível sem firewall ligada.
Diagnóstico em tempo real: `GET /api/syslog/stats`.

> Multitenancy (03.5): o mapeamento `SYSLOG_TENANT_MAP=ip=tenant,…` já permite
> atribuir cada firewall a uma organização; a aplicação plena chega nessa fase.

## Desenvolvimento (sem Docker)

```bash
# Backend (porta 4000)
cd server && npm install && npm run dev

# Frontend (porta 5173, com proxy /api → 4000)
cd web && npm install && npm run dev
```

Frontend de dev em **http://localhost:5173**.

---

## Arquitetura

```
soc-xpert/
├── docker-compose.yml      # orquestração (app + base de dados PostgreSQL)
├── Dockerfile              # multi-stage: build web → build server → runtime
├── .env.example            # todas as variáveis de ambiente
├── server/                 # API Node + TypeScript (Express)
│   ├── prisma/
│   │   ├── schema.prisma      # modelo de dados (Fase 03)
│   │   └── migrations/        # migrações SQL
│   ├── docker-entrypoint.sh   # migrate + seed no arranque (se houver BD)
│   └── src/
│       ├── config.ts           # configuração por ambiente
│       ├── crypto/secretbox.ts # cifragem AES-256-GCM de credenciais
│       ├── db/client.ts        # Prisma (com degradação graciosa)
│       ├── connectors/         # wazuh · misp · thehive · http (polling)
│       ├── ingest/syslog/       # recetor de syslog das firewalls (push)
│       ├── services/           # aggregator · copilot · tenantConfig
│       ├── routes/api.ts       # endpoints REST
│       ├── mock/data.ts        # dataset de demonstração
│       ├── seed.ts             # seed: tenant + admin + conectores
│       └── index.ts            # servidor (API + estáticos)
└── web/                    # React 18 + TypeScript + Vite
    └── src/
        ├── components/         # Logo · TopBar · Sidebar · Copilot · ui
        ├── views/              # Dashboard · Events · Incidents · …
        ├── api.ts              # cliente tipado
        └── theme.css           # design system (HUD/SOC, cyan)
```

### API (resumo)
`GET /api/health` · `GET /api/dashboard` · `GET /api/events?severity=` · `GET|POST /api/incidents` · `GET /api/integrations` · `GET /api/syslog/stats` · `GET /api/hunting/saved` · `POST /api/hunting/run` · `GET /api/response/actions` · `POST /api/response/run` · `GET /api/intel/:ioc` · `POST /api/copilot`

---

## Notas de segurança para produção

A plataforma já corre com `helmet`, `cors`, `compression`, *rate-limiting* (240 req/min) e utilizador não-root no contentor. Antes de expor publicamente, recomenda-se:

- **TLS** — colocar atrás de um *reverse proxy* (Nginx/Traefik/Caddy) com HTTPS.
- **Autenticação** — adicionar SSO/OIDC à frente da consola (esta versão não inclui *login* aplicacional).
- **CORS** — definir `CORS_ORIGIN` para o domínio real.
- **Rede** — manter Wazuh/MISP/TheHive em rede privada; os conectores aceitam TLS self-signed (`*_INSECURE_TLS`) por conveniência em laboratório — desativa em produção quando tiveres certificados válidos.
- **Segredos** — geri-los via *secrets* do Docker/orquestrador, não em texto simples.

---

<div align="center">
<sub>SOC Xpert v1.0 — desenvolvido para o ecossistema Sec4data · Cyber Defense</sub>
</div>
