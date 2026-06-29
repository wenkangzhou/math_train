// 数数小火车 / Math Train — 本地日期工具（统一用本地时区的 yyyy-mm-dd）

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayStr(): string {
  return toDateStr(new Date())
}

// 两个 yyyy-mm-dd 之间的天数差（b - a）
export function dayDiff(a: string, b: string): number {
  const da = new Date(`${a}T00:00:00`)
  const db = new Date(`${b}T00:00:00`)
  return Math.round((db.getTime() - da.getTime()) / 86_400_000)
}

// 本周已练天数所需：返回本周一的日期字符串
export function startOfWeekStr(d = new Date()): string {
  const copy = new Date(d)
  const day = (copy.getDay() + 6) % 7 // 周一=0
  copy.setDate(copy.getDate() - day)
  return toDateStr(copy)
}
