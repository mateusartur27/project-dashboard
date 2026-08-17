interface KVNamespace {
  get(key: string): Promise<string | null>;
}

interface Env {
  DASHBOARD_DATA?: KVNamespace;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const ALLOWED_KEYS = new Set(["modules", "improvements", "configurations", "rules", "architecture", "channel-mapping"]);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

/**
 * Serve o conteúdo real do sistema de origem (módulos, melhorias,
 * configurações por canal, regras, arquitetura) a partir do KV, nunca do
 * bundle do cliente nem do repositório. Fica atrás do mesmo gate de sessão
 * que o resto de `/api/*` — `_middleware.ts` bloqueia sem cookie válido.
 */
export async function onRequestGet(context: RequestContext): Promise<Response> {
  const key = new URL(context.request.url).searchParams.get("key");

  if (!key || !ALLOWED_KEYS.has(key)) {
    return json({ error: "unknown_key" }, 400);
  }

  if (!context.env.DASHBOARD_DATA) {
    return json({ error: "dashboard_data_not_configured" }, 503);
  }

  const value = await context.env.DASHBOARD_DATA.get(key);
  if (value === null) {
    return json({ error: "not_found" }, 404);
  }

  return new Response(value, { status: 200, headers: { "content-type": "application/json" } });
}
