import { MIN_TENSION, MAX_TENSION } from './tensionRange.ts'
import { factors, improvementFactors, launchLow, launchHigh, type Factor } from './preferences.ts'
export { factors } from './preferences.ts'
export type Answers = {
  level: string; racket: string; pattern: string; previous: string; tension: string; goals: string[]; pain: string
  layout?: string; mains?: string; crosses?: string; mainsTension?: string; crossesTension?: string; liked?: string[]; headSize?: number
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
}
const strings = {
  velocity: { brand: 'HEAD', model: 'Velocity MLT', material: 'Multifilamento', gauge: '1,30 mm' },
  xone: { brand: 'Tecnifibre', model: 'X-One Biphase', material: 'Multifilamento', gauge: '1,30 mm' },
  nylon: { brand: 'Prince', model: 'Synthetic Gut with Duraflex', material: 'Synthetic gut (nylon)', gauge: '1,30 mm' },
  gut: { brand: 'Babolat', model: 'Touch VS', material: 'Tripa natural', gauge: '1,30 mm' },
  ptp: { brand: 'Yonex', model: 'POLYTOUR PRO', material: 'Poliéster', gauge: '1,25 mm' },
  hyperg: { brand: 'Solinco', model: 'Hyper-G', material: 'Poliéster', gauge: '1,30 mm' },
  hypergSoft: { brand: 'Solinco', model: 'Hyper-G Soft', material: 'Poliéster', gauge: '1,25 mm' },
} satisfies Record<string, StringSpec>
function scores(comfort: number, control: number, power: number, spin: number, durability: number, cost: number, retention: number, low: number, high: number): Scores {
  return { Conforto: comfort, Controle: control, Potência: power, 'Efeito (spin)': spin, Durabilidade: durability, 'Custo-benefício': cost, 'Manutenção de tensão': retention, [launchLow]: low, [launchHigh]: high }
}
// Classificações qualitativas para regras do protótipo, não medições de laboratório.
const setups: Setup[] = [
  { id: 'velocity', title: 'Equilíbrio com conforto', layout: 'Full bed', mains: strings.velocity, crosses: strings.velocity, scores: scores(4,3,3,2,3,4,3,3,3), benefit: 'O multifilamento é uma alternativa mais elástica ao poliéster para buscar conforto sem ir direto à tripa natural.', tradeoff: 'Pode desfiar e romper mais cedo com golpes rápidos e muito efeito.', },
  { id: 'xone', title: 'Resposta mais viva', layout: 'Full bed', mains: strings.xone, crosses: strings.xone, scores: scores(5,3,5,2,2,2,3,2,4), benefit: 'Uma opção elástica para facilitar profundidade e priorizar uma sensação mais macia.', tradeoff: 'Custa mais que um nylon básico e pode exigir adaptação para controlar a profundidade.', },
  { id: 'nylon', title: 'Teste com custo contido', layout: 'Full bed', mains: strings.nylon, crosses: strings.nylon, scores: scores(3,3,3,2,3,5,3,3,3), benefit: 'O nylon oferece um ponto de partida equilibrado e acessível para comparar sensações na quadra.', tradeoff: 'Não entrega o mesmo potencial de retorno das cordas de um poliéster e também perde tensão com o uso.', },
  { id: 'gut', title: 'Conforto e resposta premium', layout: 'Full bed', mains: strings.gut, crosses: strings.gut, scores: scores(5,3,5,3,2,1,5,2,4), benefit: 'A tripa natural combina elasticidade e manutenção de tensão para quem prioriza conforto e resposta.', tradeoff: 'Preço alto, cuidados com umidade e maior sensibilidade à abrasão.', },
  { id: 'ptp', title: 'Controle no swing completo', layout: 'Full bed', mains: strings.ptp, crosses: strings.ptp, scores: scores(2,5,2,4,4,3,2,4,3), benefit: 'O copoliéster pode ajudar jogadores que aceleram o swing a controlar a resposta do encordoamento.', tradeoff: 'Mais firme que multifilamento; precisa ser trocado quando perder resposta, mesmo sem romper.', },
  { id: 'hyperg', title: 'Controle com foco no efeito', layout: 'Full bed', mains: strings.hyperg, crosses: strings.hyperg, scores: scores(2,5,2,5,4,3,2,3,4), benefit: 'Poliéster perfilado para explorar controle e efeito junto com a técnica e a velocidade do swing.', tradeoff: 'A resposta firme e o calibre maior podem reduzir conforto e potência acessível.', },
  { id: 'hyperg-soft', title: 'Efeito com tensão reduzida', layout: 'Full bed', mains: strings.hypergSoft, crosses: strings.hypergSoft, scores: scores(3,4,2,5,3,3,2,3,4), benefit: 'Uma alternativa de copoliéster para explorar efeito e controle. A versão Soft continua sendo poliéster e não garante conforto.', tradeoff: 'A tensão reduzida pode mudar a trajetória e o controle. Continua mais firme que muitas opções de multifilamento e exige acompanhar a perda de resposta.', },
  { id: 'gut-poly', title: 'Potência e controle em dupla', layout: 'Híbrido', mains: strings.gut, crosses: strings.ptp, scores: scores(4,4,4,4,3,1,4,3,4), benefit: 'Tripa natural nas verticais e poliéster nas horizontais combinam uma resposta elástica com maior firmeza do que a tripa em full bed.', tradeoff: 'Custo alto; o poliéster pode cortar a tripa e perder resposta antes de as verticais romperem.', },
  { id: 'poly-multi', title: 'Uma ponte para o híbrido', layout: 'Híbrido', mains: strings.ptp, crosses: strings.velocity, scores: scores(3,4,3,4,3,3,2,3,3), benefit: 'Poliéster nas verticais mantém uma resposta orientada a controle; multifilamento nas horizontais oferece uma combinação diferente de um full bed de poliéster.', tradeoff: 'Continua contendo poliéster e não garante conforto. As horizontais podem se desgastar mais rápido.', },
  { id: 'multi-nylon', title: 'Híbrido sem poliéster', layout: 'Híbrido', mains: strings.xone, crosses: strings.nylon, scores: scores(4,3,4,2,2,3,3,2,4), benefit: 'Multifilamento nas verticais e nylon nas horizontais permitem explorar um híbrido sem adicionar poliéster.', tradeoff: 'É mais trabalhoso que um full bed e não garante mais durabilidade ou efeito; a vantagem precisa ser confirmada em quadra.', },
]
export function stringName(spec: StringSpec): string { return `${spec.brand} ${spec.model}` }
function parseTension(value: string | undefined): number | null {
  if (!value || !/^\d+\s*lb$/.test(value)) return null
  const n = Number.parseInt(value, 10)
  return n >= MIN_TENSION && n <= MAX_TENSION ? n : null
}
export function recommend(a: Answers): Recommendation[] {
  const currentLayout = a.layout ?? 'Full bed'
  const currentMains = currentLayout === 'Híbrido' ? a.mains ?? '' : a.previous
  const currentCrosses = currentLayout === 'Híbrido' ? a.crosses ?? '' : a.previous
  const oldMains = parseTension(currentLayout === 'Híbrido' ? a.mainsTension : a.tension)
  const oldCrosses = parseTension(currentLayout === 'Híbrido' ? a.crossesTension : a.tension)
  // Sem inventar tensões caso falte o histórico necessário.
  if (oldMains === null || oldCrosses === null) return []
  const liked = (a.liked ?? []).filter((f): f is Factor => factors.includes(f as Factor))
  const goals = [...new Set(a.goals)].filter((f): f is Factor => improvementFactors.includes(f as Factor))
  if (!goals.length || goals.length > 2 || (goals.includes(launchLow) && goals.includes(launchHigh))) return []
  const hasGoal = (goal: Factor) => goals.includes(goal)
  const angleGoal = goals.find(goal => goal === launchLow || goal === launchHigh)
  const angleLiked = liked.find(factor => factor === launchLow || factor === launchHigh)
  const patternMatch = /^(\d+) × (\d+)$/.exec(a.pattern)
  const stringCount = patternMatch ? Number(patternMatch[1]) * Number(patternMatch[2]) : undefined
  const headSize = a.headSize && a.headSize >= 90 && a.headSize <= 115 ? a.headSize : undefined
  const density = stringCount ? stringCount * 100 / (headSize ?? 100) : undefined
  const spacing = density === undefined ? 'não classificado' : density >= 342 ? 'mais denso' : density <= 310 ? 'mais aberto' : 'intermediário'
  const racketContext = `${a.racket} · ${a.pattern}${headSize ? ` · cabeça de ${headSize} pol²` : ' · tamanho da cabeça não validado'}`
  const hasDiscomfort = a.pain === 'Sim'
  const softOnly = a.level === 'Iniciante'
  const hasPoly = (setup: Setup) => setup.mains.material === 'Poliéster' || setup.crosses.material === 'Poliéster'
  const eligible = setups.filter(s => !softOnly || (s.mains.material !== 'Poliéster' && s.crosses.material !== 'Poliéster'))
  const ranked = eligible.map(setup => ({ setup, score: 5 * goals.reduce((sum, goal) => sum + setup.scores[goal], 0) / goals.length + liked.reduce((sum, f) => sum + 2 * setup.scores[f], 0) + (setup.layout === currentLayout ? 1 : 0) + (setup.mains.material === currentMains ? 0.5 : 0) + (hasDiscomfort ? 2 * setup.scores.Conforto - (hasPoly(setup) ? 4 : 0) : 0) })).sort((a, b) => b.score - a.score || a.setup.id.localeCompare(b.setup.id))
  // Com desconforto, manter pelo menos duas alternativas sem poliéster.
  const selected: Setup[] = []
  for (const { setup } of ranked) {
    if (hasDiscomfort && hasPoly(setup) && selected.some(hasPoly)) continue
    selected.push(setup)
    if (selected.length === 3) break
  }
  // Uma alternativa híbrida ajuda a explorar combinações quando se busca controle/spin
  // ou preservar conforto ao mudar para uma resposta mais firme.
  const exploreHybrid = !softOnly && !hasDiscomfort && currentLayout === 'Full bed' && (hasGoal('Controle') || hasGoal('Efeito (spin)') || (liked.includes('Controle') && (hasGoal('Conforto') || hasGoal('Potência'))))
  if (exploreHybrid && !selected.some(s => s.layout === 'Híbrido')) {
    const hybrid = ranked.find(entry => entry.setup.layout === 'Híbrido')?.setup
    if (hybrid) selected[2] = hybrid
  }
  return selected.map(setup => {
    const notes = new Set<string>()
    notes.add(`Raquete considerada: ${racketContext}. A combinação de padrão e área da cabeça é uma referência aproximada de encordoamento ${spacing}; não mede o espaçamento real nem o ângulo de saída.`)
    if (!headSize) notes.add('Sem tamanho validado, o ajuste considera apenas a contagem de cordas; não atribui propriedades específicas à marca ou à linha.')
    if (angleGoal || angleLiked) notes.add('Ângulo de saída (launch angle) é a inclinação inicial da trajetória da bola ao deixar as cordas. Tensão, material, espaçamento, atrito e técnica interagem; não é o mesmo que quantidade de spin e não pode ser previsto só pela tensão.')
    if (hasDiscomfort) notes.add('O desconforto dá mais peso ao conforto. O poliéster pode entrar como uma alternativa de tensão reduzida; reduzir tensão não elimina sua rigidez nem garante ausência de dor.')
    else if (a.level === 'Iniciante') notes.add('Para iniciantes, a regra não aumenta a tensão nem inclui poliéster para perseguir o ângulo desejado.')
    if (goals.length === 2) notes.add(`Objetivos combinados com o mesmo peso: ${goals.join(' e ')}. Ajustes de tensão em sentidos opostos são compensados, em vez de prometer melhorar tudo ao mesmo tempo.`)
    if (angleGoal && angleLiked && angleGoal !== angleLiked) notes.add('O ângulo que você quer preservar entra em conflito com o ângulo desejado: o ajuste é reduzido e exige confirmar sua prioridade em quadra.')
    const tensionFor = (base: number, oldMaterial: string, spec: StringSpec) => {
      const goalDelta = (goal: Factor) => goal === launchLow || goal === 'Controle' ? 2 : goal === launchHigh || goal === 'Conforto' || goal === 'Potência' ? -2 : 0
      let delta = goals.reduce((sum, goal) => sum + goalDelta(goal), 0) / goals.length
      if (liked.includes('Controle') && hasGoal('Potência')) delta += 1
      if (liked.includes('Conforto') && hasGoal('Controle')) delta -= 1
      if (angleGoal === launchLow && spacing === 'mais aberto') {
        delta += 1; notes.add('Para buscar saída mais baixa em uma configuração relativamente aberta, a regra acrescenta 1 lb ao ajuste de referência.')
      }
      if (angleGoal === launchHigh && spacing === 'mais denso') {
        delta -= 1; notes.add('Para buscar saída mais alta em uma configuração relativamente densa, a regra reduz mais 1 lb da referência.')
      }
      if (angleLiked && (!angleGoal || angleGoal !== angleLiked)) {
        delta = Math.max(-1, Math.min(1, delta))
        notes.add('Como você quer preservar o ângulo atual, a parcela do ajuste ligada aos objetivos é limitada a ±1 lb; mudanças de material ainda podem alterar a trajetória.')
      }
      if (spec.material === 'Poliéster' && oldMaterial !== 'Poliéster') {
        delta -= 4; notes.add('A entrada de poliéster reduz a referência de tensão por sua resposta mais firme.')
      } else if (spec.material !== 'Poliéster' && oldMaterial === 'Poliéster') {
        delta += 2; notes.add('A saída do poliéster considera a maior elasticidade do material proposto.')
      }
      if (a.pattern === '18 × 20' && (hasGoal('Conforto') || hasGoal('Potência')) && !angleGoal) {
        delta -= 1; notes.add('O padrão 18 × 20 recebe um pequeno ajuste para buscar uma resposta menos firme.')
      }
      if (a.pain === 'Sim') delta = Math.min(delta, -2)
      if (a.level === 'Iniciante') delta = Math.min(delta, 0)
      let raw = base + delta
      if (hasDiscomfort && spec.material === 'Poliéster') {
        raw = Math.min(raw, base - 4, 45)
        notes.add('Para a direção com poliéster e desconforto relatado, o protótipo testa pelo menos 4 lb abaixo da referência e no máximo 45 lb, respeitando o limite inferior do seletor. É um teto heurístico, não uma faixa clinicamente segura ou validada para a raquete.')
      }
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
    if (angleGoal) notes.add(angleGoal === launchLow ? 'A regra testa maior firmeza para buscar uma saída mais baixa; é uma hipótese para comparar em quadra, não uma relação universal.' : 'A regra testa menor firmeza para buscar uma saída mais alta; é uma hipótese para comparar em quadra, não uma relação universal.')
    else notes.add(hasGoal('Controle') ? 'O ajuste busca uma resposta mais contida, preservando conforto quando ele foi marcado.' : hasGoal('Conforto') || hasGoal('Potência') ? 'O ajuste busca uma resposta mais elástica; menor tensão não substitui a escolha do material.' : 'Para efeito e durabilidade, a combinação de cordas tem prioridade sobre mudanças grandes de tensão.')
    const supported = liked.filter(f => setup.scores[f] >= 3)
    const compromises = liked.filter(f => setup.scores[f] < 3)
    const preservation = liked.length === 0 ? 'Você não marcou um ponto a preservar; a prioridade é o objetivo escolhido.' : `${supported.length ? `Busca preservar: ${supported.join(', ')}.` : 'Os pontos que você gosta podem mudar com esta configuração.'}${compromises.length ? ` Atenção à possível perda de ${compromises.join(', ')}.` : ''}`
    const deltaText = (next: number, old: number) => `${old} → ${next} lb (${next - old > 0 ? '+' : ''}${next - old} lb)`
    return {
      ...setup,
      reason: `Para buscar ${goals.map(goal => goal.toLowerCase()).join(' e ')}: ${setup.benefit}${softOnly ? ' O perfil iniciante prioriza opções sem poliéster.' : hasDiscomfort ? hasPoly(setup) ? ' Esta é uma alternativa com poliéster em tensão reduzida, para avaliar com o encordoador.' : ' Esta opção prioriza materiais sem poliéster para comparar o conforto.' : ''}`,
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
  return `${r.title}\n${r.layoutChange}\n${setup}\n${r.reason}\n${r.preservation}\nAjuste: ${r.tensionComparison}\n${r.tensions.explanation}\nO que considerar: ${r.tradeoff}\n${r.caution}`
}
