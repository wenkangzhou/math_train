import { motion, useReducedMotion } from 'framer-motion'

export type MascotMood = 'happy' | 'thinking' | 'cheer' | 'idle'

interface TrainMascotProps {
  mood?: MascotMood
  size?: number
}

// 数数小火车吉祥物：一辆友好的小火车（正式内联 SVG 插画）。
// 保持 { mood, size } API 不变，方便练习页角落与结果页直接调用。
const C = {
  body: '#4fb0f0',
  bodyDark: '#2b8fd6',
  roof: '#ff8a65',
  face: '#eaf6ff',
  window: '#bfe6ff',
  wheel: '#37506b',
  rim: '#bfe6ff',
  smoke: '#e3f1fb',
  cheek: '#ff9db0',
  eye: '#37506b',
  star: '#ffd24d',
}

// 根据心情绘制脸部（眼睛 + 嘴）
function Face({ mood }: { mood: MascotMood }) {
  const eyes =
    mood === 'cheer' ? (
      // 开心眯眼 ^_^
      <>
        <path d="M11 52 q3 -3 6 0" fill="none" stroke={C.eye} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M23 52 q3 -3 6 0" fill="none" stroke={C.eye} strokeWidth="2.4" strokeLinecap="round" />
      </>
    ) : mood === 'thinking' ? (
      // 向上看 + 眉毛
      <>
        <circle cx="15" cy="52" r="2.3" fill={C.eye} />
        <circle cx="26" cy="52" r="2.3" fill={C.eye} />
        <circle cx="15.7" cy="51.2" r="0.7" fill="#fff" />
        <circle cx="26.7" cy="51.2" r="0.7" fill="#fff" />
        <path d="M11 47 q3.5 -1.5 7 0" fill="none" stroke={C.eye} strokeWidth="1.6" strokeLinecap="round" />
      </>
    ) : (
      // 普通圆眼 + 高光
      <>
        <circle cx="15" cy="54" r="2.6" fill={C.eye} />
        <circle cx="26" cy="54" r="2.6" fill={C.eye} />
        <circle cx="16" cy="53" r="0.9" fill="#fff" />
        <circle cx="27" cy="53" r="0.9" fill="#fff" />
      </>
    )

  const mouth =
    mood === 'cheer' ? (
      <path d="M13 61 q7.5 9 15 0 z" fill="#ff6f6f" stroke={C.eye} strokeWidth="1.2" strokeLinejoin="round" />
    ) : mood === 'happy' ? (
      <path d="M12.5 60 q8 8 16 0" fill="none" stroke={C.eye} strokeWidth="2.4" strokeLinecap="round" />
    ) : mood === 'thinking' ? (
      <circle cx="20.5" cy="62" r="1.8" fill="none" stroke={C.eye} strokeWidth="2" />
    ) : (
      <path d="M14 61 q6.5 5 13 0" fill="none" stroke={C.eye} strokeWidth="2.2" strokeLinecap="round" />
    )

  return (
    <g>
      {/* 脸盘 */}
      <circle cx="20" cy="55" r="16" fill={C.face} stroke={C.body} strokeWidth="2.5" />
      {/* 腮红 */}
      <ellipse cx="10.5" cy="59" rx="3" ry="2.2" fill={C.cheek} opacity="0.75" />
      <ellipse cx="30.5" cy="59" rx="3" ry="2.2" fill={C.cheek} opacity="0.75" />
      {eyes}
      {mouth}
    </g>
  )
}

function Wheel({ cx, r }: { cx: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy="80" r={r} fill={C.wheel} />
      <circle cx={cx} cy="80" r={r * 0.55} fill={C.rim} />
      <circle cx={cx} cy="80" r={r * 0.18} fill={C.wheel} />
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
          <g>
            {[
              { cx: 45, cy: 21, r: 3, d: 0 },
              { cx: 42, cy: 14, r: 3.6, d: 0.3 },
              { cx: 47, cy: 8, r: 4.2, d: 0.6 },
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
            ))}
          </g>
        ) : (
          <g>
            <circle cx="45" cy="21" r="3" fill={C.smoke} />
            <circle cx="42" cy="14" r="3.6" fill={C.smoke} opacity="0.7" />
            <circle cx="47" cy="8" r="4.2" fill={C.smoke} opacity="0.45" />
          </g>
        )}

        {/* 烟囱 */}
        <rect x="38" y="27" width="14" height="5" rx="2" fill={C.bodyDark} />
        <rect x="40" y="30" width="10" height="14" rx="2" fill={C.bodyDark} />

        {/* 车厢（驾驶舱） */}
        <rect x="60" y="24" width="31" height="7" rx="3" fill={C.roof} />
        <rect x="63" y="30" width="25" height="39" rx="5" fill={C.body} />
        <rect x="68" y="37" width="15" height="15" rx="4" fill={C.window} stroke="#fff" strokeWidth="2" />

        {/* 锅炉主体 */}
        <rect x="18" y="42" width="49" height="27" rx="13" fill={C.body} />
        {/* 蒸汽圆顶 */}
        <ellipse cx="58" cy="41" rx="5" ry="4.2" fill={C.roof} />

        {/* 底盘 */}
        <rect x="10" y="67" width="84" height="8" rx="4" fill={C.bodyDark} />

        {/* 车轮 */}
        <Wheel cx={26} r={10} />
        <Wheel cx={52} r={9} />
        <Wheel cx={80} r={7} />

        {/* 脸 */}
        <Face mood={mood} />

        {/* 心情装饰 */}
        {mood === 'cheer' && !reduce && (
          <g>
            {[
              { x: 70, y: 16, s: 1 },
              { x: 86, y: 40, s: 0.7 },
              { x: 60, y: 8, s: 0.6 },
            ].map((p, i) => (
              <motion.path
                key={i}
                d="M0 -4 L1.2 -1.2 L4 0 L1.2 1.2 L0 4 L-1.2 1.2 L-4 0 L-1.2 -1.2 Z"
                fill={C.star}
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
                cx={40 + i * 7}
                cy={20}
                r={2.2}
                fill={C.bodyDark}
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
