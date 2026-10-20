export const factors = ['Conforto', 'Controle', 'Potência', 'Efeito (spin)', 'Durabilidade', 'Custo-benefício', 'Manutenção de tensão'] as const
export type Factor = typeof factors[number]
export type Answers = {
  level: string; racket: string; pattern: string; previous: string; tension: string; goal: string; pain: string
  layout?: string; mains?: string; crosses?: string; mainsTension?: string; crossesTension?: string; liked?: string[]
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
} satisfies Record<string, StringSpec>
function scores(comfort: number, control: number, power: number, spin: number, durability: number, cost: number, retention: number): Scores {
  return { Conforto: comfort, Controle: control, Potência: power, 'Efeito (spin)': spin, Durabilidade: durability, 'Custo-benefício': cost, 'Manutenção de tensão': retention }
}
// Classificações qualitativas para regras do protótipo, não medições de laboratório.
const setups: Setup[] = [
  { id: 'velocity', title: 'Equilíbrio com conforto', layout: 'Full bed', mains: strings.velocity, crosses: strings.velocity, scores: scores(4,3,3,2,3,4,3), benefit: 'O multifilamento é uma alternativa mais elástica ao poliéster para buscar conforto sem ir direto à tripa natural.', tradeoff: 'Pode desfiar e romper mais cedo com golpes rápidos e muito efeito.', },
  { id: 'xone', title: 'Resposta mais viva', layout: 'Full bed', mains: strings.xone, crosses: strings.xone, scores: scores(5,3,5,2,2,2,3), benefit: 'Uma opção elástica para facilitar profundidade e priorizar uma sensação mais macia.', tradeoff: 'Custa mais que um nylon básico e pode exigir adaptação para controlar a profundidade.', },
  { id: 'nylon', title: 'Teste com custo contido', layout: 'Full bed', mains: strings.nylon, crosses: strings.nylon, scores: scores(3,3,3,2,3,5,3), benefit: 'O nylon oferece um ponto de partida equilibrado e acessível para comparar sensações na quadra.', tradeoff: 'Não entrega o mesmo potencial de retorno das cordas de um poliéster e também perde tensão com o uso.', },
  { id: 'gut', title: 'Conforto e resposta premium', layout: 'Full bed', mains: strings.gut, crosses: strings.gut, scores: scores(5,3,5,3,2,1,5), benefit: 'A tripa natural combina elasticidade e manutenção de tensão para quem prioriza conforto e resposta.', tradeoff: 'Preço alto, cuidados com umidade e maior sensibilidade à abrasão.', },
  { id: 'ptp', title: 'Controle no swing completo', layout: 'Full bed', mains: strings.ptp, crosses: strings.ptp, scores: scores(2,5,2,4,4,3,2), benefit: 'O copoliéster pode ajudar jogadores que aceleram o swing a controlar a resposta do encordoamento.', tradeoff: 'Mais firme que multifilamento; precisa ser trocado quando perder resposta, mesmo sem romper.', },
  { id: 'hyperg', title: 'Controle com foco no efeito', layout: 'Full bed', mains: strings.hyperg, crosses: strings.hyperg, scores: scores(2,5,2,5,4,3,2), benefit: 'Poliéster perfilado para explorar controle e efeito junto com a técnica e a velocidade do swing.', tradeoff: 'A resposta firme e o calibre maior podem reduzir conforto e potência acessível.', },
  { id: 'gut-poly', title: 'Potência e controle em dupla', layout: 'Híbrido', mains: strings.gut, crosses: strings.ptp, scores: scores(4,4,4,4,3,1,4), benefit: 'Tripa natural nas verticais e poliéster nas horizontais combinam uma resposta elástica com maior firmeza do que a tripa em full bed.', tradeoff: 'Custo alto; o poliéster pode cortar a tripa e perder resposta antes de as verticais romperem.', },
  { id: 'poly-multi', title: 'Uma ponte para o híbrido', layout: 'Híbrido', mains: strings.ptp, crosses: strings.velocity, scores: scores(3,4,3,4,3,3,2), benefit: 'Poliéster nas verticais mantém uma resposta orientada a controle; multifilamento nas horizontais oferece uma combinação diferente de um full bed de poliéster.', tradeoff: 'Continua contendo poliéster e não garante conforto. As horizontais podem se desgastar mais rápido.', },
  { id: 'multi-nylon', title: 'Híbrido sem poliéster', layout: 'Híbrido', mains: strings.xone, crosses: strings.nylon, scores: scores(4,3,4,2,2,3,3), benefit: 'Multifilamento nas verticais e nylon nas horizontais permitem explorar um híbrido sem adicionar poliéster.', tradeoff: 'É mais trabalhoso que um full bed e não garante mais durabilidade ou efeito; a vantagem precisa ser confirmada em quadra.', },
]
export function stringName(spec: StringSpec): string { return `${spec.brand} ${spec.model}` }
function parseTension(value: string | undefined): number | null {
  if (!value || !/^\d+\s*lb$/.test(value)) return null
  const n = Number.parseInt(value, 10)
  return n >= 30 && n <= 60 ? n : null
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
  const goal = factors.includes(a.goal as Factor) ? a.goal as Factor : 'Conforto'
  const softOnly = a.pain === 'Sim' || a.level === 'Iniciante'
  const eligible = setups.filter(s => !softOnly || (s.mains.material !== 'Poliéster' && s.crosses.material !== 'Poliéster'))
  const ranked = eligible.map(setup => ({ setup, score: 5 * setup.scores[goal] + liked.reduce((sum, f) => sum + 2 * setup.scores[f], 0) + (setup.layout === currentLayout ? 1 : 0) + (setup.mains.material === currentMains ? 0.5 : 0) })).sort((a, b) => b.score - a.score || a.setup.id.localeCompare(b.setup.id))
  const selected = ranked.slice(0, 3).map(entry => entry.setup)
  // Uma alternativa híbrida ajuda a explorar combinações quando se busca controle/spin
  // ou preservar conforto ao mudar para uma resposta mais firme.
  const exploreHybrid = !softOnly && currentLayout === 'Full bed' && (['Controle', 'Efeito (spin)'].includes(goal) || (liked.includes('Controle') && ['Conforto', 'Potência'].includes(goal)))
  if (exploreHybrid && !selected.some(s => s.layout === 'Híbrido')) {
    const hybrid = ranked.find(entry => entry.setup.layout === 'Híbrido')?.setup
    if (hybrid) selected[2] = hybrid
  }
  return selected.map(setup => {
    const notes = new Set<string>()
    const tensionFor = (base: number, oldMaterial: string, spec: StringSpec) => {
      let delta = ['Conforto', 'Potência'].includes(goal) ? -2 : goal === 'Controle' ? 2 : 0
      if (liked.includes('Controle') && goal === 'Potência') delta += 1
      if (liked.includes('Conforto') && goal === 'Controle') delta -= 1
      if (spec.material === 'Poliéster' && oldMaterial !== 'Poliéster') {
        delta -= 4; notes.add('A entrada de poliéster reduz a referência de tensão por sua resposta mais firme.')
      } else if (spec.material !== 'Poliéster' && oldMaterial === 'Poliéster') {
        delta += 2; notes.add('A saída do poliéster considera a maior elasticidade do material proposto.')
      }
      if (a.pattern === '18 × 20' && ['Conforto', 'Potência'].includes(goal)) {
        delta -= 1; notes.add('O padrão 18 × 20 recebe um pequeno ajuste para buscar uma resposta menos firme.')
      }
      if (a.pain === 'Sim') delta = Math.min(delta, -2)
      if (a.level === 'Iniciante') delta = Math.min(delta, 0)
      const raw = base + delta
      const adjusted = Math.max(30, Math.min(60, Math.round(raw)))
      if (adjusted !== raw) notes.add('O ajuste foi limitado à faixa de 30–60 lb do protótipo; isso não valida a faixa da sua raquete.')
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
    notes.add(goal === 'Controle' ? 'O ajuste busca uma resposta mais contida, preservando conforto quando ele foi marcado.' : ['Conforto', 'Potência'].includes(goal) ? 'O ajuste busca uma resposta mais elástica; menor tensão não substitui a escolha do material.' : 'Para efeito e durabilidade, a combinação de cordas tem prioridade sobre mudanças grandes de tensão.')
    const supported = liked.filter(f => setup.scores[f] >= 3)
    const compromises = liked.filter(f => setup.scores[f] < 3)
    const preservation = liked.length === 0 ? 'Você não marcou um ponto a preservar; a prioridade é o objetivo escolhido.' : `${supported.length ? `Busca preservar: ${supported.join(', ')}.` : 'Os pontos que você gosta podem mudar com esta configuração.'}${compromises.length ? ` Atenção à possível perda de ${compromises.join(', ')}.` : ''}`
    const deltaText = (next: number, old: number) => `${old} → ${next} lb (${next - old > 0 ? '+' : ''}${next - old} lb)`
    return {
      ...setup,
      reason: `Para buscar ${goal.toLowerCase()}: ${setup.benefit}${softOnly ? ' O perfil informado prioriza opções sem poliéster.' : ''}`,
      preservation,
      layoutChange: setup.layout === currentLayout ? `Mantém ${currentLayout}` : `Muda de ${currentLayout} para ${setup.layout}`,
      tensions: { mains, crosses, explanation: [...notes].join(' ') },
      tensionComparison: setup.layout === 'Full bed' ? currentLayout === 'Full bed' ? deltaText(mains, oldMains) : `Mains ${oldMains} / crosses ${oldCrosses} lb → ${mains} lb em toda a raquete` : `Mains: ${deltaText(mains, oldMains)} · Crosses: ${deltaText(crosses, oldCrosses)}`,
      caution: 'Ponto de teste, sujeito à faixa do fabricante e à avaliação do encordoador. A faixa da sua raquete ainda não foi validada pelo app. Trocar material e tensão juntos dificulta isolar o efeito de cada mudança.',
    }
  })
}
export function recommendationText(r: Recommendation): string {
  const setup = r.layout === 'Full bed'
    ? `${stringName(r.mains)} · ${r.mains.material} · ${r.mains.gauge} · ${r.tensions.mains} lb em toda a raquete`
    : `Mains (verticais): ${stringName(r.mains)} · ${r.mains.material} · ${r.mains.gauge} · ${r.tensions.mains} lb\nCrosses (horizontais): ${stringName(r.crosses)} · ${r.crosses.material} · ${r.crosses.gauge} · ${r.tensions.crosses} lb`
  return `${r.title}\n${r.layoutChange}\n${setup}\n${r.reason}\n${r.preservation}\nAjuste: ${r.tensionComparison}\n${r.tensions.explanation}\nO que considerar: ${r.tradeoff}\n${r.caution}`
}
