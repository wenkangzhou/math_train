// iPad 横竖屏布局自查：遍历多视口 + 三个屏幕截图到 screenshots/
// 用法：先 pnpm build && pnpm preview（或 dev），再 pnpm shots [url]
import { chromium, devices } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'screenshots')
const BASE = process.argv[2] || 'http://localhost:4173'

const VIEWPORTS = [
  { name: 'ipad-portrait', width: 768, height: 1024 },
  { name: 'ipad-landscape', width: 1024, height: 768 },
  { name: 'ipad-pro-portrait', width: 1024, height: 1366 },
  { name: 'ipad-pro-landscape', width: 1366, height: 1024 },
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent: devices['iPad (gen 7)'].userAgent,
  })
  const page = await ctx.newPage()
  await page.goto(BASE, { waitUntil: 'networkidle' })

  // 1) 设置页
  await page.waitForTimeout(600)
  await page.screenshot({ path: resolve(OUT, `${vp.name}-1-setup.png`) })

  // 2) 练习页：点「开始做题」
  await page.getByRole('button', { name: /开始做题/ }).click()
  await page.waitForTimeout(700)
  await page.screenshot({ path: resolve(OUT, `${vp.name}-2-practice.png`) })

  // 展开图片提示
  const hintBtn = page.getByRole('button', { name: '图片' })
  if (await hintBtn.count()) {
    await hintBtn.first().click()
    await page.waitForTimeout(400)
    await page.screenshot({ path: resolve(OUT, `${vp.name}-2b-practice-hint.png`) })
  }

  // 3) 结果页：读取算式求解 → 点正确答案，直到答完
  const solve = (txt) => {
    const s = txt.replace(/\s/g, '').replace(/−/g, '-')
    const m = s.match(/^(\d+|\?)([+\-])(\d+|\?)=(\d+|\?)$/)
    if (!m) return null
    const [, a, op, b, c] = m
    const n = (x) => (x === '?' ? null : Number(x))
    const [A, B, Cc] = [n(a), n(b), n(c)]
    if (Cc === null) return op === '+' ? A + B : A - B
    if (B === null) return op === '+' ? Cc - A : A - Cc
    if (A === null) return op === '+' ? Cc - B : Cc + B
    return null
  }

  for (let i = 0; i < 60; i++) {
    if (await page.getByText(/这一趟完成/).count()) break
    const card = page.locator('div.bg-cream').first()
    if (!(await card.count())) break
    const ans = solve(await card.innerText())
    if (ans === null || ans < 0) break
    const btn = page.getByRole('button', { name: `数字 ${ans}` })
    if (!(await btn.count())) break
    await btn.first().click()
    const confirm = page.getByRole('button', { name: '确定' })
    if (await confirm.isEnabled().catch(() => false)) await confirm.click()
    await page.waitForTimeout(1500) // 等正确反馈 + 切到下一题
  }
  await page.waitForTimeout(700)
  await page.screenshot({ path: resolve(OUT, `${vp.name}-3-result.png`) })

  await ctx.close()
  console.log(`✓ ${vp.name}`)
}

await browser.close()
console.log(`截图已保存到 ${OUT}`)
