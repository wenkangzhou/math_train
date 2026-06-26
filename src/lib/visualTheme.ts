import type { VisualTheme } from '@/types/math'

interface ThemeMeta {
  theme: VisualTheme
  emoji: string
  label: string
  // 减法「拿走/开走」时的可选离开 emoji（默认复用 emoji）
}

export const VISUAL_THEMES: ThemeMeta[] = [
  { theme: 'car', emoji: '🚗', label: '小汽车' },
  { theme: 'apple', emoji: '🍎', label: '苹果' },
  { theme: 'star', emoji: '⭐', label: '星星' },
  { theme: 'fish', emoji: '🐟', label: '小鱼' },
  { theme: 'carrot', emoji: '🥕', label: '胡萝卜' },
  { theme: 'block', emoji: '🧱', label: '积木' },
  { theme: 'balloon', emoji: '🎈', label: '气球' },
  { theme: 'duck', emoji: '🦆', label: '小鸭子' },
]

const THEME_MAP: Record<VisualTheme, ThemeMeta> = VISUAL_THEMES.reduce(
  (acc, t) => {
    acc[t.theme] = t
    return acc
  },
  {} as Record<VisualTheme, ThemeMeta>,
)

export function themeEmoji(theme: VisualTheme): string {
  return THEME_MAP[theme]?.emoji ?? '⭐'
}

export function themeLabel(theme: VisualTheme): string {
  return THEME_MAP[theme]?.label ?? '物品'
}
