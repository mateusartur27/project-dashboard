import { EntityCard } from "../../components/EntityCard";
import type { RuleDefinition } from "../../data/types";

export function RuleCard({ rule }: { rule: RuleDefinition }) {
  return <EntityCard to={`/rules/${rule.id}`} title={rule.title} description={rule.rule} meta={rule.source} />;
}
