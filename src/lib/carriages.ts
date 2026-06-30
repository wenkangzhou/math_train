// 数数小火车 / Math Train — 原创功能机车收藏目录

import type { Carriage } from '@/types/rewards'

// 只有第一辆为初始拥有；之后的间隔逐步拉大，形成真正的长期收藏目标。
export const CARRIAGE_CATALOG: Carriage[] = [
  {
    id: 'head-classic', kind: 'head', name: '蓝风号', functionLabel: '城市客运',
    personality: '可靠又爱笑', description: '每天最早出发，把大家稳稳送到目的地。',
    livery: 'blue', emoji: '🏙️', unlockAtStars: 0,
  },
  {
    id: 'engine-red-express', kind: 'head', name: '赤焰号', functionLabel: '快速客运',
    personality: '热情又勇敢', description: '最喜欢准时抵达，是车库里的速度小冠军。',
    livery: 'red', emoji: '⚡', unlockAtStars: 50,
  },
  {
    id: 'engine-green-freight', kind: 'head', name: '青林号', functionLabel: '重载货运',
    personality: '力气大又耐心', description: '再重的货箱也不怕，总会认真检查每一次装载。',
    livery: 'green', emoji: '📦', unlockAtStars: 130,
  },
  {
    id: 'engine-yellow-mail', kind: 'head', name: '金邮号', functionLabel: '邮政专列',
    personality: '细心又守时', description: '带着信件穿过小镇，把每份想念送到家。',
    livery: 'yellow', emoji: '✉️', unlockAtStars: 240,
  },
  {
    id: 'engine-orange-rescue', kind: 'head', name: '暖阳号', functionLabel: '救援机车',
    personality: '温暖又果断', description: '听见求助就马上出发，是大家最安心的伙伴。',
    livery: 'orange', emoji: '🛟', unlockAtStars: 380,
  },
  {
    id: 'engine-navy-harbor', kind: 'head', name: '海港号', functionLabel: '港口调车',
    personality: '沉稳又聪明', description: '熟悉每一条岔道，能把货车安排得整整齐齐。',
    livery: 'navy', emoji: '⚓', unlockAtStars: 550,
  },
  {
    id: 'engine-purple-night', kind: 'head', name: '极光号', functionLabel: '夜间卧铺',
    personality: '安静又体贴', description: '在月光下轻轻行驶，让乘客一觉睡到清晨。',
    livery: 'purple', emoji: '🌙', unlockAtStars: 760,
  },
  {
    id: 'engine-cyan-snow', kind: 'head', name: '雪峰号', functionLabel: '清雪作业',
    personality: '冷静又坚强', description: '大雪天也会清出安全轨道，让伙伴顺利通行。',
    livery: 'cyan', emoji: '❄️', unlockAtStars: 1000,
  },
  {
    id: 'engine-teal-builder', kind: 'head', name: '工程号', functionLabel: '线路检修',
    personality: '好奇又专注', description: '带着工具巡查铁轨，最擅长发现小问题。',
    livery: 'teal', emoji: '🛠️', unlockAtStars: 1300,
  },
  {
    id: 'engine-pink-festival', kind: 'head', name: '花火号', functionLabel: '节日专列',
    personality: '活泼又会逗笑', description: '车到哪里，欢乐和掌声就跟到哪里。',
    livery: 'pink', emoji: '🎉', unlockAtStars: 1650,
  },
  {
    id: 'engine-slate-mountain', kind: 'head', name: '山岳号', functionLabel: '山区牵引',
    personality: '坚定又踏实', description: '擅长攀上陡坡，是高山线路的可靠队长。',
    livery: 'slate', emoji: '⛰️', unlockAtStars: 2050,
  },
  {
    id: 'engine-lime-energy', kind: 'head', name: '绿电号', functionLabel: '电力机车',
    personality: '清爽又高效', description: '安静省电地飞驰，最爱干净的蓝天。',
    livery: 'lime', emoji: '⚡', unlockAtStars: 2500,
  },
  {
    id: 'engine-rose-sunrise', kind: 'head', name: '晨曦号', functionLabel: '长途客运',
    personality: '开朗又有耐力', description: '迎着日出跨越远方，总能带回新故事。',
    livery: 'rose', emoji: '☀️', unlockAtStars: 3000,
  },
  {
    id: 'engine-indigo-galaxy', kind: 'head', name: '星河号', functionLabel: '梦幻特快',
    personality: '神秘又有想象力', description: '沿着星光轨道出发，把美梦送往下一站。',
    livery: 'indigo', emoji: '✨', unlockAtStars: 3600,
  },
]

export const DEFAULT_HEAD_ID = 'head-classic'
export const INITIAL_CARRIAGE_IDS = ['head-classic']

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
