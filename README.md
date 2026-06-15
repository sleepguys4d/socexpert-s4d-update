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
├── docker-compose.yml      # orquestração (1 serviço)
├── Dockerfile              # multi-stage: build web → build server → runtime
├── .env.example            # todas as variáveis de ambiente
├── server/                 # API Node + TypeScript (Express)
│   └── src/
│       ├── config.ts           # configuração por ambiente
│       ├── connectors/         # wazuh · misp · thehive · http
│       ├── services/           # aggregator (real+fallback) · copilot
│       ├── routes/api.ts       # endpoints REST
│       ├── mock/data.ts        # dataset de demonstração
│       └── index.ts            # servidor (API + estáticos)
└── web/                    # React 18 + TypeScript + Vite
    └── src/
        ├── components/         # Logo · TopBar · Sidebar · Copilot · ui
        ├── views/              # Dashboard · Events · Incidents · …
        ├── api.ts              # cliente tipado
        └── theme.css           # design system (HUD/SOC, cyan)
```

### API (resumo)
`GET /api/health` · `GET /api/dashboard` · `GET /api/events?severity=` · `GET|POST /api/incidents` · `GET /api/integrations` · `GET /api/hunting/saved` · `POST /api/hunting/run` · `GET /api/response/actions` · `POST /api/response/run` · `GET /api/intel/:ioc` · `POST /api/copilot`

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
