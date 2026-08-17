# Painel de Sistemas

Painel para visualizar os módulos de sistemas modulares: cards que abrem uma página de detalhe com entrada, saída, consumidores e as decisões que restringem cada módulo. Construído para crescer — novas seções (canais, execuções, decisões) seguem o mesmo padrão de pasta de dados + feature + rota, sem tocar no que já existe.

Este repositório **não contém dado nenhum do sistema de origem** — nem no código, nem no bundle publicado. Tudo (módulos, melhorias, configurações por canal, regras, arquitetura, e a config completa de cada canal) é buscado em tempo real: canais vêm direto do control plane real via proxy server-side; o resto vem de um KV do Cloudflare, também via proxy server-side. As duas rotas ficam atrás do mesmo gate de sessão que o resto do painel — sem cookie válido, sem dado, ponto.

## Stack

- Vite + React + TypeScript + React Router — SPA estática, sem conteúdo do sistema de origem embutido.
- Cloudflare Pages Functions (`functions/`) para autenticação por sessão assinada (cookie `HttpOnly`) e para os dois proxies server-side: `live-channels.ts` (control plane real) e `data.ts` (KV).

## Desenvolvimento

```powershell
npm install
npm run dev          # front-end, sem as Functions (login/API não respondem)
npm run build
npx wrangler pages dev dist   # front-end + Functions completas, localmente
```

## Autenticação

Credenciais **não** ficam no repositório. Configure como secrets do projeto Cloudflare Pages:

```powershell
npx wrangler pages secret put AUTH_EMAIL --project-name=project-dashboard
npx wrangler pages secret put AUTH_PASSWORD --project-name=project-dashboard
npx wrangler pages secret put AUTH_SECRET --project-name=project-dashboard
```

`functions/api/login.ts` também aceita um binding `LOGIN_RATE_LIMIT` (KV) opcional — com ele, bloqueia depois de 5 tentativas erradas por IP em 15 minutos.

## Canais ao vivo

A URL do control plane real é um secret — não fica no repositório nem em código:

```powershell
npx wrangler pages secret put CONTROL_PLANE_BASE_URL --project-name=project-dashboard
```

Sem esse secret, `/api/live-channels` responde `503 control_plane_not_configured` em vez de expor um endereço padrão.

## Conteúdo do painel (módulos, melhorias, configurações, regras, arquitetura)

Fica todo em `private-data/*.json`, **fora do Git** (`.gitignore`), e é servido a partir do KV `DASHBOARD_DATA` via `functions/api/data.ts`. `src/data/*.ts` só tem os tipos e funções puras sobre esse formato — nenhum dado literal.

Editar o conteúdo:

1. Editar o JSON correspondente em `private-data/` (chaves: `modules`, `improvements`, `configurations`, `rules`, `architecture`, `channel-mapping`).
2. Sincronizar para o KV local, para testar: `npm run sync-data`
3. Sincronizar para o KV real, quando estiver pronto: `npm run sync-data:remote`

Se `private-data/` não existir (checkout novo), crie os seis arquivos com o formato que `src/data/types.ts` descreve antes do primeiro `sync-data`.

## Deploy

```powershell
npm run build
npx wrangler pages deploy dist --project-name=project-dashboard
```
