interface Env {
  /** URL do control plane real. Secret do projeto — não fica no repositório público. */
  CONTROL_PLANE_BASE_URL?: string;
}

interface RequestContext {
  request: Request;
  env: Env;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

/**
 * Proxy do lado do servidor para `/api/channels` (lista) e `/api/channels/<id>`
 * (config completa) do control plane real. Existe pelo mesmo motivo que o
 * antigo proxy de status existia: o Worker não declara CORS, e a fonte de
 * dados fica no servidor, não no bundle do cliente.
 */
export async function onRequestGet(context: RequestContext): Promise<Response> {
  const baseUrl = context.env.CONTROL_PLANE_BASE_URL;
  if (!baseUrl) {
    return json({ error: "control_plane_not_configured" }, 503);
  }

  const channelId = new URL(context.request.url).searchParams.get("id");
  const upstreamUrl = channelId ? `${baseUrl}/api/channels/${encodeURIComponent(channelId)}` : `${baseUrl}/api/channels`;

  const response = await fetch(upstreamUrl);
  const body = await response.text();

  return new Response(body, {
    status: response.status,
    headers: { "content-type": "application/json" },
  });
}
