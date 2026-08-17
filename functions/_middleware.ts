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
 * Gate de autenticação de todo o painel. Roda antes de qualquer asset estático
 * ou Function. Sem sessão válida: navegação HTML volta para `/login`, chamada
 * de API devolve 401 — nunca serve o painel nem os dados em silêncio.
 */
export async function onRequest(context: MiddlewareContext): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);

  if (PUBLIC_PATHS.has(url.pathname) || isStaticAsset(url.pathname)) {
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
