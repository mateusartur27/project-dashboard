# Painel de Sistemas

Painel para visualizar módulos, canais, melhorias e regras de sistemas modulares: cards que abrem uma página de detalhe com entrada, saída, consumidores e as decisões que restringem cada item. Construído para crescer — novas seções seguem o mesmo padrão de pasta de dados + feature + rota, sem tocar no que já existe.

Todo o conteúdo é buscado em tempo real por proxies server-side, autenticados pelo mesmo gate de sessão do resto do painel — nada fica no código nem no bundle publicado.

## Stack

- Vite + React + TypeScript + React Router — SPA estática.
- Cloudflare Pages Functions (`functions/`) para autenticação por sessão assinada (cookie `HttpOnly`) e para os proxies server-side de dados.

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

`functions/api/live-channels.ts` faz proxy para uma API externa configurada por secret — não fica no repositório nem em código:

```powershell
npx wrangler pages secret put CONTROL_PLANE_BASE_URL --project-name=project-dashboard
```

Sem esse secret, `/api/live-channels` responde `503` em vez de expor um endereço padrão.

## Conteúdo do painel (módulos, melhorias, regras, arquitetura, canais planejados)

Vive só no KV `DASHBOARD_DATA`, servido via `functions/api/data.ts`. `src/data/*.ts` só tem os tipos e funções puras sobre esse formato — nenhum dado literal no código. Editável diretamente pelo painel (melhorias e canais planejados) ou por script.

Configuração por módulo (a seção "Configurações existentes" na página de um módulo) **não** vem do KV — é computada ao vivo a partir do `with` de cada etapa de cada canal registrado (via `/api/live-channels`), agrupando canais que declaram o mesmo conjunto. Nunca fica desatualizada porque nunca é guardada.

Editar o resto por fora do painel:

1. Editar o JSON correspondente em `private-data/` (fora do Git — chaves: `modules`, `improvements`, `rules`, `architecture`, `channel-mapping`, `planned-channels`).
2. Sincronizar para o KV local, para testar: `npm run sync-data`
3. Sincronizar para o KV real, quando estiver pronto: `npm run sync-data:remote`

Se `private-data/` não existir (checkout novo), crie os arquivos com o formato que `src/data/types.ts` descreve antes do primeiro `sync-data`.

## Deploy

```powershell
npm run build
npx wrangler pages deploy dist --project-name=project-dashboard
```
