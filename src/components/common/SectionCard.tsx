import type { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  hint?: string
  children: ReactNode
}

// 圆角卡片容器，设置页的每个设置项使用
export function SectionCard({ title, hint, children }: SectionCardProps) {
  return (
    <section className="rounded-card bg-white/85 p-4 shadow-soft backdrop-blur sm:p-5 ipad-land:p-3">
      <div className="mb-3 flex items-baseline justify-between gap-2 ipad-land:mb-1">
        <h2 className="text-lg font-bold text-slate-700 sm:text-xl ipad-land:text-lg">{title}</h2>
        {hint && <span className="text-xs text-slate-400 ipad-land:text-xs">{hint}</span>}
      </div>
      {children}
    </section>
  )
}
