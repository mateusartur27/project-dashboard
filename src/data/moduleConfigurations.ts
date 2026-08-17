import type { ModuleConfiguration } from "./types";

/**
 * O conteúdo real vem do KV via `/api/data?key=configurations` — este
 * arquivo só tem funções puras sobre ele.
 */
export function getConfigurationsForModule(configurations: ModuleConfiguration[], moduleId: string): ModuleConfiguration[] {
  return configurations.filter((configuration) => configuration.moduleId === moduleId);
}

export function getConfigurationById(configurations: ModuleConfiguration[], id: string): ModuleConfiguration | undefined {
  return configurations.find((configuration) => configuration.id === id);
}
