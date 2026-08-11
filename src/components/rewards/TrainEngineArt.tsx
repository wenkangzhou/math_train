import { useId } from 'react'
import { motion } from 'framer-motion'
import type { Carriage, TrainDesign, TrainLivery } from '@/types/rewards'

interface EnginePalette {
  body: string
  dark: string
  accent: string
  light: string
  glass: string
}

const ENGINE_PALETTES: Record<TrainLivery, EnginePalette> = {
  blue: { body: '#2196dc', dark: '#176aa2', accent: '#ef5350', light: '#b9e6fb', glass: '#e5f7ff' },
  red: { body: '#ef4444', dark: '#b91c1c', accent: '#facc15', light: '#fecaca', glass: '#fff7d6' },
  green: { body: '#22a66f', dark: '#087451', accent: '#f5b82e', light: '#b8edd5', glass: '#e7fff5' },
  yellow: { body: '#f5b82e', dark: '#c47a0b', accent: '#ef4444', light: '#fff0ae', glass: '#fffdf2' },
  orange: { body: '#f47a2a', dark: '#bd4f10', accent: '#38bdf8', light: '#fed7aa', glass: '#e8f8ff' },
  navy: { body: '#2854a3', dark: '#14295e', accent: '#67e8f9', light: '#bfdbfe', glass: '#e0f7ff' },
  purple: { body: '#8b5bd6', dark: '#58328f', accent: '#f0abfc', light: '#ddd1ff', glass: '#f7efff' },
  cyan: { body: '#35c3dc', dark: '#147a97', accent: '#ffffff', light: '#cffafe', glass: '#f2fdff' },
  teal: { body: '#16a99a', dark: '#0c6b66', accent: '#f6c94a', light: '#c7f4ed', glass: '#eafffb' },
  pink: { body: '#ec5eaa', dark: '#b82e76', accent: '#fde047', light: '#fbcfe8', glass: '#fff0f7' },
  slate: { body: '#64748b', dark: '#334155', accent: '#fb923c', light: '#d9e0e8', glass: '#f0f7ff' },
  lime: { body: '#83c92f', dark: '#4d8516', accent: '#22d3ee', light: '#dcf7ad', glass: '#efffe9' },
  rose: { body: '#ef7186', dark: '#be3f5a', accent: '#fbbf24', light: '#ffe0e6', glass: '#fff7e7' },
  indigo: { body: '#6366df', dark: '#36358e', accent: '#e879f9', light: '#cfd4ff', glass: '#efeaff' },
}

interface WheelSpec {
  x: number
  y: number
  radius: number
}

const WHEEL_LAYOUTS: Record<TrainDesign, WheelSpec[]> = {
  'city-tank': [{ x: 23, y: 75, radius: 10 }, { x: 61, y: 75, radius: 10 }, { x: 99, y: 75, radius: 10 }],
  streamliner: [{ x: 29, y: 76, radius: 9 }, { x: 69, y: 76, radius: 10 }, { x: 108, y: 76, radius: 9 }],
  'heavy-freight': [{ x: 18, y: 75, radius: 9 }, { x: 46, y: 75, radius: 10 }, { x: 77, y: 75, radius: 10 }, { x: 108, y: 75, radius: 9 }],
  'mail-van': [{ x: 23, y: 76, radius: 9 }, { x: 63, y: 76, radius: 9 }, { x: 104, y: 76, radius: 9 }],
  'rescue-unit': [{ x: 22, y: 75, radius: 10 }, { x: 63, y: 75, radius: 10 }, { x: 105, y: 75, radius: 10 }],
  'harbor-shunter': [{ x: 27, y: 76, radius: 10 }, { x: 65, y: 76, radius: 9 }, { x: 101, y: 76, radius: 9 }],
  'night-sleeper': [{ x: 20, y: 76, radius: 8 }, { x: 48, y: 76, radius: 8 }, { x: 83, y: 76, radius: 8 }, { x: 112, y: 76, radius: 8 }],
  snowplow: [{ x: 22, y: 75, radius: 10 }, { x: 61, y: 75, radius: 10 }, { x: 99, y: 75, radius: 9 }],
  'maintenance-crane': [{ x: 22, y: 76, radius: 9 }, { x: 58, y: 76, radius: 9 }, { x: 104, y: 76, radius: 10 }],
  'festival-special': [{ x: 22, y: 76, radius: 9 }, { x: 65, y: 76, radius: 11 }, { x: 107, y: 76, radius: 9 }],
  'mountain-climber': [{ x: 20, y: 73, radius: 12 }, { x: 58, y: 73, radius: 12 }, { x: 99, y: 73, radius: 12 }],
  'electric-loco': [{ x: 18, y: 76, radius: 8 }, { x: 48, y: 76, radius: 8 }, { x: 81, y: 76, radius: 8 }, { x: 112, y: 76, radius: 8 }],
  'panorama-express': [{ x: 22, y: 76, radius: 9 }, { x: 64, y: 76, radius: 9 }, { x: 108, y: 76, radius: 9 }],
  'cosmic-rocket': [{ x: 26, y: 76, radius: 9 }, { x: 67, y: 76, radius: 9 }, { x: 108, y: 76, radius: 9 }],
}

const CHASSIS: Record<TrainDesign, { x: number; width: number; y: number; height: number }> = {
  'city-tank': { x: 7, width: 115, y: 61, height: 9 },
  streamliner: { x: 8, width: 117, y: 62, height: 8 },
  'heavy-freight': { x: 3, width: 124, y: 59, height: 11 },
  'mail-van': { x: 7, width: 117, y: 61, height: 9 },
  'rescue-unit': { x: 5, width: 121, y: 59, height: 11 },
  'harbor-shunter': { x: 14, width: 105, y: 61, height: 9 },
  'night-sleeper': { x: 3, width: 125, y: 61, height: 9 },
  snowplow: { x: 5, width: 113, y: 60, height: 10 },
  'maintenance-crane': { x: 4, width: 121, y: 60, height: 10 },
  'festival-special': { x: 4, width: 122, y: 61, height: 9 },
  'mountain-climber': { x: 1, width: 127, y: 57, height: 12 },
  'electric-loco': { x: 3, width: 126, y: 61, height: 9 },
  'panorama-express': { x: 2, width: 127, y: 61, height: 9 },
  'cosmic-rocket': { x: 7, width: 121, y: 62, height: 8 },
}

const SMOKE_ORIGINS: Partial<Record<TrainDesign, { x: number; y: number }>> = {
  'city-tank': { x: 78, y: 20 },
  streamliner: { x: 43, y: 27 },
  'heavy-freight': { x: 76, y: 13 },
  'rescue-unit': { x: 72, y: 27 },
  'harbor-shunter': { x: 72, y: 27 },
  snowplow: { x: 71, y: 27 },
  'maintenance-crane': { x: 48, y: 28 },
  'festival-special': { x: 75, y: 22 },
  'mountain-climber': { x: 75, y: 11 },
}

interface TrainEngineArtProps {
  item: Carriage
  compact?: boolean
  running?: boolean
}

export function TrainEngineArt({ item, compact = false, running = false }: TrainEngineArtProps) {
  const palette = ENGINE_PALETTES[item.livery]
  const rawId = useId()
  const shadowId = `engine-shadow-${rawId.replace(/:/g, '')}`
  const bodyGradientId = `engine-body-${rawId.replace(/:/g, '')}`

  return (
    <div
      className={compact ? 'relative h-[72px] w-[102px]' : 'relative h-[92px] w-[132px]'}
      data-engine-design={item.design}
      aria-hidden="true"
    >
      <svg viewBox="0 0 132 92" className="h-full w-full overflow-visible">
        <defs>
          <filter id={shadowId} x="-20%" y="-25%" width="145%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="2.2" floodColor="#29445f" floodOpacity="0.25" />
          </filter>
          <linearGradient id={bodyGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={palette.light} />
            <stop offset="0.22" stopColor={palette.body} />
            <stop offset="1" stopColor={palette.dark} />
          </linearGradient>
        </defs>

        {running && SMOKE_ORIGINS[item.design] && (
          <EngineSmoke origin={SMOKE_ORIGINS[item.design]!} />
        )}

        <g filter={`url(#${shadowId})`}>
          <EngineChassis design={item.design} palette={palette} />
          <EngineBody
            item={item}
            palette={palette}
            gradientId={bodyGradientId}
            running={running}
          />
          <EngineWheels design={item.design} palette={palette} running={running} />
        </g>
      </svg>
    </div>
  )
}

function EngineSmoke({ origin }: { origin: { x: number; y: number } }) {
  return (
    <g data-testid="train-smoke">
      {[0, 1, 2].map((puff) => (
        <motion.circle
          key={puff}
          initial={{ cx: origin.x, cy: origin.y, r: 3, opacity: 0 }}
          animate={{
            cx: [origin.x, origin.x + 8, origin.x + 18],
            cy: [origin.y, origin.y - 10, origin.y - 24],
            r: [3, 6, 10],
            opacity: [0, 0.8, 0],
          }}
          transition={{ duration: 0.9, repeat: Infinity, delay: puff * 0.25 }}
          fill="rgba(255,255,255,0.86)"
        />
      ))}
    </g>
  )
}

function EngineChassis({ design, palette }: { design: TrainDesign; palette: EnginePalette }) {
  const chassis = CHASSIS[design]
  return (
    <g>
      {design === 'mountain-climber' && (
        <rect x="4" y="66" width="121" height="16" rx="8" fill={palette.dark} opacity="0.8" />
      )}
      <rect
        x={chassis.x}
        y={chassis.y}
        width={chassis.width}
        height={chassis.height}
        rx="4"
        fill={palette.dark}
      />
      <rect x={chassis.x + 4} y={chassis.y + 1} width={chassis.width - 10} height="2.5" rx="1" fill="white" opacity="0.3" />
      {design !== 'snowplow' && design !== 'cosmic-rocket' && (
        <path d="M124 61 L132 66 L124 70 Z" fill="#475569" />
      )}
    </g>
  )
}

function EngineBody({
  item,
  palette,
  gradientId,
  running,
}: {
  item: Carriage
  palette: EnginePalette
  gradientId: string
  running: boolean
}) {
  const fill = `url(#${gradientId})`

  switch (item.design) {
    case 'city-tank':
      return (
        <g>
          <path d="M11 60V31Q11 21 22 21H43Q50 21 50 31V60Z" fill={fill} />
          <rect x="18" y="28" width="20" height="17" rx="5" fill={palette.glass} stroke="white" strokeWidth="2" />
          <rect x="43" y="36" width="69" height="25" rx="13" fill={fill} />
          <rect x="72" y="16" width="13" height="25" rx="4" fill={palette.dark} />
          <ellipse cx="60" cy="35" rx="10" ry="6" fill={palette.accent} stroke="white" strokeWidth="2" />
          <EngineBadge x={55} y={49} emoji={item.emoji} />
          <EngineFace x={110} y={49} radius={14} palette={palette} />
        </g>
      )

    case 'streamliner':
      return (
        <g>
          <path d="M8 60Q12 35 37 30H86Q111 30 126 49L126 62H8Z" fill={fill} />
          <path d="M36 31H83L95 44H26Q27 35 36 31Z" fill={palette.glass} opacity="0.92" />
          <path d="M13 53H116" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
          <path d="M17 47H55" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          <EngineBadge x={67} y={51} emoji={item.emoji} />
          <EngineFace x={112} y={49} radius={12} palette={palette} />
        </g>
      )

    case 'heavy-freight':
      return (
        <g>
          <rect x="6" y="19" width="40" height="42" rx="7" fill={fill} />
          <rect x="13" y="26" width="22" height="17" rx="3" fill={palette.glass} stroke="white" strokeWidth="2" />
          <path d="M43 60V33Q43 27 50 27H111V60Z" fill={fill} />
          <rect x="68" y="9" width="17" height="25" rx="4" fill={palette.dark} />
          <rect x="51" y="21" width="16" height="10" rx="5" fill={palette.accent} />
          <path d="M48 41H93M48 49H93" stroke="white" strokeWidth="3" opacity="0.38" />
          <EngineBadge x={58} y={48} emoji={item.emoji} />
          <EngineFace x={110} y={46} radius={14} palette={palette} />
        </g>
      )

    case 'mail-van':
      return (
        <g>
          <path d="M8 60V31Q8 23 18 23H105Q116 23 118 35V60Z" fill={fill} />
          <path d="M13 23H99Q110 23 116 32H13Z" fill={palette.light} opacity="0.75" />
          <rect x="16" y="31" width="24" height="16" rx="4" fill={palette.glass} stroke="white" strokeWidth="2" />
          <rect x="48" y="32" width="34" height="22" rx="5" fill="white" opacity="0.9" />
          <path d="M51 36L65 46L79 36" fill="none" stroke={palette.dark} strokeWidth="2.5" strokeLinejoin="round" />
          <EngineFace x={109} y={47} radius={13} palette={palette} />
        </g>
      )

    case 'rescue-unit':
      return (
        <g>
          <rect x="7" y="27" width="109" height="34" rx="7" fill={fill} />
          <path d="M10 27H47V60H10Z" fill={palette.body} />
          <rect x="16" y="32" width="23" height="16" rx="4" fill={palette.glass} stroke="white" strokeWidth="2" />
          <motion.circle
            cx="33"
            cy="20"
            r="6"
            fill={palette.accent}
            animate={running ? { opacity: [1, 0.35, 1], scale: [1, 1.16, 1] } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, repeat: running ? Infinity : 0 }}
          />
          <rect x="25" y="17" width="16" height="5" rx="2.5" fill="white" opacity="0.75" />
          <path d="M52 33L42 57M72 33L62 57M92 33L82 57" stroke={palette.accent} strokeWidth="5" opacity="0.9" />
          <circle cx="78" cy="27" r="7" fill={palette.glass} stroke="white" strokeWidth="2" />
          <EngineBadge x={59} y={47} emoji={item.emoji} />
          <EngineFace x={111} y={47} radius={13} palette={palette} />
        </g>
      )

    case 'harbor-shunter':
      return (
        <g>
          <rect x="16" y="19" width="43" height="42" rx="6" fill={fill} />
          <rect x="22" y="26" width="23" height="16" rx="3" fill={palette.glass} stroke="white" strokeWidth="2" />
          <rect x="56" y="39" width="55" height="22" rx="6" fill={fill} />
          <rect x="67" y="24" width="10" height="18" rx="3" fill={palette.dark} />
          <path d="M60 39L88 18H107" fill="none" stroke={palette.accent} strokeWidth="4" strokeLinecap="round" />
          <path d="M106 18V32Q106 37 111 37" fill="none" stroke={palette.dark} strokeWidth="2" />
          <EngineBadge x={71} y={50} emoji={item.emoji} />
          <EngineFace x={108} y={48} radius={12} palette={palette} />
        </g>
      )

    case 'night-sleeper':
      return (
        <g>
          <rect x="4" y="25" width="123" height="38" rx="17" fill={fill} />
          <path d="M13 28Q66 15 118 28" fill="none" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" />
          {[19, 42, 65].map((x) => (
            <g key={x}>
              <rect x={x} y="34" width="17" height="14" rx="5" fill={palette.glass} stroke="white" strokeWidth="1.8" />
              <circle cx={x + 12} cy="38" r="3" fill={palette.accent} opacity="0.75" />
            </g>
          ))}
          <path d="M16 54H91" stroke="white" strokeWidth="2.5" strokeDasharray="6 5" opacity="0.55" />
          <EngineBadge x={90} y={45} emoji={item.emoji} />
          <EngineFace x={113} y={47} radius={13} palette={palette} />
        </g>
      )

    case 'snowplow':
      return (
        <g>
          <path d="M11 60V29Q11 21 20 21H49Q56 21 56 30V60Z" fill={fill} />
          <rect x="18" y="28" width="22" height="16" rx="4" fill={palette.glass} stroke="white" strokeWidth="2" />
          <rect x="52" y="36" width="58" height="25" rx="9" fill={fill} />
          <rect x="66" y="23" width="11" height="17" rx="3" fill={palette.dark} />
          <EngineBadge x={67} y={49} emoji={item.emoji} />
          <EngineFace x={105} y={47} radius={12} palette={palette} />
          <path d="M113 48L132 38V70L113 62Z" fill="white" stroke={palette.dark} strokeWidth="3" strokeLinejoin="round" />
          <path d="M117 51L129 45M117 58L129 53M117 64L129 60" stroke={palette.body} strokeWidth="3" />
        </g>
      )

    case 'maintenance-crane':
      return (
        <g>
          <rect x="7" y="25" width="40" height="36" rx="6" fill={fill} />
          <rect x="13" y="31" width="22" height="15" rx="3" fill={palette.glass} stroke="white" strokeWidth="2" />
          <rect x="45" y="44" width="72" height="17" rx="5" fill={fill} />
          <path d="M50 43L91 14H111" fill="none" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M110 14V34" stroke={palette.dark} strokeWidth="2.5" />
          <path d="M106 34Q110 40 114 34" fill="none" stroke={palette.dark} strokeWidth="3" strokeLinecap="round" />
          <rect x="54" y="48" width="30" height="10" rx="3" fill={palette.light} opacity="0.85" />
          <EngineBadge x={68} y={53} emoji={item.emoji} />
          <EngineFace x={111} y={50} radius={11} palette={palette} />
        </g>
      )

    case 'festival-special':
      return (
        <g>
          <path d="M7 60V35Q7 27 17 27H112Q122 27 122 38V60Z" fill={fill} />
          <path d="M10 29Q19 17 28 29Q37 17 46 29Q55 17 64 29Q73 17 82 29Q91 17 100 29Q109 17 119 29" fill={palette.light} stroke={palette.accent} strokeWidth="2" />
          <motion.g
            animate={running ? { y: [0, -3, 0], rotate: [0, 2, -2, 0] } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.8, repeat: running ? Infinity : 0 }}
          >
            <circle cx="30" cy="12" r="7" fill="#fb7185" />
            <circle cx="43" cy="9" r="6" fill="#60a5fa" />
            <path d="M30 19L35 29M43 15L38 29" stroke={palette.dark} strokeWidth="1.5" />
          </motion.g>
          <path d="M19 39L34 49L49 39L64 49L79 39" fill="none" stroke={palette.accent} strokeWidth="3" />
          <EngineBadge x={69} y={48} emoji={item.emoji} />
          <EngineFace x={110} y={47} radius={13} palette={palette} />
        </g>
      )

    case 'mountain-climber':
      return (
        <g>
          <path d="M5 58V25Q5 16 16 16H44Q52 16 52 26V58Z" fill={fill} />
          <rect x="12" y="23" width="23" height="16" rx="3" fill={palette.glass} stroke="white" strokeWidth="2" />
          <path d="M48 58V31H110L119 43V58Z" fill={fill} />
          <path d="M68 31V15H82V33" fill={palette.dark} />
          <path d="M66 14L84 14L80 8H70Z" fill={palette.accent} />
          <path d="M51 46H93" stroke={palette.accent} strokeWidth="5" strokeDasharray="8 4" />
          <EngineBadge x={62} y={40} emoji={item.emoji} />
          <EngineFace x={108} y={43} radius={14} palette={palette} />
        </g>
      )

    case 'electric-loco':
      return (
        <g>
          <path d="M5 60L12 29Q14 24 21 24H91L127 42V60Z" fill={fill} />
          <path d="M18 29H86L100 39H15Z" fill={palette.glass} opacity="0.9" />
          <path d="M41 24L53 9L68 24M53 9H83M83 9L73 24" fill="none" stroke={palette.dark} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M27 46H58L50 53H80" fill="none" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <motion.path
            d="M61 16L65 11L68 16L72 11"
            fill="none"
            stroke="white"
            strokeWidth="2"
            animate={running ? { opacity: [0.25, 1, 0.25] } : { opacity: 0.65 }}
            transition={{ duration: 0.35, repeat: running ? Infinity : 0 }}
          />
          <EngineBadge x={87} y={50} emoji={item.emoji} />
          <EngineFace x={112} y={47} radius={12} palette={palette} />
        </g>
      )

    case 'panorama-express':
      return (
        <g>
          <path d="M3 61Q5 28 30 25H99Q119 27 129 45V61Z" fill={fill} />
          <path d="M18 31Q24 27 35 27H95Q109 28 117 40H15Z" fill={palette.glass} opacity="0.92" />
          <path d="M38 28V40M66 28V40M94 29V40" stroke="white" strokeWidth="2" opacity="0.85" />
          <rect x="33" y="18" width="46" height="7" rx="3.5" fill={palette.dark} />
          <rect x="42" y="14" width="28" height="6" rx="3" fill={palette.accent} />
          <path d="M13 51H115" stroke={palette.accent} strokeWidth="4" strokeLinecap="round" />
          <EngineBadge x={82} y={51} emoji={item.emoji} />
          <EngineFace x={113} y={48} radius={12} palette={palette} />
        </g>
      )

    case 'cosmic-rocket':
      return (
        <g>
          <path d="M8 61L16 32Q22 25 36 25H94Q117 26 129 48L126 61Z" fill={fill} />
          <path d="M7 55L1 40L22 52L21 62Z" fill={palette.accent} opacity="0.9" />
          <path d="M46 25Q62 5 79 25" fill={palette.glass} stroke={palette.accent} strokeWidth="3" />
          <circle cx="63" cy="20" r="7" fill="#fff7c2" opacity="0.8" />
          <path d="M97 29L102 13L107 29" fill="none" stroke={palette.accent} strokeWidth="3" strokeLinejoin="round" />
          <motion.circle
            cx="102"
            cy="11"
            r="4"
            fill="#fde047"
            animate={running ? { opacity: [0.25, 1, 0.25], scale: [0.8, 1.25, 0.8] } : { opacity: 0.9, scale: 1 }}
            transition={{ duration: 0.55, repeat: running ? Infinity : 0 }}
          />
          <path d="M28 46H90" stroke="white" strokeWidth="3" strokeDasharray="2 7" strokeLinecap="round" opacity="0.8" />
          <EngineBadge x={42} y={50} emoji={item.emoji} />
          <EngineFace x={111} y={47} radius={13} palette={palette} glassDome />
        </g>
      )
  }
}

function EngineBadge({ x, y, emoji }: { x: number; y: number; emoji: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="9" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.65)" strokeWidth="2" />
      <text x={x} y={y + 4} fontSize="11" textAnchor="middle">
        {emoji}
      </text>
    </g>
  )
}

function EngineFace({
  x,
  y,
  radius,
  palette,
  glassDome = false,
}: {
  x: number
  y: number
  radius: number
  palette: EnginePalette
  glassDome?: boolean
}) {
  return (
    <g>
      {glassDome && (
        <circle cx={x} cy={y - 1} r={radius + 4} fill={palette.glass} opacity="0.52" stroke="white" strokeWidth="2" />
      )}
      <circle cx={x} cy={y} r={radius} fill="#f7e7d0" stroke="#cbd5e1" strokeWidth="2.5" />
      <circle cx={x - 4.5} cy={y - 2.5} r="1.8" fill="#334155" />
      <circle cx={x + 4.5} cy={y - 2.5} r="1.8" fill="#334155" />
      <path d={`M${x - 5} ${y + 4}Q${x} ${y + 8} ${x + 5} ${y + 4}`} fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx={x - 7} cy={y + 2} r="2.3" fill="#fda4af" opacity="0.65" />
      <circle cx={x + 7} cy={y + 2} r="2.3" fill="#fda4af" opacity="0.65" />
    </g>
  )
}

function EngineWheels({
  design,
  palette,
  running,
}: {
  design: TrainDesign
  palette: EnginePalette
  running: boolean
}) {
  return (
    <g>
      {WHEEL_LAYOUTS[design].map(({ x, y, radius }, index) => (
        <motion.g
          key={`${design}-wheel-${index}`}
          animate={running ? { rotate: 360 } : { rotate: 0 }}
          transition={running ? { duration: design === 'mountain-climber' ? 0.42 : 0.28, repeat: Infinity, ease: 'linear' } : undefined}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <circle cx={x} cy={y} r={radius + 1.5} fill="#334155" stroke="white" strokeWidth="1.5" />
          <circle cx={x} cy={y} r={radius - 3} fill={palette.light} stroke={palette.dark} strokeWidth="2" />
          <path d={`M${x - radius + 4} ${y}H${x + radius - 4}M${x} ${y - radius + 4}V${y + radius - 4}`} stroke={palette.dark} strokeWidth="1.5" opacity="0.72" />
          <circle cx={x} cy={y} r="2.5" fill={palette.dark} />
        </motion.g>
      ))}
    </g>
  )
}
