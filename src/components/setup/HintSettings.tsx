import { useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { SpeechRate } from '@/types/profile'
import {
  listChineseVoiceOptions,
  speak,
  speechSupported,
  type SpeechVoiceOption,
} from '@/lib/speech'

interface ToggleRowProps {
  label: string
  description?: string
  checked: boolean
  disabled?: boolean
  onChange: (value: boolean) => void
}

function ToggleRow({ label, description, checked, disabled = false, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-btn bg-slate-50 p-3.5 text-left ring-2 ring-slate-200 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/50 disabled:cursor-not-allowed disabled:opacity-60 ipad-land:p-3"
    >
      <span>
        <span className="block text-base font-bold text-slate-700 ipad-land:text-base">{label}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-slate-400">
            {description}
          </span>
        )}
      </span>
      <span
        className={[
          'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition',
          checked ? 'bg-grass' : 'bg-slate-300',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-6 w-6 transform rounded-full bg-white shadow transition',
            checked ? 'translate-x-7' : 'translate-x-1',
          ].join(' ')}
        />
      </span>
    </button>
  )
}

interface HintSettingsProps {
  autoShowVisualHint: boolean
  showHintAfterWrongAnswer: boolean
  soundEnabled: boolean
  autoReadQuestion: boolean
  autoReadFeedback: boolean
  speechRate: SpeechRate
  speechVoiceId: string
  onChangeAutoShow: (value: boolean) => void
  onChangeAfterWrong: (value: boolean) => void
  onChangeSound: (value: boolean) => void
  onChangeAutoReadQuestion: (value: boolean) => void
  onChangeAutoReadFeedback: (value: boolean) => void
  onChangeSpeechRate: (value: SpeechRate) => void
  onChangeSpeechVoice: (value: string) => void
}

export function HintSettings({
  autoShowVisualHint,
  showHintAfterWrongAnswer,
  soundEnabled,
  autoReadQuestion,
  autoReadFeedback,
  speechRate,
  speechVoiceId,
  onChangeAutoShow,
  onChangeAfterWrong,
  onChangeSound,
  onChangeAutoReadQuestion,
  onChangeAutoReadFeedback,
  onChangeSpeechRate,
  onChangeSpeechVoice,
}: HintSettingsProps) {
  const canSpeak = speechSupported()
  const [voices, setVoices] = useState<SpeechVoiceOption[]>(() =>
    listChineseVoiceOptions(),
  )
  const [previewFailed, setPreviewFailed] = useState(false)

  useEffect(() => {
    if (!canSpeak) return
    const synth = window.speechSynthesis
    const refresh = () => setVoices(listChineseVoiceOptions())
    const timer = window.setTimeout(refresh, 120)
    synth.addEventListener('voiceschanged', refresh)
    return () => {
      window.clearTimeout(timer)
      synth.removeEventListener('voiceschanged', refresh)
    }
  }, [canSpeak])

  const selectedVoiceId = voices.some((voice) => voice.id === speechVoiceId)
    ? speechVoiceId
    : ''

  const previewVoice = () => {
    setPreviewFailed(false)
    speak(
      '你好，我是数数小火车。准备好后，我们一起做题吧！',
      speechRate,
      () => setPreviewFailed(true),
      selectedVoiceId,
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 ipad-land:grid-cols-3">
      <ToggleRow
        label="自动显示图片提示"
        description="每道题自动显示数量图片"
        checked={autoShowVisualHint}
        onChange={onChangeAutoShow}
      />
      <ToggleRow
        label="答错后自动显示提示"
        description="答错时自动展开小提示"
        checked={showHintAfterWrongAnswer}
        onChange={onChangeAfterWrong}
      />
      <ToggleRow
        label="答题反馈音效"
        description="答对和答错时播放不同提示音"
        checked={soundEnabled}
        onChange={onChangeSound}
      />
      <ToggleRow
        label="自动朗读题目"
        description={canSpeak ? '每道新题出现后自动读一遍' : '这台设备暂不支持朗读，答题仍可正常使用'}
        checked={canSpeak && autoReadQuestion}
        disabled={!canSpeak}
        onChange={onChangeAutoReadQuestion}
      />
      <ToggleRow
        label="自动朗读反馈"
        description={canSpeak ? '答对或答错后读出鼓励语' : '这台设备暂不支持朗读，答题仍可正常使用'}
        checked={canSpeak && autoReadFeedback}
        disabled={!canSpeak}
        onChange={onChangeAutoReadFeedback}
      />

      <div className="rounded-btn bg-sky-50/70 p-4 ring-2 ring-sky-100 sm:col-span-2 ipad-land:col-span-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="block text-base font-extrabold text-slate-700">朗读声音</span>
            <span className="mt-0.5 block text-xs font-medium text-slate-400">
              优先选择标有“本机”的声音，断网也能朗读
            </span>
            <select
              value={selectedVoiceId}
              disabled={!canSpeak}
              onChange={(event) => onChangeSpeechVoice(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-2xl border-2 border-sky-100 bg-white px-3 text-sm font-bold text-slate-600 outline-none focus:border-sky disabled:opacity-60"
            >
              <option value="">自动选择中文声音</option>
              {voices.map((voice) => (
                <option key={voice.id} value={voice.id}>
                  {voice.label}
                </option>
              ))}
            </select>
          </label>

          <div className="shrink-0">
            <span className="block text-xs font-bold text-slate-400">语速</span>
            <div className="mt-2 flex rounded-full bg-white p-1 ring-1 ring-sky-100">
              {SPEECH_RATES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={speechRate === option.value}
                  onClick={() => onChangeSpeechRate(option.value)}
                  className={[
                    'min-h-9 rounded-full px-3 text-xs font-extrabold transition',
                    speechRate === option.value
                      ? 'bg-sky text-white shadow-sm'
                      : 'text-slate-400',
                  ].join(' ')}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={previewVoice}
            disabled={!canSpeak}
            className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-sky px-4 text-sm font-extrabold text-white shadow-sm disabled:bg-slate-300"
          >
            <Volume2 size={18} /> 试听
          </button>
        </div>
        {voices.length === 0 && canSpeak && (
          <p className="mt-2 text-xs font-bold text-amber-700">
            暂未读取到声音列表，系统仍会自动选择中文声音。
          </p>
        )}
        {previewFailed && (
          <p role="status" className="mt-2 text-xs font-bold text-coral">
            这台设备暂时无法试听，请保持“自动选择”后再试。
          </p>
        )}
      </div>
    </div>
  )
}

const SPEECH_RATES: { value: SpeechRate; label: string }[] = [
  { value: 'slow', label: '慢一点' },
  { value: 'normal', label: '正常' },
  { value: 'fast', label: '快一点' },
]
