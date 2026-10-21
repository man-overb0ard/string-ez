export const nothingLiked = 'Nada em especial'
export const factors = ['Conforto', 'Controle', 'Potência', 'Spin', 'Durabilidade', 'Preço', 'Manutenção de tensão', 'Snapback', 'Pocketing'] as const
export type Factor = typeof factors[number]
export const reduceCost = 'Reduzir o custo'
export type ImprovementFactor = Factor | typeof reduceCost
export const improvementFactors: readonly ImprovementFactor[] = ['Conforto', 'Controle', 'Potência', 'Spin', 'Durabilidade', 'Snapback', 'Pocketing', reduceCost]
export function togglePreference(current: string[], value: string, limit = Infinity): string[] {
  if (current.includes(value)) return current.filter(item => item !== value)
  if (value === nothingLiked) return [value]
  const remaining = current.filter(item => item !== nothingLiked)
  return remaining.length < limit ? [...remaining, value] : current
}
export function canSelectPreference(current: string[], value: string, limit: number): boolean {
  return value === nothingLiked || current.includes(value) || current.length < limit
}
