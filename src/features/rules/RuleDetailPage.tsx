import { Navigate, useParams } from "react-router-dom";
import { EntityDetail } from "../../components/EntityDetail";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { useRemoteData } from "../../hooks/useRemoteData";
import { getRuleById, type RulesData } from "../../data/rules";

export function RuleDetailPage() {
  const { ruleId } = useParams<{ ruleId: string }>();
  const state = useRemoteData<RulesData>("rules");

  if (state.kind === "loading") {
    return <LoadingNote label="Carregando regra…" />;
  }

  if (state.kind === "error") {
    return <ErrorNote message={state.message} />;
  }

  const rule = ruleId ? getRuleById(state.data, ruleId) : undefined;
  if (!rule) {
    return <Navigate to="/rules" replace />;
  }

  return (
    <EntityDetail backTo="/rules" backLabel="Todas as regras" title={rule.title} summary={rule.rule} meta={rule.source} fields={[]} />
  );
}
