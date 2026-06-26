import type { ReactNode } from 'react'

interface SectionCardProps {
  title: string
  hint?: string
  children: ReactNode
}

// 圆角卡片容器，设置页的每个设置项使用
export function SectionCard({ title, hint, children }: SectionCardProps) {
  return (
    <section className="rounded-card bg-white/85 p-5 shadow-soft backdrop-blur sm:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-xl font-bold text-slate-700 sm:text-2xl">{title}</h2>
        {hint && <span className="text-sm text-slate-400">{hint}</span>}
      </div>
      {children}
    </section>
  )
}
