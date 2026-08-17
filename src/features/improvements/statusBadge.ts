import type { ImprovementStatus } from "../../data/types";
import type { EntityCardBadge } from "../../components/EntityCard";

export function statusBadge(status: ImprovementStatus): EntityCardBadge {
  switch (status) {
    case "resolved":
      return { label: "Resolvido", tone: "ok" };
    case "mitigated":
      return { label: "Mitigado", tone: "warn" };
    case "open":
      return { label: "Aberto", tone: "neutral" };
  }
}
