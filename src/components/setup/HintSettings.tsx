interface ToggleRowProps {
  label: string
  description?: string
  checked: boolean
  onChange: (value: boolean) => void
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-btn bg-slate-50 p-3.5 text-left ring-2 ring-slate-200 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/50 ipad-land:p-3"
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
  onChangeAutoShow: (value: boolean) => void
  onChangeAfterWrong: (value: boolean) => void
  onChangeSound: (value: boolean) => void
}

export function HintSettings({
  autoShowVisualHint,
  showHintAfterWrongAnswer,
  soundEnabled,
  onChangeAutoShow,
  onChangeAfterWrong,
  onChangeSound,
}: HintSettingsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
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
    </div>
  )
}
