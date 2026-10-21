// Ajustes complementares de ordenação; trajetórias não medem rotação nem velocidade.
export const shotStyles = [
  { label: 'Mais reta', description: 'Busco uma bola mais direta, com pouca altura sobre a rede.', control: 1, power: 0, spin: 0, snapback: 0, durability: 0, retention: 0.25, note: 'Sua trajetória mais reta dá mais peso ao controle de profundidade e à manutenção de uma resposta previsível.' },
  { label: 'Com arco e topspin', description: 'Costumo dar rotação para a bola subir e cair dentro da quadra.', control: 0, power: 0, spin: 0.75, snapback: 0.5, durability: 0.25, retention: 0, note: 'Seu jogo com arco e topspin reforça spin, snapback e resistência ao desgaste, junto das prioridades escolhidas.' },
  { label: 'Mais alta e profunda', description: 'Uso altura e profundidade para manter a troca e afastar o adversário.', control: 0.5, power: 0.75, spin: 0, snapback: 0, durability: 0, retention: 0, note: 'Sua trajetória mais alta e profunda considera facilidade para gerar profundidade e controle. Uma bola alta também pode ter muito topspin.' },
] as const
export const shotStyleOptions = shotStyles.map(style => style.label)
export function shotStyleProfile(label: string | undefined) {
  return shotStyles.find(style => style.label === label)
}
