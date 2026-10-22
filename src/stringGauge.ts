import { measuredGauges } from './twu.ts'
import { gaugeVariants } from './gaugeVariants.ts'
import type { StringSpec } from './recommendations.ts'

type GaugeContext = { goals: readonly string[]; liked?: readonly string[]; weeklyHours?: string; pattern: string; headSize?: number }
export const gaugeLabel = (hundredths: number): string => `${(hundredths / 100).toFixed(2).replace('.', ',')} mm`
const gaugeCache = new Map<string, readonly number[]>()
export function knownGauges(spec: Pick<StringSpec, 'brand' | 'model'>): readonly number[] {
  const key = `${spec.brand} ${spec.model}`
  const cached = gaugeCache.get(key)
  if (cached) return cached
  const values = [...new Set([...(gaugeVariants[key] ?? []), ...measuredGauges(spec)])].sort((a,b)=>a-b)
  gaugeCache.set(key,values)
  return values
}
function closest(variants: readonly number[], target: number): number {
  return [...variants].sort((a,b) => Math.abs(a-target)-Math.abs(b-target) || b-a)[0]
}
export function referenceGauge(spec: Pick<StringSpec, 'brand' | 'model' | 'material'>): string {
  const variants = knownGauges(spec)
  return variants.length ? gaugeLabel(closest(variants, spec.material === 'Poliéster' ? 125 : 130)) : 'A confirmar'
}
export function recommendGauge(spec: StringSpec, context: GaugeContext): { spec: StringSpec; explanation: string } {
  const variants = knownGauges(spec)
  if (!variants.length) return { spec: { ...spec, gauge: 'A confirmar' }, explanation: 'Calibres deste modelo ainda não confirmados no catálogo ou nos ensaios consultados. Confirme as variantes com o encordoador; não atribuímos 1,25 ou 1,30 mm automaticamente.' }
  const poly = spec.material === 'Poliéster'
  const baseline = closest(variants, poly ? 125 : 130)
  const priority = (factor: string) => (context.goals.includes(factor) ? 2 : 0) + (context.liked?.includes(factor) ? 1 : 0)
  const durability = priority('Durabilidade')
  const response = Math.max(...['Conforto', 'Potência', 'Pocketing', 'Spin'].map(priority))
  const heavyPlay = context.weeklyHours === 'Mais de 5 até 10 horas' || context.weeklyHours === 'Mais de 10 horas'
  const lightPlay = context.weeklyHours === 'Até 2 horas' || context.weeklyHours === 'Mais de 2 até 5 horas'
  const pattern = /^(\d+) × (\d+)$/.exec(context.pattern)
  const head = context.headSize && context.headSize >= 90 && context.headSize <= 130 ? context.headSize : 100
  const density = pattern ? Number(pattern[1])*Number(pattern[2])*100/head : undefined
  const dense = density !== undefined && density >= 342
  const open = density !== undefined && density <= 310
  let target = baseline
  let purpose = poly ? 'Referência próxima de 1,25 mm para equilibrar resposta e resistência ao rompimento no poliéster.' : 'Referência próxima de 1,30 mm para este material; o padrão de poliéster não é aplicado automaticamente.'
  if (durability > response && (durability >= 2 || heavyPlay || open)) {
    target = poly ? 130 : 135
    purpose = 'Prioriza resistência ao rompimento, conforme a durabilidade informada' + (heavyPlay ? ' e a frequência semanal elevada' : '') + (open ? ', considerando também a malha mais aberta' : '') + '. Maior calibre não garante melhor manutenção de tensão.'
  } else if (response > durability && (dense || lightPlay)) {
    target = poly ? 120 : 125
    purpose = 'Explora uma resposta mais elástica e sensação de bola com calibre menor' + (dense ? ', considerando a malha mais densa' : ', considerando a menor frequência semanal') + '. Pode reduzir a resistência ao rompimento; calibre fino não significa automaticamente mais controle ou mais spin.'
  } else if (durability && response) {
    purpose = 'Mantém um calibre intermediário para conciliar durabilidade e resposta, sem privilegiar automaticamente a corda mais grossa ou mais fina.'
  }
  const selected = closest(variants, target)
  const availability = selected === target ? '' : ` Entre os calibres confirmados deste modelo, ${gaugeLabel(selected)} é o mais próximo da referência buscada (${gaugeLabel(target)}).`
  return { spec: { ...spec, gauge: gaugeLabel(selected) }, explanation: `${purpose}${availability} Variantes de referência (catálogo/ensaios): ${variants.map(gaugeLabel).join(', ')}. Os ensaios podem incluir variantes antigas; confirme disponibilidade local. A frequência não informa se você costuma romper cordas; o calibre atual não foi coletado, portanto não calculamos uma mudança em relação a ele.` }
}
