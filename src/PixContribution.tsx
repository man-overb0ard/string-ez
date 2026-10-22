import pixQr from './assets/pix-qr.png?no-inline'

export default function PixContribution() {
  return <section className="pix-contribution" aria-labelledby="pix-contribution-title">
    <h2 id="pix-contribution-title">Curtiu?</h2>
    <p>O string-ez será sempre gratuito para a comunidade. Se quiser contribuir com o projeto, faça um Pix de qualquer valor usando o QR Code abaixo.</p>
    <a className="pix-qr-link" href={pixQr} target="_blank" rel="noopener noreferrer" aria-label="Ampliar QR Code Pix para contribuir com o string-ez (abre em nova aba)">
      <img src={pixQr} alt="QR Code Pix para contribuição voluntária ao string-ez" width="488" height="488" loading="lazy" decoding="async" />
    </a>
    <p className="micro">Toque no QR Code para ampliar.</p>
  </section>
}
