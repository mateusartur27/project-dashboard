import type { ChannelMappingData, LiveChannelDetail } from "./types";

/**
 * Configurações de módulo, computadas ao vivo — nunca armazenadas. Um canal
 * declara `uses` (qual módulo) e `with` (qual configuração); dois canais que
 * declaram o mesmo `with` para o mesmo módulo estão usando o mesmo conjunto,
 * e aparecem juntos aqui. Sempre reflete o real: se um canal registrado
 * mudar, a próxima consulta já mostra o novo conjunto, sem editar nada aqui.
 *
 * O nome de cada conjunto é o que o próprio `with` declara — não o canal que
 * o usa. Configuração existe independente de canal; o canal só escolhe qual
 * usar.
 */

export interface ConfigurationSetting {
  label: string;
  value: string;
}

export interface ConfigurationGroup {
  key: string;
  stepId: string;
  usesIdentifier: string;
  name: string;
  channelNames: string[];
  settings: ConfigurationSetting[];
}

function flattenSettings(value: unknown, prefix = ""): ConfigurationSetting[] {
  if (value === null || value === undefined) {
    return prefix ? [{ label: prefix, value: String(value) }] : [];
  }
  if (Array.isArray(value)) {
    return [{ label: prefix, value: value.map((item) => String(item)).join(", ") || "—" }];
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return prefix ? [{ label: prefix, value: "—" }] : [];
    }
    return entries.flatMap(([key, nested]) => flattenSettings(nested, prefix ? `${prefix}.${key}` : key));
  }
  return [{ label: prefix, value: String(value) }];
}

/**
 * Campos que, quando presentes no `with` (em qualquer nível), servem de
 * nome para o conjunto — na ordem em que são procurados. Cobre o vocabulário
 * real observado: modelo de IA, preset visual, catálogo, provedor, voz,
 * modo de operação, etc.
 */
const NAME_FIELD_PRIORITY = [
  "model",
  "preset",
  "catalog",
  "provider",
  "voice",
  "mode",
  "privacyStatus",
  "workflow",
  "repository",
  "strategy",
];

function findConfigurationName(withBlock: Record<string, unknown>, depth = 0): string | undefined {
  if (depth > 3) return undefined;

  for (const field of NAME_FIELD_PRIORITY) {
    const value = withBlock[field];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  for (const value of Object.values(withBlock)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const found = findConfigurationName(value as Record<string, unknown>, depth + 1);
      if (found) return found;
    }
  }

  return undefined;
}

export function computeConfigurationGroups(
  moduleId: string,
  mapping: ChannelMappingData,
  channels: LiveChannelDetail[],
): ConfigurationGroup[] {
  const relevantUses = new Set(
    Object.entries(mapping.usesToModuleId)
      .filter(([, mappedModuleId]) => mappedModuleId === moduleId)
      .map(([uses]) => uses),
  );

  if (relevantUses.size === 0) {
    return [];
  }

  interface RawEntry {
    channelName: string;
    stepId: string;
    uses: string;
    with: Record<string, unknown>;
  }

  const entries: RawEntry[] = [];
  for (const channel of channels) {
    for (const step of channel.config.pipeline) {
      if (relevantUses.has(step.uses)) {
        entries.push({
          channelName: channel.config.channel.name,
          stepId: step.id,
          uses: step.uses,
          with: step.with ?? {},
        });
      }
    }
  }

  const byStep = new Map<string, RawEntry[]>();
  for (const entry of entries) {
    const list = byStep.get(entry.stepId) ?? [];
    list.push(entry);
    byStep.set(entry.stepId, list);
  }

  const groups: ConfigurationGroup[] = [];
  for (const [stepId, stepEntries] of byStep) {
    const bySignature = new Map<string, RawEntry[]>();
    for (const entry of stepEntries) {
      const signature = JSON.stringify({ uses: entry.uses, with: entry.with });
      const list = bySignature.get(signature) ?? [];
      list.push(entry);
      bySignature.set(signature, list);
    }

    let index = 1;
    for (const sigEntries of bySignature.values()) {
      const first = sigEntries[0]!;
      groups.push({
        key: `${stepId}-${index}`,
        stepId,
        usesIdentifier: first.uses,
        name: findConfigurationName(first.with) ?? first.uses,
        channelNames: sigEntries.map((entry) => entry.channelName),
        settings: flattenSettings(first.with),
      });
      index += 1;
    }
  }

  return groups;
}

export function groupConfigurationsByStep(groups: ConfigurationGroup[]): Array<{ stepId: string; groups: ConfigurationGroup[] }> {
  const order: string[] = [];
  const byStep = new Map<string, ConfigurationGroup[]>();
  for (const group of groups) {
    if (!byStep.has(group.stepId)) {
      byStep.set(group.stepId, []);
      order.push(group.stepId);
    }
    byStep.get(group.stepId)!.push(group);
  }
  return order.map((stepId) => ({ stepId, groups: byStep.get(stepId)! }));
}
