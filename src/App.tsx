import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type {
  PracticeResult,
  PracticeSettings,
  Question,
  StoredHistory,
} from '@/types/math'
import type { Carriage, RouteReward } from '@/types/rewards'
import { generateQuestions } from '@/lib/questionGenerator'
import {
  loadHistory,
  loadSettings,
  recordPractice,
  saveSettings,
} from '@/lib/storage'
import { resultLevel } from '@/lib/difficulty'
import { SetupScreen, type StartSettings } from '@/components/setup/SetupScreen'
import { PracticeScreen } from '@/components/practice/PracticeScreen'
import { ResultScreen } from '@/components/result/ResultScreen'
import { OfflineStatusBadge } from '@/components/common/OfflineStatusBadge'
import {
  loadAppStorage,
  recordLearningResult,
  saveProfileSettings,
  selectRewardHead,
} from '@/lib/appStorage'
import {
  DEFAULT_PROFILE_SETTINGS,
  DEFAULT_LEVEL,
  createDefaultRewardState,
} from '@/lib/defaults'
import { isReviewDue } from '@/lib/spacedReview'
import { settingsForDifficulty } from '@/lib/adaptiveDifficulty'

type Screen = 'setup' | 'practice' | 'result'
type SessionKind = 'regular' | 'review'

// 练习设置（含第二版的题型格式与细分技能）
type ActiveSettings = PracticeSettings &
  Partial<Pick<StartSettings, 'questionFormats' | 'skillTags' | 'soundEnabled' | 'autoReadQuestion' | 'autoReadFeedback' | 'speechRate' | 'speechVoiceId' | 'adaptiveDifficulty' | 'allowHarder'>>

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup')
  const [settings, setSettings] = useState<ActiveSettings>(() => loadSettings())
  const [questions, setQuestions] = useState<Question[]>([])
  const [result, setResult] = useState<PracticeResult | null>(null)
  const [history, setHistory] = useState<StoredHistory>(() => loadHistory())
  const [learningData, setLearningData] = useState(() => loadAppStorage())
  const [newlyUnlocked, setNewlyUnlocked] = useState<Carriage[]>([])
  const [routeReward, setRouteReward] = useState<RouteReward | null>(null)
  const [difficultyChange, setDifficultyChange] = useState<{ from: string; to: string } | null>(null)
  const [sessionKind, setSessionKind] = useState<SessionKind>('regular')

  const profileId =
    learningData.activeProfileId ?? learningData.profiles[0]?.id ?? ''
  const reward =
    learningData.rewardsByProfile[profileId] ??
    createDefaultRewardState(history.totalStars)
  const wrongRecords = learningData.wrongQuestionsByProfile[profileId] ?? []
  const practiceHistory = learningData.historyByProfile[profileId] ?? []
  const currentLevel = learningData.profiles.find((profile) => profile.id === profileId)?.currentLevel ?? DEFAULT_LEVEL

  const generateForSettings = useCallback(
    (nextSettings: ActiveSettings) =>
      generateQuestions(settingsForDifficulty(nextSettings, currentLevel)),
    [currentLevel],
  )

  const startWith = useCallback(
    (s: ActiveSettings, qs: Question[], kind: SessionKind = 'regular') => {
      saveSettings(s)
      if (profileId) {
        setLearningData(saveProfileSettings(profileId, {
          ...DEFAULT_PROFILE_SETTINGS,
          ...s,
          questionFormats: s.questionFormats ?? ['equation'],
          skillTags: s.skillTags ?? [],
        }))
      }
      setSettings(s)
      setQuestions(qs)
      setResult(null)
      setNewlyUnlocked([])
      setRouteReward(null)
      setDifficultyChange(null)
      setSessionKind(kind)
      setScreen('practice')
    },
    [profileId],
  )

  // 从设置页开始
  const handleStart = useCallback(
    (s: StartSettings) => {
      startWith(s, generateForSettings(s))
    },
    [generateForSettings, startWith],
  )

  // 练习完成 → 统计 + 写入本地 → 结果页
  const handleComplete = useCallback((res: PracticeResult) => {
    const level = resultLevel(res.accuracy)
    const history = recordPractice({
      entry: {
        date: Date.now(),
        total: res.total,
        correct: res.correctCount,
        stars: res.stars,
        bestStreak: res.bestStreak,
        accuracy: res.accuracy,
      },
      earnedStars: res.stars,
      wrongQuestions: res.wrongQuestions,
    })
    setHistory(history)
    if (profileId) {
      const learningUpdate = recordLearningResult({
        profileId,
        settings,
        result: res,
        sessionKind,
      })
      setLearningData(learningUpdate.storage)
      setNewlyUnlocked(learningUpdate.newlyUnlocked)
      setRouteReward(learningUpdate.routeReward)
      setDifficultyChange(learningUpdate.difficultyChange)
    }
    setResult(res)
    setScreen('result')
    void level
  }, [profileId, sessionKind, settings])

  // 退出练习，回到设置
  const handleExit = useCallback(() => {
    setScreen('setup')
  }, [])

  // 结果页操作
  const handleReplay = useCallback(() => {
    // 同样设置，重新生成新题
    startWith(settings, generateForSettings(settings))
  }, [generateForSettings, settings, startWith])

  const handlePracticeWrong = useCallback(() => {
    if (!result || result.wrongQuestions.length === 0) return
    // 用错题原样再练一遍（重新洗一下顺序）
    const shuffled = [...result.wrongQuestions].sort(() => Math.random() - 0.5)
    startWith(settings, shuffled, 'review')
  }, [result, settings, startWith])

  const handlePracticeSavedWrong = useCallback(() => {
    const pendingQuestions = wrongRecords
      .filter((item) => isReviewDue(item))
      .sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt))
      .slice(0, 10)
      .map((item) => item.question)
    if (pendingQuestions.length === 0) return
    const shuffled = [...pendingQuestions].sort(
      () => Math.random() - 0.5,
    )
    startWith(settings, shuffled, 'review')
  }, [wrongRecords, settings, startWith])

  const handleSelectHead = useCallback((id: string) => {
    if (!profileId) return
    setLearningData(selectRewardHead(profileId, id))
  }, [profileId])

  const handleReconfigure = useCallback(() => {
    setScreen('setup')
  }, [])

  return (
    <div className="min-h-full w-full px-safe">
      <OfflineStatusBadge />
      <AnimatePresence mode="wait">
        {screen === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <SetupScreen
              initialSettings={settings}
              history={history}
              practiceHistory={practiceHistory}
              reward={reward}
              wrongRecords={wrongRecords}
              currentLevel={currentLevel}
              onStart={handleStart}
              onPracticeWrong={handlePracticeSavedWrong}
              onSelectHead={handleSelectHead}
            />
          </motion.div>
        )}

        {screen === 'practice' && (
          <motion.div
            key="practice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <PracticeScreen
              questions={questions}
              settings={settings}
              reward={reward}
              onComplete={handleComplete}
              onExit={handleExit}
            />
          </motion.div>
        )}

        {screen === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ResultScreen
              result={result}
              totalStars={reward.stars}
              newlyUnlocked={newlyUnlocked}
              routeReward={routeReward}
              difficultyChange={difficultyChange}
              onReplay={handleReplay}
              onPracticeWrong={handlePracticeWrong}
              onReconfigure={handleReconfigure}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
