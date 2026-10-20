import { useState } from 'react'
import { MIN_TENSION, MAX_TENSION } from './tensionRange'
type Props = { label: string; selected: string; onSelect: (value: string) => void }
export default function TensionSelector({ label, selected, onSelect }: Props) {
  const [digits, setDigits] = useState(() => selected.replace(/\D/g, '').slice(0, 2))
  const valid = /^\d{2}$/.test(digits) && Number(digits) >= MIN_TENSION && Number(digits) <= MAX_TENSION
  const invalid = digits.length === 2 && !valid
  const confirm = () => { if (valid) onSelect(`${Number(digits)} lb`) }
  return <div className="tension-selector">
    <label className="tension-input-label" htmlFor="tension-input">TENSÃO ATUAL</label>
    <div className="tension-display">
      <input id="tension-input" type="text" inputMode="numeric" autoComplete="off" maxLength={2}
        aria-label={label} aria-describedby="tension-help" aria-invalid={invalid}
        placeholder="––" value={digits}
        onChange={event => setDigits(event.target.value.replace(/\D/g, '').slice(0, 2))}
        onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); confirm() } }} />
      <span>lb</span>
    </div>
    <p id="tension-help" className={`micro tension-help${invalid ? ' tension-invalid' : ''}`} aria-live="polite">
      {invalid ? `Escolha uma tensão entre ${MIN_TENSION} e ${MAX_TENSION} lb.` : `Digite sua tensão de ${MIN_TENSION} a ${MAX_TENSION} lb e confirme.`}
    </p>
    <div className="tension-keypad" role="group" aria-label="Teclado de tensão">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => <button type="button" key={digit} disabled={digits.length === 2} onClick={() => setDigits(current => `${current}${digit}`)}>{digit}</button>)}
      <button type="button" className="tension-erase" aria-label="Apagar último dígito" disabled={!digits.length} onClick={() => setDigits(current => current.slice(0, -1))}>⌫</button>
      <button type="button" disabled={digits.length === 2} onClick={() => setDigits(current => `${current}0`)}>0</button>
      <button type="button" className="tension-confirm" aria-label="Confirmar tensão" disabled={!valid} onClick={confirm}>✓</button>
    </div>
  </div>
}
