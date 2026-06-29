// 数数小火车 / Math Train — 语音朗读（浏览器原生 speechSynthesis）
// PRD 功能三：中文普通话、尽量女声、朗读前取消上一段、页面退出停止。

import type { Question } from '@/types/math'
import type { SpeechRate } from '@/types/profile'

function synth(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  return window.speechSynthesis
}

export function speechSupported(): boolean {
  return synth() !== null
}

// 语音可能异步加载，缓存一次挑选结果
let cachedVoice: SpeechSynthesisVoice | null = null
let voiceResolved = false

const FEMALE_HINTS = [
  'ting-ting',
  'tingting',
  'mei-jia',
  'meijia',
  'sin-ji',
  'huihui',
  'yaoyao',
  'female',
  '婷',
  '华',
  '小',
]

function isChinese(v: SpeechSynthesisVoice): boolean {
  const lang = (v.lang || '').toLowerCase()
  return lang.startsWith('zh') || lang.includes('cmn')
}

function pickVoice(): SpeechSynthesisVoice | null {
  const s = synth()
  if (!s) return null
  const voices = s.getVoices()
  if (!voices || voices.length === 0) return null

  const zh = voices.filter(isChinese)
  if (zh.length === 0) return null

  // 优先普通话 zh-CN，再偏好疑似女声名称
  const cn = zh.filter((v) => (v.lang || '').toLowerCase().includes('cn'))
  const pool = cn.length > 0 ? cn : zh
  const female = pool.find((v) =>
    FEMALE_HINTS.some((h) => (v.name || '').toLowerCase().includes(h)),
  )
  return female ?? pool[0]
}

function ensureVoice(): SpeechSynthesisVoice | null {
  if (voiceResolved && cachedVoice) return cachedVoice
  const v = pickVoice()
  if (v) {
    cachedVoice = v
    voiceResolved = true
  }
  return v
}

// 某些浏览器需要监听 voiceschanged 才能拿到列表
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = pickVoice()
    voiceResolved = cachedVoice !== null
  }
}

const RATE_MAP: Record<SpeechRate, number> = {
  slow: 0.7,
  normal: 0.88,
  fast: 1.08,
}

export function cancelSpeech(): void {
  const s = synth()
  if (s) s.cancel()
}

export function speak(text: string, rate: SpeechRate = 'normal'): void {
  const s = synth()
  if (!s || !text) return
  // 朗读前先取消上一段，避免重叠（PRD 5.2 / 验收 17）
  s.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const v = ensureVoice()
  if (v) u.voice = v
  u.lang = v?.lang || 'zh-CN'
  u.rate = RATE_MAP[rate] ?? 0.88
  u.pitch = 1.12 // 略高更亲切
  u.volume = 1
  s.speak(u)
}

// ---------------------------------------------------------------------------
// 数字与题目 → 中文朗读文本
// ---------------------------------------------------------------------------

const ZH_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

export function numberToZh(n: number): string {
  if (n < 0) return String(n)
  if (n <= 10) return ZH_DIGITS[n]
  if (n < 20) return `十${ZH_DIGITS[n - 10]}`
  if (n === 20) return '二十'
  // 21~99 兜底
  const tens = Math.floor(n / 10)
  const unit = n % 10
  return `${ZH_DIGITS[tens]}十${unit ? ZH_DIGITS[unit] : ''}`
}

// 把题目转成可朗读文本（缺项读作「几」）。
export function questionToSpeech(q: Question): string {
  const L = numberToZh(q.fullLeft)
  const R = numberToZh(q.fullRight)
  const C = numberToZh(q.fullResult)
  switch (q.pattern) {
    case 'a-plus-b-equals-blank':
      return `${L}加${R}等于几？`
    case 'a-plus-blank-equals-c':
      return `${L}加几等于${C}？`
    case 'blank-plus-b-equals-c':
      return `几加${R}等于${C}？`
    case 'a-minus-b-equals-blank':
      return `${L}减去${R}还剩几？`
    case 'a-minus-blank-equals-c':
      return `${L}减去几等于${C}？`
    case 'blank-minus-b-equals-c':
      return `几减去${R}等于${C}？`
    default:
      return ''
  }
}
