import { useState } from "react";
import { GroupedCardGrid } from "../../components/GroupedCardGrid";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { SearchField } from "../../components/SearchField";
import { useChannelList } from "../../hooks/useChannelList";
import { useEditableRemoteData } from "../../hooks/useEditableRemoteData";
import { matchesSearch } from "../../lib/search";
import type { PlannedChannelDefinition } from "../../data/types";
import { ChannelCard } from "./ChannelCard";
import { PlannedChannelCard } from "./PlannedChannelCard";
import { PlannedChannelFormModal } from "./PlannedChannelFormModal";
import "./channels-page.css";

export function ChannelsPage() {
  const liveState = useChannelList();
  const { state: plannedState, save: savePlanned } = useEditableRemoteData<PlannedChannelDefinition[]>("planned-channels");
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  async function handleCreate(channel: PlannedChannelDefinition) {
    if (plannedState.kind !== "ready") return;
    await savePlanned([...plannedState.data, channel]);
    setShowForm(false);
  }

  const filteredLiveChannels =
    liveState.kind === "ready"
      ? liveState.channels.filter((channel) =>
          matchesSearch(search, channel.config.channel.name, channel.channelId),
        )
      : [];
  const filteredPlannedChannels =
    plannedState.kind === "ready"
      ? plannedState.data.filter((channel) => matchesSearch(search, channel.title, channel.summary))
      : [];

  return (
    <div className="channels-page">
      <div className="channels-page-search">
        <SearchField value={search} onChange={setSearch} placeholder="Pesquisar canais…" />
      </div>

      <GroupedCardGrid
        heading="Canais registrados"
        intro="Cada canal é um JSON declarativo que decide horário, formato, plataforma e quais módulos usar — o runtime nunca conhece regra de canal específico. Dado ao vivo, direto do D1 de produção. Clique num card para ver o fluxo completo."
        groups={
          liveState.kind === "ready"
            ? [
                {
                  key: "channels",
                  title: "Canais registrados no D1",
                  description: "Buscado agora de /api/channels no control plane real.",
                  items: filteredLiveChannels,
                },
              ]
            : []
        }
        renderItem={(channel) => <ChannelCard key={channel.channelId} channel={channel} />}
        controls={
          liveState.kind === "loading" ? (
            <LoadingNote label="Consultando os canais reais…" />
          ) : liveState.kind === "error" ? (
            <ErrorNote message={liveState.message} />
          ) : undefined
        }
      />

      <section className="planned-channels-section">
        <GroupedCardGrid
          heading="Canais a implementar"
          intro="Ideias de canais que ainda não existem em produção — registradas aqui, não no control plane real."
          controls={
            <button type="button" className="add-entity-btn" onClick={() => setShowForm(true)}>
              + Novo canal planejado
            </button>
          }
          groups={
            plannedState.kind === "ready"
              ? [
                  {
                    key: "planned",
                    title: "Ideias registradas",
                    description: "Guardadas no painel, fora do control plane real.",
                    items: filteredPlannedChannels,
                  },
                ]
              : []
          }
          renderItem={(channel) => <PlannedChannelCard key={channel.id} channel={channel} />}
        />
        {plannedState.kind === "loading" && <LoadingNote label="Carregando canais planejados…" />}
        {plannedState.kind === "error" && <ErrorNote message={plannedState.message} />}
        {plannedState.kind === "ready" && plannedState.data.length === 0 && (
          <p className="planned-channels-empty">Nenhum canal planejado ainda — clique em "+ Novo canal planejado" para começar.</p>
        )}
        {plannedState.kind === "ready" && plannedState.data.length > 0 && filteredPlannedChannels.length === 0 && (
          <p className="planned-channels-empty">Nenhum canal planejado corresponde à pesquisa.</p>
        )}
      </section>

      {showForm && plannedState.kind === "ready" && (
        <PlannedChannelFormModal
          existingIds={plannedState.data.map((channel) => channel.id)}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
