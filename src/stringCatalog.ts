export const specifyString = 'Quero especificar'
export type CatalogString = { model: string; material: string }
const poly = (model: string): CatalogString => ({ model, material: 'Poliéster' })
const multi = (model: string): CatalogString => ({ model, material: 'Multifilamento' })
const nylon = (model: string): CatalogString => ({ model, material: 'Synthetic gut (nylon)' })
const gut = (model: string): CatalogString => ({ model, material: 'Tripa natural' })
// Catálogo inicial de identificação, sem classificação de vendas/estoque no Brasil.
export const stringCatalog: Record<string, CatalogString[]> = {
  Solinco: [poly('Hyper-G'), poly('Hyper-G Soft'), poly('Confidential'), poly('Tour Bite'), poly('Tour Bite Soft'), poly('Outlast'), multi('Vanquish')],
  Yonex: [poly('POLYTOUR PRO'), poly('POLYTOUR REV'), poly('POLYTOUR STRIKE'), poly('POLYTOUR FIRE'), multi('REXIS SPEED'), multi('REXIS COMFORT')],
  Babolat: [poly('RPM Blast'), poly('RPM Rough'), poly('RPM Team'), poly('RPM Power'), multi('Xcel'), multi('Addiction'), nylon('Synthetic Gut'), gut('Touch VS')],
  Tecnifibre: [multi('X-One Biphase'), multi('NRG2'), multi('Multifeel'), multi('TGV'), poly('Razor Code'), poly('Razor Soft'), poly('Ice Code'), poly('Black Code')],
  HEAD: [poly('Lynx'), poly('Lynx Tour'), poly('Hawk'), poly('Hawk Touch'), poly('Hawk Power'), multi('Velocity MLT'), multi('RIP Control')],
  'Signum Pro': [poly('Poly Plasma'), poly('Plasma Pure'), poly('Tornado'), poly('Hyperion'), poly('Firestorm'), poly('X-Perience'), multi('Micronite')],
  'Robin Söderling (RS)': [poly('Lyon'), poly('Paris'), multi('New York')],
  Luxilon: [poly('ALU Power'), poly('ALU Power Rough'), poly('4G'), poly('4G Soft'), poly('Element'), poly('Original'), poly('Eco Power'), gut('Natural Gut')],
  Wilson: [multi('Sensation'), multi('NXT'), multi('NXT Power'), poly('Revolve'), poly('Revolve Spin'), nylon('Synthetic Gut Power')],
  Prince: [nylon('Synthetic Gut with Duraflex'), multi('Premier Control'), poly('Tour XP'), poly('Tour XC')],
  Kirschbaum: [poly('Pro Line II'), poly('Max Power'), poly('Super Smash Orange'), poly('Black Shark')],
  MSV: [poly('Focus Hex'), poly('Focus Hex Soft'), poly('Co-Focus')],
  Dunlop: [poly('Black Widow'), poly('Explosive Bite'), poly('Explosive Speed'), multi('Iconic All'), multi('Iconic Touch')],
  Tourna: [poly('Big Hitter Silver'), poly('Big Hitter Blue'), poly('Big Hitter Black 7')],
}
export function findString(brand: string, model: string): CatalogString | undefined {
  return stringCatalog[brand]?.find(entry => entry.model === model)
}
export function resolveStringMaterial(choice: string, brand: string, model: string): string {
  return choice === specifyString ? findString(brand, model)?.material ?? '' : choice
}
