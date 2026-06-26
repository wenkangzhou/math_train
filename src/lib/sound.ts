// 轻量音效（默认关闭，使用 Web Audio 合成，不加载外部资源）。
// PRD 第十九节：音效默认关闭或提供明显开关，不自动播放持续声音。

let enabled = false
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  return ctx
}

export function setSoundEnabled(value: boolean): void {
  enabled = value
}

export function isSoundEnabled(): boolean {
  return enabled
}

function tone(freq: number, duration: number, when: number, type: OscillatorType = 'sine') {
  const audio = getCtx()
  if (!audio) return
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.0001, audio.currentTime + when)
  gain.gain.exponentialRampToValueAtTime(0.18, audio.currentTime + when + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + when + duration)
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(audio.currentTime + when)
  osc.stop(audio.currentTime + when + duration)
}

export function playCorrect(): void {
  if (!enabled) return
  // 上行小三度，欢快
  tone(523.25, 0.15, 0) // C5
  tone(659.25, 0.18, 0.12) // E5
  tone(783.99, 0.22, 0.24) // G5
}

export function playWrong(): void {
  if (!enabled) return
  // 柔和的低音提示，不刺耳
  tone(392.0, 0.18, 0, 'triangle') // G4
}

export function playTap(): void {
  if (!enabled) return
  tone(660, 0.06, 0, 'sine')
}
