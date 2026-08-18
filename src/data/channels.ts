/**
 * `uses -> módulo` vem ao vivo de `/api/module-registry` (proxy para o
 * control plane real) — nunca copiado aqui. O que fica aqui é só a
 * categorização própria do painel (quais módulos são infraestrutura,
 * sempre ativa, sem `uses` próprio) e funções puras.
 */

/**
 * Módulos de infraestrutura/orquestração que todo canal usa por construção
 * — nunca têm `uses` próprio no registro real, então nunca ficam
 * escurecidos pelo filtro por canal. Categorização editorial do painel, não
 * dado que muda com o sistema de origem — daí não vir de uma API.
 */
export const ALWAYS_ON_MODULE_IDS: string[] = [
  "channel-config",
  "channel-registry",
  "scheduler",
  "persistence",
  "pipeline-orchestrator",
  "pipeline-runtime",
  "video-run-coordination",
];

export function deriveUsesModuleIds(usesToModule: Record<string, string>, pipeline: Array<{ uses: string }>): string[] {
  const ids = new Set<string>();
  for (const step of pipeline) {
    const moduleId = usesToModule[step.uses];
    if (moduleId) ids.add(moduleId);
  }
  return [...ids];
}

export function isModuleUsedByChannel(moduleId: string, usesModuleIds: string[]): boolean {
  return ALWAYS_ON_MODULE_IDS.includes(moduleId) || usesModuleIds.includes(moduleId);
}

export function formatCronDaily(cron: string): string {
  const parts = cron.trim().split(/\s+/);
  if (parts.length === 5 && parts[2] === "*" && parts[3] === "*" && parts[4] === "*") {
    const minute = Number(parts[0]);
    const hour = Number(parts[1]);
    if (Number.isFinite(minute) && Number.isFinite(hour)) {
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} diariamente`;
    }
  }
  return cron;
}
