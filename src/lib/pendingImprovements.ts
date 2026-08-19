import type { PendingImprovementEntry } from "../data/types";

function targetKey(entry: Pick<PendingImprovementEntry, "targetId" | "improvement">): string | undefined {
  return entry.targetId ?? entry.improvement?.id;
}

/**
 * Uma melhoria só pode ter uma sugestão pendente por vez — sem isso, criar e
 * depois editar antes da revisão empilhava duas entradas para o mesmo item
 * (visto na fila como se fossem duas melhorias diferentes). Uma nova
 * submissão substitui a anterior do mesmo alvo, nunca soma.
 *
 * Duas regras de fusão: excluir algo que só existia como sugestão de criação
 * ainda não revisada remove a entrada inteira — não há nada em
 * docs/future-improvements.md para excluir. E editar algo que só existia
 * como sugestão de criação continua contando como "create": o alvo ainda não
 * é real no documento fonte, só o conteúdo mudou.
 */
export function upsertPendingEntry(
  current: PendingImprovementEntry[],
  next: Omit<PendingImprovementEntry, "id" | "submittedAt">,
): PendingImprovementEntry[] {
  const key = targetKey(next);
  const previous = key ? current.find((entry) => targetKey(entry) === key) : undefined;
  const withoutPrevious = key ? current.filter((entry) => targetKey(entry) !== key) : current;

  if (next.action === "delete" && previous?.action === "create") {
    return withoutPrevious;
  }

  const action = previous?.action === "create" && next.action === "edit" ? "create" : next.action;
  return [...withoutPrevious, { ...next, action, id: crypto.randomUUID(), submittedAt: new Date().toISOString() }];
}
