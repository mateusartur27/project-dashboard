import { Navigate, useParams } from "react-router-dom";
import { EntityDetail } from "../../components/EntityDetail";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { useRemoteData } from "../../hooks/useRemoteData";
import { getImprovementById, getImprovementCategory, type ImprovementsData } from "../../data/improvements";
import { statusBadge } from "./statusBadge";

export function ImprovementDetailPage() {
  const { improvementId } = useParams<{ improvementId: string }>();
  const state = useRemoteData<ImprovementsData>("improvements");

  if (state.kind === "loading") {
    return <LoadingNote label="Carregando melhoria…" />;
  }

  if (state.kind === "error") {
    return <ErrorNote message={state.message} />;
  }

  const improvement = improvementId ? getImprovementById(state.data, improvementId) : undefined;
  if (!improvement) {
    return <Navigate to="/" replace />;
  }

  const category = getImprovementCategory(state.data, improvement.category);
  const fields = improvement.requestedBy ? [{ label: "Pedido por", value: improvement.requestedBy }] : [];

  return (
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
    />
  );
}
