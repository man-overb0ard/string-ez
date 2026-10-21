// Catálogo inicial de identificação; não representa especificações ou disponibilidade por geração.
const models: Record<string, Record<string, string[]>> = {
  Yonex: { VCORE: ['95', '98', '100', '100L'], EZONE: ['98', '98L', '100', '100L', '105'], PERCEPT: ['97', '97D', '97H', '100', '100D'] },
  Babolat: { 'Pure Aero': ['Pure Aero', '98', 'Team', 'Lite', 'Rafa'], 'Pure Drive': ['Pure Drive', '98', 'Team', 'Lite', '107'], 'Pure Strike': ['97', '98', '100', 'Team'] },
  Head: { Speed: ['Pro', 'MP', 'MP L', 'Team'], Radical: ['Pro', 'MP', 'Team'], Gravity: ['Pro', 'Tour', 'MP', 'Team'], Extreme: ['Pro', 'MP', 'MP L', 'Team'], Prestige: ['Pro', 'Tour', 'MP', 'MP L'], Boom: ['Pro', 'MP', 'MP L', 'Team'] },
  Wilson: { Blade: ['98', '100', '100L', '104'], Clash: ['98', '100', '100 Pro', '100L', '108'], 'Pro Staff': ['97', '97L', '97UL', 'X'], Ultra: ['100', '100L', '100UL', '108'], Shift: ['99', '99 Pro', '99L'] },
  Prince: { Tour: ['95', '98', '100', '100P'], Phantom: ['93P', '97P', '100', '100P', '100X'], Beast: ['98', '100', '104'] },
  Tecnifibre: { 'T-Fight': ['315', '305', '305S', '300', '300S', '295', '285', '280', '270'], 'TF40': ['305', '315'], 'TF-X1': ['300', '285', '275'], 'Tempo': ['298', '285', '270'] },
  Dunlop: { CX: ['200', '200 Tour', '200 LS', '200 OS', '400', '400 Tour'], SX: ['300', '300 Tour', '300 LS', '300 Lite', '600'], FX: ['500', '500 Tour', '500 LS', '500 Lite', '700'] },
  Diadem: { Elevate: ['98', '98 Tour', '98 Lite'], Nova: ['100', '100+', '100 Lite'] },
  'Pro Kennex': { Ki: ['5', '10', '15'], 'Q+': ['5', '15', 'Tour', 'Tour Pro'], Black: ['Ace 97', 'Ace 100', 'Ace 105', 'Ace Pro'] },
}
export type RacketModel = { name: string; patterns: string[]; headSize?: number; source?: string }
// Opções abrangem variantes/gerações do catálogo inicial. Não inferir tensão a partir delas.
const overrides: Record<string, Record<string, Record<string, string[]>>> = {
  Yonex: { VCORE: { '95': ['16 × 20'] }, PERCEPT: { '97D': ['18 × 20'], '100D': ['18 × 19'] } },
  Babolat: { 'Pure Strike': { '98': ['16 × 19', '18 × 20'], '100': ['16 × 19', '16 × 20'] } },
  Head: {
    Speed: { Pro: ['18 × 20'] },
    Gravity: { Pro: ['18 × 20'], Tour: ['18 × 20', '16 × 19'], MP: ['16 × 20'], Team: ['16 × 20'] },
    Prestige: { Pro: ['18 × 20', '16 × 19'], Tour: ['16 × 19'], MP: ['18 × 19'], 'MP L': ['16 × 19'] },
  },
  Wilson: { Blade: { '98': ['16 × 19', '18 × 20'], '104': ['16 × 19', '18 × 19'] }, Clash: { '98': ['16 × 19', '16 × 20'], '100 Pro': ['16 × 20'] }, Shift: { '99 Pro': ['18 × 20'], '99': ['16 × 20'], '99L': ['16 × 20'] } },
  Prince: {
    Tour: { '95': ['16 × 20'], '100P': ['18 × 20'] },
    Phantom: { '93P': ['14 × 18', '18 × 20'], '97P': ['16 × 18'], '100': ['16 × 18'], '100P': ['16 × 18'], '100X': ['16 × 18', '18 × 20'] },
    Beast: { '98': ['16 × 20'] },
  },
  Tecnifibre: { 'T-Fight': { '305': ['18 × 19'], '305S': ['18 × 19'] }, TF40: { '305': ['16 × 19', '18 × 20'], '315': ['16 × 19', '18 × 20'] } },
  Dunlop: { CX: { '200 Tour': ['16 × 19', '18 × 20'] }, SX: { '600': ['16 × 18'] }, FX: { '700': ['16 × 18'] } },
  Diadem: { Elevate: { '98': ['16 × 20'], '98 Tour': ['16 × 20'], '98 Lite': ['16 × 20'] } },
  'Pro Kennex': { Ki: { '5': ['16 × 20'], '15': ['16 × 19'] }, 'Q+': { '5': ['16 × 20'], Tour: ['16 × 19'], 'Tour Pro': ['16 × 19', '18 × 20'] } },
}
const existingRackets: Record<string, Record<string, RacketModel[]>> = Object.fromEntries(
  Object.entries(models).map(([brand, lines]) => [brand, Object.fromEntries(
    Object.entries(lines).map(([line, names]) => [line, names.map(name => ({ name, patterns: overrides[brand]?.[line]?.[name] ?? ['16 × 19'] }))]),
  )]),
)
// Fichas oficiais consultadas na revisão de 20/10/2026. Os registros explícitos
// evitam atribuir o padrão genérico 16 × 19 aos lançamentos.
function verifiedModel(name: string, pattern: string, headSize: number, source: string): RacketModel {
  return { name, patterns: [pattern], headSize, source }
}
const verifiedFamilies: Record<string, Record<string, RacketModel[]>> = {
  Wilson: {
    'RF 01': [
      verifiedModel('RF 01', '16 × 19', 98, 'https://www.wilson.com/en-us/products/rf-01-tennis-racket-wr15140'),
      verifiedModel('Pro', '16 × 19', 98, 'https://www.wilson.com/en-us/products/rf-01-pro-tennis-racket-wr15130'),
      verifiedModel('Future', '16 × 19', 98, 'https://www.wilson.com/en-us/products/rf-01-future-tennis-racket-wr16680'),
    ],
    Defyer: [
      verifiedModel('98 Pro', '16 × 20', 98, 'https://www.wilson.com/en-us/products/defyer-98-pro-v1-tennis-racket-wr21530'),
      verifiedModel('100', '16 × 19', 100, 'https://www.wilson.com/en-us/products/defyer-100-v1-tennis-racket-wr21540'),
      verifiedModel('100L', '16 × 19', 100, 'https://www.wilson.com/en-us/products/defyer-100l-v1-tennis-racket-wr21550'),
      verifiedModel('100UL', '16 × 19', 100, 'https://www.wilson.com/en-us/products/defyer-100ul-v1-tennis-racket-wr21560'),
    ],
  },
  Tecnifibre: {
    Fire: [
      verifiedModel('305S', '16 × 19', 98, 'https://www.tecnifibre.com/products/fire-305s'),
      verifiedModel('300', '16 × 19', 100, 'https://www.tecnifibre.com/products/fire-300'),
      verifiedModel('285', '16 × 19', 100, 'https://www.tecnifibre.com/products/fire-285'),
      verifiedModel('270', '16 × 19', 100, 'https://www.tecnifibre.com/products/fire-270'),
      verifiedModel('260 OS', '16 × 19', 110, 'https://www.tecnifibre.com/products/fire-260-os'),
      verifiedModel('255', '16 × 19', 100, 'https://www.tecnifibre.com/products/fire-255'),
    ],
  },
  Yonex: {
    MUSE: [
      verifiedModel('98', '16 × 18', 98, 'https://www.yonex.com/tennis/racquets/muse-98'),
      verifiedModel('100', '16 × 18', 100, 'https://www.yonex.com/tennis/racquets/muse-100'),
      verifiedModel('100L', '16 × 18', 100, 'https://www.yonex.com/tennis/racquets/muse-100l'),
      verifiedModel('100SL', '16 × 18', 100, 'https://www.yonex.com/tennis/racquets/muse-100sl'),
      verifiedModel('107', '16 × 18', 107, 'https://www.yonex.com/tennis/racquets/muse-107'),
    ],
  },
  Head: {
    Squared: [verifiedModel('Squared', '16 × 18', 100, 'https://www.head.com/en_US/product/squared-232606')],
  },
  Babolat: {
    'Pure Aero': [verifiedModel('98', '16 × 20', 98, 'https://www.babolat.com/us/pure-aero-98-gen9-unstrung/101567.html')],
  },
  'Pro Kennex': {
    'Q+': [
      verifiedModel('5', '16 × 20', 100, 'https://prokennex.com/products/q-6'),
      verifiedModel('5 Pro', '16 × 20', 100, 'https://prokennex.com/products/q-5-pro'),
      verifiedModel('15', '16 × 19', 105, 'https://prokennex.com/products/q-16'),
      verifiedModel('20', '16 × 19', 110, 'https://prokennex.com/products/q-21'),
      verifiedModel('30', '16 × 19', 119, 'https://prokennex.com/products/q-31'),
      verifiedModel('Tour', '16 × 19', 98, 'https://prokennex.com/products/q-tour-1'),
      verifiedModel('Tour Pro', '18 × 20', 98, 'https://prokennex.com/products/q-tour-pro'),
    ],
  },
  Diadem: {
    Axis: [
      verifiedModel('98', '16 × 20', 98, 'https://diademsports.com/products/axis-98'),
      verifiedModel('100', '16 × 19', 100, 'https://diademsports.com/products/axis-100'),
      verifiedModel('Team', '16 × 19', 100, 'https://diademsports.com/products/axis-team'),
    ],
  },
}
// Catálogo de identificação das marcas adicionais; fichas não consultadas ao vivo.
// Valores de referência não validam gerações nem a faixa de tensão do fabricante.
function catalogModel(name: string, pattern: string, headSize: number): RacketModel {
  return { name, patterns: [pattern], headSize }
}
const volklModernModels = () => [
  catalogModel('V1 MP', '16 × 19', 102),
  catalogModel('V1 OS', '16 × 19', 110),
  catalogModel('V1 Pro', '16 × 19', 99),
  catalogModel('V4', '16 × 19', 105),
  catalogModel('V6', '16 × 19', 100),
  catalogModel('V7', '16 × 19', 104),
  catalogModel('V8 285 g', '16 × 18', 100),
  catalogModel('V8 300 g', '16 × 18', 100),
  catalogModel('V8 315 g', '16 × 18', 100),
  catalogModel('V9', '16 × 19', 100),
  catalogModel('V10 300 g', '16 × 19', 98),
  catalogModel('V10 320 g', '16 × 19', 98),
]
const additionalFamilies: Record<string, Record<string, RacketModel[]>> = {
  Mizuno: {
    F: [catalogModel('F97', '16 × 19', 97), catalogModel('F100', '16 × 19', 100)],
    'F Tour': [catalogModel('285', '16 × 19', 100), catalogModel('300', '16 × 19', 100)],
  },
  Volkl: {
    Vostra: volklModernModels(),
    'V-Cell': volklModernModels().filter(model => !model.name.startsWith('V9')).map(model => ({ ...model, name: model.name.replace(/^V/, '') })),
    C10: [catalogModel('Pro', '16 × 19', 98), catalogModel('Evo', '16 × 19', 98)],
    'Power Bridge': [catalogModel('10 Mid', '16 × 19', 93)],
  },
}
export const rackets: Record<string, Record<string, RacketModel[]>> = { ...Object.fromEntries(
  Object.entries(existingRackets).map(([brand, families]) => {
    const merged = { ...families }
    for (const [line, verified] of Object.entries(verifiedFamilies[brand] ?? {})) {
      const previous = families[line] ?? []
      merged[line] = previous.map(model => verified.find(entry => entry.name === model.name) ?? model)
        .concat(verified.filter(entry => !previous.some(model => model.name === entry.name)))
    }
    return [brand, merged]
  }),
), ...additionalFamilies }
export function getPatterns(brand: string, line: string, model: string): string[] {
  return rackets[brand]?.[line]?.find(entry => entry.name === model)?.patterns ?? []
}
export function racketLabel(brand: string, line: string, model: string) {
  return [brand, line, model].filter(Boolean).filter((part, i, all) => i === 0 || part !== all[i - 1]).join(' · ')
}


// Tamanho apenas quando o modelo do catálogo permite identificá-lo sem escolher geração.
// Não equivale ao espaçamento real das cordas ou a uma medição de launch angle.
export function getHeadSize(brand: string, line: string, model: string): number | undefined {
  const entry = rackets[brand]?.[line]?.find(entry => entry.name === model)
  if (!entry) return undefined
  if (entry.headSize) return entry.headSize
  if (['Yonex', 'Wilson', 'Prince', 'Diadem'].includes(brand)) {
    const size = Number.parseInt(model, 10)
    if (size >= 90 && size <= 115) return size
  }
  if (brand === 'Wilson') {
    if (line === 'Pro Staff') return model === 'X' ? 100 : 97
  }
  if (brand === 'Babolat') {
    if (model === '98' || model === '97' || model === '107') return Number(model)
    return 100
  }
  if (brand === 'Head') {
    if (line === 'Speed' && model !== 'Team') return 100
    if (line === 'Radical') return model === 'Team' ? 102 : 98
    if (line === 'Gravity' && model !== 'Tour') return model === 'Team' ? 104 : 100
    if (line === 'Boom') return model === 'Pro' ? 98 : model === 'Team' ? 102 : 100
  }
  if (brand === 'Tecnifibre' && line === 'TF40') return 98
  if (brand === 'Dunlop') {
    if (line === 'CX') return model === '200 Tour' ? 95 : model === '200 OS' ? 105 : model.startsWith('200') ? 98 : 100
    if (line === 'SX') return model === '300 Tour' ? 98 : model === '600' ? 105 : 100
    if (line === 'FX') return model === '500 Tour' ? 98 : model === '700' ? 107 : 100
  }
  return undefined
}
