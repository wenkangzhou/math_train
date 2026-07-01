# 数数小火车 · Math Train

面向 4～7 岁儿童的 **20 以内加减法练习** 网页小游戏。大按钮、大字号、可爱的小火车吉祥物、即时温和的语音反馈。

纯前端单页应用，无需登录与后端；设置、练习记录、错题本与收藏进度保存在浏览器 `localStorage`。

## 技术栈

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3（含自定义 `ipad-land` 断点）
- Framer Motion（动效与拖拽）
- Lucide React（图标）
- Web Speech API（中文语音朗读）
- Vitest（题目生成器、学习数据、收藏系统等单元测试）

## 启动

```bash
pnpm install
pnpm dev        # 本地开发，默认 http://localhost:5173（已开启 --host，可局域网真机访问）
pnpm test       # 运行全量单元测试
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
- **做题页**：大号算式卡片、数字键盘（按范围显示 0~10 或 0~20）、进度条、星星与连对、可视化数量提示（拖拽摆一摆 / 开走动画）。支持键盘数字 / 退格 / 回车。
- **结果页**：庆祝动画、到站奖励卡片、正向评价等级、答对数 / 正确率 / 最长连对 / 提示次数、再练一次 / 马上订正 / 重新选择。
- **奖励系统**：原创机车收藏系统，14 辆功能各异的机车按累计星星逐步解锁；每辆机车都有专属任务路线，完成练习可收集路线邮票并累计到站次数。
- **长期错题本**：记录错题、曾答答案、累计尝试与最近练习时间；按隔天、3 天、7 天三阶段间隔复习，全部答对后归入「已掌握」。
- **练习记录**：保存每轮练习起止时间、用时和题数，按天展示每日累计与本周累计。
- **家长中心**：查看累计星星、练习题数、正确率、连续练习天数与错题分布，辅助家长了解学习进度。
- **语音朗读**：基于浏览器 Web Speech API，自动选择中文女声，支持朗读题目与反馈。

## 目录结构

```
src/
├── App.tsx                  # 三屏状态机：setup / practice / result
├── main.tsx
├── index.css                # Tailwind + 全局样式（含 prefers-reduced-motion）
├── types/
│   ├── math.ts              # 题目与练习相关类型
│   ├── rewards.ts           # 奖励 / 机车收藏类型
│   └── storage.ts           # 本地存储类型
├── lib/
│   ├── questionGenerator.ts # 题目生成（逻辑与 UI 分离）
│   ├── questionValidator.ts # 答案校验 / 题目合法性
│   ├── difficulty.ts        # 题型难度 + 结果等级
│   ├── visualTheme.ts       # 提示素材（emoji，可替换为插画）
│   ├── storage.ts           # 练习历史 localStorage 读写
│   ├── appStorage.ts        # 学习档案、错题本、奖励状态读写
│   ├── carriages.ts         # 14 辆原创机车目录
│   ├── trainRoutes.ts       # 机车任务路线与到站奖励
│   ├── spacedReview.ts      # 错题间隔复习阶段计算
│   ├── practiceHistory.ts   # 练习时长与每日累计
│   ├── speech.ts            # Web Speech API 中文朗读
│   ├── sound.ts             # 轻量合成音效（默认关闭）
│   └── migrations.ts        # 本地存储版本迁移
└── components/
    ├── common/              # TrainMascot / OfflineStatusBadge / SectionCard
    ├── setup/               # SetupScreen + 选择器 + 首页入口
    ├── practice/            # PracticeScreen + 题卡 / 键盘 / 提示 / 反馈
    ├── result/              # ResultScreen + 庆祝 / 统计 / 操作
    ├── rewards/             # RewardDrawer / 机车插画
    ├── history/             # PracticeHistoryDrawer 练习记录
    ├── wrongBook/           # WrongBookDrawer 错题本
    └── parent/              # ParentCenterDrawer 家长中心
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

测试覆盖六种题型各 1000 个样本的合法性、四个范围各 2000 个样本的边界条件，以及学习数据、错题本、机车收藏等模块。当前共 47 个用例。
