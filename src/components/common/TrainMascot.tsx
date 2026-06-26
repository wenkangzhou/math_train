import { motion, useReducedMotion } from 'framer-motion'

export type MascotMood = 'happy' | 'thinking' | 'cheer' | 'idle'

interface TrainMascotProps {
  mood?: MascotMood
  size?: number
}

// 数数小火车吉祥物：仿「托马斯小火车」的蓝色水柜机车（正式内联 SVG 插画）。
// 保持 { mood, size } API 不变，练习页角落与结果页直接调用。
const C = {
  blue: '#2f8fd6',
  blueDark: '#1f6cae',
  face: '#cdd6dc',
  faceEdge: '#a9b6bf',
  ink: '#33424d',
  red: '#e8503f',
  yellow: '#ffd24d',
  window: '#bfe6ff',
  smoke: '#e3f1fb',
  rim: '#9aa6ae',
}

// 托马斯式表情：白眼珠 + 黑瞳 + 眉毛 + 嘴，画在前烟箱大圆脸上
function Face({ mood }: { mood: MascotMood }) {
  // 瞳孔朝向：thinking 看向右上
  const px = mood === 'thinking' ? 0.8 : 0
  const py = mood === 'thinking' ? -1.2 : mood === 'idle' ? 0.6 : 0

  // 眉毛
  const brows =
    mood === 'happy' || mood === 'cheer' ? (
      <>
        <path d="M14.5 41.5 q3 -2.2 6 -0.6" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M25.5 40.9 q3 -1.6 6 0.6" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </>
    ) : mood === 'thinking' ? (
      <>
        <path d="M14 42 q3 -2.6 6 -1" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <path d="M25.5 39.5 q3 -0.4 6 1.4" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </>
    ) : (
      <>
        <path d="M14.5 42.5 h6" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M25.5 42.5 h6" stroke={C.ink} strokeWidth="1.8" strokeLinecap="round" />
      </>
    )

  const mouth =
    mood === 'cheer' ? (
      <path d="M16 61 q9 10 18 0 q-9 4 -18 0 z" fill="#b23b30" stroke={C.ink} strokeWidth="1.2" strokeLinejoin="round" />
    ) : mood === 'happy' ? (
      <path d="M16 60 q9 8 18 0" fill="none" stroke={C.ink} strokeWidth="2.4" strokeLinecap="round" />
    ) : mood === 'thinking' ? (
      <path d="M20 62 q5 -2 9 0" fill="none" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" />
    ) : (
      <path d="M18 61 q7 5 14 0" fill="none" stroke={C.ink} strokeWidth="2.2" strokeLinecap="round" />
    )

  return (
    <g>
      {/* 烟箱圆脸 */}
      <circle cx="25" cy="52" r="19" fill={C.face} stroke={C.faceEdge} strokeWidth="2.2" />
      <circle cx="25" cy="52" r="19" fill="none" stroke="#fff" strokeWidth="0.8" opacity="0.6" />
      {brows}
      {/* 眼睛 */}
      <ellipse cx="19" cy="49" rx="3.6" ry="4.6" fill="#fff" stroke={C.rim} strokeWidth="0.6" />
      <ellipse cx="31" cy="49" rx="3.6" ry="4.6" fill="#fff" stroke={C.rim} strokeWidth="0.6" />
      <circle cx={19 + px} cy={50 + py} r="1.9" fill={C.ink} />
      <circle cx={31 + px} cy={50 + py} r="1.9" fill={C.ink} />
      {mouth}
    </g>
  )
}

function Wheel({ cx, r }: { cx: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy="80" r={r} fill={C.ink} />
      <circle cx={cx} cy="80" r={r * 0.5} fill={C.red} />
      <circle cx={cx} cy="80" r={r * 0.16} fill="#fff" />
    </g>
  )
}

export function TrainMascot({ mood = 'idle', size = 88 }: TrainMascotProps) {
  const reduce = useReducedMotion()

  const animate = reduce
    ? {}
    : mood === 'cheer'
      ? { y: [0, -10, 0], rotate: [0, -4, 4, 0] }
      : mood === 'happy'
        ? { y: [0, -7, 0] }
        : mood === 'thinking'
          ? { rotate: [0, -2.5, 2.5, 0] }
          : { y: [0, -4, 0] } // idle 呼吸

  const duration =
    mood === 'cheer' ? 0.7 : mood === 'thinking' ? 1.4 : mood === 'idle' ? 2.6 : 0.6

  return (
    <div className="relative inline-flex" aria-hidden="true">
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow"
        animate={animate}
        transition={{ duration, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
      >
        {/* 烟雾 */}
        {!reduce ? (
          [
            { cx: 50, cy: 20, r: 3, d: 0 },
            { cx: 47, cy: 13, r: 3.6, d: 0.3 },
            { cx: 52, cy: 7, r: 4.2, d: 0.6 },
          ].map((p, i) => (
            <motion.circle
              key={i}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill={C.smoke}
              animate={{ y: [0, -6, -12], opacity: [0.9, 0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: p.d, ease: 'easeOut' }}
            />
          ))
        ) : (
          <g>
            <circle cx="50" cy="20" r="3" fill={C.smoke} />
            <circle cx="47" cy="13" r="3.6" fill={C.smoke} opacity="0.7" />
            <circle cx="52" cy="7" r="4.2" fill={C.smoke} opacity="0.45" />
          </g>
        )}

        {/* 烟囱 */}
        <rect x="44" y="24" width="14" height="5" rx="2" fill={C.ink} />
        <rect x="46" y="27" width="10" height="15" rx="2" fill={C.ink} />
        {/* 蒸汽圆顶 */}
        <ellipse cx="64" cy="38" rx="5.5" ry="5" fill={C.ink} />

        {/* 车厢（驾驶舱） */}
        <rect x="66" y="22" width="26" height="7" rx="3" fill={C.blueDark} />
        <rect x="68" y="28" width="22" height="42" rx="5" fill={C.blue} />
        <rect x="72" y="35" width="14" height="14" rx="3" fill={C.window} stroke="#fff" strokeWidth="2" />

        {/* 锅炉 / 水柜主体 */}
        <rect x="16" y="40" width="58" height="30" rx="14" fill={C.blue} />
        {/* 侧面编号 1 */}
        <circle cx="55" cy="55" r="7" fill={C.yellow} stroke="#fff" strokeWidth="1.5" />
        <text x="55" y="59.5" textAnchor="middle" fontSize="10" fontWeight="800" fill={C.red} fontFamily="'Baloo 2','PingFang SC',system-ui,sans-serif">1</text>

        {/* 红色脚踏板 + 缓冲梁 */}
        <rect x="10" y="66" width="80" height="7" rx="3" fill={C.red} />
        <rect x="9" y="60" width="5" height="12" rx="2" fill={C.red} />
        {/* 底盘 */}
        <rect x="14" y="72" width="72" height="5" rx="2.5" fill={C.ink} />

        {/* 车轮 */}
        <Wheel cx={26} r={10} />
        <Wheel cx={52} r={9} />
        <Wheel cx={78} r={7} />

        {/* 脸 */}
        <Face mood={mood} />

        {/* 心情装饰 */}
        {mood === 'cheer' && !reduce && (
          <g>
            {[
              { x: 74, y: 14, s: 1 },
              { x: 90, y: 38, s: 0.7 },
              { x: 64, y: 7, s: 0.6 },
            ].map((p, i) => (
              <motion.path
                key={i}
                d="M0 -4 L1.2 -1.2 L4 0 L1.2 1.2 L0 4 L-1.2 1.2 L-4 0 L-1.2 -1.2 Z"
                fill={C.yellow}
                transform={`translate(${p.x} ${p.y}) scale(${p.s})`}
                style={{ transformOrigin: 'center' }}
                animate={{ scale: [0, 1, 0], rotate: [0, 90] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </g>
        )}
        {mood === 'thinking' && !reduce && (
          <g>
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={46 + i * 7}
                cy={18}
                r={2.2}
                fill={C.blueDark}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
              />
            ))}
          </g>
        )}
      </motion.svg>
    </div>
  )
}
