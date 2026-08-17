import type { ModuleDefinition, PhaseInfo } from "./types";

/**
 * O conteúdo real (fases e módulos) vem do KV via `/api/data?key=modules` —
 * este arquivo só tem o formato e funções puras sobre ele.
 */
export interface ModulesData {
  phases: PhaseInfo[];
  modules: ModuleDefinition[];
}

export function getModuleById(data: ModulesData, id: string): ModuleDefinition | undefined {
  return data.modules.find((module) => module.id === id);
}

export function getPhaseInfo(data: ModulesData, phaseId: string): PhaseInfo | undefined {
  return data.phases.find((phase) => phase.id === phaseId);
}

export function modulesByPhase(data: ModulesData): Array<{ phase: PhaseInfo; modules: ModuleDefinition[] }> {
  return data.phases
    .map((phase) => ({ phase, modules: data.modules.filter((module) => module.phase === phase.id) }))
    .filter((group) => group.modules.length > 0);
}
