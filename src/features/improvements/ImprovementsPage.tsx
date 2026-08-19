import { useState } from "react";
import { GroupedCardGrid } from "../../components/GroupedCardGrid";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { StalenessNotice } from "../../components/StalenessNotice";
import { PendingImprovementsNotice } from "../../components/PendingImprovementsNotice";
import { useEditableRemoteData } from "../../hooks/useEditableRemoteData";
import { improvementsByCategory, type ImprovementsData } from "../../data/improvements";
import type { ImprovementDefinition, PendingImprovementEntry } from "../../data/types";
import { upsertPendingEntry } from "../../lib/pendingImprovements";
import { ImprovementCard } from "./ImprovementCard";
import { ImprovementFormModal } from "./ImprovementFormModal";

export function ImprovementsPage() {
  const { state, save } = useEditableRemoteData<ImprovementsData>("improvements");
  const pending = useEditableRemoteData<PendingImprovementEntry[]>("pending-improvements");
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (state.kind === "loading") {
    return <LoadingNote label="Carregando melhorias…" />;
  }

  if (state.kind === "error") {
    return <ErrorNote message={state.message} />;
  }

  const { data } = state;
  const groups = improvementsByCategory(data).map((group) => ({
    key: group.category.id,
    title: group.category.label,
    description: group.category.description,
    items: group.improvements,
  }));

  async function handleCreate(improvement: ImprovementDefinition) {
    const pendingImprovement: ImprovementDefinition = { ...improvement, status: "pending" };

    // Aparece como card imediatamente, com status "Pendente" — visível, mas
    // não é a versão final: o documento fonte (docs/future-improvements.md)
    // só reflete isso depois de uma sessão de IA revisar a fila abaixo.
    await save({ ...data, improvements: [...data.improvements, pendingImprovement] });

    const currentPending = pending.state.kind === "ready" ? pending.state.data : [];
    await pending.save(upsertPendingEntry(currentPending, { action: "create", improvement: pendingImprovement }));
    setShowForm(false);
    setSubmitted(true);
  }

  return (
    <>
      <GroupedCardGrid
        heading="Melhorias a implementar"
        intro="Backlog real de expansão do sistema. Cada card mostra se o item já foi resolvido, se recebeu um contorno paliativo ou se ainda está em aberto — clique para o contexto completo."
        controls={
          <>
            <StalenessNotice docKey="improvements" />
            <PendingImprovementsNotice />
            {submitted && (
              <p className="pending-improvements-hint">
                Sugestão enviada — já aparece como card com status "Pendente" até ser revisada.
              </p>
            )}
            <button type="button" className="add-entity-btn" onClick={() => setShowForm(true)}>
              + Sugerir melhoria
            </button>
          </>
        }
        groups={groups}
        renderItem={(improvement) => <ImprovementCard key={improvement.id} improvement={improvement} />}
      />

      {showForm && (
        <ImprovementFormModal
          categories={data.categories}
          existingIds={data.improvements.map((improvement) => improvement.id)}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}
    </>
  );
}
