export type Answers = { level: string; racket: string; pattern: string; previous: string; tension: string; goal: string; pain: string }
export type Recommendation = { title: string; material: string; gauge: string; reason: string; tradeoff: string }
export function recommend(a: Answers): Recommendation[] {
  const soft = a.pain === 'Sim' || a.level === 'Iniciante'
  const options: Record<string, Recommendation> = {
    multi: { title: 'Conforto em primeiro lugar', material: 'Multifilamento', gauge: '1,30 mm', reason: 'Uma resposta mais macia e potência acessível, especialmente para iniciantes ou quem relata desconforto.', tradeoff: 'Pode desfiar e durar menos com batidas fortes e muito efeito.' },
    nylon: { title: 'Um começo equilibrado', material: 'Synthetic gut (nylon)', gauge: '1,30 mm', reason: 'Equilibra conforto, resposta e custo para experimentar um novo encordoamento.', tradeoff: 'Oferece menos controle em golpes muito rápidos do que um poliéster.' },
    gut: { title: 'Resposta e conforto premium', material: 'Tripa natural', gauge: '1,30 mm', reason: 'Boa manutenção de tensão e resposta elástica para quem prioriza conforto e potência.', tradeoff: 'Custo mais alto e maior sensibilidade à umidade e à abrasão.' },
    poly: { title: 'Mais controle no swing', material: 'Copoliéster', gauge: a.goal === 'Durabilidade' ? '1,30 mm' : '1,25 mm', reason: a.goal === 'Efeito (spin)' ? 'Pode favorecer o movimento e retorno das cordas para gerar efeito com a técnica adequada.' : 'Resposta mais firme para jogadores experientes que aceleram o swing e buscam controle.', tradeoff: 'Menor conforto; perde propriedades com o uso mesmo sem romper. Não é a primeira escolha para quem sente dor.' },
    hybrid: { title: 'Um equilíbrio para experimentar', material: 'Híbrido: multifilamento nas verticais + copoliéster nas horizontais', gauge: '1,30 / 1,25 mm', reason: 'Combina a resposta do multifilamento com uma configuração mais firme que um conjunto inteiramente macio.', tradeoff: 'O poliéster pode cortar o multifilamento; não garante conforto e exige acompanhar o desgaste.' },
  }
  const keys = soft ? ['multi', 'nylon', 'gut'] : ['Controle', 'Efeito (spin)', 'Durabilidade'].includes(a.goal) ? ['poly', 'hybrid', 'nylon'] : ['multi', 'nylon', 'gut']
  return keys.map(key => options[key])
}
