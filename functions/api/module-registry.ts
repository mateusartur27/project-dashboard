interface Env {
  CONTROL_PLANE_BASE_URL?: string;
}

interface RequestContext {
  env: Env;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

/**
 * Proxy do lado do servidor para `/api/module-registry` do control plane
 * real — qual módulo implementa cada `uses`, direto do mesmo mapa que o
 * Worker usa para si mesmo. Sem isso, "qual módulo faz X" ficaria copiado à
 * mão no painel, exatamente o tipo de cópia que já ficou desatualizada uma
 * vez (chunked-narration invisível até o Worker ganhar esta rota).
 */
export async function onRequestGet(context: RequestContext): Promise<Response> {
  const baseUrl = context.env.CONTROL_PLANE_BASE_URL;
  if (!baseUrl) {
    return json({ error: "control_plane_not_configured" }, 503);
  }

  const response = await fetch(`${baseUrl}/api/module-registry`);
  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}
