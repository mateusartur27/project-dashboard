import type { RuleDefinition } from "./types";

/**
 * O conteúdo real (regras e checklist) vem do KV via `/api/data?key=rules`
 * — este arquivo só tem o formato e funções puras sobre ele.
 */
export interface RulesData {
  rules: RuleDefinition[];
  checklist: string[];
}

export function getRuleById(data: RulesData, id: string): RuleDefinition | undefined {
  return data.rules.find((rule) => rule.id === id);
}
