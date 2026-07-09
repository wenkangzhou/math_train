import type { Question, VisualTheme } from '@/types/math'
import { themeEmoji, themeLabel } from './visualTheme'

export interface PictureBookScene {
  title: string
  sceneName: string
  sceneEmoji: string
  actor: string
  actorEmoji: string
  itemEmoji: string
  itemLabel: string
  cardClass: string
  groundClass: string
  accentClass: string
  helperLine: string
  storyLine: string
  decorations: string[]
}

interface PictureBookPlace {
  sceneName: string
  sceneEmoji: string
  helperLine: string
  storyLines: string[]
  decorations: string[]
  cardClass: string
  groundClass: string
  accentClass: string
}

interface ThemeScene {
  actors: Array<{ name: string; emoji: string }>
  places: PictureBookPlace[]
}

const THEME_SCENES: Record<VisualTheme, ThemeScene> = {
  car: {
    actors: [
      { name: '小站长', emoji: '🧑‍✈️' },
      { name: '蓝帽司机', emoji: '👩‍✈️' },
      { name: '检票小熊', emoji: '🐻‍❄️' },
    ],
    places: [
      {
        sceneName: '彩虹中转站',
        sceneEmoji: '🚉',
        helperLine: '站台、信号灯和轨道都准备好了，帮忙数清楚车辆吧。',
        storyLines: [
          '在彩虹中转站，{actor}正在给{item}排队。',
          '{actor}听到小铃铛叮当响，站台上的{item}要出发啦。',
        ],
        decorations: ['🚦', '🛤️', '🎫', '🌈'],
        cardClass: 'from-sky-100 via-white to-amber-50 ring-sky-100',
        groundClass: 'bg-slate-300/70',
        accentClass: 'bg-sky-50 text-sky-deep ring-sky-100',
      },
      {
        sceneName: '环城小路',
        sceneEmoji: '🛣️',
        helperLine: '小路弯弯，车辆一辆一辆经过，慢慢看就不会漏。',
        storyLines: [
          '在环城小路上，{actor}正带着{item}兜风。',
          '{actor}把路边小旗插好，准备数一数经过的{item}。',
        ],
        decorations: ['🌳', '🚧', '🏁', '☁️'],
        cardClass: 'from-cyan-100 via-white to-lime-50 ring-cyan-100',
        groundClass: 'bg-emerald-200/70',
        accentClass: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
      },
    ],
  },
  apple: {
    actors: [
      { name: '小松鼠', emoji: '🐿️' },
      { name: '果园小熊', emoji: '🐻' },
      { name: '围裙小兔', emoji: '🐰' },
    ],
    places: [
      {
        sceneName: '阳光果园',
        sceneEmoji: '🌳',
        helperLine: '树下的篮子排好了，帮忙看看水果够不够。',
        storyLines: [
          '阳光果园里，{actor}把{item}放进小篮子。',
          '{actor}站在苹果树下，想把{item}分清楚。',
        ],
        decorations: ['🧺', '🍃', '🐝', '☀️'],
        cardClass: 'from-emerald-100 via-white to-amber-50 ring-emerald-100',
        groundClass: 'bg-emerald-200/80',
        accentClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      },
      {
        sceneName: '苹果派厨房',
        sceneEmoji: '🥧',
        helperLine: '烤箱旁边有小盘子，先数盘子里的苹果。',
        storyLines: [
          '苹果派厨房香香的，{actor}正在准备{item}。',
          '{actor}把{item}摆在小盘子上，想做甜甜的苹果派。',
        ],
        decorations: ['🥣', '🥄', '🧁', '✨'],
        cardClass: 'from-orange-100 via-white to-red-50 ring-orange-100',
        groundClass: 'bg-orange-200/80',
        accentClass: 'bg-orange-50 text-orange-700 ring-orange-100',
      },
    ],
  },
  star: {
    actors: [
      { name: '月亮姐姐', emoji: '🌛' },
      { name: '小星探', emoji: '🧒' },
      { name: '云朵指挥家', emoji: '☁️' },
    ],
    places: [
      {
        sceneName: '星星舞台',
        sceneEmoji: '🌙',
        helperLine: '舞台灯亮起来啦，一起数闪闪的星星。',
        storyLines: [
          '星星舞台上，{actor}正在点亮小灯。',
          '{actor}拉开夜空幕布，想看看有多少颗{item}。',
        ],
        decorations: ['🎭', '✨', '☁️', '🌌'],
        cardClass: 'from-indigo-100 via-white to-yellow-50 ring-indigo-100',
        groundClass: 'bg-indigo-200/70',
        accentClass: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
      },
      {
        sceneName: '银河邮局',
        sceneEmoji: '📮',
        helperLine: '银河邮包一闪一闪，数清楚才能送到月亮家。',
        storyLines: [
          '银河邮局开门啦，{actor}正在整理亮晶晶的{item}。',
          '{actor}把星光邮票排成一列，准备寄给远方的小朋友。',
        ],
        decorations: ['💌', '🪐', '🚀', '🌠'],
        cardClass: 'from-violet-100 via-white to-sky-50 ring-violet-100',
        groundClass: 'bg-violet-200/70',
        accentClass: 'bg-violet-50 text-violet-700 ring-violet-100',
      },
    ],
  },
  fish: {
    actors: [
      { name: '小青蛙', emoji: '🐸' },
      { name: '池塘船长', emoji: '🦦' },
      { name: '泡泡海豚', emoji: '🐬' },
    ],
    places: [
      {
        sceneName: '泡泡池塘',
        sceneEmoji: '🫧',
        helperLine: '小鱼在泡泡里游来游去，慢慢数最稳。',
        storyLines: [
          '泡泡池塘里，{actor}看见{item}排着小队。',
          '{actor}吹出圆圆泡泡，想数一数游过来的{item}。',
        ],
        decorations: ['🌿', '🪷', '🫧', '💧'],
        cardClass: 'from-cyan-100 via-white to-sky-50 ring-cyan-100',
        groundClass: 'bg-cyan-200/80',
        accentClass: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
      },
      {
        sceneName: '珊瑚小湾',
        sceneEmoji: '🪸',
        helperLine: '珊瑚旁边有很多小鱼，先看左边，再看右边。',
        storyLines: [
          '珊瑚小湾亮晶晶，{actor}正在给{item}点名。',
          '{actor}坐在小贝壳上，看着{item}一条一条游过来。',
        ],
        decorations: ['🐚', '🪸', '🦀', '🌊'],
        cardClass: 'from-teal-100 via-white to-blue-50 ring-teal-100',
        groundClass: 'bg-teal-200/80',
        accentClass: 'bg-teal-50 text-teal-700 ring-teal-100',
      },
    ],
  },
  carrot: {
    actors: [
      { name: '小白兔', emoji: '🐰' },
      { name: '菜园小鹿', emoji: '🦌' },
      { name: '浇水小熊', emoji: '🐻' },
    ],
    places: [
      {
        sceneName: '兔兔菜园',
        sceneEmoji: '🥬',
        helperLine: '菜园今天大丰收，帮小伙伴整理胡萝卜。',
        storyLines: [
          '兔兔菜园里，{actor}把{item}放进小推车。',
          '{actor}戴上草帽，准备数一数新拔出来的{item}。',
        ],
        decorations: ['🌱', '🧺', '💦', '🪴'],
        cardClass: 'from-lime-100 via-white to-orange-50 ring-lime-100',
        groundClass: 'bg-lime-200/80',
        accentClass: 'bg-lime-50 text-lime-700 ring-lime-100',
      },
      {
        sceneName: '小小农夫集市',
        sceneEmoji: '🛒',
        helperLine: '小摊上东西很多，先把胡萝卜分成两堆看。',
        storyLines: [
          '小小农夫集市热闹起来，{actor}正在摆好{item}。',
          '{actor}推着小车来到集市，想把{item}数明白。',
        ],
        decorations: ['🏷️', '🧺', '🌽', '☀️'],
        cardClass: 'from-yellow-100 via-white to-lime-50 ring-yellow-100',
        groundClass: 'bg-yellow-200/75',
        accentClass: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
      },
    ],
  },
  block: {
    actors: [
      { name: '工程小象', emoji: '🐘' },
      { name: '积木队长', emoji: '👷' },
      { name: '安全帽小猫', emoji: '🐱' },
    ],
    places: [
      {
        sceneName: '积木工坊',
        sceneEmoji: '🏗️',
        helperLine: '工坊正在搭高高的塔，需要把积木数准确。',
        storyLines: [
          '积木工坊里，{actor}正在搭一座小塔。',
          '{actor}把{item}一块一块摆整齐，准备开工啦。',
        ],
        decorations: ['🧰', '📐', '⚙️', '🪛'],
        cardClass: 'from-orange-100 via-white to-sky-50 ring-orange-100',
        groundClass: 'bg-orange-200/80',
        accentClass: 'bg-orange-50 text-orange-700 ring-orange-100',
      },
      {
        sceneName: '彩色城堡',
        sceneEmoji: '🏰',
        helperLine: '城堡墙要刚刚好，数对积木才能盖稳。',
        storyLines: [
          '彩色城堡前，{actor}正在搬来漂亮的{item}。',
          '{actor}想给城堡加一堵小墙，先把{item}数清楚。',
        ],
        decorations: ['🚩', '🪟', '🌤️', '🧱'],
        cardClass: 'from-rose-100 via-white to-orange-50 ring-rose-100',
        groundClass: 'bg-rose-200/75',
        accentClass: 'bg-rose-50 text-rose-700 ring-rose-100',
      },
    ],
  },
  balloon: {
    actors: [
      { name: '小丑鱼气球师', emoji: '🤹' },
      { name: '广场小猫', emoji: '🐱' },
      { name: '彩带小熊', emoji: '🐻' },
    ],
    places: [
      {
        sceneName: '气球广场',
        sceneEmoji: '🎪',
        helperLine: '彩色气球飞起来啦，抓住机会数一数。',
        storyLines: [
          '气球广场上，{actor}牵着一串彩色{item}。',
          '{actor}听见音乐响起，准备把{item}分给小朋友。',
        ],
        decorations: ['🎈', '🎊', '🎵', '☁️'],
        cardClass: 'from-pink-100 via-white to-amber-50 ring-pink-100',
        groundClass: 'bg-pink-200/70',
        accentClass: 'bg-pink-50 text-pink-700 ring-pink-100',
      },
      {
        sceneName: '云朵游乐园',
        sceneEmoji: '🎡',
        helperLine: '气球在云朵旁边飘，先抓住一组，再看另一组。',
        storyLines: [
          '云朵游乐园开门啦，{actor}正在数飘起来的{item}。',
          '{actor}站在摩天轮旁边，看着{item}慢慢升高。',
        ],
        decorations: ['🎡', '🍭', '☁️', '🌟'],
        cardClass: 'from-fuchsia-100 via-white to-sky-50 ring-fuchsia-100',
        groundClass: 'bg-fuchsia-200/70',
        accentClass: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100',
      },
    ],
  },
  duck: {
    actors: [
      { name: '鸭妈妈', emoji: '🦆' },
      { name: '河边小狗', emoji: '🐶' },
      { name: '荷叶小龟', emoji: '🐢' },
    ],
    places: [
      {
        sceneName: '鸭鸭小河',
        sceneEmoji: '🌿',
        helperLine: '小鸭排队过小河，一只一只看清楚。',
        storyLines: [
          '鸭鸭小河边，{actor}正在带{item}排队。',
          '{actor}站在荷叶旁边，想数清楚游来的{item}。',
        ],
        decorations: ['🪷', '🌿', '💧', '☀️'],
        cardClass: 'from-teal-100 via-white to-yellow-50 ring-teal-100',
        groundClass: 'bg-teal-200/80',
        accentClass: 'bg-teal-50 text-teal-700 ring-teal-100',
      },
      {
        sceneName: '雨后小水洼',
        sceneEmoji: '🌦️',
        helperLine: '水洼边有小脚印，跟着脚印数小鸭。',
        storyLines: [
          '雨后小水洼亮亮的，{actor}发现好多{item}。',
          '{actor}撑着小伞，看见{item}一只一只走过来。',
        ],
        decorations: ['☂️', '👣', '🌈', '💧'],
        cardClass: 'from-sky-100 via-white to-teal-50 ring-sky-100',
        groundClass: 'bg-sky-200/75',
        accentClass: 'bg-sky-50 text-sky-700 ring-sky-100',
      },
    ],
  },
}

function hashQuestion(q: Question, salt = ''): number {
  let h = 0
  for (const c of `${q.id}-${q.visualTheme}-${q.pattern}-${salt}`) {
    h = (h * 31 + c.charCodeAt(0)) >>> 0
  }
  return h
}

function stablePick<T>(arr: T[], q: Question, salt: string): T {
  return arr[hashQuestion(q, salt) % arr.length]
}

function fillTemplate(template: string, scene: {
  actor: string
  item: string
  sceneName: string
}): string {
  const text = template
    .replace(/\{actor\}/g, scene.actor)
    .replace(/\{item\}/g, scene.item)

  return text.includes(scene.sceneName) ? text : `${scene.sceneName}里，${text}`
}

function titleFor(q: Question, sceneName: string): string {
  switch (q.pattern) {
    case 'a-plus-b-equals-blank':
      return `${sceneName}来了新朋友`
    case 'a-minus-b-equals-blank':
      return `${sceneName}出发啦`
    case 'a-plus-blank-equals-c':
      return `${sceneName}还差一点点`
    case 'blank-plus-b-equals-c':
      return `${sceneName}找原来的伙伴`
    case 'a-minus-blank-equals-c':
      return `${sceneName}谁离开了`
    case 'blank-minus-b-equals-c':
      return `${sceneName}想想原来有多少`
    default:
      return `${sceneName}数一数`
  }
}

export function getPictureBookScene(q: Question): PictureBookScene {
  const meta = THEME_SCENES[q.visualTheme] ?? THEME_SCENES.star
  const place = stablePick(meta.places, q, 'place')
  const actor = stablePick(meta.actors, q, 'actor')
  const itemLabel = themeLabel(q.visualTheme)
  const storyLine = fillTemplate(
    stablePick(place.storyLines, q, 'story-line'),
    { actor: actor.name, item: itemLabel, sceneName: place.sceneName },
  )

  return {
    title: titleFor(q, place.sceneName),
    sceneName: place.sceneName,
    sceneEmoji: place.sceneEmoji,
    actor: actor.name,
    actorEmoji: actor.emoji,
    itemEmoji: themeEmoji(q.visualTheme),
    itemLabel,
    cardClass: place.cardClass,
    groundClass: place.groundClass,
    accentClass: place.accentClass,
    helperLine: place.helperLine,
    storyLine,
    decorations: place.decorations,
  }
}

function actionWords(theme: Question['visualTheme']): { arrive: string; depart: string } {
  if (theme === 'car') return { arrive: '开来', depart: '开走' }
  if (theme === 'fish' || theme === 'duck') return { arrive: '游来', depart: '游走' }
  if (theme === 'balloon') return { arrive: '飞来', depart: '飞走' }
  if (theme === 'block') return { arrive: '搬来', depart: '搬走' }
  if (theme === 'star') return { arrive: '点亮', depart: '收起' }
  return { arrive: '放进来', depart: '拿走' }
}

export function pictureBookQuestionText(q: Question): string {
  const scene = getPictureBookScene(q)
  const { arrive, depart } = actionWords(q.visualTheme)
  const L = q.fullLeft
  const R = q.fullRight
  const C = q.fullResult
  const label = scene.itemLabel

  switch (q.pattern) {
    case 'a-plus-b-equals-blank':
      return `${scene.storyLine}先有 ${L} 个${label}，又${arrive} ${R} 个。现在一共有几个？`
    case 'a-minus-b-equals-blank':
      return `${scene.storyLine}原来有 ${L} 个${label}，${depart} ${R} 个。还剩几个？`
    case 'a-plus-blank-equals-c':
      return `${scene.storyLine}已经有 ${L} 个${label}，想凑成 ${C} 个。还需要几个${label}？`
    case 'blank-plus-b-equals-c':
      return `${scene.storyLine}后来${arrive} ${R} 个${label}，现在一共有 ${C} 个。原来有几个？`
    case 'a-minus-blank-equals-c':
      return `${scene.storyLine}原来有 ${L} 个${label}，有一些${depart}后还剩 ${C} 个。${depart}了几个？`
    case 'blank-minus-b-equals-c':
      return `${scene.storyLine}${depart} ${R} 个${label}后，还剩 ${C} 个。原来有几个？`
    default:
      return `${scene.storyLine}答案是多少？`
  }
}

export function enrichPictureBookQuestion(q: Question): Question {
  const scene = getPictureBookScene(q)
  return {
    ...q,
    story: pictureBookQuestionText(q),
    storyActor: scene.actor,
    storyTitle: scene.title,
    storyScene: scene.sceneName,
  }
}
