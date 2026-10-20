export const launchLow = 'Ângulo de saída baixo'
export const launchHigh = 'Ângulo de saída alto'
export const nothingLiked = 'Nada em especial'
export const factors = ['Conforto', 'Controle', 'Potência', 'Efeito (spin)', 'Durabilidade', 'Custo-benefício', 'Manutenção de tensão', launchLow, launchHigh] as const
export type Factor = typeof factors[number]
export const improvementFactors: readonly Factor[] = ['Conforto', 'Controle', 'Potência', 'Efeito (spin)', 'Durabilidade', launchLow, launchHigh]
export function oppositeAngle(value: string): string | undefined {
  return value === launchLow ? launchHigh : value === launchHigh ? launchLow : undefined
}
export function togglePreference(current: string[], value: string, limit = Infinity): string[] {
  if (current.includes(value)) return current.filter(item => item !== value)
  if (value === nothingLiked) return [value]
  const remaining = current.filter(item => item !== nothingLiked && item !== oppositeAngle(value))
  return remaining.length < limit ? [...remaining, value] : current
}
export function canSelectPreference(current: string[], value: string, limit: number): boolean {
  return current.includes(value) || current.length < limit || current.includes(oppositeAngle(value) ?? '')
}
