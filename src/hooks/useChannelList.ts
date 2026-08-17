import { useEffect, useState } from "react";
import { fetchChannelDetail, fetchChannelSummaries } from "../lib/liveChannels";
import type { LiveChannelDetail } from "../data/types";

export type ChannelListState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; channels: LiveChannelDetail[] };

export function useChannelList(): ChannelListState {
  const [state, setState] = useState<ChannelListState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const summaries = await fetchChannelSummaries();
        const details = await Promise.all(summaries.map((summary) => fetchChannelDetail(summary.channelId)));
        const channels = details.filter((channel): channel is LiveChannelDetail => channel !== null);
        if (!cancelled) setState({ kind: "ready", channels });
      } catch (error) {
        if (!cancelled) {
          setState({ kind: "error", message: error instanceof Error ? error.message : "falha desconhecida" });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
