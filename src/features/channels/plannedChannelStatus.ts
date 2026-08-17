import type { EntityCardBadge } from "../../components/EntityCard";
import type { PlannedChannelStatus } from "../../data/types";

export const PLANNED_CHANNEL_STATUS_OPTIONS: Array<{ value: PlannedChannelStatus; label: string }> = [
  { value: "planned", label: "Planejado" },
  { value: "in-progress", label: "Em desenvolvimento" },
  { value: "launched", label: "Lançado" },
];

export function plannedChannelStatusBadge(status: PlannedChannelStatus): EntityCardBadge {
  switch (status) {
    case "launched":
      return { label: "Lançado", tone: "ok" };
    case "in-progress":
      return { label: "Em desenvolvimento", tone: "warn" };
    case "planned":
      return { label: "Planejado", tone: "neutral" };
  }
}
