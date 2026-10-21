import { useId } from 'react'
import { shotStyleProfile } from './shotStyle'

export default function ShotStyleOption({ label }: { label: string }) {
  const style = shotStyleProfile(label)!
  const id = useId()
  const flat = label === 'Mais reta'
  const topspin = label === 'Com arco e topspin'
  const path = flat ? 'M24 112 Q146 56 276 128' : topspin ? 'M24 112 C88 42 210 44 276 128' : 'M24 112 C64 -12 212 -18 276 128'
  const [ballX, ballY] = flat ? [224.32, 104.32] : topspin ? [230.59, 87.36] : [229.06, 58.37]
  return <>
    <svg className="shot-diagram" viewBox="0 0 300 154" aria-hidden="true" focusable="false">
      <defs><pattern id={id} width="4" height="5" patternUnits="userSpaceOnUse"><path d="M0 0H4M0 0V5" fill="none" stroke="var(--frame)" strokeWidth="0.7" /></pattern></defs>
      <rect x="14" y="129" width="272" height="10" rx="5" fill="var(--soft)" />
      <path d="M18 128H284M24 124V132M276 124V132" stroke="var(--frame)" fill="none" strokeWidth="1.5" />
      <rect x="146" y="100" width="8" height="28" fill={`url(#${id})`} />
      <path d="M145 100H155M150 99V130" stroke="var(--frame)" strokeWidth="2" />
      <text x="150" y="150" textAnchor="middle" fontSize="10" fill="var(--muted)">rede</text>
      <path className="shot-flight-path" d={path} fill="none" stroke="var(--accent)" strokeWidth="3.5" strokeDasharray="1 8" strokeLinecap="round" />
      <circle cx="24" cy="112" r="3" fill="var(--accent)" />
      <ellipse cx="276" cy="128" rx="6" ry="2.5" fill="var(--accent)" opacity="0.4" />
      <g transform={`translate(${ballX} ${ballY})`}>
        <circle r="7" fill="var(--primary)" stroke="var(--accent)" strokeWidth="1.5" />
        <path d="M-4 -5Q2 0 -4 5M4 -5Q-2 0 4 5" stroke="var(--on-primary)" strokeWidth="1" fill="none" />
        {topspin && <path d="M12 10A16 16 0 1 0-16-2M-19-8L-16-2L-10-6" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
      </g>
    </svg>
    <span className="shot-option-copy"><strong>{label}</strong><span>{style.description}</span></span>
  </>
}
