// 数数小火车 / Math Train — 故事题文案（PRD 功能十四）
// 1~2 句话，低幼、不出现成人化场景；支持语音朗读。

import type { Question } from '@/types/math'
import { themeLabel } from './visualTheme'

const ACTORS = ['小熊', '小兔', '小猫', '小狗', '小鸭', '小猴']

// 主角按题目 id 稳定选取（同题一致）
function actorFor(q: Question): string {
  let h = 0
  for (const c of q.id) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return ACTORS[h % ACTORS.length]
}

// 不同主题的「来 / 走」措辞
function verbs(theme: Question['visualTheme']): { come: string; leave: string } {
  if (theme === 'car') return { come: '又开来了', leave: '开走了' }
  if (theme === 'fish' || theme === 'duck') return { come: '又游来了', leave: '游走了' }
  if (theme === 'balloon') return { come: '又飞来了', leave: '飞走了' }
  return { come: '又拿来了', leave: '拿走了' }
}

// 把题目转成故事文本（缺项题引导寻找未知数）。
export function storyText(q: Question): string {
  const label = themeLabel(q.visualTheme)
  const actor = actorFor(q)
  const { come, leave } = verbs(q.visualTheme)
  const L = q.fullLeft
  const R = q.fullRight
  const C = q.fullResult

  switch (q.pattern) {
    case 'a-plus-b-equals-blank':
      return `${actor}有 ${L} 个${label}，${come} ${R} 个。现在一共有几个？`
    case 'a-minus-b-equals-blank':
      return `${actor}有 ${L} 个${label}，${leave} ${R} 个。还剩几个？`
    case 'a-plus-blank-equals-c':
      return `${actor}已经有 ${L} 个${label}，还差几个就有 ${C} 个？`
    case 'blank-plus-b-equals-c':
      return `${actor}${come} ${R} 个${label}，现在一共有 ${C} 个。原来有几个？`
    case 'a-minus-blank-equals-c':
      return `${actor}原来有 ${L} 个${label}，${leave}一些后还剩 ${C} 个。${leave}了几个？`
    case 'blank-minus-b-equals-c':
      return `${actor}的${label}${leave} ${R} 个后，还剩 ${C} 个。原来有几个？`
    default:
      return ''
  }
}
