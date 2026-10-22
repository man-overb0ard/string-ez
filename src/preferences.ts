export const nothingLiked = 'Nada em especial'
export const factors = ['Conforto', 'Controle', 'Potência', 'Spin', 'Durabilidade', 'Preço', 'Manutenção de tensão', 'Snapback', 'Pocketing'] as const
export type Factor = typeof factors[number]
export const reduceCost = 'Reduzir o custo'
export type ImprovementFactor = Factor | typeof reduceCost
export const improvementFactors: readonly ImprovementFactor[] = ['Conforto', 'Controle', 'Potência', 'Spin', 'Durabilidade', 'Manutenção de tensão', 'Snapback', 'Pocketing', reduceCost]
export function togglePreference(current: string[], value: string, limit = Infinity): string[] {
  if (current.includes(value)) return current.filter(item => item !== value)
  if (value === nothingLiked) return [value]
  const remaining = current.filter(item => item !== nothingLiked)
  return remaining.length < limit ? [...remaining, value] : current
}
export function canSelectPreference(current: string[], value: string, limit: number): boolean {
  return value === nothingLiked || current.includes(value) || current.length < limit
}

export function availableImprovementFactors(liked: readonly string[]): ImprovementFactor[] {
  return improvementFactors.filter(goal => !liked.includes(goal === reduceCost ? 'Preço' : goal))
}
export function reconcileImprovementGoals(goals: readonly string[], liked: readonly string[]): string[] {
  const available = availableImprovementFactors(liked)
  return goals.filter(goal => available.includes(goal as ImprovementFactor))
}

const preferenceLabels: Record<string, string> = {
  Conforto: 'Conforto no impacto',
  Controle: 'Controle de profundidade',
  Potência: 'Potência fácil',
  Durabilidade: 'Resistência ao rompimento',
  'Manutenção de tensão': 'Consistência ao longo do uso',
  Snapback: 'Retorno das cordas — Snapback',
  Pocketing: 'Sensação de encaixe — Pocketing',
}
export function preferenceLabel(value: string): string {
  return preferenceLabels[value] ?? value
}
export const preferenceDescriptions: Record<string, string> = {
  Conforto: 'Uma resposta menos firme no contato com a bola.',
  Controle: 'Mais confiança para acelerar sem mandar a bola longa.',
  Potência: 'Conseguir profundidade com menos esforço.',
  Spin: 'Facilidade para produzir rotação na bola.',
  Durabilidade: 'Jogar por mais tempo antes de a corda arrebentar.',
  'Manutenção de tensão': 'Preservar a resposta do encordoamento entre as partidas, mesmo sem a corda arrebentar.',
  Snapback: 'As cordas se deslocam e voltam à posição após o impacto.',
  Pocketing: 'Sentir a bola afundar e ser abraçada pelas cordas.',
}
