import { EntityCard } from "../../components/EntityCard";
import type { ImprovementDefinition } from "../../data/types";
import { statusBadge } from "./statusBadge";

export function ImprovementCard({ improvement }: { improvement: ImprovementDefinition }) {
  return (
    <EntityCard
      to={`/improvements/${improvement.id}`}
      title={improvement.title}
      description={improvement.summary}
      badge={statusBadge(improvement.status)}
    />
  );
}
