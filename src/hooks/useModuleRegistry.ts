import { useEffect, useState } from "react";
import { fetchModuleRegistry } from "../lib/liveChannels";
import type { RemoteState } from "./useRemoteData";

export function useModuleRegistry(): RemoteState<Record<string, string>> {
  const [state, setState] = useState<RemoteState<Record<string, string>>>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchModuleRegistry()
      .then((data) => {
        if (!cancelled) setState({ kind: "ready", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ kind: "error", message: error instanceof Error ? error.message : "falha desconhecida" });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
