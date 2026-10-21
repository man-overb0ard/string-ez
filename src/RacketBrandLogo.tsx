const logos: Record<string, string> = {
  Babolat: 'babolat.svg', Diadem: 'diadem.png', Dunlop: 'dunlop.png', Head: 'head.svg',
  Prince: 'prince.png', 'Pro Kennex': 'prokennex.png', Tecnifibre: 'tecnifibre.png', Wilson: 'wilson.svg', Yonex: 'yonex.svg',
}
export default function RacketBrandLogo({ brand }: { brand: string }) {
  const logo = logos[brand]
  return <span className="racket-brand-label"><span className="racket-brand-logo" aria-hidden="true">
    {logo ? <img src={`/brands/${logo}`} alt="" width="88" height="36" className={brand === 'Dunlop' ? 'logo-on-light' : undefined} /> : <span className="brand-initial">{brand[0]}</span>}
  </span><span>{brand}</span></span>
}
