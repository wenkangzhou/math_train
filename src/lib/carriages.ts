// 数数小火车 / Math Train — 可收集车厢目录（首版用 emoji，保留替换接口）

import type { Carriage } from '@/types/rewards'

// 解锁阈值按累计星星递增；车头与首节数字车厢初始拥有。
export const CARRIAGE_CATALOG: Carriage[] = [
  { id: 'head-classic', kind: 'head', name: '经典车头', emoji: '🚂', unlockAtStars: 0 },
  { id: 'car-num-1', kind: 'number', name: '数字 1 车厢', emoji: '1️⃣', unlockAtStars: 0 },
  { id: 'car-num-2', kind: 'number', name: '数字 2 车厢', emoji: '2️⃣', unlockAtStars: 10 },
  { id: 'car-animal-duck', kind: 'animal', name: '小鸭车厢', emoji: '🦆', unlockAtStars: 20 },
  { id: 'car-fruit-apple', kind: 'fruit', name: '苹果车厢', emoji: '🍎', unlockAtStars: 30 },
  { id: 'head-red', kind: 'head', name: '红色车头', emoji: '🚆', unlockAtStars: 40 },
  { id: 'car-star', kind: 'star', name: '星星车厢', emoji: '⭐', unlockAtStars: 50 },
  { id: 'car-rainbow', kind: 'rainbow', name: '彩虹车厢', emoji: '🌈', unlockAtStars: 70 },
]

export const DEFAULT_HEAD_ID = 'head-classic'
export const INITIAL_CARRIAGE_IDS = ['head-classic', 'car-num-1']

const MAP: Record<string, Carriage> = CARRIAGE_CATALOG.reduce(
  (acc, c) => {
    acc[c.id] = c
    return acc
  },
  {} as Record<string, Carriage>,
)

export function getCarriage(id: string): Carriage | undefined {
  return MAP[id]
}

// 给定累计星星，返回应当解锁的全部车厢 id
export function carriagesUnlockedByStars(stars: number): string[] {
  return CARRIAGE_CATALOG.filter((c) => stars >= c.unlockAtStars).map((c) => c.id)
}
