import { useEffect, useRef, useState } from 'react'
import pixQr from './assets/pix-qr.png?no-inline'
import { pixCode } from './pix'

export default function PixContribution() {
  const [copied, setCopied] = useState(false)
  const [manualCopy, setManualCopy] = useState(false)
  const codeField = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (manualCopy) { codeField.current?.focus(); codeField.current?.select() }
  }, [manualCopy])
  async function copyPix() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(pixCode)
      setCopied(true)
      setManualCopy(false)
    } catch {
      setCopied(false)
      setManualCopy(true)
      codeField.current?.focus()
      codeField.current?.select()
    }
  }
  return <section className="pix-contribution" aria-labelledby="pix-contribution-title">
    <h2 id="pix-contribution-title">Curtiu?</h2>
    <p>O string-ez será sempre gratuito para a comunidade. Se quiser contribuir com o projeto, faça um Pix de qualquer valor pelo QR Code ou pelo Pix Copia e Cola.</p>
    <a className="pix-qr-link" href={pixQr} target="_blank" rel="noopener noreferrer" aria-label="Ampliar QR Code Pix para contribuir com o string-ez (abre em nova aba)">
      <img src={pixQr} alt="QR Code Pix para contribuição voluntária ao string-ez" width="488" height="488" loading="lazy" decoding="async" />
    </a>
    <button className="primary pix-copy-button" type="button" onClick={copyPix}>{copied ? 'Código Pix copiado ✓' : 'Copiar código Pix'}</button>
    <p className="micro" role="status">{manualCopy ? 'Não foi possível copiar automaticamente. Selecione e copie o código abaixo.' : copied ? 'Código Pix copiado! No app do seu banco, escolha Pix Copia e Cola e informe o valor que quiser.' : 'No celular, copie o código e use Pix Copia e Cola no app do seu banco.'}</p>
    {manualCopy && <textarea ref={codeField} className="pix-code-field" aria-label="Código Pix para copiar manualmente" readOnly value={pixCode} rows={4} />}
    <p className="micro">Toque no QR Code para ampliar.</p>
  </section>
}
