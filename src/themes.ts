export const themes = [
  { id: 'alcaraz', name: 'Alcaraz', fullName: 'Carlos Alcaraz', outfit: 'Ivory, verde e turquesa', colors: ['#f7f7ef', '#183c2e', '#24aaa4'], browserColor: '#24563e', position: '0%' },
  { id: 'guga', name: 'Guga', fullName: 'Gustavo Kuerten', outfit: 'Amarelo e azul-marinho', colors: ['#f5c84c', '#19385e', '#fff9e8'], browserColor: '#19385e', position: '25%' },
  { id: 'agassi', name: 'Agassi', fullName: 'Andre Agassi', outfit: 'Rosa, preto e branco', colors: ['#f6529c', '#241d28', '#fff7fa'], browserColor: '#92335f', position: '50%' },
  { id: 'federer', name: 'Federer', fullName: 'Roger Federer', outfit: 'All black · modo noturno', colors: ['#111214', '#52565e', '#e5e7eb'], browserColor: '#111214', position: '75%' },
  { id: 'nadal', name: 'Nadal', fullName: 'Rafael Nadal', outfit: 'Lilás e coral', colors: ['#b8a1de', '#ff704b', '#312a4b'], browserColor: '#60468d', position: '100%' },
  { id: 'djokovic', name: 'Djokovic', fullName: 'Novak Djokovic', outfit: 'Azul-celeste, cobalto e coral', colors: ['#78b9ed', '#1554ab', '#ff916f'], browserColor: '#1554ab', position: '50%' },
  { id: 'sinner', name: 'Sinner', fullName: 'Jannik Sinner', outfit: 'Mostarda, oliva e preto', colors: ['#d4a51c', '#56502b', '#181914'], browserColor: '#56502b', position: '50%' },
] as const
export type ThemeId = typeof themes[number]['id']
export const themeStorageKey = 'string-ez-theme'
export function readSavedTheme(): ThemeId {
  try {
    const saved = window.localStorage.getItem(themeStorageKey)
    return themes.find(theme => theme.id === saved)?.id ?? 'alcaraz'
  } catch { return 'alcaraz' }
}
