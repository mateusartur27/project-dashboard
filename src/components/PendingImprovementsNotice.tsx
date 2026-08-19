import { useEffect, useState } from "react";
import { fetchRemoteData } from "../lib/remoteData";
import type { PendingImprovementEntry } from "../data/types";
import "./pending-improvements-notice.css";

const ACTION_LABEL: Record<PendingImprovementEntry["action"], string> = {
  create: "Nova sugestão",
  edit: "Edição sugerida",
  delete: "Exclusão sugerida",
};

/**
 * Sugestões feitas no painel nunca escrevem em `improvements` na hora — ficam
 * em `pending-improvements` até uma sessão de IA revisar e incorporar a
 * docs/future-improvements.md (a fonte real). Isso só mostra o que está na
 * fila; não aprova, edita nem remove nada.
 */
export function PendingImprovementsNotice() {
  const [entries, setEntries] = useState<PendingImprovementEntry[] | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchRemoteData<PendingImprovementEntry[]>("pending-improvements")
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {
        if (!cancelled) setEntries([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!entries || entries.length === 0) {
    return null;
  }

  const sorted = [...entries].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  return (
    <div className="pending-improvements-notice">
      <button type="button" className="pending-improvements-toggle" onClick={() => setOpen((value) => !value)}>
        {entries.length} sugestão{entries.length === 1 ? "" : "ões"} aguardando revisão {open ? "▲" : "▼"}
      </button>
      {open && (
        <ul className="pending-improvements-list">
          {sorted.map((entry) => (
            <li key={entry.id}>
              <span className="pending-improvements-action">{ACTION_LABEL[entry.action]}</span>
              <span className="pending-improvements-title">{entry.improvement?.title ?? entry.targetId ?? "—"}</span>
              <time dateTime={entry.submittedAt}>{new Date(entry.submittedAt).toLocaleString("pt-BR")}</time>
            </li>
          ))}
        </ul>
      )}
      <p className="pending-improvements-hint">
        Cada uma já aparece como card com status "Pendente" — ainda não incorporada a docs/future-improvements.md.
      </p>
    </div>
  );
}
