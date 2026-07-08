interface KidStepsProps {
  steps: string[]
}

export function KidSteps({ steps }: KidStepsProps) {
  return (
    <div className="mb-2 grid grid-cols-3 gap-1.5 rounded-2xl bg-sky-50/80 p-1.5 ring-1 ring-sky-100">
      {steps.slice(0, 3).map((step, index) => (
        <div
          key={`${index}-${step}`}
          className="flex min-h-9 items-center justify-center gap-1 rounded-xl bg-white/80 px-1.5 text-center text-[11px] font-extrabold leading-tight text-slate-600 shadow-sm ipad-land:min-h-8 ipad-land:text-[10px]"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky text-xs text-white ipad-land:h-4 ipad-land:w-4 ipad-land:text-[10px]">
            {index + 1}
          </span>
          <span>{step}</span>
        </div>
      ))}
    </div>
  )
}
