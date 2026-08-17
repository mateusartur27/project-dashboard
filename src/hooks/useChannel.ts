import { useEffect, useState } from "react";
import { fetchChannelDetail } from "../lib/liveChannels";
import type { LiveChannelDetail } from "../data/types";

export type ChannelState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "not-found" }
  | { kind: "ready"; channel: LiveChannelDetail };

export function useChannel(channelId: string | undefined): ChannelState {
  const [state, setState] = useState<ChannelState>({ kind: "loading" });

  useEffect(() => {
    if (!channelId) {
      setState({ kind: "not-found" });
      return;
    }

    let cancelled = false;
    setState({ kind: "loading" });

    fetchChannelDetail(channelId)
      .then((channel) => {
        if (cancelled) return;
        setState(channel ? { kind: "ready", channel } : { kind: "not-found" });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ kind: "error", message: error instanceof Error ? error.message : "falha desconhecida" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [channelId]);

  return state;
}
