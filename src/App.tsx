import { useEffect, useRef, useState } from 'react'
import { factors, recommend, recommendationText, type Answers as RecommendationAnswers } from './recommendations'
import { rackets, getPatterns, racketLabel, getHeadSize } from './rackets'
import RacketBrandLogo from './RacketBrandLogo'
import StringBedDiagram from './StringBedDiagram'
import TensionSelector from './TensionSelector'
import RecommendationCard from './RecommendationCard'
import { stringCatalog, specifyString, findString, resolveStringMaterial, materialLabel } from './stringCatalog'
import { improvementFactors, launchLow, launchHigh, nothingLiked, togglePreference, canSelectPreference } from './preferences'
import ThemePicker from './ThemePicker'
import { themes, readSavedTheme, themeStorageKey } from './themes'
import { sortOptions } from './sortOptions'
import { colorPreference, shapePreference, stringColors, stringShapes } from './stringAppearance'
import './App.css'

type Answers = RecommendationAnswers & {
  brand: string; line: string; layout: string; mains: string; crosses: string
  mainsTension: string; crossesTension: string; liked: string[]; painDetails: string[]
  previousBrand: string; previousModel: string; mainsBrand: string; mainsModel: string; crossesBrand: string; crossesModel: string
}
type Question = { key: keyof Answers; title: string; hint: string; options?: string[] }
const currentYear = new Date().getFullYear()
type StringSlot = 'previous' | 'mains' | 'crosses'
const initial: Answers = { previousBrand: '', previousModel: '', mainsBrand: '', mainsModel: '', crossesBrand: '', crossesModel: '', brand: '', line: '', layout: '', mains: '', crosses: '', mainsTension: '', crossesTension: '', level: '', racket: '', pattern: '', previous: '', tension: '', goals: [], pain: '', painDetails: [], liked: [] }
const levelRanges: Record<string, string> = { Iniciante: 'NTRP 1.0 a 3.0', Intermediário: 'NTRP 3.5 a 4.5', Avançado: 'NTRP 5.0 a 7.0' }
const stringTypes = ['Multifilamento', 'Synthetic gut (nylon)', 'Poliéster', 'Tripa natural', specifyString]
const likesQuestion: Question = {
  key: 'liked', title: 'O que você gosta no encordoamento atual?',
  hint: 'Escolha até três pontos que você gostaria de preservar. Na próxima etapa, você escolhe até dois pontos a melhorar.',
  options: [...factors, colorPreference, shapePreference, nothingLiked],
}

function App() {
  const [theme, setTheme] = useState(readSavedTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themes.find(item => item.id === theme)!.browserColor)
    try { window.localStorage.setItem(themeStorageKey, theme) } catch { /* Tema continua funcionando sem armazenamento local. */ }
  }, [theme])
  const [step, setStep] = useState(-1)
  const [answers, setAnswers] = useState<Answers>(initial)
  const [copied, setCopied] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const patterns = getPatterns(answers.brand, answers.line, answers.racket)
  const resolvedPattern = patterns.length === 1 ? patterns[0] : answers.pattern
  const hybrid = answers.layout === 'Híbrido'
  function stringQuestions(slot: StringSlot): Question[] {
    const directionName = slot === 'mains' ? ' nas verticais' : slot === 'crosses' ? ' nas horizontais' : ''
    const brandKey = `${slot}Brand` as const
    const modelKey = `${slot}Model` as const
    return [
      { key: slot, title: `Que corda você usa${directionName || ' hoje'}?`, hint: 'Escolha o tipo de corda ou toque em “Quero especificar” para informar marca e modelo.', options: stringTypes },
      ...(answers[slot] === specifyString ? [
        { key: brandKey, title: `Qual é a marca da corda${directionName}?`, hint: 'Selecione a marca da corda que você usa atualmente.', options: Object.keys(stringCatalog) },
        { key: modelKey, title: `Qual é o modelo da corda${directionName}?`, hint: `Escolha o modelo da sua corda ${answers[brandKey]}.`, options: (stringCatalog[answers[brandKey]] ?? []).map(entry => entry.model) },
      ] : []),
    ]
  }
  const questions: Question[] = [
    { key: 'brand', title: 'Qual é a marca da sua raquete?', hint: 'Primeiro, vamos conhecer o equipamento que entra em quadra com você.', options: Object.keys(rackets) },
    { key: 'line', title: 'Qual é a linha da sua raquete?', hint: `Escolha a família da sua ${answers.brand}.`, options: Object.keys(rackets[answers.brand] ?? {}) },
    { key: 'racket', title: 'Qual é o modelo da sua raquete?', hint: 'Selecione o modelo indicado no aro da sua raquete.', options: (rackets[answers.brand]?.[answers.line] ?? []).map(model => model.name) },
    ...(patterns.length > 1 ? [{ key: 'pattern' as const, title: 'Qual é o padrão de cordas?', hint: 'Este modelo tem mais de um padrão no catálogo. Confira na sua raquete: verticais × horizontais.', options: patterns }] : []),
    { key: 'level', title: 'Como é o seu jogo hoje?', hint: 'Escolha o nível que mais combina com seu jogo. As faixas NTRP são uma referência aproximada para esta seleção.', options: ['Iniciante', 'Intermediário', 'Avançado'] },
    { key: 'layout', title: 'Como está montado seu encordoamento?', hint: 'Escolha a configuração que você usa hoje. Mains são as cordas verticais; crosses, as horizontais.', options: ['Full bed', 'Híbrido'] },
    ...(hybrid ? [
      ...stringQuestions('mains'),
      ...stringQuestions('crosses'),
      { key: 'mainsTension' as const, title: 'Qual é a tensão das verticais?', hint: 'Selecione a tensão atual das mains. Esse valor é independente da tensão das horizontais.' },
      { key: 'crossesTension' as const, title: 'Qual é a tensão das horizontais?', hint: 'Selecione a tensão atual das crosses. Ela pode ser igual ou diferente da tensão das verticais.' },
    ] : [
      ...stringQuestions('previous'),
      { key: 'tension' as const, title: 'E a tensão atual?', hint: 'Selecione a tensão do seu encordoamento atual, em libras (lb).' },
    ]),
    likesQuestion,
    { key: 'goals', title: 'O que você quer melhorar?', hint: 'Escolha um ou dois pontos para sua próxima partida. Os dois terão o mesmo peso nas sugestões.', options: [...improvementFactors] },
    { key: 'pain', title: 'Você sente algum desconforto físico ao jogar?', hint: 'Considere desconfortos durante ou após o jogo.', options: ['Sim', 'Não'] },
    ...(answers.pain === 'Sim' ? [{ key: 'painDetails' as const, title: 'Qual desconforto você apresenta?', hint: 'Marque um ou mais relatos que se aplicam a você. Esta seleção não confirma um diagnóstico.', options: ['Cotovelo de tenista', 'Cotovelo de golfista', 'Dor no ombro', 'Dor nos punhos'] }] : []),
  ]
  const result = step === questions.length
  const q = questions[step]
  const options = q?.key === 'level' ? q.options ?? [] : [...sortOptions((q?.options ?? []).filter(option => option !== specifyString), materialLabel), ...(q?.options?.includes(specifyString) ? [specifyString] : [])]
  const isTension = q?.key === 'tension' || q?.key === 'mainsTension' || q?.key === 'crossesTension'
  const isGoals = q?.key === 'goals'
  const isLiked = q?.key === 'liked'
  const appearanceComplete = (!answers.liked.includes(colorPreference) || !!answers.preferredColor) && (!answers.liked.includes(shapePreference) || !!answers.preferredShape)
  const isPainDetails = q?.key === 'painDetails'
  const isMulti = q?.key === 'liked' || isGoals || isPainDetails
  const multiLimit = isGoals ? 2 : isLiked ? 3 : Infinity
  const multiSelection = isGoals ? answers.goals : isPainDetails ? answers.painDetails : answers.liked
  const direction = q?.key.startsWith('mains') ? 'mains' : q?.key.startsWith('crosses') ? 'crosses' : null
  const materialFor = (slot: StringSlot) => resolveStringMaterial(answers[slot], answers[`${slot}Brand`], answers[`${slot}Model`])
  const racketSummary = racketLabel(answers.brand, answers.line, answers.racket)
  const recommendations = result ? recommend({ ...answers, previous: materialFor('previous'), mains: materialFor('mains'), crosses: materialFor('crosses'), racket: racketSummary, headSize: getHeadSize(answers.brand, answers.line, answers.racket), pattern: resolvedPattern }) : []
  const answerText = (key: keyof Answers) => {
    if (key === 'liked') return answers.liked.map(value => value === colorPreference ? `${value}: ${answers.preferredColor}` : value === shapePreference ? `${value}: ${answers.preferredShape}` : value).join(', ')
    if (key === 'goals' || key === 'painDetails') return answers[key].join(', ')
    if ((key === 'previous' || key === 'mains' || key === 'crosses') && answers[key] === specifyString) return materialLabel(materialFor(key))
    return typeof answers[key] === 'string' ? materialLabel(answers[key]) : answers[key]
  }
  function move(next: number) {
    setStep(next)
    setCopied(false)
    requestAnimationFrame(() => { heading.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }) })
  }
  function updateAnswer(key: keyof Answers, value: string) {
    setAnswers(current => {
      if (current[key] === value) return current
      const clearDetails: Partial<Answers> = {}
      if (key === 'previous' || key === 'mains' || key === 'crosses') {
        clearDetails[`${key}Brand`] = ''; clearDetails[`${key}Model`] = ''
      }
      if (key === 'previousBrand') clearDetails.previousModel = ''
      if (key === 'mainsBrand') clearDetails.mainsModel = ''
      if (key === 'crossesBrand') clearDetails.crossesModel = ''
      return ({
      ...current, [key]: value, ...clearDetails,
      ...(key === 'brand' ? { line: '', racket: '', pattern: '' }
        : key === 'line' ? { racket: '', pattern: '' }
        : key === 'racket' ? { pattern: '' }
        : key === 'pain' && value === 'Não' ? { painDetails: [] }
        : key === 'layout' ? { previous: '', mains: '', crosses: '', previousBrand: '', previousModel: '', mainsBrand: '', mainsModel: '', crossesBrand: '', crossesModel: '', tension: '', mainsTension: '', crossesTension: '' } : {}),
    })
    })
  }
  function choose(value: string) { updateAnswer(q.key, value); move(step + 1) }
  function toggleMulti(value: string) {
    const key = isGoals ? 'goals' : isPainDetails ? 'painDetails' : 'liked'
    setAnswers(current => {
      const selection = togglePreference(current[key], value, multiLimit)
      return { ...current, [key]: selection, ...(key === 'liked' ? { preferredColor: selection.includes(colorPreference) ? current.preferredColor : undefined, preferredShape: selection.includes(shapePreference) ? current.preferredShape : undefined } : {}) }
    })
  }
  async function copy() {
    const text = `Meu perfil String EZ\nRaquete: ${racketSummary} · ${resolvedPattern}\n${questions.map(item => `${item.title} ${answerText(item.key)}`).join('\n')}\n\n${recommendations.map((r, i) => `${i + 1}. ${recommendationText(r)}`).join('\n\n')}\n\nSugestões por regras, não validação da faixa de tensão do fabricante.`
    try { await navigator.clipboard.writeText(text); setCopied(true) }
    catch { setCopied(false); window.alert('Não foi possível copiar. Você pode selecionar o texto da página.') }
  }
  return <div className="shell">
    <header><a className="brand" href="/" aria-label="String EZ, início"><svg className="ball" viewBox="0 0 36 36" aria-hidden="true" focusable="false"><circle cx="18" cy="18" r="17" fill="var(--primary)" /><g transform="rotate(-25 18 18)" fill="none" stroke="var(--ball-seam)" strokeWidth="2"><path d="M4 8C17 10 17 26 4 28" /><path d="M32 8C19 10 19 26 32 28" /></g></svg> string<span>ez</span><small>your strings tuned to your game.</small></a><span className="creator-credit">Vibecoded by João Boccoli</span></header>
    <main>
      {step === -1 ? <section className="welcome">
        <div className="intro"><h1 ref={heading} tabIndex={-1}>Menos dúvida.<br /><em>Mais jogo.</em></h1><p className="lead">Conte como você joga, o que gosta nas suas cordas e o que quer melhorar. Em instantes, vamos te recomendar 3 configurações de encordoamento.</p><ThemePicker selected={theme} onSelect={setTheme} /><button className="primary" onClick={() => move(0)}>Encontrar minhas cordas <span>↗</span></button></div>
      </section> : result ? <section className="results">
        <p className="eyebrow">SEU PRÓXIMO ENCORDOAMENTO</p><h1 ref={heading} tabIndex={-1}>Três caminhos.<br /><em>Um jogo mais seu.</em></h1>
        <p className="lead">Configurações para discutir com seu encordoador e testar em quadra, escolhidas por regras a partir do seu perfil.</p>
        <p className="racket-reference">Referência: <b>{racketSummary}</b> · {resolvedPattern}{getHeadSize(answers.brand, answers.line, answers.racket) ? ` · ${getHeadSize(answers.brand, answers.line, answers.racket)} pol²` : ''}</p>
        <div className="profile-priorities"><p><b>Preservar</b> {answerText('liked')}</p><p><b>Melhorar</b> {answers.goals.join(' · ')}</p></div>
        <details><summary>Conferir minhas respostas</summary><dl><div><dt>Padrão de cordas</dt><dd>{resolvedPattern}</dd></div>{questions.filter(item => item.key !== 'pattern').map(item => <div key={item.key}><dt>{item.title}</dt><dd>{answerText(item.key)}</dd></div>)}</dl></details>
        {answers.pain === 'Sim' && <p className="notice"><b>Desconfortos informados: {answers.painDetails.join(' · ')}.</b> Dor persistente merece avaliação de um profissional de saúde. Trocar cordas não trata lesões. As opções podem incluir poliéster em tensão reduzida; isso não garante conforto nem ausência de dor.</p>}
        <p className="notice"><b>Antes de encordoar:</b> as tensões abaixo são pontos de teste, não uma faixa validada para sua raquete. Confirme cada valor com o encordoador e com a indicação do fabricante. Os modelos de corda fazem parte de um catálogo inicial; preço e disponibilidade não são consultados em tempo real.</p>
        <div className="cards">{recommendations.map((r, i) => <RecommendationCard key={r.id} recommendation={r} index={i} />)}</div>
        {recommendations.length !== 3 && <p role="alert">Não foi possível gerar as três opções. Revise as tensões do encordoamento atual.</p>}
        <div className="notice"><b>Como comparar na quadra</b><p>Registre a configuração escolhida e observe conforto, profundidade, controle e desgaste. Ao experimentar, prefira uma mudança por vez quando possível. Uma sugestão híbrida é uma alternativa para testar, não uma garantia de melhora.</p></div>
        <div className="actions"><button className="primary" onClick={copy}>{copied ? 'Resumo copiado ✓' : 'Copiar para o encordoador ↗'}</button><button className="secondary" onClick={() => move(0)}>Rever respostas</button><button className="secondary" onClick={() => { setAnswers(initial); move(-1) }}>Começar de novo</button></div>
      </section> : <section className="quiz">
        <div className="quiz-top"><span className="eyebrow">SEU PERFIL EM QUADRA</span><span>{step + 1} / {questions.length}</span></div>
        <progress aria-label="Progresso do questionário" value={step + 1} max={questions.length} />
        <h1 ref={heading} tabIndex={-1}>{direction && <span className={`direction-heading ${direction}`}><span aria-hidden="true">{direction === 'mains' ? '↕' : '↔'}</span> {direction === 'mains' ? 'MAINS · VERTICAIS' : 'CROSSES · HORIZONTAIS'}</span>}{q.title}</h1>
        {q.key.endsWith('Model') && <p className="racket-path">{answers[q.key.replace('Model', 'Brand') as keyof Answers]}</p>}
        {(q.key === 'line' || q.key === 'racket') && <p className="racket-path">{racketLabel(answers.brand, answers.line, '')}</p>}
        <p className="lead" id="question-hint">{q.hint}{q.options && <span className="micro option-hint">{isMulti ? isGoals ? 'Selecione até duas opções e confirme em Continuar.' : isPainDetails ? 'Você pode marcar mais de uma opção. Confirme em Continuar.' : 'Selecione até três fatores e confirme em Continuar.' : 'Toque em uma opção para avançar.'}</span>}</p>
        {isMulti && !isPainDetails && <p className="launch-angle-help">Ângulo de saída (launch angle) é a inclinação inicial da bola ao sair das cordas. Alto e baixo são alternativas: escolher um substitui o outro. A trajetória também depende da técnica, do material e da raquete.</p>}
        {(isGoals || isLiked) && <p className="selection-count" role="status">{multiSelection.length} de {multiLimit} {isGoals ? 'objetivos' : 'pontos a preservar'} selecionados</p>}
        <form onSubmit={event => { event.preventDefault(); if (isMulti && multiSelection.length && (multiSelection.length <= multiLimit) && (!isLiked || appearanceComplete)) move(step + 1) }}>
          <fieldset aria-describedby="question-hint"><legend className="sr-only">{q.title}</legend>
            {isTension ? <TensionSelector key={q.key} label={q.title} selected={String(answers[q.key])} onSelect={choose} />
              : isMulti ? <div className="choices liked-choices">{options.map(option => <label className={multiSelection.includes(option) ? 'choice selected' : 'choice'} key={option}><input type="checkbox" aria-label={option} checked={multiSelection.includes(option)} disabled={!canSelectPreference(multiSelection, option, multiLimit)} onChange={() => toggleMulti(option)} /><span>{option}{(option === launchLow || option === launchHigh) && <small className="angle-option-hint">{option === launchLow ? 'Trajetória inicial mais baixa ao deixar as cordas.' : 'Trajetória inicial mais alta ao deixar as cordas.'}</small>}</span></label>)}</div>
                : <div className={q.key === 'layout' ? 'choices layout-choices' : q.key.endsWith('Brand') ? 'choices string-brand-choices' : 'choices'}>{options.map(option => <button type="button" className={`choice${answers[q.key] === option ? ' selected' : ''}${option === specifyString ? ' specify-string-choice' : ''}`} key={option} aria-pressed={answers[q.key] === option} onClick={() => choose(option)}>
                  {q.key === 'brand' ? <RacketBrandLogo brand={option} /> : q.key === 'layout' ? <><StringBedDiagram hybrid={option === 'Híbrido'} /><span className="layout-copy"><strong>{option}</strong><span>{option === 'Full bed' ? 'A mesma corda nas mains (verticais) e nas crosses (horizontais).' : 'Uma corda nas mains (verticais) e outra nas crosses (horizontais).'}</span><span className="string-color-legend"><span><i className="string-swatch mains-swatch" aria-hidden="true" />{option === 'Full bed' ? '↕ ↔ Mesma corda' : '↕ Verticais · corda A'}</span>{option === 'Híbrido' && <span><i className="string-swatch crosses-swatch" aria-hidden="true" />↔ Horizontais · corda B</span>}</span></span></> : q.key === 'level' ? <span className="string-model-option">{option}<small>{levelRanges[option]}</small></span> : q.key.endsWith('Model') ? <span className="string-model-option">{option}<small aria-hidden="true">{materialLabel(findString(String(answers[q.key.replace('Model', 'Brand') as keyof Answers]), option)?.material ?? '')}</small></span> : materialLabel(option)}<span aria-hidden="true">→</span>
                </button>)}</div>}
            {q.key === 'layout' && <p className="micro">Cores apenas ilustrativas: um híbrido pode ter cordas da mesma cor.</p>}
          </fieldset>
          {isLiked && answers.liked.includes(colorPreference) && <fieldset className="appearance-picker"><legend>Qual cor base você quer manter?</legend><p className="micro">No híbrido, vamos priorizar essa cor nas verticais. A disponibilidade pode variar por calibre e loja.</p><div className="color-options">{sortOptions(Object.keys(stringColors)).map(color => <button type="button" key={color} aria-pressed={answers.preferredColor === color} onClick={() => setAnswers(current => ({ ...current, preferredColor: color }))}><i aria-hidden="true" style={{ background: stringColors[color as keyof typeof stringColors] }} />{color}</button>)}</div></fieldset>}
          {isLiked && answers.liked.includes(shapePreference) && <fieldset className="appearance-picker"><legend>Qual formato você quer manter?</legend><p className="micro">Escolha a seção da corda, não o padrão da raquete. No híbrido, priorizamos as verticais.</p><div className="color-options">{sortOptions(stringShapes).map(shape => <button type="button" key={shape} aria-pressed={answers.preferredShape === shape} onClick={() => setAnswers(current => ({ ...current, preferredShape: shape }))}>{shape}</button>)}</div></fieldset>}
          <div className="actions"><button type="button" className="secondary" onClick={() => move(step - 1)}>← Voltar</button>{isMulti && <button className="primary" disabled={!multiSelection.length || (isLiked && !appearanceComplete)} type="submit">Continuar →</button>}</div>
        </form>
        <p className="micro">Suas respostas ficam apenas nesta sessão. Nenhum dado é enviado.</p>
      </section>}
    </main>
    <footer><span>STRING EZ © {currentYear}</span><span>Recomendações por regras · versão inicial</span></footer>
  </div>
}
export default App
