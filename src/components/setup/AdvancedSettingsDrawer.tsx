import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { SkillTag } from '@/types/math'
import {
  SKILLS_BY_GROUP,
  SKILL_GROUP_LABEL,
  SKILL_META,
  type SkillGroup,
} from '@/lib/skills'
import { getDifficultyLabel } from '@/lib/adaptiveDifficulty'

const SKILL_GROUPS: SkillGroup[] = ['add10', 'sub10', 'add20', 'sub20']

interface AdvancedSettingsDrawerProps {
  open: boolean
  skillTags: SkillTag[]
  adaptiveDifficulty: boolean
  allowHarder: boolean
  currentLevel: string
  onClose: () => void
  onToggleSkill: (tag: SkillTag) => void
  onClear: () => void
  onChangeAdaptiveDifficulty: (value: boolean) => void
  onChangeAllowHarder: (value: boolean) => void
}

export function AdvancedSettingsDrawer({
  open,
  skillTags,
  adaptiveDifficulty,
  allowHarder,
  currentLevel,
  onClose,
  onToggleSkill,
  onClear,
  onChangeAdaptiveDifficulty,
  onChangeAllowHarder,
}: AdvancedSettingsDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />

          {/* 面板：手机底部半弹层 / iPad 横屏右侧抽屉 */}
          <motion.div
            initial={{ y: '100%', x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: '100%', x: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={[
              'fixed z-50 bg-white shadow-2xl',
              // 手机：底部半弹层
              'inset-x-0 bottom-0 h-[82vh] rounded-t-3xl',
              // iPad 横屏：右侧抽屉
              'ipad-land:left-auto ipad-land:right-0 ipad-land:top-0 ipad-land:bottom-0 ipad-land:h-full ipad-land:w-[420px] ipad-land:rounded-none ipad-land:rounded-l-3xl',
            ].join(' ')}
          >
            <div className="flex h-full flex-col">
              {/* 头部 */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 ipad-land:px-6">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-700">
                    难度细分
                  </h2>
                  <p className="text-sm text-slate-400">
                    可自动调节，也可以手动选择专项技能
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                  aria-label="关闭"
                >
                  <X size={22} />
                </button>
              </div>

              {/* 内容 */}
              <div className="flex-1 overflow-y-auto px-5 py-4 ipad-land:px-6">
                <div className="space-y-5">
                  <section className="rounded-[24px] bg-gradient-to-br from-sky-50 to-emerald-50 p-4 ring-1 ring-sky-100">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-extrabold text-slate-700">自动难度调节</p>
                        <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                          连续两趟轻松答对会升一级；明显吃力时退一级，不会在一趟中途突然变化。
                        </p>
                        <p className="mt-1.5 text-xs font-bold leading-5 text-sky-700">
                          开启后仍按你选择的加法/减法练习，但 10/20 难度、算式题型和专项技能由系统安排。
                        </p>
                      </div>
                      <SwitchButton
                        checked={adaptiveDifficulty}
                        label="自动难度调节"
                        onChange={onChangeAdaptiveDifficulty}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-3 py-2.5 ring-1 ring-white">
                      <span className="text-xs font-bold text-slate-400">当前阶段</span>
                      <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-extrabold text-sky-700">
                        {getDifficultyLabel(currentLevel)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-extrabold text-slate-600">允许进阶到20以内</p>
                        <p className="mt-0.5 text-xs font-medium text-slate-400">关闭时最高停在10以内进阶</p>
                      </div>
                      <SwitchButton
                        checked={allowHarder}
                        disabled={!adaptiveDifficulty}
                        label="允许进阶到20以内"
                        onChange={onChangeAllowHarder}
                      />
                    </div>
                  </section>

                  <div className={adaptiveDifficulty ? 'opacity-55' : ''}>
                    <p className="mb-1 text-sm font-extrabold text-slate-600">手动专项技能</p>
                    <p className="mb-3 text-xs font-medium text-slate-400">
                      {adaptiveDifficulty ? '自动模式开启时暂不使用这些手动选择' : '留空时按上方练习范围正常出题'}
                    </p>
                  </div>
                  {SKILL_GROUPS.map((g) => (
                    <div key={g}>
                      <p className="mb-2 text-sm font-bold text-slate-600">
                        {SKILL_GROUP_LABEL[g]}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {SKILLS_BY_GROUP[g].map((tag) => {
                          const active = skillTags.includes(tag)
                          return (
                            <button
                              key={tag}
                              type="button"
                              disabled={adaptiveDifficulty}
                              onClick={() => onToggleSkill(tag)}
                              className={[
                                'rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition',
                                active
                                  ? 'border-grass bg-grass/15 text-grass'
                                  : 'border-slate-200 bg-white text-slate-500 hover:border-grass/40',
                                adaptiveDifficulty ? 'cursor-not-allowed' : '',
                              ].join(' ')}
                            >
                              {SKILL_META[tag].label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 底部操作 */}
              <div className="border-t border-slate-100 px-5 py-4 ipad-land:px-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium text-slate-500">
                    已选 {skillTags.length} 项
                  </span>
                  <div className="flex gap-3">
                    {skillTags.length > 0 && (
                      <button
                        type="button"
                        onClick={onClear}
                        className="rounded-full px-4 py-2 text-sm font-bold text-coral transition hover:bg-coral/10"
                      >
                        清空
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-full bg-grass px-5 py-2 text-sm font-bold text-white shadow-soft transition hover:brightness-105"
                    >
                      完成
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function SwitchButton({
  checked,
  disabled = false,
  label,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  label: string
  onChange: (value: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative h-8 w-14 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-4 focus-visible:ring-sky/40 disabled:cursor-not-allowed disabled:opacity-40',
        checked ? 'bg-grass' : 'bg-slate-300',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform',
          checked ? 'left-1 translate-x-6' : 'left-1 translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}
