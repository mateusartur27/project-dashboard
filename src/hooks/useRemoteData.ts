import { useEffect, useState } from "react";
import { fetchRemoteData } from "../lib/remoteData";

export type RemoteState<T> = { kind: "loading" } | { kind: "error"; message: string } | { kind: "ready"; data: T };

export function useRemoteData<T>(key: string): RemoteState<T> {
  const [state, setState] = useState<RemoteState<T>>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });

    fetchRemoteData<T>(key)
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
  }, [key]);

  return state;
}
