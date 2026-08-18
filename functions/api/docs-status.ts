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
 * Proxy do lado do servidor para `/api/docs-status` do control plane real —
 * hash de conteúdo dos documentos que este painel transcreve à mão. Usado
 * junto com `docs-sync-state` (KV) para avisar quando um documento real
 * mudou depois da última sincronização manual.
 */
export async function onRequestGet(context: RequestContext): Promise<Response> {
  const baseUrl = context.env.CONTROL_PLANE_BASE_URL;
  if (!baseUrl) {
    return json({ error: "control_plane_not_configured" }, 503);
  }

  const response = await fetch(`${baseUrl}/api/docs-status`);
  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}
