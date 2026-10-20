import { useId } from 'react'

export default function StringBedDiagram({ hybrid }: { hybrid: boolean }) {
  const clipId = useId()
  const mainsColor = '#24563e'
  const crossesColor = hybrid ? '#bd642b' : mainsColor
  return <svg className="string-bed-diagram" viewBox="0 0 160 170" aria-hidden="true" focusable="false">
    <defs><clipPath id={clipId}><ellipse cx="80" cy="75" rx="53" ry="64" /></clipPath></defs>
    <path d="M67 133 L75 156 L85 156 L93 133 M80 156 V168" fill="none" stroke="#70816b" strokeWidth="5" strokeLinejoin="round" />
    <ellipse cx="80" cy="75" rx="56" ry="67" fill="#f7f7ef" stroke="#70816b" strokeWidth="5" />
    <g clipPath={`url(#${clipId})`}>
      {Array.from({ length: 11 }, (_, i) => <line key={`main-${i}`} x1={30 + i * 10} x2={30 + i * 10} y1="10" y2="140" stroke={mainsColor} strokeWidth="2" />)}
      {Array.from({ length: 13 }, (_, i) => <line key={`cross-${i}`} x1="24" x2="136" y1={15 + i * 10} y2={15 + i * 10} stroke={crossesColor} strokeWidth="2" />)}
    </g>
  </svg>
}
