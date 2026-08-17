import { Link, useParams } from "react-router-dom";
import { EntityDetail } from "../../components/EntityDetail";
import { LoadingNote, ErrorNote } from "../../components/AsyncState";
import { useChannel } from "../../hooks/useChannel";
import { formatCronDaily } from "../../data/channels";
import "./channel-detail.css";

export function ChannelDetailPage() {
  const { channelId } = useParams<{ channelId: string }>();
  const state = useChannel(channelId);

  if (state.kind === "loading") {
    return <LoadingNote label="Consultando o canal real…" />;
  }

  if (state.kind === "error") {
    return <ErrorNote message={state.message} />;
  }

  if (state.kind === "not-found") {
    return (
      <div className="channel-detail-link">
        <p>Canal não encontrado no D1 de produção.</p>
        <Link to="/channels">← Todos os canais</Link>
      </div>
    );
  }

  const { channel } = state;
  const { config } = channel;

  return (
    <div>
      <EntityDetail
        backTo="/channels"
        backLabel="Todos os canais"
        categoryLabel={config.channel.metadata?.platform}
        badge={{ label: config.channel.enabled ? "Habilitado" : "Desabilitado", tone: config.channel.enabled ? "ok" : "neutral" }}
        title={config.channel.name}
        summary={`${config.channel.locale}, fuso ${config.channel.timezone}.`}
        meta={channel.channelId}
        fields={[
          {
            label: "Geração",
            value: `${formatCronDaily(config.schedule.generation.cron)} (cron ${config.schedule.generation.cron}), catchUp: ${config.schedule.generation.catchUp}`,
          },
          { label: "Publicação", value: config.schedule.publication.slots.join(", ") },
          {
            label: "Vídeos por execução",
            value: `${config.batch.videosPerRun} (até ${config.batch.maxParallelVideos} em paralelo)`,
          },
          {
            label: "Duração alvo",
            value: `${config.production.content.durationSeconds.target}s (faixa ${config.production.content.durationSeconds.min}–${config.production.content.durationSeconds.max}s)`,
          },
          {
            label: "Formato de vídeo",
            value: `${config.production.video.width}×${config.production.video.height} @ ${config.production.video.fps}fps, ${config.production.video.codec}`,
          },
          { label: "Revisão", value: channel.revision },
        ]}
      />

      <div className="channel-detail-link">
        <Link to={`/modules?channel=${channel.channelId}`}>Ver quais módulos este canal usa →</Link>
      </div>
    </div>
  );
}
