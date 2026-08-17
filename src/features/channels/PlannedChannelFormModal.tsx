import { useState, type FormEvent } from "react";
import { Modal } from "../../components/Modal";
import type { PlannedChannelDefinition, PlannedChannelStatus } from "../../data/types";
import { PLANNED_CHANNEL_STATUS_OPTIONS } from "./plannedChannelStatus";
import "../../components/form.css";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function PlannedChannelFormModal({
  existing,
  existingIds,
  onClose,
  onSubmit,
}: {
  existing?: PlannedChannelDefinition;
  existingIds: string[];
  onClose: () => void;
  onSubmit: (channel: PlannedChannelDefinition) => Promise<void>;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [status, setStatus] = useState<PlannedChannelStatus>(existing?.status ?? "planned");
  const [summary, setSummary] = useState(existing?.summary ?? "");
  const [detail, setDetail] = useState(existing?.detail ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !summary.trim()) {
      setError("Título e resumo são obrigatórios.");
      return;
    }

    let id = existing?.id;
    if (!id) {
      const base = slugify(title) || "canal";
      id = base;
      let suffix = 2;
      while (existingIds.includes(id)) {
        id = `${base}-${suffix}`;
        suffix += 1;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({ id, title: title.trim(), status, summary: summary.trim(), detail: detail.trim() || summary.trim() });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível salvar.");
      setSubmitting(false);
    }
  }

  return (
    <Modal title={existing ? "Editar canal planejado" : "Novo canal planejado"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <label className="form-field">
          <span>Título</span>
          <input className="form-input" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>

        <label className="form-field">
          <span>Status</span>
          <select
            className="form-select"
            value={status}
            onChange={(event) => setStatus(event.target.value as PlannedChannelStatus)}
          >
            {PLANNED_CHANNEL_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Resumo (aparece no card)</span>
          <textarea className="form-textarea" value={summary} onChange={(event) => setSummary(event.target.value)} required />
        </label>

        <label className="form-field">
          <span>Ideia completa (aparece no detalhe)</span>
          <textarea className="form-textarea" rows={6} value={detail} onChange={(event) => setDetail(event.target.value)} />
        </label>

        <div className="form-actions">
          <button type="button" className="form-btn form-btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="form-btn form-btn-primary" disabled={submitting}>
            {submitting ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
