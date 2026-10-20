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
  'Pro Kennex': { Ki: ['5', '10', '15', 'Q+ 5', 'Q+ 15', 'Q+ Tour', 'Q+ Tour Pro'], Black: ['Ace 97', 'Ace 100', 'Ace 105', 'Ace Pro'] },
}
export type RacketModel = { name: string; patterns: string[] }
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
  'Pro Kennex': { Ki: { '5': ['16 × 20'], '15': ['16 × 19'], 'Q+ 5': ['16 × 20'], 'Q+ Tour': ['16 × 19'], 'Q+ Tour Pro': ['16 × 19', '18 × 20'] } },
}
export const rackets: Record<string, Record<string, RacketModel[]>> = Object.fromEntries(
  Object.entries(models).map(([brand, lines]) => [brand, Object.fromEntries(
    Object.entries(lines).map(([line, names]) => [line, names.map(name => ({ name, patterns: overrides[brand]?.[line]?.[name] ?? ['16 × 19'] }))]),
  )]),
)
export function getPatterns(brand: string, line: string, model: string): string[] {
  return rackets[brand]?.[line]?.find(entry => entry.name === model)?.patterns ?? []
}
export function racketLabel(brand: string, line: string, model: string) {
  return [brand, line, model].filter(Boolean).filter((part, i, all) => i === 0 || part !== all[i - 1]).join(' · ')
}
