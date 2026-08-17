import { GroupedCardGrid } from "../../components/GroupedCardGrid";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { useRemoteData } from "../../hooks/useRemoteData";
import { improvementsByCategory, type ImprovementsData } from "../../data/improvements";
import { ImprovementCard } from "./ImprovementCard";

export function ImprovementsPage() {
  const state = useRemoteData<ImprovementsData>("improvements");

  if (state.kind === "loading") {
    return <LoadingNote label="Carregando melhorias…" />;
  }

  if (state.kind === "error") {
    return <ErrorNote message={state.message} />;
  }

  const groups = improvementsByCategory(state.data).map((group) => ({
    key: group.category.id,
    title: group.category.label,
    description: group.category.description,
    items: group.improvements,
  }));

  return (
    <GroupedCardGrid
      heading="Melhorias a implementar"
      intro="Backlog real de expansão do sistema, agrupado como no documento de origem. Cada card mostra se o item já foi resolvido, se recebeu um contorno paliativo ou se ainda está em aberto — clique para o contexto completo, com datas e execuções reais que sustentam cada decisão."
      groups={groups}
      renderItem={(improvement) => <ImprovementCard key={improvement.id} improvement={improvement} />}
    />
  );
}
