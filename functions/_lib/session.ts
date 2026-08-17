/**
 * Sessão assinada por HMAC-SHA256, sem estado no servidor: o cookie carrega o
 * timestamp de emissão e a assinatura, e a verificação usa `crypto.subtle.verify`
 * (comparação em tempo constante) em vez de comparar strings à mão.
 */

const COOKIE_NAME = "pd_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function createSessionCookie(secret: string): Promise<string> {
  const issuedAt = Date.now().toString();
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(issuedAt));
  const token = `${issuedAt}.${toBase64Url(signature)}`;
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function hasValidSession(request: Request, secret: string): Promise<boolean> {
  if (!secret) return false;

  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;

  const [issuedAtRaw, signatureRaw] = match[1].split(".");
  if (!issuedAtRaw || !signatureRaw) return false;

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > SESSION_TTL_MS) return false;

  const key = await hmacKey(secret);
  const signatureBytes = fromBase64Url(signatureRaw);
  return crypto.subtle.verify("HMAC", key, signatureBytes as BufferSource, new TextEncoder().encode(issuedAtRaw));
}
