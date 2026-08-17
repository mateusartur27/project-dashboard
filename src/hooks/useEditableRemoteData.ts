import { useCallback, useEffect, useState } from "react";
import { fetchRemoteData, saveRemoteData } from "../lib/remoteData";
import type { RemoteState } from "./useRemoteData";

export function useEditableRemoteData<T>(key: string) {
  const [state, setState] = useState<RemoteState<T>>({ kind: "loading" });

  const load = useCallback(() => {
    setState({ kind: "loading" });
    fetchRemoteData<T>(key)
      .then((data) => setState({ kind: "ready", data }))
      .catch((error: unknown) => {
        setState({ kind: "error", message: error instanceof Error ? error.message : "falha desconhecida" });
      });
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (data: T) => {
      await saveRemoteData(key, data);
      setState({ kind: "ready", data });
    },
    [key],
  );

  return { state, save, reload: load };
}
