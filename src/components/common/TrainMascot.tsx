import { motion, useReducedMotion } from 'framer-motion'

export type MascotMood = 'happy' | 'thinking' | 'cheer' | 'idle'

interface TrainMascotProps {
  mood?: MascotMood
  size?: number
}

// 数数小火车吉祥物：原创蓝色蒸汽小火车（正式内联 SVG 插画，带微笑表情）。
// 保持 { mood, size } API 不变；心情驱动整体浮动/跳跃动画，蒸汽轻微上升。
// 原始画布 520×420，按比例缩放避免变形。
const VB_W = 520
const VB_H = 420

export function TrainMascot({ mood = 'idle', size = 88 }: TrainMascotProps) {
  const reduce = useReducedMotion()

  const width = size
  const height = Math.round((size * VB_H) / VB_W)

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
        width={width}
        height={height}
        viewBox="0 0 520 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-labelledby="train-title train-desc"
        className="drop-shadow"
        animate={animate}
        transition={{ duration, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
      >
        <title id="train-title">可爱的蓝色数学小火车</title>
        <desc id="train-desc">一辆原创的儿童风蓝色蒸汽小火车，带微笑表情</desc>

        <defs>
          <linearGradient id="blueBody" x1="80" y1="120" x2="380" y2="320">
            <stop stopColor="#3CA8FF" />
            <stop offset="1" stopColor="#0874D1" />
          </linearGradient>

          <linearGradient id="blueCab" x1="80" y1="100" x2="240" y2="300">
            <stop stopColor="#269AF2" />
            <stop offset="1" stopColor="#0564B9" />
          </linearGradient>

          <linearGradient id="redBase" x1="60" y1="285" x2="460" y2="340">
            <stop stopColor="#FF4A36" />
            <stop offset="1" stopColor="#D8271B" />
          </linearGradient>

          <linearGradient id="faceFill" x1="330" y1="160" x2="430" y2="280">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#D9E0E6" />
          </linearGradient>

          <radialGradient id="cheek" cx="50%" cy="50%" r="50%">
            <stop stopColor="#FF8FA0" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FF8FA0" stopOpacity="0" />
          </radialGradient>

          <filter id="trainShadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#12385C" floodOpacity="0.22" />
          </filter>

          <filter id="trainSoftShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#12385C" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* 地面阴影 */}
        <ellipse cx="258" cy="360" rx="205" ry="25" fill="#9ECFF4" opacity="0.35" />

        <g filter="url(#trainShadow)">
          {/* 后驾驶室 */}
          <path
            d="M78 145C78 126 93 111 112 111H227C246 111 261 126 261 145V289H78V145Z"
            fill="url(#blueCab)"
            stroke="#074E91"
            strokeWidth="8"
            strokeLinejoin="round"
          />

          {/* 驾驶室屋顶 */}
          <path
            d="M68 132C77 102 106 83 139 83H217C247 83 273 102 282 132L258 146H91L68 132Z"
            fill="#163C5C"
            stroke="#0C2B45"
            strokeWidth="7"
            strokeLinejoin="round"
          />

          {/* 驾驶室窗户 */}
          <rect x="110" y="143" width="68" height="70" rx="13" fill="#D7F1FF" stroke="#FFC735" strokeWidth="8" />
          <rect x="190" y="143" width="43" height="70" rx="12" fill="#D7F1FF" stroke="#FFC735" strokeWidth="8" />

          {/* 星星徽章 */}
          <circle cx="163" cy="251" r="34" fill="#0871CA" stroke="#FFC735" strokeWidth="6" />
          <path
            d="M163 229L169 243L184 244L172 254L176 269L163 261L150 269L154 254L142 244L157 243L163 229Z"
            fill="#FFD43B"
          />

          {/* 锅炉主体 */}
          <path
            d="M205 189C205 155 233 127 267 127H349C384 127 412 155 412 189V280H205V189Z"
            fill="url(#blueBody)"
            stroke="#075AAB"
            strokeWidth="8"
          />

          {/* 锅炉装饰线 */}
          <path d="M236 138C222 160 216 188 216 222" stroke="#FFC735" strokeWidth="8" strokeLinecap="round" />

          {/* 烟囱 */}
          <path
            d="M318 123V72H370V123"
            fill="#18364F"
            stroke="#0B263A"
            strokeWidth="8"
            strokeLinejoin="round"
          />
          <path
            d="M306 72C306 56 319 43 335 43H353C369 43 382 56 382 72V79H306V72Z"
            fill="#18364F"
            stroke="#0B263A"
            strokeWidth="8"
          />
          <rect x="321" y="83" width="47" height="12" rx="6" fill="#FFC735" />

          {/* 金色汽笛 */}
          <path d="M257 132V111" stroke="#EAA300" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M242 132C242 113 254 98 269 98C284 98 296 113 296 132"
            fill="#FFC735"
            stroke="#EAA300"
            strokeWidth="6"
          />

          {/* 前部黑色圆环 */}
          <circle cx="395" cy="219" r="88" fill="#18364F" stroke="#0A2639" strokeWidth="8" />

          {/* 脸 */}
          <circle cx="395" cy="219" r="70" fill="url(#faceFill)" stroke="#A9B4BC" strokeWidth="5" />

          {/* 眉毛 */}
          <path d="M354 187C365 177 377 177 386 185" stroke="#243746" strokeWidth="7" strokeLinecap="round" />
          <path d="M405 185C415 176 428 177 437 187" stroke="#243746" strokeWidth="7" strokeLinecap="round" />

          {/* 眼睛 */}
          <ellipse cx="371" cy="210" rx="15" ry="21" fill="white" />
          <ellipse cx="420" cy="210" rx="15" ry="21" fill="white" />
          <ellipse cx="374" cy="214" rx="9" ry="14" fill="#163D63" />
          <ellipse cx="417" cy="214" rx="9" ry="14" fill="#163D63" />
          <ellipse cx="376" cy="217" rx="5" ry="8" fill="#081725" />
          <ellipse cx="415" cy="217" rx="5" ry="8" fill="#081725" />
          <circle cx="379" cy="207" r="3.5" fill="white" />
          <circle cx="418" cy="207" r="3.5" fill="white" />

          {/* 鼻子 */}
          <path
            d="M390 226C395 222 403 222 408 226C406 234 402 238 395 238C389 238 386 233 390 226Z"
            fill="#B9C1C8"
            stroke="#929DA5"
            strokeWidth="2"
          />

          {/* 嘴巴 */}
          <path d="M365 247C382 269 408 271 426 247C412 255 378 255 365 247Z" fill="#57251F" />
          <path d="M379 260C390 267 402 266 411 259C403 257 389 257 379 260Z" fill="#FF6B6B" />

          {/* 腮红 */}
          <circle cx="350" cy="235" r="13" fill="url(#cheek)" />
          <circle cx="440" cy="235" r="13" fill="url(#cheek)" />

          {/* 红色底盘 */}
          <path
            d="M58 279H447C458 279 467 288 467 299V327H58V279Z"
            fill="url(#redBase)"
            stroke="#B91D14"
            strokeWidth="8"
            strokeLinejoin="round"
          />

          {/* 前保险杠 */}
          <path
            d="M360 327H474L457 366H376L360 327Z"
            fill="#EF3425"
            stroke="#B91D14"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <path d="M390 337L382 357" stroke="#5C1B16" strokeWidth="8" strokeLinecap="round" />
          <path d="M417 337L414 359" stroke="#5C1B16" strokeWidth="8" strokeLinecap="round" />
          <path d="M443 337L449 357" stroke="#5C1B16" strokeWidth="8" strokeLinecap="round" />

          {/* 缓冲器 */}
          <circle cx="373" cy="299" r="23" fill="#18364F" stroke="#0B263A" strokeWidth="7" />
          <circle cx="453" cy="299" r="23" fill="#18364F" stroke="#0B263A" strokeWidth="7" />
          <circle cx="413" cy="299" r="13" fill="#FFC735" stroke="#EAA300" strokeWidth="5" />

          {/* 车轮 */}
          <g filter="url(#trainSoftShadow)">
            <circle cx="137" cy="321" r="48" fill="#12385C" stroke="#08243B" strokeWidth="8" />
            <circle cx="235" cy="321" r="48" fill="#12385C" stroke="#08243B" strokeWidth="8" />
            <circle cx="319" cy="321" r="39" fill="#12385C" stroke="#08243B" strokeWidth="8" />
            <circle cx="137" cy="321" r="29" fill="#2C85D3" />
            <circle cx="235" cy="321" r="29" fill="#2C85D3" />
            <circle cx="319" cy="321" r="23" fill="#2C85D3" />
            <circle cx="137" cy="321" r="11" fill="#FFC735" />
            <circle cx="235" cy="321" r="11" fill="#FFC735" />
            <circle cx="319" cy="321" r="9" fill="#FFC735" />
            <path d="M137 321L235 321L319 321" stroke="#FFC735" strokeWidth="10" strokeLinecap="round" />
          </g>
        </g>

        {/* 蒸汽（轻微上升） */}
        {!reduce ? (
          <g opacity="0.75">
            {[
              { cx: 328, cy: 25, r: 11, d: 0 },
              { cx: 350, cy: 18, r: 15, d: 0.3 },
              { cx: 376, cy: 28, r: 12, d: 0.6 },
            ].map((p, i) => (
              <motion.circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r={p.r}
                fill="#DDEEFF"
                animate={{ y: [0, -10, -20], opacity: [0.75, 0.4, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: p.d, ease: 'easeOut' }}
              />
            ))}
          </g>
        ) : (
          <g opacity="0.75">
            <circle cx="328" cy="25" r="11" fill="#DDEEFF" />
            <circle cx="350" cy="18" r="15" fill="#DDEEFF" />
            <circle cx="376" cy="28" r="12" fill="#DDEEFF" />
          </g>
        )}

        {/* 装饰星星 */}
        <path
          d="M472 125L477 137L490 138L480 146L483 159L472 152L461 159L464 146L454 138L467 137L472 125Z"
          fill="#FF6F91"
        />
        <path
          d="M61 210L65 219L75 220L67 227L69 237L61 232L52 237L54 227L47 220L57 219L61 210Z"
          fill="#FFC735"
        />
      </motion.svg>
    </div>
  )
}
