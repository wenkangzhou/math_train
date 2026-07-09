// 绘本图片题 / 故事题专项截图验收
// 用法：先 pnpm build && pnpm preview（或 dev），再 pnpm shots:book [url]
//
// 输出：
// - screenshots/book/<viewport>-picture-practice.png
// - screenshots/book/<viewport>-picture-help.png
// - screenshots/book/<viewport>-story-practice.png
// - screenshots/book/<viewport>-story-help.png
// - screenshots/book/report.json

import { chromium, devices } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(root, 'screenshots/book')
const BASE = process.argv[2] || 'http://localhost:4173'

const VIEWPORTS = [
  { name: 'ipad-landscape', width: 1024, height: 768 },
  { name: 'ipad-portrait', width: 768, height: 1024 },
  { name: 'iphone', width: 390, height: 844 },
]

const FORMATS = [
  {
    name: 'picture',
    questionFormats: ['picture'],
    marker: '绘本图片题',
    ranges: ['addition-within-20'],
    patterns: [
      'a-plus-b-equals-blank',
      'a-plus-blank-equals-c',
      'blank-plus-b-equals-c',
    ],
  },
  {
    name: 'story',
    questionFormats: ['story'],
    marker: '绘本任务',
    ranges: ['addition-within-20', 'subtraction-within-20'],
    patterns: [
      'a-plus-b-equals-blank',
      'a-plus-blank-equals-c',
      'blank-plus-b-equals-c',
      'a-minus-b-equals-blank',
      'a-minus-blank-equals-c',
      'blank-minus-b-equals-c',
    ],
  },
]

function practiceSettings(format) {
  return {
    selectedRanges: format.ranges,
    selectedPatterns: format.patterns,
    questionCount: 5,
    autoShowVisualHint: false,
    showHintAfterWrongAnswer: true,
    questionFormats: format.questionFormats,
    skillTags: [],
    soundEnabled: false,
    autoReadQuestion: false,
    autoReadFeedback: false,
    speechRate: 'normal',
    speechVoiceId: '',
    adaptiveDifficulty: false,
    allowHarder: false,
  }
}

async function seedSettings(context, format) {
  await context.addInitScript((settings) => {
    window.localStorage.clear()
    window.localStorage.setItem('math-practice-settings', JSON.stringify(settings))
  }, practiceSettings(format))
}

async function clickUnique(locator, label) {
  const count = await locator.count()
  if (count !== 1) {
    throw new Error(`${label} expected 1 element, got ${count}`)
  }
  await locator.click()
}

async function pageAudit(page) {
  return page.evaluate(() => {
    const elementInfo = (selector) => {
      const el = document.querySelector(selector)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return {
        x: Math.round(r.x),
        y: Math.round(r.y),
        width: Math.round(r.width),
        height: Math.round(r.height),
        bottom: Math.round(r.bottom),
        right: Math.round(r.right),
      }
    }

    const buttons = [...document.querySelectorAll('button')]
      .map((button) => ({
        text: (button.textContent || '').replace(/\s+/g, ' ').trim(),
        rect: (() => {
          const r = button.getBoundingClientRect()
          return {
            x: Math.round(r.x),
            y: Math.round(r.y),
            width: Math.round(r.width),
            height: Math.round(r.height),
            bottom: Math.round(r.bottom),
            right: Math.round(r.right),
          }
        })(),
      }))
      .filter((item) => item.text)

    const hasHorizontalClippingAncestor = (el) => {
      let parent = el.parentElement
      while (parent && parent !== document.body) {
        const style = window.getComputedStyle(parent)
        if (['auto', 'scroll', 'hidden', 'clip'].includes(style.overflowX)) {
          return true
        }
        parent = parent.parentElement
      }
      return false
    }

    const overflowElements = [...document.querySelectorAll('*')]
      .map((el) => {
        const r = el.getBoundingClientRect()
        return {
          clipped: hasHorizontalClippingAncestor(el),
          tag: el.tagName,
          className: (el.getAttribute('class') || '').slice(0, 120),
          text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80),
          rect: {
            x: Math.round(r.x),
            y: Math.round(r.y),
            width: Math.round(r.width),
            height: Math.round(r.height),
            bottom: Math.round(r.bottom),
            right: Math.round(r.right),
          },
        }
      })
      .filter((item) => {
        if (!(item.rect.right > window.innerWidth + 1 || item.rect.x < -1)) return false
        return !item.clipped
      })
      .map(({ clipped: _clipped, ...item }) => item)
      .slice(0, 12)

    return {
      url: location.href,
      viewport: { width: innerWidth, height: innerHeight },
      page: {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
        clientHeight: document.documentElement.clientHeight,
      },
      overflowX:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth + 1,
      pictureCard: elementInfo('[data-testid="picture-question-card"]'),
      storyBanner: elementInfo('[data-testid="story-banner"]'),
      helpPanel: elementInfo('#learning-helper-panel'),
      visibleText: document.body.innerText.slice(0, 900),
      buttons,
      overflowElements,
    }
  })
}

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch()
const report = []
const consoleErrors = []

try {
  for (const vp of VIEWPORTS) {
    for (const format of FORMATS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
        isMobile: vp.name !== 'ipad-landscape',
        hasTouch: true,
        userAgent: devices['iPad (gen 7)'].userAgent,
      })
      await seedSettings(context, format)

      const page = await context.newPage()
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(`[${vp.name}/${format.name}] ${msg.text()}`)
        }
      })
      page.on('pageerror', (error) => {
        consoleErrors.push(`[${vp.name}/${format.name}] pageerror: ${error.message}`)
      })

      await page.goto(BASE, { waitUntil: 'networkidle' })
      await clickUnique(page.getByRole('button', { name: /开始做题/ }), 'start button')
      await page.getByText(format.marker).waitFor({ timeout: 8000 })
      await page.waitForTimeout(500)

      const practiceAudit = await pageAudit(page)
      await page.screenshot({
        path: resolve(OUT, `${vp.name}-${format.name}-practice.png`),
        fullPage: true,
      })

      await clickUnique(page.getByRole('button', { name: '帮帮我' }), 'help button')
      await page.locator('#learning-helper-panel').waitFor({ timeout: 8000 })
      await page.waitForTimeout(400)

      const helpAudit = await pageAudit(page)
      await page.screenshot({
        path: resolve(OUT, `${vp.name}-${format.name}-help.png`),
        fullPage: true,
      })

      report.push({
        viewport: vp.name,
        format: format.name,
        practice: practiceAudit,
        help: helpAudit,
      })

      await context.close()
      console.log(`✓ ${vp.name} / ${format.name}`)
    }
  }
} finally {
  await browser.close()
}

await writeFile(
  resolve(OUT, 'report.json'),
  JSON.stringify({ base: BASE, generatedAt: new Date().toISOString(), consoleErrors, report }, null, 2),
)

if (consoleErrors.length > 0) {
  console.error('Console errors:')
  for (const error of consoleErrors) console.error(`- ${error}`)
  process.exitCode = 1
}

console.log(`截图与报告已保存到 ${OUT}`)
