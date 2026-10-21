import { useEffect, useRef, type CSSProperties } from 'react'
import { themes, type ThemeId } from './themes'
import './themes.css'

export default function ThemePicker({ selected, onSelect }: { selected: ThemeId; onSelect: (theme: ThemeId) => void }) {
  const optionsRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = optionsRef.current
    const active = container?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')
    if (!container || !active || container.scrollWidth <= container.clientWidth) return
    const offset = active.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft
    container.scrollLeft = Math.max(0, offset - (container.clientWidth - active.clientWidth) / 2)
  }, [selected])
  return <section className="theme-picker" aria-labelledby="theme-picker-title">
    <div className="theme-picker-heading"><div><span id="theme-picker-title">Escolha o tema do app de acordo com os outfits históricos!</span><em className="theme-picker-explanation">O tenista escolhido não afeta sua recomendação.</em></div><span className="theme-picker-hint outfit-mobile-hint">Deslize para ver os {themes.length} →</span></div>
    <div ref={optionsRef} className="theme-options" role="group" aria-label="Tema inspirado no outfit do tenista">
      {themes.map(theme => <button type="button" className="theme-option" key={theme.id}
        aria-label={`Tema ${theme.name}`} aria-pressed={selected === theme.id} title={`${theme.fullName} · ${theme.outfit}`}
        style={{ '--outfit-one': theme.colors[0], '--outfit-two': theme.colors[1], '--outfit-three': theme.colors[2], '--portrait-position': theme.position } as CSSProperties}
        onClick={() => onSelect(theme.id)}>
        <span data-player={theme.id} className="theme-portrait" aria-hidden="true" />
        <span className="theme-option-name">{theme.name}</span>
        <span className="theme-swatches" aria-hidden="true"><i /><i /><i /></span>
        <span className="theme-check" aria-hidden="true">{selected === theme.id ? '✓' : ''}</span>
      </button>)}
    </div>
  </section>
}
