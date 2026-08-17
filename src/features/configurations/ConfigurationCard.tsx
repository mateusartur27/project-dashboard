import { EntityCard } from "../../components/EntityCard";
import type { ModuleConfiguration } from "../../data/types";

export function ConfigurationCard({ configuration }: { configuration: ModuleConfiguration }) {
  return (
    <EntityCard
      to={`/configurations/${configuration.id}`}
      title={configuration.channelName}
      description={configuration.summary}
      meta={configuration.stepId}
    />
  );
}
