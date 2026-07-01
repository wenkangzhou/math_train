import { CheckCircle2, CloudOff, LoaderCircle, Sparkles, WifiOff } from 'lucide-react'
import { useOfflineStatus } from '@/lib/useOfflineStatus'

export function MascotHeader() {
  const { online, cacheStatus } = useOfflineStatus()
  const offlineLabel = !online
    ? '离线练习中'
    : cacheStatus === 'ready'
      ? '已可离线'
      : cacheStatus === 'checking'
        ? '正在准备离线'
        : '需保持联网'
  const offlineIcon = !online
    ? <WifiOff size={15} />
    : cacheStatus === 'ready'
      ? <CheckCircle2 size={15} />
      : cacheStatus === 'checking'
        ? <LoaderCircle size={15} className="animate-spin" />
        : <CloudOff size={15} />

  return (
    <header className="flex items-center justify-between gap-4 px-1">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-soft ring-1 ring-white">
          <img src="/icons/icon-192.png" alt="" className="h-9 w-9 rounded-xl object-cover" />
        </span>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-700 ipad-land:text-2xl">
            数数小火车
          </h1>
          <p className="text-xs font-semibold text-slate-400 ipad-land:text-sm">
            和小火车一起学加减法
          </p>
        </div>
      </div>
      <div className="hidden items-center gap-2 sm:flex">
        <span
          role="status"
          className="flex items-center gap-1.5 rounded-full bg-white/65 px-3 py-2 text-xs font-bold text-sky-deep shadow-sm ring-1 ring-white"
        >
          {offlineIcon} {offlineLabel}
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-white/65 px-3 py-2 text-xs font-bold text-sky-deep shadow-sm ring-1 ring-white">
          <Sparkles size={15} /> 适合 4–7 岁
        </span>
      </div>
    </header>
  )
}
