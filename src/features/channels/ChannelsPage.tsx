import { GroupedCardGrid } from "../../components/GroupedCardGrid";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { useChannelList } from "../../hooks/useChannelList";
import { ChannelCard } from "./ChannelCard";

export function ChannelsPage() {
  const state = useChannelList();

  return (
    <GroupedCardGrid
      heading="Canais registrados"
      intro="Cada canal é um JSON declarativo que decide horário, formato, plataforma e quais módulos usar — o runtime nunca conhece regra de canal específico. Dado ao vivo, direto do D1 de produção. Clique num card para ver o fluxo completo."
      groups={
        state.kind === "ready"
          ? [
              {
                key: "channels",
                title: "Canais registrados no D1",
                description: "Buscado agora de /api/channels no control plane real.",
                items: state.channels,
              },
            ]
          : []
      }
      renderItem={(channel) => <ChannelCard key={channel.channelId} channel={channel} />}
      controls={
        state.kind === "loading" ? (
          <LoadingNote label="Consultando os canais reais…" />
        ) : state.kind === "error" ? (
          <ErrorNote message={state.message} />
        ) : undefined
      }
    />
  );
}
