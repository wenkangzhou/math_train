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
}

interface ThemeScene {
  sceneName: string
  sceneEmoji: string
  actors: Array<{ name: string; emoji: string }>
  helperLine: string
  cardClass: string
  groundClass: string
  accentClass: string
}

const THEME_SCENES: Record<VisualTheme, ThemeScene> = {
  car: {
    sceneName: '小镇车站',
    sceneEmoji: '🚉',
    actors: [
      { name: '小站长', emoji: '🧑‍✈️' },
      { name: '蓝帽司机', emoji: '👩‍✈️' },
    ],
    helperLine: '站台上来来往往，帮忙数清楚车辆吧。',
    cardClass: 'from-sky-100 via-white to-amber-50 ring-sky-100',
    groundClass: 'bg-slate-300/70',
    accentClass: 'bg-sky-50 text-sky-deep ring-sky-100',
  },
  apple: {
    sceneName: '阳光果园',
    sceneEmoji: '🌳',
    actors: [
      { name: '小松鼠', emoji: '🐿️' },
      { name: '果园小熊', emoji: '🐻' },
    ],
    helperLine: '树下的篮子排好了，帮忙看看水果够不够。',
    cardClass: 'from-emerald-100 via-white to-amber-50 ring-emerald-100',
    groundClass: 'bg-emerald-200/80',
    accentClass: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  star: {
    sceneName: '星星舞台',
    sceneEmoji: '🌙',
    actors: [
      { name: '月亮姐姐', emoji: '🌛' },
      { name: '小星探', emoji: '🧒' },
    ],
    helperLine: '舞台灯亮起来啦，一起数闪闪的星星。',
    cardClass: 'from-indigo-100 via-white to-yellow-50 ring-indigo-100',
    groundClass: 'bg-indigo-200/70',
    accentClass: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  },
  fish: {
    sceneName: '泡泡池塘',
    sceneEmoji: '🫧',
    actors: [
      { name: '小青蛙', emoji: '🐸' },
      { name: '池塘船长', emoji: '🦦' },
    ],
    helperLine: '小鱼在泡泡里游来游去，慢慢数最稳。',
    cardClass: 'from-cyan-100 via-white to-sky-50 ring-cyan-100',
    groundClass: 'bg-cyan-200/80',
    accentClass: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
  },
  carrot: {
    sceneName: '兔兔菜园',
    sceneEmoji: '🥬',
    actors: [
      { name: '小白兔', emoji: '🐰' },
      { name: '菜园小鹿', emoji: '🦌' },
    ],
    helperLine: '菜园今天大丰收，帮小伙伴整理胡萝卜。',
    cardClass: 'from-lime-100 via-white to-orange-50 ring-lime-100',
    groundClass: 'bg-lime-200/80',
    accentClass: 'bg-lime-50 text-lime-700 ring-lime-100',
  },
  block: {
    sceneName: '积木工坊',
    sceneEmoji: '🏗️',
    actors: [
      { name: '工程小象', emoji: '🐘' },
      { name: '积木队长', emoji: '👷' },
    ],
    helperLine: '工坊正在搭高高的塔，需要把积木数准确。',
    cardClass: 'from-orange-100 via-white to-sky-50 ring-orange-100',
    groundClass: 'bg-orange-200/80',
    accentClass: 'bg-orange-50 text-orange-700 ring-orange-100',
  },
  balloon: {
    sceneName: '气球广场',
    sceneEmoji: '🎪',
    actors: [
      { name: '小丑鱼气球师', emoji: '🤹' },
      { name: '广场小猫', emoji: '🐱' },
    ],
    helperLine: '彩色气球飞起来啦，抓住机会数一数。',
    cardClass: 'from-pink-100 via-white to-amber-50 ring-pink-100',
    groundClass: 'bg-pink-200/70',
    accentClass: 'bg-pink-50 text-pink-700 ring-pink-100',
  },
  duck: {
    sceneName: '鸭鸭小河',
    sceneEmoji: '🌿',
    actors: [
      { name: '鸭妈妈', emoji: '🦆' },
      { name: '河边小狗', emoji: '🐶' },
    ],
    helperLine: '小鸭排队过小河，一只一只看清楚。',
    cardClass: 'from-teal-100 via-white to-yellow-50 ring-teal-100',
    groundClass: 'bg-teal-200/80',
    accentClass: 'bg-teal-50 text-teal-700 ring-teal-100',
  },
}

function hashQuestion(q: Question): number {
  let h = 0
  for (const c of `${q.id}-${q.visualTheme}`) {
    h = (h * 31 + c.charCodeAt(0)) >>> 0
  }
  return h
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
  const actor = meta.actors[hashQuestion(q) % meta.actors.length]
  return {
    title: titleFor(q, meta.sceneName),
    sceneName: meta.sceneName,
    sceneEmoji: meta.sceneEmoji,
    actor: actor.name,
    actorEmoji: actor.emoji,
    itemEmoji: themeEmoji(q.visualTheme),
    itemLabel: themeLabel(q.visualTheme),
    cardClass: meta.cardClass,
    groundClass: meta.groundClass,
    accentClass: meta.accentClass,
    helperLine: meta.helperLine,
  }
}

function verbs(theme: Question['visualTheme']): { come: string; leave: string } {
  if (theme === 'car') return { come: '又开来了', leave: '开走了' }
  if (theme === 'fish' || theme === 'duck') return { come: '又游来了', leave: '游走了' }
  if (theme === 'balloon') return { come: '又飞来了', leave: '飞走了' }
  if (theme === 'block') return { come: '又搬来了', leave: '搬走了' }
  return { come: '又拿来了', leave: '拿走了' }
}

export function pictureBookQuestionText(q: Question): string {
  const scene = getPictureBookScene(q)
  const { come, leave } = verbs(q.visualTheme)
  const L = q.fullLeft
  const R = q.fullRight
  const C = q.fullResult
  const label = scene.itemLabel

  switch (q.pattern) {
    case 'a-plus-b-equals-blank':
      return `${scene.actor}先准备了 ${L} 个${label}，${come} ${R} 个。现在一共有几个？`
    case 'a-minus-b-equals-blank':
      return `${scene.actor}原来有 ${L} 个${label}，${leave} ${R} 个。还剩几个？`
    case 'a-plus-blank-equals-c':
      return `${scene.actor}已经有 ${L} 个${label}，想凑成 ${C} 个。还差几个？`
    case 'blank-plus-b-equals-c':
      return `${scene.actor}看到${come} ${R} 个${label}，现在一共有 ${C} 个。原来有几个？`
    case 'a-minus-blank-equals-c':
      return `${scene.actor}原来有 ${L} 个${label}，有一些${leave}后还剩 ${C} 个。${leave}几个？`
    case 'blank-minus-b-equals-c':
      return `${scene.actor}发现${label}${leave} ${R} 个后，还剩 ${C} 个。原来有几个？`
    default:
      return `${scene.actor}想请你帮忙数一数。答案是多少？`
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
