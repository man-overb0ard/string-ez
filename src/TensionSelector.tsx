import { formatTension, type TensionUnit } from './tension'
type Props = {
  label?: string
  lbs: number
  unit: TensionUnit
  onChange: (lbs: number) => void
  onUnitChange: (unit: TensionUnit) => void
}
export default function TensionSelector({ lbs, unit, onChange, onUnitChange, label = 'Tensão atual' }: Props) {
  return <div className="tension-selector">
    <div className="tension-units" role="group" aria-label="Unidade de tensão">
      <button type="button" aria-pressed={unit === 'lb'} onClick={() => onUnitChange('lb')}>lb · Libras</button>
      <button type="button" aria-pressed={unit === 'kg'} onClick={() => onUnitChange('kg')}>kg · Quilos</button>
    </div>
    <label htmlFor="tension-range" className="tension-value">{formatTension(lbs, unit)}</label>
    <p className="tension-equivalent">≈ {formatTension(lbs, unit === 'lb' ? 'kg' : 'lb')}</p>
    <input id="tension-range" type="range" min="30" max="60" step="0.5" value={lbs}
      aria-label={label} aria-valuetext={formatTension(lbs, unit)}
      onChange={event => onChange(Number(event.target.value))} />
    <div className="tension-limits"><span>{formatTension(30, unit)}</span><span>{formatTension(60, unit)}</span></div>
    <p className="micro">Arraste para ajustar e confirme em Continuar. A faixa do seletor não substitui a indicação de tensão da sua raquete.</p>
  </div>
}
