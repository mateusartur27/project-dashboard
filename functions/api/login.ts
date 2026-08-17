import { createSessionCookie } from "../_lib/session";

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

interface Env {
  AUTH_EMAIL: string;
  AUTH_PASSWORD: string;
  AUTH_SECRET: string;
  /** Opcional: sem o binding, login segue funcionando sem limite de tentativas. */
  LOGIN_RATE_LIMIT?: KVNamespace;
}

interface RequestContext {
  request: Request;
  env: Env;
}

const WINDOW_SECONDS = 15 * 60;
const MAX_ATTEMPTS = 5;

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  });
}

function clientKey(request: Request): string {
  return `attempts:${request.headers.get("cf-connecting-ip") ?? "unknown"}`;
}

export async function onRequestPost(context: RequestContext): Promise<Response> {
  const { request, env } = context;

  if (!env.AUTH_EMAIL || !env.AUTH_PASSWORD || !env.AUTH_SECRET) {
    return json({ error: "autenticação não configurada neste ambiente" }, 503);
  }

  const rateLimit = env.LOGIN_RATE_LIMIT;
  const key = clientKey(request);

  if (rateLimit) {
    const attempts = Number((await rateLimit.get(key)) ?? "0");
    if (attempts >= MAX_ATTEMPTS) {
      return json({ error: "muitas tentativas — tente de novo em alguns minutos" }, 429);
    }
  }

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: "corpo inválido" }, 400);
  }

  const emailMatches = (body.email ?? "").trim().toLowerCase() === env.AUTH_EMAIL.trim().toLowerCase();
  const passwordMatches = body.password === env.AUTH_PASSWORD;

  if (!emailMatches || !passwordMatches) {
    if (rateLimit) {
      const attempts = Number((await rateLimit.get(key)) ?? "0") + 1;
      await rateLimit.put(key, String(attempts), { expirationTtl: WINDOW_SECONDS });
    }
    return json({ error: "e-mail ou senha inválidos" }, 401);
  }

  if (rateLimit) {
    await rateLimit.delete(key);
  }

  const cookie = await createSessionCookie(env.AUTH_SECRET);
  return json({ ok: true }, 200, { "set-cookie": cookie });
}
