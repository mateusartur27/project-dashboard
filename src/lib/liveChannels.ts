import type { LiveChannelDetail, LiveChannelSummary } from "../data/types";

export async function fetchChannelSummaries(): Promise<LiveChannelSummary[]> {
  const response = await fetch("/api/live-channels", { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error(`live-channels respondeu ${response.status}`);
  }
  const body = (await response.json()) as { channels: LiveChannelSummary[] };
  return body.channels;
}

export async function fetchChannelDetail(channelId: string): Promise<LiveChannelDetail | null> {
  const response = await fetch(`/api/live-channels?id=${encodeURIComponent(channelId)}`, { credentials: "same-origin" });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`live-channels respondeu ${response.status} para ${channelId}`);
  }
  return (await response.json()) as LiveChannelDetail;
}

/** Qual módulo implementa cada `uses` — direto do registro real, nunca copiado à mão. */
export async function fetchModuleRegistry(): Promise<Record<string, string>> {
  const response = await fetch("/api/module-registry", { credentials: "same-origin" });
  if (!response.ok) {
    throw new Error(`module-registry respondeu ${response.status}`);
  }
  const body = (await response.json()) as { usesToModule: Record<string, string> };
  return body.usesToModule;
}
