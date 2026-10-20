type Props = { label: string; selected: string; onSelect: (value: string) => void }
export default function TensionSelector({ label, selected, onSelect }: Props) {
  return <div className="tension-selector">
    <p className="tension-grid-label">TENSÃO ATUAL <span>LB</span></p>
    <div className="tension-grid" role="group" aria-label={label}>
      {Array.from({ length: 31 }, (_, i) => i + 30).map(value => <button
        type="button" key={value} aria-label={`${value} lb`} aria-pressed={selected === `${value} lb`}
        onClick={() => onSelect(`${value} lb`)}>{value}</button>)}
    </div>
    <p className="micro">Toque no número para selecionar e avançar. Valores em libras (lb).</p>
  </div>
}
