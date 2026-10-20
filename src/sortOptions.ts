const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true })
export function sortOptions(options: readonly string[]): string[] {
  return [...options].sort(collator.compare)
}
