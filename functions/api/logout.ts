import { clearSessionCookie } from "../_lib/session";

export async function onRequestPost(): Promise<Response> {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json", "set-cookie": clearSessionCookie() },
  });
}
