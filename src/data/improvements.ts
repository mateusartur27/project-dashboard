import type { ImprovementCategoryInfo, ImprovementDefinition } from "./types";

/**
 * O conteúdo real (categorias e melhorias) vem do KV via
 * `/api/data?key=improvements` — este arquivo só tem o formato e funções
 * puras sobre ele.
 */
export interface ImprovementsData {
  categories: ImprovementCategoryInfo[];
  improvements: ImprovementDefinition[];
}

export function getImprovementById(data: ImprovementsData, id: string): ImprovementDefinition | undefined {
  return data.improvements.find((improvement) => improvement.id === id);
}

export function getImprovementCategory(data: ImprovementsData, categoryId: string): ImprovementCategoryInfo | undefined {
  return data.categories.find((category) => category.id === categoryId);
}

export function improvementsByCategory(
  data: ImprovementsData,
): Array<{ category: ImprovementCategoryInfo; improvements: ImprovementDefinition[] }> {
  return data.categories
    .map((category) => ({
      category,
      improvements: data.improvements.filter((improvement) => improvement.category === category.id),
    }))
    .filter((group) => group.improvements.length > 0);
}
