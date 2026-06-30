// 数数小火车 / Math Train — 第二版：奖励 / 收藏系统类型

// 奖励统一为可驾驶的机车，不再混用数字、动物等车厢主题。
export type CarriageKind = 'head'

export type TrainLivery =
  | 'blue'
  | 'red'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'navy'
  | 'purple'
  | 'cyan'
  | 'teal'
  | 'pink'
  | 'slate'
  | 'lime'
  | 'rose'
  | 'indigo'

// 一辆可收集、可切换使用的原创机车。
export interface Carriage {
  id: string
  kind: CarriageKind
  name: string
  functionLabel: string
  personality: string
  description: string
  livery: TrainLivery
  emoji: string // 仅作为功能徽标，机车主体由应用内插画绘制。
  // 解锁所需累计星星（0=初始拥有）
  unlockAtStars: number
}

// 连续练习天数
export interface StreakState {
  current: number
  longest: number
  lastActiveDate: string // yyyy-mm-dd
}

export interface TrainRoute {
  id: string
  trainId: string
  destination: string
  missionTitle: string
  missionDetail: string
  cargoEmoji: string
  stampEmoji: string
}

export interface RouteReward extends TrainRoute {
  stampId: string
  tripCount: number
  isNewStamp: boolean
}

// 单个档案的奖励状态
export interface RewardState {
  coins: number
  stars: number // 累计获得的星星（用于解锁）
  stickers: string[] // 已获得贴纸 id
  unlockedCarriages: string[] // 已解锁机车 id（字段名保留以兼容旧存储）
  selectedHead: string // 当前车头 id
  trainOrder: string[] // 已解锁机车陈列顺序（字段名保留以兼容旧存储）
  routeTrips: Record<string, number> // 每条专属路线累计到站次数
  streak: StreakState
}
