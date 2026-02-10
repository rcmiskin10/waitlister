export interface ThemePreset {
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  gradientFrom: string
  gradientTo: string
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  violet: {
    name: 'Violet',
    primaryColor: '262 83% 58%',
    secondaryColor: '245 58% 51%',
    accentColor: '280 67% 60%',
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-indigo-600',
  },
  ocean: {
    name: 'Ocean',
    primaryColor: '217 91% 60%',
    secondaryColor: '199 89% 48%',
    accentColor: '189 94% 43%',
    gradientFrom: 'from-blue-600',
    gradientTo: 'to-cyan-600',
  },
  forest: {
    name: 'Forest',
    primaryColor: '142 76% 36%',
    secondaryColor: '160 84% 39%',
    accentColor: '158 64% 52%',
    gradientFrom: 'from-green-600',
    gradientTo: 'to-emerald-600',
  },
  sunset: {
    name: 'Sunset',
    primaryColor: '25 95% 53%',
    secondaryColor: '0 84% 60%',
    accentColor: '45 93% 47%',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-red-500',
  },
  midnight: {
    name: 'Midnight',
    primaryColor: '224 76% 48%',
    secondaryColor: '262 83% 58%',
    accentColor: '271 81% 56%',
    gradientFrom: 'from-blue-700',
    gradientTo: 'to-violet-600',
  },
  rose: {
    name: 'Rose',
    primaryColor: '350 89% 60%',
    secondaryColor: '330 81% 60%',
    accentColor: '280 67% 60%',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-pink-500',
  },
}

export interface ThemeConfig {
  preset: string
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  fontFamily: string
  monoFontFamily: string
  darkMode: boolean
}

export const themeConfig: ThemeConfig = {
  preset: 'violet',
  borderRadius: 'lg',
  fontFamily: 'Inter',
  monoFontFamily: 'JetBrains Mono',
  darkMode: true,
}

export function getThemePreset(): ThemePreset {
  return THEME_PRESETS[themeConfig.preset] || THEME_PRESETS.violet
}

export function getThemeCssVars(): Record<string, string> {
  const preset = getThemePreset()
  return {
    '--primary': preset.primaryColor,
    '--secondary': preset.secondaryColor,
    '--accent': preset.accentColor,
  }
}

export function getGradientClasses(): string {
  const preset = getThemePreset()
  return `${preset.gradientFrom} ${preset.gradientTo}`
}
