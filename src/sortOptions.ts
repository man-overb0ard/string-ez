const collator = new Intl.Collator('pt-BR', { sensitivity: 'base', numeric: true })
export function sortOptions(options: readonly string[], label: (value: string) => string = value => value): string[] {
  return [...options].sort((a, b) => collator.compare(label(a), label(b)))
}
