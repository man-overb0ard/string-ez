// Catálogo inicial de identificação; não representa especificações ou disponibilidade por geração.
export const rackets: Record<string, Record<string, string[]>> = {
  Yonex: { VCORE: ['95', '98', '100', '100L'], EZONE: ['98', '98L', '100', '100L', '105'], PERCEPT: ['97', '97D', '97H', '100', '100D'] },
  Babolat: { 'Pure Aero': ['Pure Aero', '98', 'Team', 'Lite', 'Rafa'], 'Pure Drive': ['Pure Drive', '98', 'Team', 'Lite', '107'], 'Pure Strike': ['97', '98 16 × 19', '98 18 × 20', '100', 'Team'] },
  Head: { Speed: ['Pro', 'MP', 'MP L', 'Team'], Radical: ['Pro', 'MP', 'Team'], Gravity: ['Pro', 'Tour', 'MP', 'Team'], Extreme: ['Pro', 'MP', 'MP L', 'Team'], Prestige: ['Pro', 'Tour', 'MP', 'MP L'], Boom: ['Pro', 'MP', 'MP L', 'Team'] },
  Wilson: { Blade: ['98 16 × 19', '98 18 × 20', '100', '100L', '104'], Clash: ['98', '100', '100 Pro', '100L', '108'], 'Pro Staff': ['97', '97L', '97UL', 'X'], Ultra: ['100', '100L', '100UL', '108'], Shift: ['99', '99 Pro', '99L'] },
  Prince: { Tour: ['95', '98', '100', '100P'], Phantom: ['93P', '97P', '100', '100P', '100X'], Beast: ['98', '100', '104'] },
  'Pro Kennex': { Ki: ['5', '10', '15', 'Q+ 5', 'Q+ 15', 'Q+ Tour', 'Q+ Tour Pro'], Black: ['Ace 97', 'Ace 100', 'Ace 105', 'Ace Pro'] },
}
export const other = 'Outra / não sei'
export function racketLabel(brand: string, line: string, model: string) {
  return [brand, line, model].filter(Boolean).filter((part, i, all) => i === 0 || part !== all[i - 1]).join(' · ')
}
