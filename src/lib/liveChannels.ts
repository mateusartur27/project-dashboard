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
