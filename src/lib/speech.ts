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
let speechPrimed = false

export interface SpeechVoiceOption {
  id: string
  label: string
  lang: string
  local: boolean
}

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

function chineseVoices(): SpeechSynthesisVoice[] {
  const s = synth()
  if (!s) return []
  const voices = s.getVoices()
  if (!voices || voices.length === 0) return []
  return voices.filter(isChinese)
}

export function listChineseVoiceOptions(): SpeechVoiceOption[] {
  return chineseVoices()
    .sort((a, b) => Number(b.localService) - Number(a.localService))
    .map((voice) => ({
      id: voice.voiceURI || voice.name,
      label: `${voice.name}${voice.localService ? '（本机）' : '（可能需联网）'}`,
      lang: voice.lang,
      local: voice.localService,
    }))
}

function pickVoice(preferredId = ''): SpeechSynthesisVoice | null {
  const zh = chineseVoices()
  if (zh.length === 0) return null

  if (preferredId) {
    const selected = zh.find(
      (voice) => voice.voiceURI === preferredId || voice.name === preferredId,
    )
    if (selected) return selected
  }

  // 优先普通话 zh-CN，再偏好疑似女声名称
  const cn = zh.filter((v) => (v.lang || '').toLowerCase().includes('cn'))
  const localCn = cn.filter((voice) => voice.localService)
  const localZh = zh.filter((voice) => voice.localService)
  const pool = localCn.length > 0 ? localCn : localZh.length > 0 ? localZh : cn.length > 0 ? cn : zh
  const female = pool.find((v) =>
    FEMALE_HINTS.some((h) => (v.name || '').toLowerCase().includes(h)),
  )
  return female ?? pool[0]
}

function ensureVoice(preferredId = ''): SpeechSynthesisVoice | null {
  if (preferredId) return pickVoice(preferredId)
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
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoice = pickVoice()
    voiceResolved = cachedVoice !== null
  })
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

// iPad / iPhone 的 WebKit 可能不允许页面加载后的定时器直接启动语音。
// 必须在“开始答题”这类真实点击手势里先放入一段无声语音，后续题目才能稳定自动朗读。
export function primeSpeech(): boolean {
  const s = synth()
  if (!s) return false

  try {
    s.resume()
    if (speechPrimed) return true

    const utterance = new SpeechSynthesisUtterance('\u200B')
    utterance.lang = 'zh-CN'
    utterance.rate = 10
    utterance.volume = 0
    s.speak(utterance)
    speechPrimed = true
    return true
  } catch {
    speechPrimed = false
    return false
  }
}

export function speak(
  text: string,
  rate: SpeechRate = 'normal',
  onFailure?: () => void,
  preferredVoiceId = '',
): boolean {
  const s = synth()
  if (!s || !text) {
    onFailure?.()
    return false
  }
  // 朗读前先取消上一段，避免重叠（PRD 5.2 / 验收 17）
  s.cancel()
  const u = new SpeechSynthesisUtterance(text)
  const v = ensureVoice(preferredVoiceId)
  if (v) u.voice = v
  u.lang = v?.lang || 'zh-CN'
  u.rate = RATE_MAP[rate] ?? 0.88
  u.pitch = 1.12 // 略高更亲切
  u.volume = 1
  u.onerror = (event) => {
    // 主动切换题目会 cancel 上一段语音，不把这种正常中断当成故障。
    if (event.error === 'canceled' || event.error === 'interrupted') return
    onFailure?.()
  }
  try {
    s.speak(u)
    return true
  } catch {
    onFailure?.()
    return false
  }
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
