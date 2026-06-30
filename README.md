# 数数小火车 · Math Train

面向 4～7 岁儿童的 **20 以内加减法练习** 网页。像一个轻量的数学小游戏：大按钮、大字号、可爱的小火车吉祥物、即时温和的反馈。

纯前端单页应用，无需登录与后端，设置与练习记录保存在浏览器 `localStorage`。

## 技术栈

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Framer Motion（动效）
- Lucide React（图标）
- Vitest（题目生成器单元测试）

## 启动

```bash
pnpm install
pnpm dev        # 本地开发，默认 http://localhost:5173（已开启 --host，可局域网真机访问）
pnpm test       # 运行题目生成器测试
pnpm build      # 类型检查 + 生产构建
pnpm preview    # 预览构建产物
pnpm gen:icons  # 由 public/logo-v2.png 生成 PWA / iOS 图标到 public/icons/
pnpm shots [url]# Playwright 截 iPad 横竖屏布局图到 screenshots/（默认 http://localhost:4173）
```

## iPad / PWA

- **添加到主屏**：含 `manifest.webmanifest` 与 iOS `apple-mobile-web-app-*` meta，主屏图标名为「数数小火车」，全屏 standalone 运行。图标由 `pnpm gen:icons` 从 `public/logo-v2.png` 生成（192/512/maskable + 180 apple-touch）。
- **离线使用**：生产构建会扫描 `dist` 并生成版本化 `sw.js`，预缓存应用壳、带 hash 的 JS/CSS 与必要图标；首次在线打开后即可断网继续练习。新版本激活时会自动清理旧缓存。
- **横竖屏适配**：竖屏纵向布局；横屏（`ipad-land` = 宽≥1024 且横向）练习页改两栏（左题目+提示、右键盘），设置页选项卡双列，均一屏可见、不溢出；处理了 `env(safe-area-inset-*)` 安全区与动态视口高度 `100dvh`。不锁屏。
- **自查**：`pnpm build && pnpm preview` 后 `pnpm shots`，覆盖 iPad / iPad Pro 的竖屏与横屏。

## 功能

- **设置页**：四种练习范围多选（10/20 以内加/减）、六种题型多选（标准题 + 缺项题）、题量（5/10/20）、提示/音效/自动朗读开关。题型会根据所选运算自动启用/置灰。
- **做题页**：大号算式卡片、数字键盘（按范围显示 0~10 或 0~20）、进度条、星星与连对、可视化数量提示（六种题型各自布局，减法含「开走」动画）。支持键盘数字 / 退格 / 回车。
- **结果页**：庆祝动画、正向评价等级、答对数 / 正确率 / 最长连对 / 提示次数、再练一次 / 练习错题 / 重新选择。
- **奖励系统**：首次答对获得星星，按逐步拉长的里程碑解锁 14 辆不同配色与功能的原创机车；每辆机车都有工作、性格和故事档案，可在轨道上试跑，并可切换已解锁机车。
- **长期错题本**：记录题目、曾答答案、累计尝试与最近练习时间；错题连续两次独立答对后自动归入「已掌握」，待巩固题可从首页集中练习。

## 目录结构

```
src/
├── App.tsx                  # 三屏状态机：setup / practice / result
├── main.tsx
├── index.css                # Tailwind + 全局样式（含 prefers-reduced-motion）
├── types/
│   └── math.ts              # 全部数据类型
├── lib/
│   ├── questionGenerator.ts # 题目生成（逻辑与 UI 分离）
│   ├── questionGenerator.test.ts
│   ├── questionValidator.ts # 答案校验 / 题目合法性
│   ├── difficulty.ts        # 题型难度 + 结果等级
│   ├── visualTheme.ts       # 提示素材（emoji，可替换为插画）
│   ├── storage.ts           # localStorage 读写
│   └── sound.ts             # 轻量合成音效（默认关闭）
└── components/
    ├── common/              # TrainMascot / SectionCard / ConfirmExitDialog
    ├── setup/               # SetupScreen + 选择器
    ├── practice/            # PracticeScreen + 题卡 / 键盘 / 提示 / 反馈
    └── result/              # ResultScreen + 庆祝 / 统计 / 操作
```

## 部署（Vercel）

推送到 GitHub 后在 Vercel 导入即可，框架预设选 **Vite**：

- Build Command: `pnpm build`
- Output Directory: `dist`

仓库已含 `vercel.json`（SPA 重写）。

## 题目生成规则要点

- 不产生负数、不超出所选范围；先生成完整等式再「挖空」，保证等式始终成立。
- 题型按权重分布：标准结果题 > 中间缺项题 > 前项缺失题；`? - b = c` 最难、出现频率最低。
- 避免相邻两题完全相同的数字 + 题型组合；大概率跳过 `0 + n`、`n - 0` 等过于简单题。
- 用户手动选择题型后以用户选择为准。

测试覆盖六种题型各 1000 个样本的合法性，以及四个范围各 2000 个样本的边界条件。
