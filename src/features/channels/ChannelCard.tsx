import { EntityCard } from "../../components/EntityCard";
import { formatCronDaily } from "../../data/channels";
import type { LiveChannelDetail } from "../../data/types";

export function ChannelCard({ channel }: { channel: LiveChannelDetail }) {
  const { config } = channel;
  const platform = config.channel.metadata?.platform ?? "?";
  const videosPerRun = config.batch.videosPerRun;
  const description = `${platform} · ${videosPerRun} vídeo${videosPerRun > 1 ? "s" : ""} por execução · gera às ${formatCronDaily(config.schedule.generation.cron)}`;

  return (
    <EntityCard
      to={`/channels/${channel.channelId}`}
      title={config.channel.name}
      description={description}
      meta={channel.channelId}
      badge={{ label: config.channel.enabled ? "Habilitado" : "Desabilitado", tone: config.channel.enabled ? "ok" : "neutral" }}
    />
  );
}
