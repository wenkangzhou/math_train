// 从 public/logo.png 生成 PWA / iOS 所需图标。
// 生成期脚本，运行时不依赖 sharp。用法：pnpm gen:icons
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(root, 'public/logo.png')
const OUT = resolve(root, 'public/icons')
const BG = '#eafbe7' // 与 manifest background_color 一致

await mkdir(OUT, { recursive: true })

// 透明 logo 缩放后居中铺到指定底色画布上
async function padded(size, scale, bg) {
  const inner = Math.round(size * scale)
  const logo = await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()
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
  // 普通图标：透明背景、占满
  sharp(SRC).resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(resolve(OUT, 'icon-192.png')),
  sharp(SRC).resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(resolve(OUT, 'icon-512.png')),
  // maskable：留安全区（logo 占 78%），铺底色
  padded(512, 0.78, BG).then((img) => img.toFile(resolve(OUT, 'icon-maskable-512.png'))),
  // iOS 主屏：不透明底色
  padded(180, 0.86, BG).then((img) => img.toFile(resolve(OUT, 'apple-touch-icon-180.png'))),
]

await Promise.all(tasks)
console.log('✓ 图标已生成到 public/icons/')
