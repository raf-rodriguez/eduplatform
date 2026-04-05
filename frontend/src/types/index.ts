export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  name: string
  gradeLevel?: number
  avatarUrl?: string
  roles: string[]
}

export interface Grade {
  id: string
  name: string
  level: number
  description?: string
  hasStemTrack: boolean
  subjects: Subject[]
}

export interface Subject {
  id: string
  name: string
  code: string
  description?: string
  isStem: boolean
  modules: Module[]
}

export interface Module {
  id: string
  name: string
  description?: string
  orderIndex: number
  estimatedHours?: number
  difficulty: string
  lessons: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  description?: string
  content?: any
  videoUrl?: string
  videoDuration?: number
  duration?: number
  orderIndex: number
  resources: Resource[]
  activities: Activity[]
  assessments: Assessment[]
  progress?: Progress[]
}

export interface Resource {
  id: string
  type: string
  title: string
  url: string
}

export interface Activity {
  id: string
  type: string
  title: string
  content: any
  orderIndex: number
  isRequired: boolean
}

export interface Assessment {
  id: string
  type: string
  title: string
  description?: string
  maxScore: number
  passingScore: number
  timeLimit?: number
  maxAttempts: number
}

export interface Progress {
  id: string
  status: 'not_started' | 'in_progress' | 'completed'
  score?: number
  timeSpent: number
  attempts: number
  startedAt?: string
  completedAt?: string
}

export interface GamificationProfile {
  id: string
  level: number
  totalXp: number
  currentStreak: number
  longestStreak: number
  lastActivityAt?: string
  avatarConfig?: any
  theme: string
}

export interface Badge {
  id: string
  name: string
  description: string
  iconUrl: string
  xpValue: number
  rarity: string
  earned?: boolean
  earnedAt?: string
}
