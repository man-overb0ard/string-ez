import { useRef, useState } from 'react'
import { recommend, type Answers as RecommendationAnswers } from './recommendations'
import { rackets, other, racketLabel } from './rackets'
type Answers = RecommendationAnswers & { brand: string; line: string }
import './App.css'

const currentYear = new Date().getFullYear()
const initial: Answers = { brand: '', line: '', level: '', racket: '', pattern: '', previous: '', tension: '', goal: '', pain: '' }
const profileQuestions: { key: keyof Answers; title: string; hint: string; options?: string[]; placeholder?: string }[] = [
  { key: 'level', title: 'Como é o seu jogo hoje?', hint: 'Vamos encontrar um ponto de partida para o seu momento.', options: ['Iniciante', 'Intermediário', 'Avançado'] },
  { key: 'pattern', title: 'Qual é o padrão de cordas?', hint: 'Normalmente aparece na raquete: verticais × horizontais.', options: ['16 × 19', '18 × 20', 'Outro / não sei'] },
  { key: 'previous', title: 'Que corda você usa hoje?', hint: 'Tudo bem se este for seu primeiro encordoamento.', options: ['Não sei / primeiro encordoamento', 'Multifilamento', 'Synthetic gut (nylon)', 'Poliéster', 'Tripa natural', 'Híbrido'] },
  { key: 'tension', title: 'E a tensão atual?', hint: 'Informe o valor e a unidade, se souber. Não vamos adivinhar uma tensão segura.', placeholder: 'Ex.: 50 lb, 23 kg ou “não sei”' },
  { key: 'goal', title: 'O que você quer melhorar?', hint: 'Escolha o que faria mais diferença na sua próxima partida.', options: ['Conforto', 'Controle', 'Potência', 'Efeito (spin)', 'Durabilidade'] },
  { key: 'pain', title: 'Sente desconforto no braço?', hint: 'Isso muda nossa prioridade na escolha das cordas.', options: ['Sim', 'Não'] },
]
function App() {
  const [step, setStep] = useState(-1)
  const [answers, setAnswers] = useState<Answers>(initial)
  const questions: typeof profileQuestions = [
    { key: 'brand', title: 'Qual é a marca da sua raquete?', hint: 'Primeiro, vamos conhecer o equipamento que entra em quadra com você.', options: [...Object.keys(rackets), other] },
    ...(rackets[answers.brand] ? [{ key: 'line' as const, title: 'Qual é a linha da sua raquete?', hint: `Escolha a família da sua ${answers.brand}.`, options: [...Object.keys(rackets[answers.brand]), other] }] : []),
    { key: 'racket', title: 'Qual é o modelo da sua raquete?', hint: 'Confira o nome no aro. O catálogo inicial não diferencia anos ou gerações; se não encontrar, escolha outra opção.', ...(rackets[answers.brand]?.[answers.line] ? { options: [...rackets[answers.brand][answers.line], 'Outro modelo / não sei'] } : { placeholder: 'Digite o modelo, marca ou “não sei”' }) },
    ...profileQuestions,
  ]
  const [copied, setCopied] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const move = (next: number) => { setStep(next); setCopied(false); requestAnimationFrame(() => heading.current?.focus()) }
  const result = step === questions.length
  const q = questions[step]
  const recommendations = recommend(answers)
  function updateAnswer(key: keyof Answers, value: string) {
    setAnswers(current => ({ ...current, [key]: value, ...(key === 'brand' ? { line: '', racket: '' } : key === 'line' ? { racket: '' } : {}) }))
  }
  const racketSummary = racketLabel(answers.brand, answers.line, answers.racket)
  async function copy() {
    const text = `Meu perfil String EZ\n${`Raquete: ${racketSummary}`}\n${questions.map(item => `${item.title} ${answers[item.key]}`).join('\n')}\n\n${recommendations.map((r, i) => `${i + 1}. ${r.material} · ${r.gauge}\n${r.reason}\nAtenção: ${r.tradeoff}`).join('\n\n')}\nTensão: confirmar a faixa do fabricante com o encordoador.`
    try { await navigator.clipboard.writeText(text); setCopied(true) } catch { setCopied(false); window.alert('Não foi possível copiar. Você pode selecionar o texto da página.') }
  }
  return <div className="shell">
    <header><a className="brand" href="/" aria-label="String EZ, início"><span className="ball">✳</span> string<span>ez</span><small>TENNIS, TUNED TO YOU.</small></a><span className="badge">SEU PRÓXIMO SET COMEÇA AQUI</span></header>
    <main>
      {step === -1 ? <section className="welcome"><div className="intro"><p className="eyebrow">MENOS DÚVIDA. MAIS JOGO.</p><h1 ref={heading} tabIndex={-1}>Seu jogo.<br />Sua corda.<br /><em>Seu próximo nível.</em></h1><p className="lead">Encontre um encordoamento que combine com você. Conte um pouco sobre seu jogo e descubra três caminhos para a próxima partida.</p><button className="primary" onClick={() => move(0)}>Encontrar minhas cordas <span>↗</span></button><p className="micro">Sua raquete + seu perfil · cerca de 3 minutos · sem cadastro</p></div><div className="court" aria-hidden="true"><div className="court-lines"/><div className="tennis-ball"/><span>FIND YOUR<br />SWEET SPOT.</span><small>01 / A ESCOLHA CERTA MUDA O JOGO</small></div><div className="features"><p><b>01 / SEU PERFIL</b>Do primeiro saque ao jogo competitivo.</p><p><b>02 / SEU OBJETIVO</b>Conforto, controle ou mais efeito.</p><p><b>03 / SUAS OPÇÕES</b>Três sugestões, com os prós e contras.</p></div></section> : result ? <section className="results"><p className="eyebrow">SEU PRÓXIMO ENCORDOAMENTO</p><h1 ref={heading} tabIndex={-1}>Três caminhos.<br /><em>Um jogo mais seu.</em></h1><p className="lead">Sugestões por regras para o seu perfil. A escolha final depende da raquete, da técnica e do teste em quadra.</p><details><summary>Conferir minhas respostas</summary><dl>{questions.map(item => <div key={item.key}><dt>{item.title}</dt><dd>{answers[item.key]}</dd></div>)}</dl></details>{answers.pain === 'Sim' && <p className="notice">Dor persistente merece avaliação de um profissional de saúde. Trocar cordas não trata lesões; por isso, priorizamos opções macias.</p>}<div className="cards">{recommendations.map((r, i) => <article key={r.material}><span className="eyebrow">OPÇÃO 0{i + 1}</span><h2>{r.title}</h2><h3>{r.material}</h3><span className="pill">Calibre inicial: {r.gauge}</span><p>{r.reason}</p><p className="tradeoff"><b>O que considerar</b>{r.tradeoff}</p></article>)}</div><div className="notice"><b>E a tensão?</b><p>Leve a faixa indicada na sua raquete ao encordoador. Comece por uma tensão dentro dela, considerando material, calibre e histórico. Como ainda não validamos especificações de modelos, não calculamos um valor personalizado.</p><p>Seu padrão {answers.pattern.toLowerCase()} e o encordoamento anterior ajudam nessa conversa; nesta versão, não alteram as sugestões automaticamente.</p></div><div className="actions"><button className="primary" onClick={copy}>{copied ? 'Resumo copiado ✓' : 'Copiar para o encordoador ↗'}</button><button className="secondary" onClick={() => move(0)}>Rever respostas</button><button className="secondary" onClick={() => { setAnswers(initial); move(-1) }}>Começar de novo</button></div></section> : <section className="quiz"><div className="quiz-top"><span className="eyebrow">SEU PERFIL EM QUADRA</span><span>{step + 1} / {questions.length}</span></div><progress aria-label="Progresso do questionário" value={step + 1} max={questions.length}/><h1 ref={heading} tabIndex={-1}>{q.title}</h1>{(q.key === 'line' || q.key === 'racket') && <p className="racket-path">{racketLabel(answers.brand, answers.line, '')}</p>}<p className="lead" id="question-hint">{q.hint}</p><form onSubmit={event => { event.preventDefault(); if (answers[q.key].trim()) move(step + 1) }}><fieldset aria-describedby="question-hint"><legend className="sr-only">{q.title}</legend>{q.options ? <div className="choices">{q.options.map(option => <label className={answers[q.key] === option ? 'choice selected' : 'choice'} key={option}><input type="radio" name={q.key} value={option} checked={answers[q.key] === option} onChange={() => updateAnswer(q.key, option)}/>{option}<span aria-hidden="true">{answers[q.key] === option ? '●' : '○'}</span></label>)}</div> : <input className="text-input" aria-label={q.title} maxLength={120} placeholder={q.placeholder} value={answers[q.key]} onChange={event => updateAnswer(q.key, event.target.value)}/> }</fieldset><div className="actions"><button type="button" className="secondary" onClick={() => move(step - 1)}>← Voltar</button><button className="primary" disabled={!answers[q.key].trim()} type="submit">{step === questions.length - 1 ? 'Ver recomendações' : 'Continuar'} →</button></div></form><p className="micro">Suas respostas ficam apenas nesta sessão. Nenhum dado é enviado.</p></section>}
    </main><footer><span>STRING EZ © {currentYear}</span><span>Feito para quem ama estar em quadra.</span><span>Recomendações por regras · versão inicial</span></footer>
  </div>
}
export default App
