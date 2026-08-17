import { EntityCard } from "../../components/EntityCard";
import type { ModuleDefinition } from "../../data/types";

export function ModuleCard({ module, dimmed }: { module: ModuleDefinition; dimmed?: boolean }) {
  return (
    <EntityCard
      to={`/modules/${module.id}`}
      title={module.name}
      description={module.summary}
      meta={module.sourcePath}
      dimmed={dimmed}
    />
  );
}
