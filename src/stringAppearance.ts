export const colorPreference = 'Cor da corda'
export const shapePreference = 'Formato (Redondo, Hexagonal, etc.)'
export const stringColors = { Azul: '#2466c5', Branca: '#ffffff', Cinza: '#777f87', Natural: '#ead6a0', Preta: '#242424', Verde: '#83bc36', Vermelha: '#cb3434', Amarela: '#efe342', Laranja: '#eb7d25', Rosa: '#e85ba5' } as const
export const stringShapes = ['Redondo', 'Quadrado', 'Hexagonal'] as const
export type Appearance = { colors: readonly string[]; shape: string }
// Variantes de referência do catálogo, sem consulta de estoque. Cor não indica desempenho.
const appearances: Record<string, Appearance> = {
  'HEAD Velocity MLT': { colors: ['Natural', 'Preta'], shape: 'Redondo' },
  'Tecnifibre X-One Biphase': { colors: ['Natural', 'Vermelha'], shape: 'Redondo' },
  'Prince Synthetic Gut with Duraflex': { colors: ['Branca', 'Preta', 'Natural'], shape: 'Redondo' },
  'Babolat Touch VS': { colors: ['Natural'], shape: 'Redondo' },
  'Yonex POLYTOUR PRO': { colors: ['Amarela', 'Preta', 'Azul'], shape: 'Redondo' },
  'Solinco Hyper-G': { colors: ['Verde'], shape: 'Quadrado' },
  'Solinco Hyper-G Soft': { colors: ['Verde'], shape: 'Quadrado' },
  'HEAD Lynx Tour': { colors: ['Natural', 'Cinza', 'Laranja'], shape: 'Hexagonal' },
}
export function stringAppearance(spec: { brand: string; model: string }): Appearance {
  return appearances[`${spec.brand} ${spec.model}`] ?? { colors: [], shape: 'Não catalogado' }
}

type StringIdentity = { brand: string; model: string }
export function appearanceDescription(mains: StringIdentity, crosses: StringIdentity, hybrid: boolean, color?: string, shape?: string): string {
  if (!color && !shape) return ''
  const main = stringAppearance(mains), cross = stringAppearance(crosses)
  const direction = hybrid ? 'nas verticais' : 'em toda a raquete'
  const variant = (spec: Appearance) => `${color && spec.colors.includes(color) ? color : spec.colors[0]} · ${spec.shape.toLowerCase()}`
  return [
    `${hybrid ? 'Verticais' : 'Toda a raquete'}: ${variant(main)}.`,
    hybrid ? `Horizontais: ${variant(cross)}.` : '',
    color ? main.colors.includes(color) ? `Prioriza a cor ${color.toLowerCase()} ${direction}.` : `Não preserva a cor ${color.toLowerCase()} ${direction} nesta alternativa.` : '',
    shape ? main.shape === shape ? `Mantém o formato ${shape.toLowerCase()} ${direction}.` : `Troca o formato ${shape.toLowerCase()} ${direction} para conciliar as demais prioridades.` : '',
    'Variantes de referência: confirme cor, calibre e disponibilidade com o encordoador. Cor não determina desempenho.',
  ].filter(Boolean).join(' ')
}
