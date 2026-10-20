// Faixas qualitativas para comparação inicial, sem cotações ou promessa de economia.
// Não representam preço por set, rolo, mão de obra ou custo por hora de jogo.
export function stringCostBand(material: string, brand = '', model = ''): number {
  const key = `${brand} ${model}`.toLowerCase()
  if (material === 'Tripa natural') return 4
  if (['x-one biphase', 'nrg2', 'nxt', 'alu power', '4g'].some(name => key.includes(name))) return 3
  if (material === 'Synthetic gut (nylon)') return 1
  return 2
}
const labels = ['baixa', 'média', 'alta', 'premium']
export function costBandLabel(band: number): string {
  const low = Math.floor(band) - 1, high = Math.ceil(band) - 1
  return low === high ? labels[low] : `${labels[low]} a ${labels[high]}`
}
export function compareCost(current: number, proposed: number): string {
  const direction = proposed < current
    ? 'Faixa indicativa menor: pode reduzir o gasto com cordas, sujeito a cotação.'
    : proposed === current ? 'Mesma faixa indicativa: não há economia demonstrada em relação ao setup atual.'
      : 'Faixa indicativa maior: esta opção privilegia outros objetivos, não a redução de custo.'
  return `Setup atual: faixa ${costBandLabel(current)}. Esta opção: faixa ${costBandLabel(proposed)}. ${direction}`
}
export const costNote = 'Comparação qualitativa por material/modelo, sem consulta de preços. Confirme a cotação com o encordoador. Mão de obra, compra em rolo ou set, desgaste e frequência de troca podem mudar o custo total e por hora; não calculamos economia em R$.'
