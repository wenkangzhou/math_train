// 数数小火车 / Math Train — 第二版：奖励 / 收藏系统类型

// 车厢类别（「我的小火车」收集主题）
export type CarriageKind =
  | 'head' // 车头
  | 'number' // 数字车厢
  | 'animal' // 动物车厢
  | 'fruit' // 水果车厢
  | 'star' // 星星车厢
  | 'rainbow' // 彩虹车厢

// 一节可收集车厢
export interface Carriage {
  id: string
  kind: CarriageKind
  name: string
  emoji: string // 首版用 emoji/简单 SVG，保留替换接口
  // 解锁所需累计星星（0=初始拥有）
  unlockAtStars: number
}

// 连续练习天数
export interface StreakState {
  current: number
  longest: number
  lastActiveDate: string // yyyy-mm-dd
}

// 单个档案的奖励状态
export interface RewardState {
  coins: number
  stars: number // 累计获得的星星（用于解锁）
  stickers: string[] // 已获得贴纸 id
  unlockedCarriages: string[] // 已解锁车厢 id
  selectedHead: string // 当前车头 id
  trainOrder: string[] // 「我的小火车」车厢排列
  streak: StreakState
}
