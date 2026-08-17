import type { ChannelMappingData } from "./types";

/**
 * O mapeamento `uses` → módulo e os módulos sempre-ativos vêm do KV via
 * `/api/data?key=channel-mapping` — este arquivo só tem funções puras sobre
 * ele, mais o formatador de cron, que não depende de dado nenhum.
 */
export function deriveUsesModuleIds(mapping: ChannelMappingData, pipeline: Array<{ uses: string }>): string[] {
  const ids = new Set<string>();
  for (const step of pipeline) {
    const moduleId = mapping.usesToModuleId[step.uses];
    if (moduleId) ids.add(moduleId);
  }
  return [...ids];
}

export function isModuleUsedByChannel(mapping: ChannelMappingData, moduleId: string, usesModuleIds: string[]): boolean {
  return mapping.alwaysOnModuleIds.includes(moduleId) || usesModuleIds.includes(moduleId);
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
