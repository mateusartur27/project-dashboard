export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "same-origin",
  });

  if (response.ok) {
    return { ok: true };
  }

  const body = await response.json().catch(() => ({}) as { error?: string });
  return { ok: false, error: body.error ?? "Não foi possível entrar." };
}

export async function logout(): Promise<void> {
  await fetch("/api/logout", { method: "POST", credentials: "same-origin" });
}
