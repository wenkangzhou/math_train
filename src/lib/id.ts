// 数数小火车 / Math Train — 唯一 id 生成（本地用，弱唯一即可）

let counter = 0

export function genId(prefix = 'id'): string {
  counter += 1
  const t =
    typeof Date !== 'undefined' ? Date.now().toString(36) : 'x'
  const r = Math.random().toString(36).slice(2, 7)
  return `${prefix}_${t}_${r}_${counter}`
}
