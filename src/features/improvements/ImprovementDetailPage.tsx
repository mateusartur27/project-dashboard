import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { EntityDetail } from "../../components/EntityDetail";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { useEditableRemoteData } from "../../hooks/useEditableRemoteData";
import { getImprovementById, getImprovementCategory, type ImprovementsData } from "../../data/improvements";
import type { ImprovementDefinition, PendingImprovementEntry } from "../../data/types";
import { statusBadge } from "./statusBadge";
import { ImprovementFormModal } from "./ImprovementFormModal";
import "../../components/form.css";

export function ImprovementDetailPage() {
  const { improvementId } = useParams<{ improvementId: string }>();
  const navigate = useNavigate();
  const { state, save } = useEditableRemoteData<ImprovementsData>("improvements");
  const pending = useEditableRemoteData<PendingImprovementEntry[]>("pending-improvements");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (state.kind === "loading") {
    return <LoadingNote label="Carregando melhoria…" />;
  }

  if (state.kind === "error") {
    return <ErrorNote message={state.message} />;
  }

  const { data } = state;
  const improvement = improvementId ? getImprovementById(data, improvementId) : undefined;
  if (!improvement) {
    return <Navigate to="/" replace />;
  }

  const category = getImprovementCategory(data, improvement.category);
  const fields = improvement.requestedBy ? [{ label: "Pedido por", value: improvement.requestedBy }] : [];

  async function submitPending(entry: Omit<PendingImprovementEntry, "id" | "submittedAt">) {
    const current = pending.state.kind === "ready" ? pending.state.data : [];
    await pending.save([...current, { ...entry, id: crypto.randomUUID(), submittedAt: new Date().toISOString() }]);
  }

  const handleUpdate = async (updated: ImprovementDefinition) => {
    // O card já mostra o conteúdo novo, mas com status forçado para
    // "Pendente" — o status que a pessoa escolheu no formulário (ex.:
    // "Resolvido") fica só na fila, como o alvo proposto, até a IA revisar
    // e incorporar a docs/future-improvements.md.
    const pendingVersion: ImprovementDefinition = { ...updated, status: "pending" };
    await save({ ...data, improvements: data.improvements.map((item) => (item.id === updated.id ? pendingVersion : item)) });
    await submitPending({ action: "edit", targetId: updated.id, improvement: updated });
    setEditing(false);
    window.alert('Edição enviada — o card já mostra o conteúdo novo com status "Pendente" até ser revisada.');
  };

  const handleDelete = async () => {
    if (!window.confirm(`Sugerir exclusão de "${improvement.title}"? O card continua visível até ser revisado.`)) return;
    setDeleting(true);
    await submitPending({ action: "delete", targetId: improvement.id });
    navigate("/");
  };

  return (
    <>
      <EntityDetail
        backTo="/"
        backLabel="Todas as melhorias"
        categoryLabel={category?.label}
        badge={statusBadge(improvement.status)}
        title={improvement.title}
        summary={improvement.summary}
        fields={fields}
        highlight={{
          label: "Contexto",
          text: improvement.detail,
          tone: improvement.status === "resolved" ? "ok" : "warn",
        }}
        actions={
          <div className="entity-detail-actions">
            <button type="button" className="form-btn form-btn-secondary" onClick={() => setEditing(true)}>
              Editar
            </button>
            <button type="button" className="form-btn form-btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Excluindo…" : "Excluir"}
            </button>
          </div>
        }
      />

      {editing && (
        <ImprovementFormModal
          categories={data.categories}
          existing={improvement}
          existingIds={data.improvements.map((item) => item.id)}
          onClose={() => setEditing(false)}
          onSubmit={handleUpdate}
        />
      )}
    </>
  );
}
