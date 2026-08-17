import { EntityCard } from "../../components/EntityCard";
import type { PlannedChannelDefinition } from "../../data/types";
import { plannedChannelStatusBadge } from "./plannedChannelStatus";

export function PlannedChannelCard({ channel }: { channel: PlannedChannelDefinition }) {
  return (
    <EntityCard
      to={`/planned-channels/${channel.id}`}
      title={channel.title}
      description={channel.summary}
      badge={plannedChannelStatusBadge(channel.status)}
    />
  );
}
