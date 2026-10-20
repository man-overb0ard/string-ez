export type TensionUnit = 'lb' | 'kg'
const KG_PER_LB = 0.45359237
export function formatTension(lbs: number, unit: TensionUnit): string {
  const value = unit === 'kg' ? lbs * KG_PER_LB : lbs
  return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)} ${unit}`
}
