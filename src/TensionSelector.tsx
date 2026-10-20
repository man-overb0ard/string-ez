import { useEffect, useRef } from 'react'
import { TENSION_DECADES } from './tensionRange'
type Props = { label: string; selected: string; onSelect: (value: string) => void }
export default function TensionSelector({ label, selected, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const button = container.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
    if (!button) { container.scrollLeft = 0; return }
    const left = button.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft
    container.scrollLeft = Math.max(0, left - (container.clientWidth - button.clientWidth) / 2)
  }, [selected, label])
  return <div className="tension-selector">
    <p className="tension-grid-label">TENSÃO ATUAL <span>LB</span></p>
    <p className="tension-scroll-hint micro">Cada linha tem uma faixa de dez valores. Deslize para o lado para ver todos.</p>
    <div ref={scrollRef} className="tension-scroll" role="group" aria-label={label} tabIndex={0}>
      <div className="tension-decades">
        {TENSION_DECADES.map(start => <div className="tension-grid" role="group" aria-label={`${start} a ${start + 9} lb`} key={start}>
          {Array.from({ length: 10 }, (_, i) => i + start).map(value => <button
            type="button" key={value} aria-label={`${value} lb`} aria-pressed={selected === `${value} lb`}
            onClick={() => onSelect(`${value} lb`)}>{value}</button>)}
        </div>)}
      </div>
    </div>
    <p className="micro">Toque no número para selecionar e avançar. Valores em libras (lb).</p>
  </div>
}
