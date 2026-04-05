// Daily Challenges - Frontend-only system
// Generates and tracks daily challenges using localStorage

import { useState, useEffect } from 'react'

export interface DailyChallenge {
  id: string
  title: string
  description: string
  type: ChallengeType
  target: number
  progress: number
  xpReward: number
  difficulty: Difficulty
  completed: boolean
  completedAt?: string
  actionUrl?: string
  subjectName?: string
}

export interface DailyChallengeSet {
  date: string
  challenges: DailyChallenge[]
}

export interface ChallengeHistoryEntry {
  date: string
  challenges: DailyChallenge[]
  completedCount: number
  totalCount: number
}

export type ChallengeType =
  | 'complete_lessons'
  | 'study_time'
  | 'quiz_score'
  | 'review_subjects'
  | 'maintain_streak'

export type Difficulty = 'easy' | 'medium' | 'hard'

// Storage keys
const STORAGE_PREFIX = 'daily_challenges_'
const HISTORY_KEY = 'daily_challenges_history'
const STREAK_KEY = 'daily_challenges_streak'

// Challenge templates
const CHALLENGE_TEMPLATES: Array<{
  type: ChallengeType
  titles: Record<Difficulty, string>
  descriptions: Record<Difficulty, string>
  targets: Record<Difficulty, number>
  xpRewards: Record<Difficulty, number>
}> = [
    {
      type: 'complete_lessons',
      titles: {
        easy: 'Completa 2 lecciones de {subject}',
        medium: 'Completa 3 lecciones de {subject}',
        hard: 'Completa 4 lecciones de {subject}',
      },
      descriptions: {
        easy: 'Avanza en tu materia completando lecciones hoy.',
        medium: 'Desaf&iacute;o de lecciones: completa varias sesiones de estudio.',
        hard: 'Modo intenso: demuestra tu dedicaci&oacute;n completando m&uacute;ltiples lecciones.',
      },
      targets: { easy: 2, medium: 3, hard: 4 },
      xpRewards: { easy: 25, medium: 40, hard: 60 },
    },
    {
      type: 'study_time',
      titles: {
        easy: 'Estudia por 15 minutos',
        medium: 'Estudia por 30 minutos',
        hard: 'Estudia por 45 minutos',
      },
      descriptions: {
        easy: 'Dedica tiempo a estudiar hoy.',
        medium: 'Sesi&oacute;n de estudio de media hora.',
        hard: 'Sesi&oacute;n intensiva de estudio.',
      },
      targets: { easy: 15, medium: 30, hard: 45 },
      xpRewards: { easy: 20, medium: 30, hard: 50 },
    },
    {
      type: 'quiz_score',
      titles: {
        easy: 'Completa un quiz con 60%+',
        medium: 'Completa un quiz con 80%+',
        hard: 'Completa un quiz con 90%+',
      },
      descriptions: {
        easy: 'Demuestra lo que sabes en un quiz.',
        medium: 'Obt&eacute;n una buena calificacion en un quiz.',
        hard: 'Excelencia: obt&eacute;n una puntuaci&oacute;n sobresaliente.',
      },
      targets: { easy: 60, medium: 80, hard: 90 },
      xpRewards: { easy: 30, medium: 50, hard: 75 },
    },
    {
      type: 'review_subjects',
      titles: {
        easy: 'Revisa 2 materias diferentes',
        medium: 'Revisa 3 materias diferentes',
        hard: 'Revisa 4 materias diferentes',
      },
      descriptions: {
        easy: 'Explora un par de materias hoy.',
        medium: 'Var&iacute;a tu estudio revisando varias materias.',
        hard: 'Estudio multidisciplinario: revisa muchas materias.',
      },
      targets: { easy: 2, medium: 3, hard: 4 },
      xpRewards: { easy: 25, medium: 40, hard: 55 },
    },
    {
      type: 'maintain_streak',
      titles: {
        easy: 'Mant&eacute;n tu racha',
        medium: 'Mant&eacute;n tu racha de {streak} d&iacute;as',
        hard: 'Mant&eacute;n tu racha &iexcl;y completa todos los desaf&iacute;os!',
      },
      descriptions: {
        easy: 'No rompas tu racha de estudio diario.',
        medium: 'Tu racha sigue creciendo, &iexcl;sigue as&iacute;!',
        hard: 'Racha perfecta: completa todo para mantener tu racha.',
      },
      targets: { easy: 1, medium: 1, hard: 1 },
      xpRewards: { easy: 15, medium: 25, hard: 40 },
    },
  ]

// Seeded random for consistent daily generation
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function getDateSeed(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

function dateToString(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getDifficulty(streak: number, daysUsing: number): Difficulty {
  if (streak >= 14 || daysUsing >= 30) return 'hard'
  if (streak >= 7 || daysUsing >= 14) return 'medium'
  return 'easy'
}

function shuffle<T>(array: T[], random: () => number): T[] {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

// Default subjects to use when curriculum is not available
const DEFAULT_SUBJECTS = [
  { name: 'Matem&aacute;ticas', code: 'MATH' },
  { name: 'Ciencias', code: 'SCI' },
  { name: 'Historia', code: 'HIST' },
  { name: 'Lengua', code: 'LANG' },
  { name: 'Ingl&eacute;s', code: 'ENG' },
]

function getSubjects(): Array<{ name: string; code: string }> {
  try {
    const stored = localStorage.getItem('daily_challenges_subjects')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // ignore
  }
  return DEFAULT_SUBJECTS
}

export function setSubjects(subjects: Array<{ name: string; code: string }>): void {
  localStorage.setItem('daily_challenges_subjects', JSON.stringify(subjects))
}

// Generate challenges for a given date
export function generateChallenges(
  date: Date,
  streak: number,
  daysUsing: number,
  subjects?: Array<{ name: string; code: string }>
): DailyChallenge[] {
  const seed = getDateSeed(date)
  const random = seededRandom(seed)
  const difficulty = getDifficulty(streak, daysUsing)
  const subjectList = subjects || getSubjects()

  // Pick 3 random challenge types
  const shuffledTemplates = shuffle(CHALLENGE_TEMPLATES, random)
  const selectedTemplates = shuffledTemplates.slice(0, 3)

  // Shuffle subjects for variety
  const shuffledSubjects = shuffle(subjectList, random)

  return selectedTemplates.map((template, index) => {
    const subject = shuffledSubjects[index % shuffledSubjects.length]
    const id = `${dateToString(date)}-${template.type}-${index}`

    let title = template.titles[difficulty]
    let description = template.descriptions[difficulty]

    // Replace placeholders
    title = title.replace('{subject}', subject.name)
    title = title.replace('{streak}', String(streak))
    description = description.replace('{subject}', subject.name)

    // Determine action URL based on challenge type
    let actionUrl: string | undefined
    if (template.type === 'complete_lessons' || template.type === 'review_subjects') {
      actionUrl = '/student/curriculum'
    } else if (template.type === 'study_time') {
      actionUrl = '/student/curriculum'
    } else if (template.type === 'quiz_score') {
      actionUrl = '/student/curriculum'
    }

    return {
      id,
      title,
      description,
      type: template.type,
      target: template.targets[difficulty],
      progress: 0,
      xpReward: template.xpRewards[difficulty],
      difficulty,
      completed: false,
      actionUrl,
      subjectName: subject.name,
    }
  })
}

// Days using the system
function getDaysUsing(): number {
  const stored = localStorage.getItem('daily_challenges_first_use')
  if (!stored) {
    localStorage.setItem('daily_challenges_first_use', dateToString(new Date()))
    return 1
  }
  const firstUse = new Date(stored)
  const now = new Date()
  const diffTime = now.getTime() - firstUse.getTime()
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
}

// Streak tracking (internal, uses STREAK_KEY)
function internalGetStreak(): number {
  const stored = localStorage.getItem(STREAK_KEY)
  return stored ? parseInt(stored, 10) : 0
}

function incrementStreak(): void {
  const current = internalGetStreak()
  const today = dateToString(new Date())
  const lastActive = localStorage.getItem(`${STREAK_KEY}_last_active`)

  // Only increment if not already incremented today
  if (lastActive !== today) {
    localStorage.setItem(STREAK_KEY, String(current + 1))
    localStorage.setItem(`${STREAK_KEY}_last_active`, today)
  }
}

// Reset streak if a day was missed
export function checkAndResetStreak(): void {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayStr = dateToString(today)
  const yesterdayStr = dateToString(yesterday)
  const lastActive = localStorage.getItem(`${STREAK_KEY}_last_active`)

  if (lastActive && lastActive !== todayStr && lastActive !== yesterdayStr) {
    localStorage.setItem(STREAK_KEY, '0')
  }
}

// Public API - Get current streak
export function getStreak(): number {
  checkAndResetStreak()
  return internalGetStreak()
}

// History tracking
function saveToHistory(challenges: DailyChallenge[]): void {
  const today = dateToString(new Date())
  const history = getChallengeHistory()

  // Remove today's entry if exists (overwrite)
  const filtered = history.filter((h) => h.date !== today)

  const entry: ChallengeHistoryEntry = {
    date: today,
    challenges,
    completedCount: challenges.filter((c) => c.completed).length,
    totalCount: challenges.length,
  }

  // Keep only last 30 days
  const updated = [entry, ...filtered].slice(0, 30)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
}

export function getChallengeHistory(days = 7): ChallengeHistoryEntry[] {
  const stored = localStorage.getItem(HISTORY_KEY)
  if (!stored) return []

  try {
    const history: ChallengeHistoryEntry[] = JSON.parse(stored)
    return history.slice(0, days)
  } catch {
    return []
  }
}

// Get today's challenges (generates if not exists for today)
export function getTodayChallenges(): DailyChallenge[] {
  const today = dateToString(new Date())
  const key = `${STORAGE_PREFIX}${today}`

  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // regenerate if corrupted
    }
  }

  // Generate new challenges
  const streak = getStreak()
  const daysUsing = getDaysUsing()
  const challenges = generateChallenges(new Date(), streak, daysUsing)

  localStorage.setItem(key, JSON.stringify(challenges))
  return challenges
}

// Mark a challenge as complete
export function markChallengeComplete(challengeId: string): boolean {
  const today = dateToString(new Date())
  const key = `${STORAGE_PREFIX}${today}`

  const stored = localStorage.getItem(key)
  if (!stored) return false

  try {
    const challenges: DailyChallenge[] = JSON.parse(stored)
    const challenge = challenges.find((c) => c.id === challengeId)
    if (!challenge || challenge.completed) return false

    challenge.completed = true
    challenge.progress = challenge.target
    challenge.completedAt = new Date().toISOString()

    localStorage.setItem(key, JSON.stringify(challenges))

    // Check if all challenges are completed
    const allCompleted = challenges.every((c) => c.completed)
    if (allCompleted) {
      incrementStreak()
    }

    // Save to history
    saveToHistory(challenges)

    return true
  } catch {
    return false
  }
}

// Update challenge progress (called externally when user completes lessons, etc.)
export function updateChallengeProgress(challengeId: string, increment: number): void {
  const today = dateToString(new Date())
  const key = `${STORAGE_PREFIX}${today}`

  const stored = localStorage.getItem(key)
  if (!stored) return

  try {
    const challenges: DailyChallenge[] = JSON.parse(stored)
    const challenge = challenges.find((c) => c.id === challengeId)
    if (!challenge || challenge.completed) return

    challenge.progress = Math.min(challenge.progress + increment, challenge.target)

    if (challenge.progress >= challenge.target) {
      markChallengeComplete(challengeId)
    } else {
      localStorage.setItem(key, JSON.stringify(challenges))
    }
  } catch {
    // ignore
  }
}

// Get total XP earned from daily challenges
export function getTotalDailyXP(): number {
  const history = getChallengeHistory(30)
  return history.reduce((total, day) => {
    const dayXP = day.challenges
      .filter((c) => c.completed)
      .reduce((sum, c) => sum + c.xpReward, 0)
    return total + dayXP
  }, 0)
}

// Get today's total earned XP
export function getTodayEarnedXP(): number {
  const challenges = getTodayChallenges()
  return challenges
    .filter((c) => c.completed)
    .reduce((sum, c) => sum + c.xpReward, 0)
}

// Get today's potential XP
export function getTodayPotentialXP(): number {
  const challenges = getTodayChallenges()
  return challenges.reduce((sum, c) => sum + c.xpReward, 0)
}

// Manual reset for testing
export function resetDailyChallenges(): void {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(STORAGE_PREFIX) || key === HISTORY_KEY || key?.startsWith(STREAK_KEY)) {
      keys.push(key)
    }
  }
  keys.forEach((key) => localStorage.removeItem(key))
}

// Hook-like function for use in components
export function useDailyChallenges() {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([])
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setChallenges(getTodayChallenges())
    setStreak(getStreak())
    setIsLoading(false)
  }, [])

  const completeChallenge = (id: string) => {
    markChallengeComplete(id)
    setChallenges(getTodayChallenges())
  }

  return { challenges, streak, isLoading, completeChallenge }
}
