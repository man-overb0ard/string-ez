import { useId } from 'react'

export default function StringBedDiagram({ hybrid }: { hybrid: boolean }) {
  const clipId = useId()
  const mainsColor = '#1463ce'
  const crossesColor = hybrid ? '#d95408' : mainsColor
  return <svg className="string-bed-diagram" viewBox="0 0 160 170" aria-hidden="true" focusable="false">
    <defs><clipPath id={clipId}><ellipse cx="80" cy="75" rx="53" ry="64" /></clipPath></defs>
    <path d="M67 133 L75 156 L85 156 L93 133 M80 156 V168" fill="none" stroke="#465365" strokeWidth="5" strokeLinejoin="round" />
    <ellipse cx="80" cy="75" rx="56" ry="67" fill="#fffefa" stroke="#465365" strokeWidth="5" />
    <g clipPath={`url(#${clipId})`}>
      {Array.from({ length: 9 }, (_, i) => <line key={`main-${i}`} x1={32 + i * 12} x2={32 + i * 12} y1="10" y2="140" stroke={mainsColor} strokeWidth="3" />)}
      {Array.from({ length: 11 }, (_, i) => <line key={`cross-${i}`} x1="24" x2="136" y1={15 + i * 12} y2={15 + i * 12} stroke={crossesColor} strokeWidth="3" />)}
    </g>
  </svg>
}
