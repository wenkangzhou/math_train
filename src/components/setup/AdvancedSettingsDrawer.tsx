import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { SkillTag } from '@/types/math'
import {
  SKILLS_BY_GROUP,
  SKILL_GROUP_LABEL,
  SKILL_META,
  type SkillGroup,
} from '@/lib/skills'

const SKILL_GROUPS: SkillGroup[] = ['add10', 'sub10', 'add20', 'sub20']

interface AdvancedSettingsDrawerProps {
  open: boolean
  skillTags: SkillTag[]
  onClose: () => void
  onToggleSkill: (tag: SkillTag) => void
  onClear: () => void
}

export function AdvancedSettingsDrawer({
  open,
  skillTags,
  onClose,
  onToggleSkill,
  onClear,
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
                    选了后将按技能出题，覆盖上面的范围
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
                              onClick={() => onToggleSkill(tag)}
                              className={[
                                'rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition',
                                active
                                  ? 'border-grass bg-grass/15 text-grass'
                                  : 'border-slate-200 bg-white text-slate-500 hover:border-grass/40',
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
