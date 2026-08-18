interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

interface Env {
  DASHBOARD_DATA?: KVNamespace;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const ALLOWED_KEYS = new Set(["modules", "improvements", "rules", "architecture", "channel-mapping", "planned-channels"]);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function keyFrom(request: Request): string | null {
  const key = new URL(request.url).searchParams.get("key");
  return key && ALLOWED_KEYS.has(key) ? key : null;
}

/**
 * Serve módulos, melhorias, regras, arquitetura e canais planejados a partir
 * do KV, nunca do bundle do cliente nem do repositório. Fica atrás do mesmo
 * gate de sessão que o resto de `/api/*` — `_middleware.ts` bloqueia sem
 * cookie válido. Configuração por canal não vem daqui — é computada ao vivo
 * a partir da config real de cada canal (`/api/live-channels`), nunca
 * guardada.
 */
export async function onRequestGet(context: RequestContext): Promise<Response> {
  const key = keyFrom(context.request);
  if (!key) {
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

/**
 * Grava o valor inteiro de uma chave. Substitui o documento todo — sem
 * merge parcial — porque cada chave já é um blob JSON coerente (lista de
 * módulos, lista de melhorias etc.), e mesclar campo a campo esconderia
 * conflito em vez de resolvê-lo. Uso de usuário único: sem essa garantia,
 * não vale a complexidade de um merge real.
 */
export async function onRequestPost(context: RequestContext): Promise<Response> {
  const key = keyFrom(context.request);
  if (!key) {
    return json({ error: "unknown_key" }, 400);
  }

  if (!context.env.DASHBOARD_DATA) {
    return json({ error: "dashboard_data_not_configured" }, 503);
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  await context.env.DASHBOARD_DATA.put(key, JSON.stringify(body));
  return json({ ok: true });
}
