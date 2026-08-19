import { useState, type FormEvent } from "react";
import { Modal } from "../../components/Modal";
import type { ImprovementCategoryInfo, ImprovementDefinition, ImprovementStatus } from "../../data/types";
import "../../components/form.css";

const STATUS_OPTIONS: Array<{ value: ImprovementStatus; label: string }> = [
  { value: "pending", label: "Pendente" },
  { value: "open", label: "Aberto" },
  { value: "mitigated", label: "Mitigado" },
  { value: "resolved", label: "Resolvido" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ImprovementFormModal({
  categories,
  existing,
  existingIds,
  onClose,
  onSubmit,
}: {
  categories: ImprovementCategoryInfo[];
  existing?: ImprovementDefinition;
  existingIds: string[];
  onClose: () => void;
  onSubmit: (improvement: ImprovementDefinition) => Promise<void>;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [category, setCategory] = useState(existing?.category ?? categories[0]?.id ?? "");
  const [status, setStatus] = useState<ImprovementStatus>(existing?.status ?? "open");
  const [summary, setSummary] = useState(existing?.summary ?? "");
  const [detail, setDetail] = useState(existing?.detail ?? "");
  const [requestedBy, setRequestedBy] = useState(existing?.requestedBy ?? "");
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
      const base = slugify(title) || "melhoria";
      id = base;
      let suffix = 2;
      while (existingIds.includes(id)) {
        id = `${base}-${suffix}`;
        suffix += 1;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        id,
        title: title.trim(),
        category: category as ImprovementDefinition["category"],
        status: existing ? status : "pending",
        summary: summary.trim(),
        detail: detail.trim() || summary.trim(),
        requestedBy: requestedBy.trim() || undefined,
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível salvar.");
      setSubmitting(false);
    }
  }

  return (
    <Modal title={existing ? "Editar melhoria" : "Nova melhoria"} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        {!existing && (
          <p className="form-hint">Aparece como card com status "Pendente" até ser revisada e incorporada ao documento fonte.</p>
        )}

        <label className="form-field">
          <span>Título</span>
          <input className="form-input" value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>

        <label className="form-field">
          <span>Categoria</span>
          <select
            className="form-select"
            value={category}
            onChange={(event) => setCategory(event.target.value as ImprovementDefinition["category"])}
          >
            {categories.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {existing && (
          <label className="form-field">
            <span>Status</span>
            <select
              className="form-select"
              value={status}
              onChange={(event) => setStatus(event.target.value as ImprovementStatus)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="form-field">
          <span>Resumo (aparece no card)</span>
          <textarea className="form-textarea" value={summary} onChange={(event) => setSummary(event.target.value)} required />
        </label>

        <label className="form-field">
          <span>Contexto completo (aparece no detalhe)</span>
          <textarea className="form-textarea" rows={6} value={detail} onChange={(event) => setDetail(event.target.value)} />
        </label>

        <label className="form-field">
          <span>Pedido por (opcional)</span>
          <input className="form-input" value={requestedBy} onChange={(event) => setRequestedBy(event.target.value)} />
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
