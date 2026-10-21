import { recommendationStrings, type StringProfile } from './recommendationStrings.ts'
import { shotStyleProfile } from './shotStyle.ts'
import { weeklyPlayProfile } from './weeklyPlay.ts'
import { colorPreference, shapePreference, stringColors, stringShapes, stringAppearance, appearanceDescription } from './stringAppearance.ts'
import { stringCostBand, compareCost, costNote } from './cost.ts'
import { MIN_TENSION, MAX_TENSION } from './tensionRange.ts'
import { factors, improvementFactors, reduceCost, type ImprovementFactor, type Factor } from './preferences.ts'
export { factors } from './preferences.ts'
export type Answers = {
  level: string; racket: string; pattern: string; previous: string; tension: string; goals: string[]; pain: string
  shotStyle?: string; weeklyHours?: string; preferredColor?: string; preferredShape?: string; layout?: string; mains?: string; crosses?: string; mainsTension?: string; crossesTension?: string; liked?: string[]; headSize?: number; previousBrand?: string; previousModel?: string; mainsBrand?: string; mainsModel?: string; crossesBrand?: string; crossesModel?: string
}
export type StringSpec = { brand: string; model: string; material: string; gauge: string }
type Scores = Record<Factor, number>
type Setup = {
  id: string; title: string; layout: 'Full bed' | 'Híbrido'; mains: StringSpec; crosses: StringSpec
  scores: Scores; benefit: string; tradeoff: string
}
export type Recommendation = Setup & {
  reason: string; preservation: string; layoutChange: string
  tensions: { mains: number; crosses: number; explanation: string }
  tensionComparison: string; caution: string
  shotStyleNote: string; frequencyNote: string; appearanceNote: string; isValueOption: boolean; costComparison: string; costNote: string
}
// Todo modelo do catálogo participa como full bed. Híbridos usam cruzamentos
// selecionados por material, evitando o produto cartesiano de combinações sem propósito.
function fullBed(profile: StringProfile): Setup {
  const poly = profile.material === 'Poliéster'
  const strengths = factors.filter(f => f !== 'Preço' && profile.scores[f] >= 4).join(', ').toLowerCase()
  return { id: profile.id, title: `${profile.brand} ${profile.model}`, layout: 'Full bed', mains: profile, crosses: profile, scores: profile.scores,
    benefit: `Neste perfil qualitativo, os pontos fortes são ${strengths || 'equilíbrio entre os fatores'}. ` + (poly ? 'Copoliéster para comparar controle, rotação e resposta no swing completo, conforme o perfil deste modelo.' : 'Uma configuração uniforme para explorar a resposta e a elasticidade deste modelo, conforme suas prioridades.'),
    tradeoff: poly ? 'O conforto varia entre modelos, calibres e tensões. Uma tensão menor pode ser um ponto de teste com o encordoador; acompanhe perda de resposta e desgaste, mesmo sem rompimento.' : profile.material === 'Tripa natural' ? 'Preço alto, cuidados com umidade e maior sensibilidade à abrasão.' : 'Pode se desgastar ou romper mais cedo com golpes rápidos e muito efeito; confirme calibre e custo local.' }
}
function hybrid(main: StringProfile, cross: StringProfile): Setup {
  const hasPoly = main.material === 'Poliéster' || cross.material === 'Poliéster'
  return { id: `${main.id}--${cross.id}`, title: `${main.model} + ${cross.model}`, layout: 'Híbrido', mains: main, crosses: cross,
    // Verticais têm maior peso como aproximação editorial. A interação entre cordas
    // não é medida: a média não promete o desempenho real da combinação.
    scores: Object.fromEntries(factors.map(f => [f, f === 'Preço' ? Math.min(main.scores[f], cross.scores[f]) : Math.round((main.scores[f] * 0.65 + cross.scores[f] * 0.35) * 100) / 100])) as Scores,
    benefit: `${main.brand} ${main.model} nas verticais e ${cross.brand} ${cross.model} nas horizontais para comparar uma resposta diferente do full bed.`,
    tradeoff: hasPoly ? 'Contém poliéster e não garante conforto. A interação pode alterar atrito e desgaste; as duas cordas podem perder resposta em ritmos diferentes.' : 'O híbrido exige acompanhar desgaste e resposta das duas cordas e não garante vantagem sobre um full bed.' }
}
const crossModels = new Set(['HEAD Velocity MLT', 'Tecnifibre Multifeel', 'Prince Synthetic Gut with Duraflex', 'Volkl Classic Synthetic Gut', 'Yonex POLYTOUR PRO', 'MSV Co-Focus', 'ReString Sync', 'Toroline Enso Pro'])
const crossProfiles = recommendationStrings.filter(s => crossModels.has(`${s.brand} ${s.model}`))
export const recommendationSetups: Setup[] = [
  ...recommendationStrings.map(fullBed),
  ...recommendationStrings.filter(s => s.material !== 'Synthetic gut (nylon)').flatMap(main => crossProfiles.filter(cross =>
    cross.id !== main.id && (main.material === 'Poliéster' ? cross.material !== 'Poliéster' : main.material === 'Tripa natural' || cross.material !== main.material)
  ).map(cross => hybrid(main, cross))),
]
export function stringName(spec: StringSpec): string { return `${spec.brand} ${spec.model}` }
function parseTension(value: string | undefined): number | null {
  if (!value || !/^\d+\s*lb$/.test(value)) return null
  const n = Number.parseInt(value, 10)
  return n >= MIN_TENSION && n <= MAX_TENSION ? n : null
}
export function recommend(a: Answers): Recommendation[] {
  const shot = shotStyleProfile(a.shotStyle)
  if (a.shotStyle !== undefined && !shot) return []
  const frequency = weeklyPlayProfile(a.weeklyHours)
  if (a.weeklyHours !== undefined && !frequency) return []
  const currentLayout = a.layout ?? 'Full bed'
  const currentMains = currentLayout === 'Híbrido' ? a.mains ?? '' : a.previous
  const currentCrosses = currentLayout === 'Híbrido' ? a.crosses ?? '' : a.previous
  const oldMains = parseTension(currentLayout === 'Híbrido' ? a.mainsTension : a.tension)
  const oldCrosses = parseTension(currentLayout === 'Híbrido' ? a.crossesTension : a.tension)
  // Sem inventar tensões caso falte o histórico necessário.
  if (oldMains === null || oldCrosses === null) return []
  const preferences = [...new Set(a.liked ?? [])].filter(f => factors.includes(f as Factor) || f === colorPreference || f === shapePreference)
  if (preferences.length > 3) return []
  const color = preferences.includes(colorPreference) ? a.preferredColor : undefined
  const shape = preferences.includes(shapePreference) ? a.preferredShape : undefined
  if (preferences.includes(colorPreference) && (!color || !Object.hasOwn(stringColors, color))) return []
  if (preferences.includes(shapePreference) && (!shape || !stringShapes.includes(shape as typeof stringShapes[number]))) return []
  const liked = preferences.filter((f): f is Factor => factors.includes(f as Factor))
  if (liked.length > 3) return []
  const goals = [...new Set(a.goals)].filter((f): f is ImprovementFactor => improvementFactors.includes(f as ImprovementFactor))
  if (!goals.length || goals.length > 2) return []
  const hasGoal = (goal: ImprovementFactor) => goals.includes(goal)
  const patternMatch = /^(\d+) × (\d+)$/.exec(a.pattern)
  const stringCount = patternMatch ? Number(patternMatch[1]) * Number(patternMatch[2]) : undefined
  const headSize = a.headSize && a.headSize >= 90 && a.headSize <= 130 ? a.headSize : undefined
  const density = stringCount ? stringCount * 100 / (headSize ?? 100) : undefined
  const spacing = density === undefined ? 'não classificado' : density >= 342 ? 'mais denso' : density <= 310 ? 'mais aberto' : 'intermediário'
  const racketContext = `${a.racket} · ${a.pattern}${headSize ? ` · cabeça de ${headSize} pol²` : ' · tamanho da cabeça não validado'}`
  const hasDiscomfort = a.pain === 'Sim'
  const fullBedOnly = a.level === 'Iniciante'
  const hasPoly = (setup: Setup) => setup.mains.material === 'Poliéster' || setup.crosses.material === 'Poliéster'
  const appearanceScore = (s: Setup) => {
    const main = stringAppearance(s.mains), cross = stringAppearance(s.crosses)
    return (color ? (main.colors.includes(color) ? 5 : 0) + (cross.colors.includes(color) ? 2 : 0) : 0) + (shape ? (main.shape === shape ? 5 : 0) + (cross.shape === shape ? 2 : 0) : 0)
  }
  const candidates = recommendationSetups
  const alreadyUsesNaturalGut = currentMains === 'Tripa natural' || currentCrosses === 'Tripa natural'
  const eligible = candidates.filter(s =>
    (alreadyUsesNaturalGut || (s.mains.material !== 'Tripa natural' && s.crosses.material !== 'Tripa natural')) &&
    (!fullBedOnly || s.layout === 'Full bed')
  )
  const ranked = eligible.map(setup => ({ setup, score: (shot ? shot.control * setup.scores.Controle + shot.power * setup.scores.Potência + shot.spin * setup.scores.Spin + shot.snapback * setup.scores.Snapback + shot.durability * setup.scores.Durabilidade + shot.retention * setup.scores['Manutenção de tensão'] : 0) + (frequency ? frequency.retention * setup.scores['Manutenção de tensão'] + frequency.durability * setup.scores.Durabilidade + frequency.price * setup.scores.Preço : 0) + appearanceScore(setup) + 5 * goals.reduce((sum, goal) => sum + setup.scores[goal === reduceCost ? 'Preço' : goal], 0) / goals.length + liked.reduce((sum, f) => sum + 2 * setup.scores[f], 0) + (hasDiscomfort ? 2 * setup.scores.Conforto : 0) })).sort((a, b) => b.score - a.score || a.setup.id.localeCompare(b.setup.id))
  const currentCost = currentLayout === 'Híbrido'
    ? (stringCostBand(currentMains, a.mainsBrand, a.mainsModel) + stringCostBand(currentCrosses, a.crossesBrand, a.crossesModel)) / 2
    : stringCostBand(currentMains, a.previousBrand, a.previousModel)
  const setupCost = (setup: Setup) => (stringCostBand(setup.mains.material, setup.mains.brand, setup.mains.model) + stringCostBand(setup.crosses.material, setup.crosses.brand, setup.crosses.model)) / 2
  // As duas primeiras são as mais bem pontuadas, sem alternância obrigatória.
  const first = ranked[0].setup
  const second = ranked[1].setup
  const valueOption = ranked.find(({ setup }) => setup.scores.Preço >= 4 && setup.id !== first.id && setup.id !== second.id)!.setup
  const selected = [first, second, valueOption]
  return selected.map(setup => {
    const notes = new Set<string>()
    notes.add(`Raquete considerada: ${racketContext}. A combinação de padrão e área da cabeça é uma referência aproximada de encordoamento ${spacing}; não mede o espaçamento real nem o ângulo de saída.`)
    if (!headSize) notes.add('Sem tamanho validado, o ajuste considera apenas a contagem de cordas; não atribui propriedades específicas à marca ou à linha.')
    if (hasDiscomfort) notes.add('O desconforto informado dá mais peso ao conforto na pontuação, sem excluir materiais ou impor um teto de tensão. Poliésteres de resposta relativamente mais macia também são elegíveis; uma redução de tensão pode ser avaliada com o encordoador. A recomendação não garante ausência de dor.')
    if (fullBedOnly) notes.add('Para iniciantes, as três opções são full bed, sem exclusão automática de materiais.')
    if (goals.length === 2) notes.add(`Objetivos combinados com o mesmo peso: ${goals.join(' e ')}. Ajustes de tensão em sentidos opostos são compensados, em vez de prometer melhorar tudo ao mesmo tempo.`)
    const tensionFor = (base: number, oldMaterial: string, spec: StringSpec) => {
      const goalDelta = (goal: ImprovementFactor) => goal === 'Controle' ? 2 : goal === 'Conforto' || goal === 'Potência' ? -2 : 0
      let delta = goals.reduce((sum, goal) => sum + goalDelta(goal), 0) / goals.length
      if (liked.includes('Controle') && hasGoal('Potência')) delta += 1
      if (liked.includes('Conforto') && hasGoal('Controle')) delta -= 1
      if (spec.material === 'Poliéster' && oldMaterial !== 'Poliéster') {
        delta -= 4; notes.add('A entrada de poliéster reduz a referência de tensão por sua resposta mais firme.')
      } else if (spec.material !== 'Poliéster' && oldMaterial === 'Poliéster') {
        delta += 2; notes.add('A saída do poliéster considera a maior elasticidade do material proposto.')
      }
      if (a.pattern === '18 × 20' && (hasGoal('Conforto') || hasGoal('Potência'))) {
        delta -= 1; notes.add('O padrão 18 × 20 recebe um pequeno ajuste para buscar uma resposta menos firme.')
      }
      const raw = base + delta
      const adjusted = Math.max(MIN_TENSION, Math.min(MAX_TENSION, Math.round(raw)))
      if (adjusted !== raw) notes.add('O ajuste foi limitado à faixa de 30–69 lb do protótipo; isso não valida a faixa da sua raquete.')
      return adjusted
    }
    let mains: number, crosses: number
    if (setup.layout === 'Full bed') {
      const baseline = Math.round((oldMains + oldCrosses) / 2)
      if (currentLayout === 'Híbrido') notes.add(`Para testar um full bed, a referência é a média arredondada das tensões atuais (${baseline} lb).`)
      const oldMaterial = currentMains === 'Poliéster' || currentCrosses === 'Poliéster' ? 'Poliéster' : currentMains
      mains = crosses = tensionFor(baseline, oldMaterial, setup.mains)
    } else {
      mains = tensionFor(oldMains, currentMains, setup.mains)
      crosses = tensionFor(oldCrosses, currentCrosses, setup.crosses)
    }
    if (goals.length === 1 && hasGoal(reduceCost)) notes.add('Reduzir o custo orienta a escolha da corda; a tensão não é alterada para prometer economia. Eventuais ajustes de tensão decorrem da mudança de material e do histórico informado.')
    else notes.add(hasGoal('Controle') ? 'O ajuste busca uma resposta mais contida, preservando conforto quando ele foi marcado.' : hasGoal('Conforto') || hasGoal('Potência') ? 'O ajuste busca uma resposta mais elástica; menor tensão não substitui a escolha do material.' : 'Para efeito e durabilidade, a combinação de cordas tem prioridade sobre mudanças grandes de tensão.')
    if (hasGoal('Snapback') || liked.includes('Snapback')) notes.add('Snapback é o retorno das cordas à posição após o impacto. A classificação considera a combinação e o material de forma heurística, não medições de atrito. Desgaste, entalhes e técnica afetam o resultado; não há ajuste de tensão específico para prometer snapback.')
    if (hasGoal('Pocketing') || liked.includes('Pocketing')) notes.add('Pocketing é a sensação de a bola afundar e ser abraçada pelas cordas no impacto. A classificação é heurística, ligada à elasticidade dos materiais e à combinação; tensão, calibre, raquete e técnica também influenciam. Não é uma medição de tempo de contato nem motivo isolado para baixar a tensão.')
    const supported = liked.filter(f => setup.scores[f] >= 3)
    const compromises = liked.filter(f => setup.scores[f] < 3)
    const preservation = liked.length === 0 ? preferences.length ? 'As preferências de cor e formato estão detalhadas abaixo.' : 'Você não marcou um ponto a preservar; a prioridade é o objetivo escolhido.' : `${supported.length ? `Busca preservar: ${supported.join(', ')}.` : 'Os pontos que você gosta podem mudar com esta configuração.'}${compromises.length ? ` Atenção à possível perda de ${compromises.join(', ')}.` : ''}`
    const deltaText = (next: number, old: number) => `${old} → ${next} lb (${next - old > 0 ? '+' : ''}${next - old} lb)`
    return {
      ...setup,
      shotStyleNote: shot ? shot.note : '',
      frequencyNote: frequency ? `${frequency.label} por semana: ${frequency.note}${frequency.label === 'Até 2 horas' && hasPoly(setup) ? ' O poliéster pode perder resposta sem romper; acompanhe a condição das cordas entre as partidas.' : ''}` : '',
      appearanceNote: appearanceDescription(setup.mains, setup.crosses, setup.layout === 'Híbrido', color, shape),
      isValueOption: setup.id === valueOption.id,
      costComparison: compareCost(currentCost, setupCost(setup)),
      costNote,
      reason: `Para buscar ${goals.map(goal => goal.toLowerCase()).join(' e ')}: ${setup.benefit}${hasGoal('Pocketing') || liked.includes('Pocketing') ? setup.scores.Pocketing >= 4 ? ' A combinação busca uma sensação de maior pocketing, a confirmar em quadra.' : ' O pocketing é uma concessão nesta alternativa para conciliar as demais prioridades e o custo.' : ''}${hasGoal('Snapback') || liked.includes('Snapback') ? setup.scores.Snapback >= 4 ? ' A combinação prioriza potencial de snapback; é uma hipótese para testar, não garantia de mais spin.' : ' O snapback é uma concessão nesta alternativa para conciliar as demais prioridades e o custo.' : ''}${fullBedOnly ? ' O perfil iniciante recebe apenas opções full bed.' : ''}`,
      preservation,
      layoutChange: setup.layout === currentLayout ? `Mantém ${currentLayout}` : `Muda de ${currentLayout} para ${setup.layout}`,
      tensions: { mains, crosses, explanation: [...notes].join(' ') },
      tensionComparison: setup.layout === 'Full bed' ? currentLayout === 'Full bed' ? deltaText(mains, oldMains) : `Mains ${oldMains} / crosses ${oldCrosses} lb → ${mains} lb em toda a raquete` : `Mains: ${deltaText(mains, oldMains)} · Crosses: ${deltaText(crosses, oldCrosses)}`,
      caution: 'Ponto de teste, sujeito à faixa do fabricante e à avaliação do encordoador. A faixa da sua raquete ainda não foi validada pelo app. Trocar material e tensão juntos dificulta isolar o efeito de cada mudança.' + (hasDiscomfort && hasPoly(setup) ? ' Baixa tensão não torna o poliéster uma opção isenta de risco para quem sente desconforto; se houver dor, interrompa o teste e procure avaliação profissional.' : ''),
    }
  })
}
export function recommendationText(r: Recommendation): string {
  const setup = r.layout === 'Full bed'
    ? `${stringName(r.mains)} · ${r.mains.material} · ${r.mains.gauge} · ${r.tensions.mains} lb em toda a raquete`
    : `Mains (verticais): ${stringName(r.mains)} · ${r.mains.material} · ${r.mains.gauge} · ${r.tensions.mains} lb\nCrosses (horizontais): ${stringName(r.crosses)} · ${r.crosses.material} · ${r.crosses.gauge} · ${r.tensions.crosses} lb`
  return `${r.title}\n${r.layoutChange}${r.isValueOption ? ' · Opção de custo-benefício' : ''}\n${setup}\n${r.reason}\n${r.preservation}\n${r.frequencyNote}\n${r.shotStyleNote}\n${r.appearanceNote}\n${r.costComparison}\n${r.costNote}\nAjuste: ${r.tensionComparison}\n${r.tensions.explanation}\nO que considerar: ${r.tradeoff}\n${r.caution}`
}
