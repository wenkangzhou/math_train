import { TrainMascot } from '@/components/common/TrainMascot'
import { Star } from 'lucide-react'

interface MascotHeaderProps {
  totalStars: number
}

export function MascotHeader({ totalStars }: MascotHeaderProps) {
  return (
    <header className="relative flex flex-col items-center pb-2 pt-6 text-center">
      {totalStars > 0 && (
        <div className="absolute right-0 top-4 flex items-center gap-1 rounded-full bg-white/80 px-3 py-1.5 text-amber-500 shadow-soft">
          <Star size={20} fill="currentColor" />
          <span className="font-extrabold">{totalStars}</span>
        </div>
      )}
      <TrainMascot mood="idle" size={96} />
      <h1 className="mt-1 text-4xl font-extrabold text-sky-deep drop-shadow-sm sm:text-5xl">
        数数小火车
      </h1>
      <p className="mt-1 text-lg font-medium text-slate-500">
        和小火车一起学加减法
      </p>
    </header>
  )
}
