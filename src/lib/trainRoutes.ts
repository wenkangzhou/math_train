import type { RouteReward, TrainRoute } from '@/types/rewards'

export const TRAIN_ROUTES: TrainRoute[] = [
  {
    id: 'route-rainbow-city',
    trainId: 'head-classic',
    destination: '彩虹中央站',
    missionTitle: '接送小乘客',
    missionDetail: '沿着城市轨道，把小乘客稳稳送到彩虹中央站。',
    cargoEmoji: '🎒',
    stampEmoji: '🌈',
    scenery: {
      theme: 'city',
      journeyLabel: '🏙️ 城市街角 → 🌈 彩虹高架 → 🚉 中央站 → 回到车库',
      waypoints: [
        { label: '城市街角', landmarkEmoji: '🏙️', decorations: ['🚦', '🚌', '🏫'], terrain: 'city' },
        { label: '彩虹高架', landmarkEmoji: '🌈', decorations: ['☁️', '🚲', '🌳'], terrain: 'city' },
        { label: '中央站台', landmarkEmoji: '🚉', decorations: ['🎒', '👋', '🌼'], terrain: 'city' },
      ],
    },
  },
  {
    id: 'route-morning-express',
    trainId: 'engine-red-express',
    destination: '晨光总站',
    missionTitle: '运送加急包裹',
    missionDetail: '穿过三座小桥，把加急包裹准时送到晨光总站。',
    cargoEmoji: '📮',
    stampEmoji: '⚡',
    scenery: {
      theme: 'express',
      journeyLabel: '🌉 晨光大桥 → 🚇 快车隧道 → ⚡ 晨光总站 → 回到车库',
      waypoints: [
        { label: '晨光大桥', landmarkEmoji: '🌉', decorations: ['🌅', '🚗', '☁️'], terrain: 'water' },
        { label: '快车隧道', landmarkEmoji: '🚇', decorations: ['⚡', '⛰️', '🚦'], terrain: 'mountain' },
        { label: '加急站台', landmarkEmoji: '📮', decorations: ['📦', '⏰', '🙌'], terrain: 'city' },
      ],
    },
  },
  {
    id: 'route-forest-yard',
    trainId: 'engine-green-freight',
    destination: '森林货场',
    missionTitle: '运送水果箱',
    missionDetail: '拉着满满的水果箱，慢慢爬上森林小坡。',
    cargoEmoji: '🍎',
    stampEmoji: '🌲',
    scenery: {
      theme: 'forest',
      journeyLabel: '🍎 苹果果园 → 🌲 松林缓坡 → 📦 森林货场 → 回到车库',
      waypoints: [
        { label: '苹果果园', landmarkEmoji: '🍎', decorations: ['🌳', '🧺', '🐝'], terrain: 'field' },
        { label: '松林缓坡', landmarkEmoji: '🌲', decorations: ['🦌', '🍄', '🌿'], terrain: 'forest' },
        { label: '森林货场', landmarkEmoji: '📦', decorations: ['🪵', '🏗️', '🐿️'], terrain: 'forest' },
      ],
    },
  },
  {
    id: 'route-windmill-post',
    trainId: 'engine-yellow-mail',
    destination: '风车邮局',
    missionTitle: '送出彩色信件',
    missionDetail: '带上小镇的彩色信件，开往山坡上的风车邮局。',
    cargoEmoji: '✉️',
    stampEmoji: '💌',
    scenery: {
      theme: 'mail',
      journeyLabel: '🏠 信箱小路 → 🌬️ 风车山坡 → 📮 风车邮局 → 回到车库',
      waypoints: [
        { label: '信箱小路', landmarkEmoji: '🏠', decorations: ['📬', '🐕', '🌷'], terrain: 'field' },
        { label: '风车山坡', landmarkEmoji: '🌬️', decorations: ['🌾', '🦋', '☁️'], terrain: 'field' },
        { label: '风车邮局', landmarkEmoji: '📮', decorations: ['✉️', '💌', '🏡'], terrain: 'city' },
      ],
    },
  },
  {
    id: 'route-sun-rescue',
    trainId: 'engine-orange-rescue',
    destination: '暖阳救援站',
    missionTitle: '运送救援装备',
    missionDetail: '装好救援工具，赶去暖阳救援站帮助伙伴。',
    cargoEmoji: '🧰',
    stampEmoji: '🛟',
    scenery: {
      theme: 'rescue',
      journeyLabel: '🚨 瞭望路口 → 🪨 救援峡谷 → 🛟 暖阳救援站 → 回到车库',
      waypoints: [
        { label: '瞭望路口', landmarkEmoji: '🚨', decorations: ['📡', '🚧', '🐦'], terrain: 'worksite' },
        { label: '救援峡谷', landmarkEmoji: '🪨', decorations: ['🧗', '🧰', '⛑️'], terrain: 'mountain' },
        { label: '暖阳救援站', landmarkEmoji: '🛟', decorations: ['🏥', '🚑', '☀️'], terrain: 'worksite' },
      ],
    },
  },
  {
    id: 'route-blue-harbor',
    trainId: 'engine-navy-harbor',
    destination: '蓝湾港口',
    missionTitle: '整理港口货箱',
    missionDetail: '沿着港口岔道，把货箱送到正确的装卸区。',
    cargoEmoji: '📦',
    stampEmoji: '⚓',
    scenery: {
      theme: 'harbor',
      journeyLabel: '📦 集装箱场 → 🏗️ 蓝湾码头 → 🗼 海角灯塔 → 回到车库',
      waypoints: [
        { label: '集装箱场', landmarkEmoji: '📦', decorations: ['🏗️', '🚧', '🚚'], terrain: 'worksite' },
        { label: '蓝湾码头', landmarkEmoji: '⚓', decorations: ['🚢', '🐟', '🌊'], terrain: 'water' },
        { label: '海角灯塔', landmarkEmoji: '🗼', decorations: ['⛵', '🕊️', '🌊'], terrain: 'coast' },
      ],
    },
  },
  {
    id: 'route-moonlight',
    trainId: 'engine-purple-night',
    destination: '月光总站',
    missionTitle: '护送晚安乘客',
    missionDetail: '轻轻驶过夜色，让乘客在月光总站安心下车。',
    cargoEmoji: '🛏️',
    stampEmoji: '🌙',
    scenery: {
      theme: 'night',
      journeyLabel: '🌙 月影森林 → 🏘️ 晚安小镇 → 🌌 月光总站 → 回到车库',
      waypoints: [
        { label: '月影森林', landmarkEmoji: '🌙', decorations: ['🌲', '🦉', '✨'], terrain: 'night' },
        { label: '晚安小镇', landmarkEmoji: '🏘️', decorations: ['💤', '🛏️', '🐈'], terrain: 'night' },
        { label: '月光总站', landmarkEmoji: '🌌', decorations: ['⭐', '🏮', '☁️'], terrain: 'night' },
      ],
    },
  },
  {
    id: 'route-snow-pass',
    trainId: 'engine-cyan-snow',
    destination: '雪花山口',
    missionTitle: '清理积雪轨道',
    missionDetail: '推开轨道上的积雪，为后面的列车清出道路。',
    cargoEmoji: '🧹',
    stampEmoji: '❄️',
    scenery: {
      theme: 'snow',
      journeyLabel: '🌲 雪松林 → 🌉 冰晶桥 → 🏔️ 雪花山口 → 回到车库',
      waypoints: [
        { label: '雪松林', landmarkEmoji: '🌲', decorations: ['❄️', '🐇', '⛄'], terrain: 'snow' },
        { label: '冰晶桥', landmarkEmoji: '🌉', decorations: ['🧊', '❄️', '🦊'], terrain: 'snow' },
        { label: '雪花山口', landmarkEmoji: '🏔️', decorations: ['🧹', '🚩', '☃️'], terrain: 'mountain' },
      ],
    },
  },
  {
    id: 'route-rainbow-bridge',
    trainId: 'engine-teal-builder',
    destination: '彩桥工地',
    missionTitle: '检修彩虹大桥',
    missionDetail: '带齐扳手和零件，去彩桥工地检查每段轨道。',
    cargoEmoji: '🛠️',
    stampEmoji: '🌉',
    scenery: {
      theme: 'builder',
      journeyLabel: '🧰 工具仓 → 🚧 检修路段 → 🌉 彩虹大桥 → 回到车库',
      waypoints: [
        { label: '工具仓', landmarkEmoji: '🧰', decorations: ['🔩', '⚙️', '🪜'], terrain: 'worksite' },
        { label: '检修路段', landmarkEmoji: '🚧', decorations: ['🛠️', '👷', '🚦'], terrain: 'worksite' },
        { label: '彩虹大桥', landmarkEmoji: '🌉', decorations: ['🌈', '🔧', '✅'], terrain: 'water' },
      ],
    },
  },
  {
    id: 'route-festival-square',
    trainId: 'engine-pink-festival',
    destination: '欢乐广场',
    missionTitle: '送去节日彩旗',
    missionDetail: '载着彩旗和气球，把欢乐送到小镇广场。',
    cargoEmoji: '🎈',
    stampEmoji: '🎉',
    scenery: {
      theme: 'festival',
      journeyLabel: '🎏 彩旗街 → 🎠 旋转乐园 → 🎆 欢乐广场 → 回到车库',
      waypoints: [
        { label: '彩旗街', landmarkEmoji: '🎏', decorations: ['🎈', '🥁', '🎀'], terrain: 'festival' },
        { label: '旋转乐园', landmarkEmoji: '🎠', decorations: ['🎡', '🍭', '🤹'], terrain: 'festival' },
        { label: '欢乐广场', landmarkEmoji: '🎆', decorations: ['🎉', '🎺', '👏'], terrain: 'festival' },
      ],
    },
  },
  {
    id: 'route-cloud-peak',
    trainId: 'engine-slate-mountain',
    destination: '云顶车站',
    missionTitle: '牵引登山物资',
    missionDetail: '稳稳拉着登山物资，一步一步开往云顶车站。',
    cargoEmoji: '🎒',
    stampEmoji: '⛰️',
    scenery: {
      theme: 'mountain',
      journeyLabel: '🌲 松林山脚 → 🦅 鹰嘴崖 → 🏔️ 云顶车站 → 回到车库',
      waypoints: [
        { label: '松林山脚', landmarkEmoji: '🌲', decorations: ['🪨', '🐐', '🌿'], terrain: 'forest' },
        { label: '鹰嘴崖', landmarkEmoji: '🦅', decorations: ['⛰️', '☁️', '🧗'], terrain: 'mountain' },
        { label: '云顶车站', landmarkEmoji: '🏔️', decorations: ['🎒', '🚩', '☁️'], terrain: 'mountain' },
      ],
    },
  },
  {
    id: 'route-breeze-power',
    trainId: 'engine-lime-energy',
    destination: '清风电站',
    missionTitle: '补充绿色能量',
    missionDetail: '沿着清洁轨道，把绿色能量送到清风电站。',
    cargoEmoji: '🔋',
    stampEmoji: '🍃',
    scenery: {
      theme: 'energy',
      journeyLabel: '🌬️ 风车原野 → ☀️ 阳光电场 → 🔋 清风电站 → 回到车库',
      waypoints: [
        { label: '风车原野', landmarkEmoji: '🌬️', decorations: ['🍃', '🌾', '🦋'], terrain: 'energy' },
        { label: '阳光电场', landmarkEmoji: '☀️', decorations: ['🔆', '🌱', '⚡'], terrain: 'energy' },
        { label: '清风电站', landmarkEmoji: '🔋', decorations: ['💡', '🏭', '✅'], terrain: 'energy' },
      ],
    },
  },
  {
    id: 'route-sunrise-coast',
    trainId: 'engine-rose-sunrise',
    destination: '日出海岸站',
    missionTitle: '完成长途旅行',
    missionDetail: '迎着清晨的阳光，带乘客去看看远方的大海。',
    cargoEmoji: '🧳',
    stampEmoji: '☀️',
    scenery: {
      theme: 'coast',
      journeyLabel: '🌅 日出原野 → 🐚 海风崖 → 🏖️ 海岸车站 → 回到车库',
      waypoints: [
        { label: '日出原野', landmarkEmoji: '🌅', decorations: ['🌾', '🐦', '🧳'], terrain: 'field' },
        { label: '海风崖', landmarkEmoji: '🐚', decorations: ['🌊', '🕊️', '⛵'], terrain: 'coast' },
        { label: '海岸车站', landmarkEmoji: '🏖️', decorations: ['☀️', '🌴', '👋'], terrain: 'coast' },
      ],
    },
  },
  {
    id: 'route-galaxy-terminal',
    trainId: 'engine-indigo-galaxy',
    destination: '星河终点站',
    missionTitle: '运送闪亮美梦',
    missionDetail: '穿过星光隧道，把一车美梦送到星河终点站。',
    cargoEmoji: '🌟',
    stampEmoji: '✨',
    scenery: {
      theme: 'galaxy',
      journeyLabel: '🌌 星光隧道 → 🪐 行星原野 → ✨ 星河终点站 → 回到车库',
      waypoints: [
        { label: '星光隧道', landmarkEmoji: '🌌', decorations: ['⭐', '☄️', '✨'], terrain: 'space' },
        { label: '行星原野', landmarkEmoji: '🪐', decorations: ['🚀', '🌙', '🛸'], terrain: 'space' },
        { label: '星河终点站', landmarkEmoji: '✨', decorations: ['🌟', '🔭', '💫'], terrain: 'space' },
      ],
    },
  },
]

const ROUTE_BY_TRAIN = new Map(TRAIN_ROUTES.map((route) => [route.trainId, route]))
const ROUTE_BY_ID = new Map(TRAIN_ROUTES.map((route) => [route.id, route]))

export function getTrainRoute(trainId: string): TrainRoute {
  return ROUTE_BY_TRAIN.get(trainId) ?? TRAIN_ROUTES[0]
}

export function getTrainRouteById(routeId: string): TrainRoute | undefined {
  return ROUTE_BY_ID.get(routeId)
}

export function routeStampId(routeId: string): string {
  return `route-stamp:${routeId}`
}

export function makeRouteReward(
  route: TrainRoute,
  tripCount: number,
  isNewStamp: boolean,
): RouteReward {
  return {
    ...route,
    stampId: routeStampId(route.id),
    tripCount,
    isNewStamp,
  }
}
