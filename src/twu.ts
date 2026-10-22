import { twuRecords, twuRanges, type TwuRecord } from './twuData.ts'
import type { Factor } from './preferences.ts'

const byModel = new Map<string, TwuRecord[]>()
for (const record of twuRecords) {
  const records = byModel.get(record.model) ?? []
  records.push(record); byModel.set(record.model, records)
}

type Identity = { brand: string; model: string; gauge: string }
export function measuredGauges(spec: Pick<Identity, 'brand' | 'model'>): number[] {
  return [...new Set((byModel.get(`${spec.brand} ${spec.model}`) ?? []).map(r=>Math.round(r.nominal*100)))].sort((a,b)=>a-b)
}
const colorWords: Record<string, string> = { Amarela:'yellow', Preta:'black', Branca:'white', Azul:'blue', Natural:'natural', Vermelha:'red', Verde:'green', Laranja:'orange', Rosa:'pink', Cinza:'gray' }
function explicitColor(record: TwuRecord): string | undefined {
  return Object.values(colorWords).find(color=>!record.model.toLowerCase().includes(color) && new RegExp(`\\b${color}\\b`,'i').test(record.name.replace(/\bgrey\b/ig,'gray')))
}
export function findTwuMeasurement(spec: Identity, color?: string): TwuRecord | undefined {
  const gauge = /^(\d+,\d+) mm$/.exec(spec.gauge)
  if (!gauge) return undefined
  const mm=Number(gauge[1].replace(',','.'))
  const records=(byModel.get(`${spec.brand} ${spec.model}`) ?? []).filter(r=>Math.abs(r.nominal-mm)<0.00001)
  const desired=color && colorWords[color]
  if (color) return (desired ? records.find(r=>explicitColor(r)===desired) : undefined) ?? records.find(r=>!explicitColor(r))
  return records.find(r=>!explicitColor(r)) ?? records[0]
}
// Relative scales derived from the ranges in the uploaded 51 lb/Fast dataset.
// These are transparent proxies, not directly measured comfort or clinical ratings.
const ranges = twuRanges
function scaled(value: number, range: readonly [number,number], inverse=false): number {
  const fraction=Math.max(0,Math.min(1,(value-range[0])/(range[1]-range[0])))
  return Math.round((1+4*(inverse?1-fraction:fraction))*100)/100
}
export function measurementSupport(spec: Identity, priorities: readonly string[], color?: string): number {
  const lab=findTwuMeasurement(spec,color)
  if (!lab) return 0
  const metrics: Record<string, 'stiffness' | 'loss' | 'spin' | 'stringCOF'> = { Conforto:'stiffness', 'Manutenção de tensão':'loss', Spin:'spin', Snapback:'stringCOF' }
  return priorities.reduce((sum,f)=>sum+(metrics[f] && lab[metrics[f]]!==null?1:0),0)
}
export function measuredScores(spec: Identity, editorial: Record<Factor,number>, color?: string): Record<Factor,number> {
  const lab=findTwuMeasurement(spec,color)
  if (!lab) return editorial
  return { ...editorial,
    Conforto: lab.stiffness===null?editorial.Conforto:scaled(lab.stiffness,ranges.stiffness,true),
    'Manutenção de tensão': lab.loss===null?editorial['Manutenção de tensão']:scaled(lab.loss,ranges.loss,true),
    Spin: lab.spin===null?editorial.Spin:scaled(lab.spin,ranges.spin),
    Snapback: lab.stringCOF===null?editorial.Snapback:scaled(lab.stringCOF,ranges.stringCOF,true),
  }
}
export function twuExplanation(spec: Identity, color?: string): string {
  const lab=findTwuMeasurement(spec,color)
  if (!lab) return `${spec.brand} ${spec.model} · ${spec.gauge}: sem ensaio correspondente ao calibre/cor selecionados; avaliação qualitativa, sem transferir medições de outra variante.`
  const format=(v:number)=>String(v).replace('.',',')
  const measured=[lab.stiffness!==null?`rigidez ${format(lab.stiffness)} lb/in`:null,lab.loss!==null?`perda de tensão ${format(lab.loss)}%`:null,lab.spin!==null?`índice de spin ${format(lab.spin)}`:null,lab.stringCOF!==null?`atrito corda/corda ${format(lab.stringCOF)}`:null].filter(Boolean)
  const missing=[lab.stiffness===null?'conforto relativo':null,lab.loss===null?'manutenção de tensão':null,lab.spin===null?'spin':null,lab.stringCOF===null?'snapback':null].filter(Boolean)
  return `Banco de dados TWU — ${lab.name}: ${measured.join('; ')}. Ensaio a 51 lb, velocidade Fast. As medidas alimentam notas relativas: rigidez é uma referência de conforto, atrito é uma referência de snapback; não são medições clínicas ou de movimento em quadra.${missing.length?` Sem medida de ${missing.join(', ')} nesta variante; nesses fatores usamos estimativas.`:''} Potência, controle, pocketing, resistência ao rompimento e preço continuam qualitativos. A data do ensaio não consta no banco de dados; calibre testado não garante estoque atual. Não extrapolamos os valores para a tensão recomendada ou outras cores.`
}
