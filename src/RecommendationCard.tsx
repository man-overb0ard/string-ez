import StringBedDiagram from './StringBedDiagram'
import { stringName, type Recommendation } from './recommendations'
export default function RecommendationCard({ recommendation: r, index }: { recommendation: Recommendation; index: number }) {
  return <article className="recommendation-card">
    <div className="recommendation-top"><span className="eyebrow">OPÇÃO 0{index + 1}</span><span className="pill">{r.layout}</span></div>
    <h2>{r.title}</h2>{r.isValueOption && <span className="value-badge">Custo-benefício</span>}<p className="layout-change">{r.layoutChange}</p>
    <div className="recommended-setup"><StringBedDiagram hybrid={r.layout === 'Híbrido'} /><div>
      <section className="string-prescription"><span className="eyebrow">{r.layout === 'Híbrido' ? 'MAINS · VERTICAIS' : 'TODA A RAQUETE'}</span><h3>{stringName(r.mains)}</h3><p>{r.mains.material} · {r.mains.gauge}</p><strong className="recommended-tension">{r.tensions.mains} <small>lb</small></strong></section>
      {r.layout === 'Híbrido' && <section className="string-prescription crosses"><span className="eyebrow">CROSSES · HORIZONTAIS</span><h3>{stringName(r.crosses)}</h3><p>{r.crosses.material} · {r.crosses.gauge}</p><strong className="recommended-tension">{r.tensions.crosses} <small>lb</small></strong></section>}
    </div></div>
    {r.frequencyNote && <p className="frequency-note">{r.frequencyNote}</p>}
    <p className="recommendation-reason">{r.reason}</p><p className="preservation">{r.preservation}</p>
    {r.appearanceNote && <p className="appearance-note"><b>Cor e formato</b><br />{r.appearanceNote}</p>}
    <div className="cost-comparison"><b>Comparando o custo</b><p>{r.costComparison}</p><details><summary>Como comparar os valores</summary><p>{r.costNote}</p></details></div>
    <details className="tension-explanation"><summary>Entender o ajuste de tensão</summary><p><b>{r.tensionComparison}</b></p><p>{r.tensions.explanation}</p></details>
    <p className="tradeoff"><b>O que considerar</b>{r.tradeoff}</p><p className="recommendation-caution">{r.caution}</p>
  </article>
}
