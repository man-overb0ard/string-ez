const levels = [
  { name: 'Iniciante', range: '1.0 a 3.0', description: 'Está aprendendo ou consolidando os fundamentos. Desenvolve coordenação, percepção da bola e controle dos golpes. Começa a colocar a bola em jogo e sustentar trocas simples.' },
  { name: 'Intermediário', range: '3.5 a 4.5', description: 'Sustenta trocas com mais consistência e direciona melhor a bola. Desenvolve um primeiro saque confiável, usa potência e efeitos com mais intenção e evolui na movimentação, no jogo de rede e nas estratégias de duplas.' },
  { name: 'Avançado', range: '5.0 a 7.0', description: 'Antecipa jogadas, controla bem a bola e possui segundo saque consistente. Aplica estratégias e compete sob pressão. Na parte superior da faixa, apresenta domínio técnico e experiência em competições de alto nível, incluindo o nível profissional.' },
]

export default function NtrpGuide() {
  return <section className="ntrp-guide" aria-labelledby="ntrp-guide-title">
    <h2 id="ntrp-guide-title">Está em dúvida?</h2>
    <p>Confira seu nível NTRP na tabela abaixo.</p>
    <table>
      <caption className="sr-only">Referência de nível NTRP para escolher seu perfil no app</caption>
      <thead><tr><th scope="col">Nível</th><th scope="col">NTRP</th><th scope="col">Características do jogador</th></tr></thead>
      <tbody>{levels.map(level => <tr key={level.name}>
        <th scope="row">{level.name}</th><td className="ntrp-range">{level.range}</td><td className="ntrp-description">{level.description}</td>
      </tr>)}</tbody>
    </table>
    <p className="ntrp-note">As descrições são referências gerais. Dentro de cada faixa, há diferenças importantes de experiência e consistência.</p>
  </section>
}
