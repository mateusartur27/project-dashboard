import { hasValidSession } from "./_lib/session";

interface Env {
  AUTH_SECRET: string;
}

interface MiddlewareContext {
  request: Request;
  env: Env;
  next: () => Promise<Response>;
}

const PUBLIC_PATHS = new Set(["/login", "/api/login"]);

function isStaticAsset(pathname: string): boolean {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

/**
 * `pending-improvements` é a única chave de `/api/data` legível sem sessão:
 * uma sessão de IA rodando no repositório do control plane (fora deste
 * painel, sem cookie de login) precisa ler as sugestões feitas no site para
 * incorporá-las a `docs/future-improvements.md`. Mesmo risco já aceito pelo
 * projeto para `/api/docs-status` e `/api/module-registry` do control plane:
 * leitura de baixo risco, não é segredo por critério deste projeto. Escrever
 * (POST) continua exigindo sessão — só o painel autenticado propõe sugestões.
 */
function isPublicPendingImprovementsRead(request: Request, url: URL): boolean {
  return request.method === "GET" && url.pathname === "/api/data" && url.searchParams.get("key") === "pending-improvements";
}

/**
 * Gate de autenticação de todo o painel. Roda antes de qualquer asset estático
 * ou Function. Sem sessão válida: navegação HTML volta para `/login`, chamada
 * de API devolve 401 — nunca serve o painel nem os dados em silêncio.
 */
export async function onRequest(context: MiddlewareContext): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);

  if (PUBLIC_PATHS.has(url.pathname) || isStaticAsset(url.pathname) || isPublicPendingImprovementsRead(request, url)) {
    return context.next();
  }

  const authenticated = await hasValidSession(request, env.AUTH_SECRET);
  if (authenticated) {
    return context.next();
  }

  if (url.pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: "não autenticado" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  return Response.redirect(new URL("/login", url.origin).toString(), 303);
}
