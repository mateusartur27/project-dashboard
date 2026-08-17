import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { EntityDetail } from "../../components/EntityDetail";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { useEditableRemoteData } from "../../hooks/useEditableRemoteData";
import { getImprovementById, getImprovementCategory, type ImprovementsData } from "../../data/improvements";
import type { ImprovementDefinition } from "../../data/types";
import { statusBadge } from "./statusBadge";
import { ImprovementFormModal } from "./ImprovementFormModal";
import "../../components/form.css";

export function ImprovementDetailPage() {
  const { improvementId } = useParams<{ improvementId: string }>();
  const navigate = useNavigate();
  const { state, save } = useEditableRemoteData<ImprovementsData>("improvements");
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

  const handleUpdate = async (updated: ImprovementDefinition) => {
    await save({ ...data, improvements: data.improvements.map((item) => (item.id === updated.id ? updated : item)) });
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Excluir "${improvement.title}"? Isso não pode ser desfeito.`)) return;
    setDeleting(true);
    await save({ ...data, improvements: data.improvements.filter((item) => item.id !== improvement.id) });
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
