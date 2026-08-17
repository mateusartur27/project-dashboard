export async function fetchRemoteData<T>(key: string): Promise<T> {
  const response = await fetch(`/api/data?key=${encodeURIComponent(key)}`, { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error(`data respondeu ${response.status} para ${key}`);
  }
  return (await response.json()) as T;
}

export async function saveRemoteData<T>(key: string, value: T): Promise<void> {
  const response = await fetch(`/api/data?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(value),
  });
  if (!response.ok) {
    throw new Error(`salvar respondeu ${response.status} para ${key}`);
  }
}
