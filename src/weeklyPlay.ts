// Pesos heurísticos adicionais; frequência não estima vida útil nem custo por hora.
export const weeklyPlayProfiles = [
  { label: 'Até 2 horas', retention: 1, durability: 0, price: 0, note: 'Sua frequência dá mais peso à manutenção de tensão e das características da corda entre as partidas.' },
  { label: 'Mais de 2 até 5 horas', retention: 0.25, durability: 0.25, price: 0.25, note: 'Sua frequência considera um equilíbrio entre manutenção de tensão, resistência ao desgaste e preço das trocas.' },
  { label: 'Mais de 5 até 10 horas', retention: 0.5, durability: 1, price: 0.5, note: 'Sua frequência dá mais peso à resistência ao desgaste e ao preço das trocas, considerando também a manutenção de tensão.' },
  { label: 'Mais de 10 horas', retention: 0.5, durability: 1, price: 1, note: 'Sua frequência reforça a resistência ao desgaste e o preço das trocas, considerando também a manutenção de tensão.' },
] as const
export const weeklyHoursOptions = weeklyPlayProfiles.map(profile => profile.label)
export function weeklyPlayProfile(label: string | undefined) {
  return weeklyPlayProfiles.find(profile => profile.label === label)
}
