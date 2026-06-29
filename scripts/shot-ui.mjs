import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const URL = 'http://localhost:4174'
const OUT = '/tmp/mt_shots_ui'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const errors = []

async function shot(label, viewport, name, actions = async () => {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${label}] ` + m.text()) })
  page.on('pageerror', (e) => errors.push(`[${label}] pageerror: ` + e.message))
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  await actions(page)
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
  await ctx.close()
}

// 1. iPad 横屏设置页
await shot('ipad-land-setup', { width: 1024, height: 768 }, 'setup-ipad-land')

// 2. iPad 横屏设置页（打开难度细分抽屉）
await shot('ipad-land-drawer', { width: 1024, height: 768 }, 'setup-ipad-land-drawer', async (page) => {
  await page.getByText('难度细分').click()
  await page.waitForTimeout(500)
})

// 3. iPad 竖屏设置页
await shot('ipad-port-setup', { width: 768, height: 1024 }, 'setup-ipad-port')

// 3. iPhone 设置页
await shot('iphone-setup', { width: 390, height: 844 }, 'setup-iphone')

// 3b. iPhone 设置页（打开难度细分抽屉，验证底部半弹层）
await shot('iphone-drawer', { width: 390, height: 844 }, 'setup-iphone-drawer', async (page) => {
  await page.getByText('难度细分').click()
  await page.waitForTimeout(500)
})

// 4. iPad 横屏练习页（算式题）
await shot('ipad-land-practice', { width: 1024, height: 768 }, 'practice-ipad-land', async (page) => {
  await page.getByText('开始练习').click()
  await page.waitForTimeout(900)
})

// 4b. iPad 横屏练习页（展开图片提示，验证 tooltip 不推动题目）
await shot('ipad-land-hint', { width: 1024, height: 768 }, 'practice-ipad-land-hint', async (page) => {
  await page.getByText('开始练习').click()
  await page.waitForTimeout(900)
  await page.getByRole('button', { name: '图片' }).click()
  await page.waitForTimeout(400)
})

// 5. 退出弹窗
await shot('exit-dialog', { width: 1024, height: 768 }, 'exit-dialog', async (page) => {
  await page.getByText('开始练习').click()
  await page.waitForTimeout(900)
  await page.getByLabel('返回设置页').click()
  await page.waitForTimeout(300)
})

console.log('CONSOLE ERRORS:', errors.length ? errors : 'none')
await browser.close()
console.log('Screenshots saved to', OUT)
