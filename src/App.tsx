import { useRef, useState } from 'react'
import { factors, recommend, recommendationText, type Answers as RecommendationAnswers } from './recommendations'
import { rackets, getPatterns, racketLabel } from './rackets'
import StringBedDiagram from './StringBedDiagram'
import TensionSelector from './TensionSelector'
import RecommendationCard from './RecommendationCard'
import './App.css'

type Answers = RecommendationAnswers & {
  brand: string; line: string; layout: string; mains: string; crosses: string
  mainsTension: string; crossesTension: string; liked: string[]
}
type Question = { key: keyof Answers; title: string; hint: string; options?: string[] }
const currentYear = new Date().getFullYear()
const initial: Answers = { brand: '', line: '', layout: '', mains: '', crosses: '', mainsTension: '', crossesTension: '', level: '', racket: '', pattern: '', previous: '', tension: '', goal: '', pain: '', liked: [] }
const stringTypes = ['Multifilamento', 'Synthetic gut (nylon)', 'Poliéster', 'Tripa natural']
const nothingLiked = 'Nada em especial'
const likesQuestion: Question = {
  key: 'liked', title: 'O que você gosta no encordoamento atual?',
  hint: 'Marque tudo o que gostaria de preservar. Na próxima etapa, você escolhe o principal ponto a melhorar.',
  options: [...factors, nothingLiked],
}

function App() {
  const [step, setStep] = useState(-1)
  const [answers, setAnswers] = useState<Answers>(initial)
  const [copied, setCopied] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const patterns = getPatterns(answers.brand, answers.line, answers.racket)
  const resolvedPattern = patterns.length === 1 ? patterns[0] : answers.pattern
  const hybrid = answers.layout === 'Híbrido'
  const questions: Question[] = [
    { key: 'brand', title: 'Qual é a marca da sua raquete?', hint: 'Primeiro, vamos conhecer o equipamento que entra em quadra com você.', options: Object.keys(rackets) },
    { key: 'line', title: 'Qual é a linha da sua raquete?', hint: `Escolha a família da sua ${answers.brand}.`, options: Object.keys(rackets[answers.brand] ?? {}) },
    { key: 'racket', title: 'Qual é o modelo da sua raquete?', hint: 'Selecione o modelo indicado no aro da sua raquete.', options: (rackets[answers.brand]?.[answers.line] ?? []).map(model => model.name) },
    ...(patterns.length > 1 ? [{ key: 'pattern' as const, title: 'Qual é o padrão de cordas?', hint: 'Este modelo tem mais de um padrão no catálogo. Confira na sua raquete: verticais × horizontais.', options: patterns }] : []),
    { key: 'level', title: 'Como é o seu jogo hoje?', hint: 'Vamos encontrar um ponto de partida para o seu momento.', options: ['Iniciante', 'Intermediário', 'Avançado'] },
    { key: 'layout', title: 'Como está montado seu encordoamento?', hint: 'Escolha a configuração que você usa hoje. Mains são as cordas verticais; crosses, as horizontais.', options: ['Full bed', 'Híbrido'] },
    ...(hybrid ? [
      { key: 'mains' as const, title: 'Que corda você usa nas verticais?', hint: 'Selecione o tipo de corda das verticais.', options: stringTypes },
      { key: 'crosses' as const, title: 'Que corda você usa nas horizontais?', hint: 'Selecione o tipo de corda das horizontais. Cordas diferentes podem pertencer à mesma categoria.', options: stringTypes },
      { key: 'mainsTension' as const, title: 'Qual é a tensão das verticais?', hint: 'Selecione a tensão atual das mains. Esse valor é independente da tensão das horizontais.' },
      { key: 'crossesTension' as const, title: 'Qual é a tensão das horizontais?', hint: 'Selecione a tensão atual das crosses. Ela pode ser igual ou diferente da tensão das verticais.' },
    ] : [
      { key: 'previous' as const, title: 'Que corda você usa hoje?', hint: 'No full bed, a mesma corda é usada nas verticais e nas horizontais.', options: stringTypes },
      { key: 'tension' as const, title: 'E a tensão atual?', hint: 'Selecione a tensão do seu encordoamento atual, em libras (lb).' },
    ]),
    likesQuestion,
    { key: 'goal', title: 'O que você quer melhorar?', hint: 'Escolha o que faria mais diferença na sua próxima partida. Vamos cruzar esse objetivo com o que você quer preservar.', options: ['Conforto', 'Controle', 'Potência', 'Efeito (spin)', 'Durabilidade'] },
    { key: 'pain', title: 'Sente desconforto no braço?', hint: 'Isso muda nossa prioridade na escolha das cordas.', options: ['Sim', 'Não'] },
  ]
  const result = step === questions.length
  const q = questions[step]
  const isTension = q?.key === 'tension' || q?.key === 'mainsTension' || q?.key === 'crossesTension'
  const isMulti = q?.key === 'liked'
  const direction = q?.key === 'mains' || q?.key === 'mainsTension' ? 'mains' : q?.key === 'crosses' || q?.key === 'crossesTension' ? 'crosses' : null
  const recommendations = result ? recommend({ ...answers, pattern: resolvedPattern }) : []
  const racketSummary = racketLabel(answers.brand, answers.line, answers.racket)
  const answerText = (key: keyof Answers) => key === 'liked' ? answers.liked.join(', ') : answers[key]
  function move(next: number) {
    setStep(next)
    setCopied(false)
    requestAnimationFrame(() => { heading.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }) })
  }
  function updateAnswer(key: keyof Answers, value: string) {
    setAnswers(current => current[key] === value ? current : ({
      ...current, [key]: value,
      ...(key === 'brand' ? { line: '', racket: '', pattern: '' }
        : key === 'line' ? { racket: '', pattern: '' }
        : key === 'racket' ? { pattern: '' }
        : key === 'layout' ? { previous: '', mains: '', crosses: '', tension: '', mainsTension: '', crossesTension: '' } : {}),
    }))
  }
  function choose(value: string) { updateAnswer(q.key, value); move(step + 1) }
  function toggleLike(value: string) {
    setAnswers(current => ({ ...current, liked: current.liked.includes(value)
      ? current.liked.filter(item => item !== value)
      : value === nothingLiked ? [nothingLiked] : [...current.liked.filter(item => item !== nothingLiked), value] }))
  }
  async function copy() {
    const text = `Meu perfil String EZ\nRaquete: ${racketSummary} · ${resolvedPattern}\n${questions.map(item => `${item.title} ${answerText(item.key)}`).join('\n')}\n\n${recommendations.map((r, i) => `${i + 1}. ${recommendationText(r)}`).join('\n\n')}\n\nSugestões por regras, não validação da faixa de tensão do fabricante.`
    try { await navigator.clipboard.writeText(text); setCopied(true) }
    catch { setCopied(false); window.alert('Não foi possível copiar. Você pode selecionar o texto da página.') }
  }
  return <div className="shell">
    <header><a className="brand" href="/" aria-label="String EZ, início"><svg className="ball" viewBox="0 0 36 36" aria-hidden="true" focusable="false"><circle cx="18" cy="18" r="17" fill="#d4ee74" /><g transform="rotate(-25 18 18)" fill="none" stroke="#fffef0" strokeWidth="2"><path d="M4 8C17 10 17 26 4 28" /><path d="M32 8C19 10 19 26 32 28" /></g></svg> string<span>ez</span><small>your strings tuned to your game.</small></a><span className="badge">SEU PRÓXIMO SET COMEÇA AQUI</span></header>
    <main>
      {step === -1 ? <section className="welcome">
        <div className="intro"><p className="eyebrow">MENOS DÚVIDA. MAIS JOGO.</p><h1 ref={heading} tabIndex={-1}>Seu jogo.<br />Sua corda.<br /><em>Seu próximo nível.</em></h1><p className="lead">Conte como você joga, o que gosta nas suas cordas e o que quer melhorar. Descubra três configurações com cordas, tensões e motivos para experimentar.</p><button className="primary" onClick={() => move(0)}>Encontrar minhas cordas <span>↗</span></button><p className="micro">Sua raquete + seu perfil · cerca de 3 minutos · sem cadastro</p></div>
        <div className="features"><p><b>01 / SEU PERFIL</b>Seu equipamento e seu momento em quadra.</p><p><b>02 / SUAS PRIORIDADES</b>O que preservar e o que melhorar.</p><p><b>03 / SUAS CONFIGURAÇÕES</b>Cordas, tensões e combinações para testar.</p></div>
      </section> : result ? <section className="results">
        <p className="eyebrow">SEU PRÓXIMO ENCORDOAMENTO</p><h1 ref={heading} tabIndex={-1}>Três caminhos.<br /><em>Um jogo mais seu.</em></h1>
        <p className="lead">Configurações para discutir com seu encordoador e testar em quadra, escolhidas por regras a partir do seu perfil.</p>
        <div className="profile-priorities"><p><b>Preservar</b> {answers.liked.join(' · ')}</p><p><b>Melhorar</b> {answers.goal}</p></div>
        <details><summary>Conferir minhas respostas</summary><dl><div><dt>Padrão de cordas</dt><dd>{resolvedPattern}</dd></div>{questions.filter(item => item.key !== 'pattern').map(item => <div key={item.key}><dt>{item.title}</dt><dd>{answerText(item.key)}</dd></div>)}</dl></details>
        {answers.pain === 'Sim' && <p className="notice">Dor persistente merece avaliação de um profissional de saúde. Trocar cordas não trata lesões; por isso, as opções abaixo não contêm poliéster.</p>}
        <p className="notice"><b>Antes de encordoar:</b> as tensões abaixo são pontos de teste, não uma faixa validada para sua raquete. Confirme cada valor com o encordoador e com a indicação do fabricante. Os modelos de corda fazem parte de um catálogo inicial; preço e disponibilidade não são consultados em tempo real.</p>
        <div className="cards">{recommendations.map((r, i) => <RecommendationCard key={r.id} recommendation={r} index={i} />)}</div>
        {recommendations.length !== 3 && <p role="alert">Não foi possível gerar as três opções. Revise as tensões do encordoamento atual.</p>}
        <div className="notice"><b>Como comparar na quadra</b><p>Registre a configuração escolhida e observe conforto, profundidade, controle e desgaste. Ao experimentar, prefira uma mudança por vez quando possível. Uma sugestão híbrida é uma alternativa para testar, não uma garantia de melhora.</p></div>
        <div className="actions"><button className="primary" onClick={copy}>{copied ? 'Resumo copiado ✓' : 'Copiar para o encordoador ↗'}</button><button className="secondary" onClick={() => move(0)}>Rever respostas</button><button className="secondary" onClick={() => { setAnswers(initial); move(-1) }}>Começar de novo</button></div>
      </section> : <section className="quiz">
        <div className="quiz-top"><span className="eyebrow">SEU PERFIL EM QUADRA</span><span>{step + 1} / {questions.length}</span></div>
        <progress aria-label="Progresso do questionário" value={step + 1} max={questions.length} />
        <h1 ref={heading} tabIndex={-1}>{direction && <span className={`direction-heading ${direction}`}><span aria-hidden="true">{direction === 'mains' ? '↕' : '↔'}</span> {direction === 'mains' ? 'MAINS · VERTICAIS' : 'CROSSES · HORIZONTAIS'}</span>}{q.title}</h1>
        {(q.key === 'line' || q.key === 'racket') && <p className="racket-path">{racketLabel(answers.brand, answers.line, '')}</p>}
        <p className="lead" id="question-hint">{q.hint}{q.options && <span className="micro option-hint">{isMulti ? 'Selecione um ou mais fatores e confirme em Continuar.' : 'Toque em uma opção para avançar.'}</span>}</p>
        <form onSubmit={event => { event.preventDefault(); if (isMulti && answers.liked.length) move(step + 1) }}>
          <fieldset aria-describedby="question-hint"><legend className="sr-only">{q.title}</legend>
            {isTension ? <TensionSelector label={q.title} selected={String(answers[q.key])} onSelect={choose} />
              : isMulti ? <div className="choices liked-choices">{q.options?.map(option => <label className={answers.liked.includes(option) ? 'choice selected' : 'choice'} key={option}><input type="checkbox" checked={answers.liked.includes(option)} onChange={() => toggleLike(option)} /><span>{option}</span></label>)}</div>
                : <div className={q.key === 'layout' ? 'choices layout-choices' : 'choices'}>{q.options?.map(option => <button type="button" className={answers[q.key] === option ? 'choice selected' : 'choice'} key={option} aria-pressed={answers[q.key] === option} onClick={() => choose(option)}>
                  {q.key === 'layout' ? <><StringBedDiagram hybrid={option === 'Híbrido'} /><span className="layout-copy"><strong>{option}</strong><span>{option === 'Full bed' ? 'A mesma corda nas mains (verticais) e nas crosses (horizontais).' : 'Uma corda nas mains (verticais) e outra nas crosses (horizontais).'}</span><small>{option === 'Full bed' ? 'Uma única corda em toda a raquete.' : 'Duas cordas, combinadas no mesmo encordoamento.'}</small></span></> : option}<span aria-hidden="true">→</span>
                </button>)}</div>}
            {q.key === 'layout' && <p className="micro">Cores apenas ilustrativas: um híbrido pode ter cordas da mesma cor.</p>}
          </fieldset>
          <div className="actions"><button type="button" className="secondary" onClick={() => move(step - 1)}>← Voltar</button>{isMulti && <button className="primary" disabled={!answers.liked.length} type="submit">Continuar →</button>}</div>
        </form>
        <p className="micro">Suas respostas ficam apenas nesta sessão. Nenhum dado é enviado.</p>
      </section>}
    </main>
    <footer><span>STRING EZ © {currentYear}</span><span>Feito para quem ama estar em quadra.</span><span>Recomendações por regras · versão inicial</span></footer>
  </div>
}
export default App
