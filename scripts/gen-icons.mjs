// 从 public/logo-v2.png 生成 PWA / iOS 所需图标。
// 生成期脚本，运行时不依赖 sharp。用法：pnpm gen:icons
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(root, 'public/logo-v2.png')
const OUT = resolve(root, 'public/icons')
const BG = '#e6f4ff' // 与页面和 manifest background_color 一致
// 生成图外围带有白色展示边距；裁到真正的圆角品牌底板。
const MARK_CROP = { left: 54, top: 53, width: 916, height: 916 }

await mkdir(OUT, { recursive: true })

// 裁掉展示边距，再用圆角蒙版去除四角白底。
async function roundedMark(size) {
  const radius = Math.round(size * 0.18)
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#fff"/></svg>`,
  )
  return sharp(SRC)
    .extract(MARK_CROP)
    .resize(size, size, { fit: 'cover' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
}

// 品牌底板缩放后居中铺到应用背景色画布上。
async function padded(size, scale, bg) {
  const inner = Math.round(size * scale)
  const logo = await roundedMark(inner)
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bg,
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
}

const tasks = [
  // 普通图标：品牌底板占满，四角与页面背景自然融合。
  padded(192, 1, BG).then((img) => img.toFile(resolve(OUT, 'icon-192.png'))),
  padded(512, 1, BG).then((img) => img.toFile(resolve(OUT, 'icon-512.png'))),
  // maskable：主体本身已有安全边距，保留约 8% 外圈。
  padded(512, 0.92, BG).then((img) => img.toFile(resolve(OUT, 'icon-maskable-512.png'))),
  // iOS 主屏：不透明底色
  padded(180, 0.96, BG).then((img) => img.toFile(resolve(OUT, 'apple-touch-icon-180.png'))),
]

await Promise.all(tasks)
console.log('✓ 图标已生成到 public/icons/')
