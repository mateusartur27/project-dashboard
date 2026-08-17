import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { EntityDetail } from "../../components/EntityDetail";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { useEditableRemoteData } from "../../hooks/useEditableRemoteData";
import type { PlannedChannelDefinition } from "../../data/types";
import { plannedChannelStatusBadge } from "./plannedChannelStatus";
import { PlannedChannelFormModal } from "./PlannedChannelFormModal";
import "../../components/form.css";

export function PlannedChannelDetailPage() {
  const { plannedChannelId } = useParams<{ plannedChannelId: string }>();
  const navigate = useNavigate();
  const { state, save } = useEditableRemoteData<PlannedChannelDefinition[]>("planned-channels");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (state.kind === "loading") {
    return <LoadingNote label="Carregando canal planejado…" />;
  }

  if (state.kind === "error") {
    return <ErrorNote message={state.message} />;
  }

  const { data } = state;
  const channel = data.find((item) => item.id === plannedChannelId);
  if (!channel) {
    return <Navigate to="/channels" replace />;
  }

  const handleUpdate = async (updated: PlannedChannelDefinition) => {
    await save(data.map((item) => (item.id === updated.id ? updated : item)));
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Excluir "${channel.title}"? Isso não pode ser desfeito.`)) return;
    setDeleting(true);
    await save(data.filter((item) => item.id !== channel.id));
    navigate("/channels");
  };

  return (
    <>
      <EntityDetail
        backTo="/channels"
        backLabel="Todos os canais"
        badge={plannedChannelStatusBadge(channel.status)}
        title={channel.title}
        summary={channel.summary}
        fields={[]}
        highlight={{ label: "Ideia completa", text: channel.detail, tone: channel.status === "launched" ? "ok" : "warn" }}
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
        <PlannedChannelFormModal
          existing={channel}
          existingIds={data.map((item) => item.id)}
          onClose={() => setEditing(false)}
          onSubmit={handleUpdate}
        />
      )}
    </>
  );
}
