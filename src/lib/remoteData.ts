export async function fetchRemoteData<T>(key: string): Promise<T> {
  const response = await fetch(`/api/data?key=${encodeURIComponent(key)}`, { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error(`data respondeu ${response.status} para ${key}`);
  }
  return (await response.json()) as T;
}
