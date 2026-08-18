import { useEffect, useState } from "react";
import { fetchRemoteData } from "../lib/remoteData";
import { fetchDocsStatus } from "../lib/liveChannels";
import "./staleness-notice.css";

type StalenessState = "checking" | "fresh" | "stale" | "unknown";

/**
 * Compara o hash do documento real (ao vivo, via control plane) contra o
 * hash de quando este painel sincronizou por último (`docs-sync-state` no
 * KV). Não corrige nada sozinho — só avisa, em vez de mostrar conteúdo
 * desatualizado calado.
 */
export function StalenessNotice({ docKey }: { docKey: string }) {
  const [state, setState] = useState<StalenessState>("checking");

  useEffect(() => {
    let cancelled = false;

    Promise.all([fetchRemoteData<Record<string, string>>("docs-sync-state"), fetchDocsStatus()])
      .then(([syncState, liveStatus]) => {
        if (cancelled) return;
        const synced = syncState[docKey];
        const live = liveStatus[docKey]?.sha256;
        if (!synced || !live) {
          setState("unknown");
        } else {
          setState(synced === live ? "fresh" : "stale");
        }
      })
      .catch(() => {
        if (!cancelled) setState("unknown");
      });

    return () => {
      cancelled = true;
    };
  }, [docKey]);

  if (state !== "stale") {
    return null;
  }

  return (
    <div className="staleness-notice">
      ⚠ O documento real de origem mudou desde a última sincronização manual deste conteúdo — pode estar desatualizado.
    </div>
  );
}
