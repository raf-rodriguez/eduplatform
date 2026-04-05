# 🎮 EduPlatform - Sistema de Gamificación

## Visión General

El sistema de gamificación de EduPlatform está diseñado para motivar y enganchar a los estudiantes mediante mecánicas de juego adaptadas por edad y nivel académico.

---

## 🎯 Principios de Diseño

### Por Grupo de Edad

| Grupo | Edad | Enfoque | Mecánicas Principales |
|-------|------|---------|----------------------|
| **Early** | 4-7 | Exploración, diversión | Personajes, colores, sonidos, recompensas inmediatas |
| **Middle** | 8-11 | Competencia, logros | Niveles, badges, colecciones, desafíos |
| **Teen** | 12-18 | Autonomía, propósito | Rutas de carrera, mentoría, proyectos, portafolio |

---

## 📊 Sistema de Niveles

### Estructura de Progresión

```
NIVEL 1: EXPLORADOR (0 - 99 XP)
├─ Desbloquea: Avatar básico
├─ Desbloquea: 3 temas de color
└─ Beneficio: Acceso a contenido básico

NIVEL 2: APRENDIZ (100 - 299 XP)
├─ Desbloquea: Nuevas opciones de avatar
├─ Desbloquea: Insignias de perfil
└─ Beneficio: +5% bonus XP por lección

NIVEL 3: ESTUDIANTE (300 - 599 XP)
├─ Desbloquea: Fondos personalizados
├─ Desbloquea: Emojis en chat
└─ Beneficio: Acceso a desafíos diarios

NIVEL 4: ERUDITO (600 - 999 XP)
├─ Desbloquea: Marco de perfil especial
├─ Desbloquea: Animaciones de victoria
└─ Beneficio: +10% bonus XP por lección

NIVEL 5: EXPERTO (1,000 - 1,999 XP)
├─ Desbloquea: Contenido avanzado temprano
├─ Desbloquea: Crear grupos de estudio
└─ Beneficio: Acceso a mentoría

NIVEL 6: MAESTRO (2,000 - 3,999 XP)
├─ Desbloquea: Ayudar a otros (gana XP)
├─ Desbloquea: Insignia de mentor
└─ Beneficio: +15% bonus XP por lección

NIVEL 7: SABIO (4,000 - 7,999 XP)
├─ Desbloquea: Proyectos especiales
├─ Desbloquea: Acceso beta a features
└─ Beneficio: Doble XP fines de semana

NIVEL 8: GENIO (8,000 - 14,999 XP)
├─ Desbloquea: Desafíos personalizados
├─ Desbloquea: Perfil destacado
└─ Beneficio: +20% bonus XP por lección

NIVEL 9: LEGENDARIO (15,000 - 29,999 XP)
├─ Desbloquea: Mentor de nuevos estudiantes
├─ Desbloquea: Voto en nuevas features
└─ Beneficio: Triple XP en tu cumpleaños

NIVEL 10: INMORTAL (30,000+ XP)
├─ Desbloquea: Acceso a todo el contenido
├─ Desbloquea: Título personalizado
└─ Beneficio: +25% bonus XP permanente
```

### Fórmula de XP

```typescript
interface XPCalculation {
  // XP base por actividad
  baseXP: {
    lessonCompleted: 50;
    quizPassed: 30;
    quizPerfect: 50; // 100%
    examPassed: 100;
    examPerfect: 150;
    projectCompleted: 200;
    activityCompleted: 25;
    streakBonus: 10; // por día de racha
    helpPeer: 20;
    dailyChallenge: 40;
  };

  // Multiplicadores
  multipliers: {
    difficulty: {
      beginner: 1.0;
      intermediate: 1.2;
      advanced: 1.5;
    };
    speed: {
      fast: 1.1; // < 50% tiempo
      normal: 1.0;
      slow: 0.9; // > 150% tiempo
    };
    streak: {
      '3_days': 1.05;
      '7_days': 1.1;
      '14_days': 1.15;
      '30_days': 1.25;
    };
    level: {
      // Bonus por nivel del estudiante
      formula: (level: number) => 1 + (level * 0.01);
    };
  };
}

// Cálculo completo
function calculateXP(
  activity: Activity,
  student: Student
): number {
  let xp = baseXP[activity.type];
  
  // Multiplicador de dificultad
  xp *= multipliers.difficulty[activity.difficulty];
  
  // Multiplicador de velocidad
  xp *= multipliers.speed[activity.speedCategory];
  
  // Multiplicador de racha
  const streakDays = student.currentStreak;
  if (streakDays >= 30) xp *= 1.25;
  else if (streakDays >= 14) xp *= 1.15;
  else if (streakDays >= 7) xp *= 1.1;
  else if (streakDays >= 3) xp *= 1.05;
  
  // Bonus de nivel
  xp *= (1 + student.level * 0.01);
  
  // Bonus de tiempo limitado (eventos)
  if (isDoubleXPEvent()) xp *= 2;
  
  return Math.round(xp);
}
```

---

## 🏆 Sistema de Badges

### Categorías de Badges

#### 📚 Académicos

```typescript
const academicBadges: Badge[] = [
  {
    id: 'reader_level_1',
    name: 'Lector Principiante',
    description: 'Completa 10 lecciones de Español',
    icon: '📖',
    criteria: { type: 'lessons_completed', subject: 'ESP', count: 10 },
    xpReward: 50,
    rarity: 'common'
  },
  {
    id: 'reader_level_2',
    name: 'Lector Avanzado',
    description: 'Completa 50 lecciones de Español',
    icon: '📚',
    criteria: { type: 'lessons_completed', subject: 'ESP', count: 50 },
    xpReward: 150,
    rarity: 'rare',
    requires: ['reader_level_1']
  },
  {
    id: 'math_wizard',
    name: 'Mago de las Matemáticas',
    description: 'Acierta 20 quizzes de matemáticas seguidos',
    icon: '🧮',
    criteria: { type: 'quiz_streak', subject: 'MAT', count: 20 },
    xpReward: 200,
    rarity: 'epic'
  },
  {
    id: 'science_explorer',
    name: 'Explorador Científico',
    description: 'Completa 10 experimentos virtuales',
    icon: '🔬',
    criteria: { type: 'activities_completed', activityType: 'experiment', count: 10 },
    xpReward: 150,
    rarity: 'rare'
  },
  {
    id: 'polyglot',
    name: 'Políglota',
    description: 'Alcanza nivel 5 en Español, Inglés e Inglés Conversacional',
    icon: '🌍',
    criteria: { 
      type: 'multi_skill', 
      skills: [
        { subject: 'ESP', level: 5 },
        { subject: 'ING', level: 5 },
        { subject: 'INC', level: 5 }
      ]
    },
    xpReward: 500,
    rarity: 'legendary'
  },
  {
    id: 'coder_level_1',
    name: 'Programador Principiante',
    description: 'Completa tu primer proyecto de programación',
    icon: '💻',
    criteria: { type: 'projects_completed', subject: 'PROG', count: 1 },
    xpReward: 100,
    rarity: 'common'
  },
  {
    id: 'coder_level_2',
    name: 'Programador Avanzado',
    description: 'Completa 10 proyectos de programación',
    icon: '👨‍💻',
    criteria: { type: 'projects_completed', subject: 'PROG', count: 10 },
    xpReward: 300,
    rarity: 'epic',
    requires: ['coder_level_1']
  },
  {
    id: 'stem_champion',
    name: 'Campeón STEM',
    description: 'Completa todas las materias STEM con promedio 90%+',
    icon: '🚀',
    criteria: { 
      type: 'average_score', 
      subjects: ['MAT', 'CIE', 'TEC', 'PROG'], 
      minScore: 90 
    },
    xpReward: 1000,
    rarity: 'legendary'
  }
];
```

#### 🎯 Habilidad

```typescript
const skillBadges: Badge[] = [
  {
    id: 'speed_demon',
    name: 'Velocista',
    description: 'Completa un quiz en menos de 50% del tiempo límite',
    icon: '⚡',
    criteria: { type: 'speed_record', percentage: 50 },
    xpReward: 75,
    rarity: 'rare'
  },
  {
    id: 'perfect_score',
    name: 'Puntuación Perfecta',
    description: 'Obtén 100% en 5 evaluaciones seguidas',
    icon: '💯',
    criteria: { type: 'perfect_streak', count: 5 },
    xpReward: 200,
    rarity: 'epic'
  },
  {
    id: 'persistent',
    name: 'Persistente',
    description: 'Aprueba después de 2 intentos fallidos',
    icon: '💪',
    criteria: { type: 'retry_success', failedAttempts: 2 },
    xpReward: 100,
    rarity: 'uncommon'
  },
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Completa 10 lecciones antes de las 8am',
    icon: '🐦',
    criteria: { type: 'early_completion', count: 10, beforeHour: 8 },
    xpReward: 100,
    rarity: 'uncommon'
  },
  {
    id: 'night_owl',
    name: 'Nocturno',
    description: 'Completa 10 lecciones después de las 8pm',
    icon: '🦉',
    criteria: { type: 'late_completion', count: 10, afterHour: 20 },
    xpReward: 100,
    rarity: 'uncommon'
  }
];
```

#### 🔥 Social y Racha

```typescript
const socialBadges: Badge[] = [
  {
    id: 'streak_3',
    name: 'Racha de 3 Días',
    description: 'Actividad diaria por 3 días consecutivos',
    icon: '🔥',
    criteria: { type: 'streak', days: 3 },
    xpReward: 30,
    rarity: 'common'
  },
  {
    id: 'streak_7',
    name: 'Racha de 7 Días',
    description: 'Actividad diaria por una semana',
    icon: '🔥🔥',
    criteria: { type: 'streak', days: 7 },
    xpReward: 100,
    rarity: 'uncommon',
    requires: ['streak_3']
  },
  {
    id: 'streak_30',
    name: 'Racha de 30 Días',
    description: 'Actividad diaria por un mes',
    icon: '🔥🔥🔥',
    criteria: { type: 'streak', days: 30 },
    xpReward: 500,
    rarity: 'epic',
    requires: ['streak_7']
  },
  {
    id: 'helper',
    name: 'Colaborador',
    description: 'Ayuda a 5 compañeros en el foro',
    icon: '🤝',
    criteria: { type: 'help_peers', count: 5 },
    xpReward: 100,
    rarity: 'uncommon'
  },
  {
    id: 'inspirational',
    name: 'Inspirador',
    description: 'Tu perfil es seguido por 10 estudiantes',
    icon: '⭐',
    criteria: { type: 'followers', count: 10 },
    xpReward: 150,
    rarity: 'rare'
  }
];
```

#### 🏆 Especiales y Eventos

```typescript
const specialBadges: Badge[] = [
  {
    id: 'founding_member',
    name: 'Miembro Fundador',
    description: 'Uno de los primeros 1000 usuarios',
    icon: '🌟',
    criteria: { type: 'early_adopter', maxUserId: 1000 },
    xpReward: 1000,
    rarity: 'legendary',
    limited: true
  },
  {
    id: 'beta_tester',
    name: 'Beta Tester',
    description: 'Participa en el programa beta',
    icon: '🧪',
    criteria: { type: 'beta_participation' },
    xpReward: 200,
    rarity: 'rare'
  },
  {
    id: 'content_creator',
    name: 'Creador de Contenido',
    description: 'Contribuye material aprobado por maestros',
    icon: '✍️',
    criteria: { type: 'content_contribution', approvedCount: 3 },
    xpReward: 500,
    rarity: 'epic'
  },
  {
    id: 'bug_hunter',
    name: 'Cazador de Bugs',
    description: 'Reporta 5 bugs válidos',
    icon: '🐛',
    criteria: { type: 'bug_reports', count: 5 },
    xpReward: 300,
    rarity: 'rare'
  }
];
```

---

## 🎨 Personalización

### Avatares

```typescript
interface AvatarSystem {
  // Desbloqueo por nivel
  unlocks: {
    level1: ['boy_1', 'girl_1', 'animal_1'];
    level3: ['boy_2', 'girl_2', 'animal_2', 'fantasy_1'];
    level5: ['superhero_1', 'profession_1', 'animal_3'];
    level7: ['custom_colors', 'accessories'];
    level10: ['full_customization'];
  };

  // Categorías
  categories: {
    humans: ['boy', 'girl', 'teen', 'adult'];
    animals: ['cat', 'dog', 'dragon', 'unicorn', 'robot'];
    fantasy: ['wizard', 'knight', 'alien', 'ninja'];
    professions: ['doctor', 'engineer', 'artist', 'scientist'];
  };

  // Personalización
  customization: {
    colors: ['skin', 'hair', 'eyes', 'clothes'];
    accessories: ['glasses', 'hats', 'jewelry', 'badges'];
    backgrounds: ['colors', 'patterns', 'scenes'];
    animations: ['idle', 'celebration', 'thinking'];
  };
}
```

### Temas

```typescript
interface ThemeSystem {
  // Temas base (todos)
  base: ['light', 'dark', 'high_contrast'];
  
  // Desbloqueables
  unlockable: {
    level2: ['ocean', 'forest', 'space'];
    level4: ['cyberpunk', 'pastel', 'monochrome'];
    level6: ['anime', 'retro', 'minimalist'];
    level8: ['custom_css'];
  };
  
  // Temas especiales (eventos)
  seasonal: {
    halloween: 'available_october';
    christmas: 'available_december';
    summer: 'available_july';
    back_to_school: 'available_august';
  };
}
```

---

## 📈 Tablas de Clasificación

### Tipos de Leaderboards

```typescript
interface LeaderboardSystem {
  types: {
    // Por scope
    global: 'Todos los estudiantes de la plataforma';
    school: 'Estudiantes de la misma escuela';
    grade: 'Estudiantes del mismo grado';
    class: 'Estudiantes de la misma clase';
    friends: 'Amigos del estudiante';
    
    // Por métrica
    xp: 'Total de XP acumulado';
    streak: 'Racha más larga';
    accuracy: 'Porcentaje de aciertos';
    completion: 'Lecciones completadas';
    speed: 'Tiempo promedio';
    help: 'Ayuda proporcionada a otros';
  };
  
  // Períodos
  periods: {
    daily: 'Resets cada día';
    weekly: 'Resets cada lunes';
    monthly: 'Resets primer día del mes';
    allTime: 'Histórico total';
  };
  
  // Recompensas
  rewards: {
    daily_top3: { xp: 50, badge: 'daily_champion' };
    weekly_top10: { xp: 200, badge: 'weekly_warrior' };
    monthly_top10: { xp: 1000, badge: 'monthly_master', theme: 'exclusive' };
  };
}
```

---

## 🎯 Desafíos y Misiones

### Sistema de Misiones

```typescript
interface MissionSystem {
  // Tipos de misiones
  types: {
    daily: {
      resetTime: '00:00';
      count: 3;
      examples: [
        'Completa 2 lecciones',
        'Acierta 5 preguntas seguidas',
        'Ayuda a un compañero'
      ];
      reward: { xp: 40, coins: 10 };
    };
    
    weekly: {
      resetDay: 'monday';
      count: 5;
      examples: [
        'Completa 10 lecciones',
        'Mantén racha de 5 días',
        'Obtén 90%+ en un examen'
      ];
      reward: { xp: 200, badge: 'weekly_warrior' };
    };
    
    monthly: {
      examples: [
        'Completa un módulo completo',
        'Alcanza nivel 5',
        'Obtén 5 badges nuevos'
      ];
      reward: { xp: 1000, theme: 'exclusive' };
    };
    
    special: {
      // Eventos limitados
      examples: [
        { name: 'Maratón STEM', task: 'Completa 5 lecciones STEM en un día' },
        { name: 'Festival de Lectura', task: 'Lee 10 cuentos' },
        { name: 'Semana del Código', task: 'Completa 3 proyectos de programación' }
      ];
    };
  };
}
```

---

## 💰 Moneda Virtual (Opcional)

```typescript
interface VirtualCurrencySystem {
  coins: {
    // Cómo ganar
    earnings: {
      lessonCompleted: 5;
      quizPassed: 3;
      perfectScore: 10;
      dailyMission: 10;
      weeklyMission: 50;
      helpingPeer: 5;
      streakBonus: { 3: 10, 7: 25, 14: 50, 30: 100 };
    };
    
    // Cómo gastar
    store: {
      avatarItems: { range: '10-100 coins' };
      themes: { range: '50-200 coins' };
      powerUps: {
        'double_xp_1h': 50;
        'hint_pack': 30;
        'extra_attempt': 20;
      };
      cosmetic: {
        badges: 'display_frame';
        profileEffects: 'animated_border';
        celebrationEffects: 'special_animation';
      };
    };
  };
}
```

---

## 🔔 Notificaciones de Gamificación

```typescript
interface GamificationNotifications {
  // Eventos que trigger notificaciones
  events: {
    levelUp: {
      channels: ['in_app', 'email', 'push'];
      template: '🎉 ¡Felicidades! Has alcanzado el Nivel {level}';
      action: 'view_new_unlocks';
    };
    
    badgeEarned: {
      channels: ['in_app', 'push'];
      template: '🏆 ¡Nuevo Badge! {badgeName}';
      action: 'share_badge';
    };
    
    streakMilestone: {
      channels: ['in_app', 'push'];
      template: '🔥 ¡Racha de {days} días! ¡Sigue así!';
      action: 'view_streak';
    };
    
    leaderboardPosition: {
      channels: ['in_app'];
      template: '📈 ¡Subiste al lugar #{position} en {leaderboard}!';
      action: 'view_leaderboard';
    };
    
    missionCompleted: {
      channels: ['in_app', 'push'];
      template: '✅ Misión completada: {missionName}';
      action: 'claim_reward';
    };
  };
}
```

---

## 📊 Dashboard de Gamificación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD DE GAMIFICACIÓN                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🎮 MI PERFIL GAMER                                                 │   │
│  │                                                                     │   │
│  │  ┌─────────┐  ⭐ Nivel 7: SABIO                                    │   │
│  │  │         │  📊 XP: 4,250 / 8,000  [████████░░░░░░░░░░] 53%       │   │
│  │  │  👤     │  🔥 Racha: 12 días                                    │   │
│  │  │  AVATAR │  🏆 Badges: 23 / 150                                  │   │
│  │  │         │  💰 Monedas: 450                                       │   │
│  │  └─────────┘                                                         │   │
│  │                                                                     │   │
│  │  [✏️ Personalizar Avatar]  [🏆 Ver Colección]  [🎁 Recompensas]    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🎯 MISIONES DE HOY                                                 │   │
│  │                                                                     │   │
│  │  [✓] Completa 2 lecciones (2/2)                     [RECLAMAR 40XP]│   │
│  │  [●] Acierta 5 preguntas seguidas (3/5)                            │   │
│  │  [ ] Ayuda a un compañero                                          │   │
│  │                                                                     │   │
│  │  [Ver todas las misiones]                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🏆 BADGES RECIENTES                                                │   │
│  │                                                                     │   │
│  │  🥇 Matemático Avanzado    🥈 Lector Ávido    🥉 Velocista         │   │
│  │  (hace 2 días)             (hace 5 días)      (hace 1 semana)      │   │
│  │                                                                     │   │
│  │  [Ver todos los badges (23)]                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📊 TABLAS DE CLASIFICACIÓN                                         │   │
│  │                                                                     │   │
│  │  [Global] [Mi Escuela] [Mi Grado] [Amigos]                         │   │
│  │                                                                     │   │
│  │  #  Nombre              Nivel    XP      🔥                        │   │
│  │  ─────────────────────────────────────────                         │   │
│  │  1  María G.           9        15,420  45                         │   │
│  │  2  Carlos R.          8        12,100  30                         │   │
│  │  3  Ana L.             8        11,850  28                         │   │
│  │  ...                                                                 │   │
│  │  15 TÚ                 7        4,250   12  ← Tú                   │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🎁 DESBLOQUEOS DISPONIBLES                                         │   │
│  │                                                                     │   │
│  │  🎨 Nuevo tema: "Espacio"              [Desbloquear - 100 coins]   │   │
│  │  👓 Accesorio: Gafas de sol            [Desbloquear - 50 coins]    │   │
│  │  🖼️ Marco de perfil dorado             [Desbloquear - 200 coins]   │   │
│  │                                                                     │   │
│  │  [Ir a la tienda]                                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementación Técnica

### Modelo de Datos

```typescript
// Prisma schema additions for gamification

model GamificationProfile {
  id            String   @id @default(uuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Nivel y XP
  level         Int      @default(1)
  totalXp       Int      @default(0)
  
  // Racha
  currentStreak Int      @default(0)
  longestStreak Int      @default(0)
  lastActivityAt DateTime?
  
  // Personalización
  avatarConfig  Json?    // { character, colors, accessories }
  theme         String   @default("default")
  
  // Estadísticas
  stats         Json?    // { lessonsCompleted, quizzesPassed, etc. }
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("gamification_profiles")
}

model Badge {
  id          String   @id @default(uuid())
  name        String
  description String
  iconUrl     String
  
  // Criterios
  criteria    Json
  xpValue     Int      @default(50)
  
  // Rareza
  rarity      String   @default("common") // common, uncommon, rare, epic, legendary
  
  // Restricciones
  requiredBadgeId String?
  gradeLevel  Int?
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  userBadges  UserBadge[]
  
  @@map("badges")
}

model UserBadge {
  id        String   @id @default(uuid())
  userId    String
  badgeId   String
  badge     Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  
  earnedAt  DateTime @default(now())
  
  @@unique([userId, badgeId])
  @@map("user_badges")
}

model XpTransaction {
  id          String   @id @default(uuid())
  userId      String
  
  amount      Int
  type        String   // earned, spent, bonus
  source      String   // lesson, quiz, badge, streak, etc.
  description String?
  
  // Referencia
  referenceId String?
  referenceType String?
  
  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
  @@map("xp_transactions")
}

model Mission {
  id          String   @id @default(uuid())
  userId      String
  
  type        String   // daily, weekly, monthly, special
  title       String
  description String
  
  // Progreso
  target      Int
  current     Int      @default(0)
  
  // Recompensa
  rewardXp    Int
  rewardCoins Int      @default(0)
  rewardBadgeId String?
  
  // Estado
  status      String   @default("active") // active, completed, claimed, expired
  
  // Fechas
  expiresAt   DateTime
  completedAt DateTime?
  claimedAt   DateTime?
  
  createdAt   DateTime @default(now())

  @@map("missions")
}

model LeaderboardEntry {
  id            String   @id @default(uuid())
  
  leaderboardId String
  userId        String
  
  score         Int
  rank          Int
  
  period        String   // daily, weekly, monthly, allTime
  periodStart   DateTime
  periodEnd     DateTime?
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([leaderboardId, userId, period, periodStart])
  @@index([leaderboardId, period, score])
  @@map("leaderboard_entries")
}
```

### Servicio de Gamificación

```typescript
// backend/src/modules/gamification/gamification.service.ts

@Injectable()
export class GamificationService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private notificationService: NotificationService
  ) {}

  async awardXP(
    userId: string,
    amount: number,
    source: string,
    referenceId?: string
  ): Promise<XPAwardResult> {
    // Crear transacción
    await this.prisma.xpTransaction.create({
      data: { userId, amount, source, referenceId, type: 'earned' }
    });

    // Actualizar perfil
    const profile = await this.prisma.gamificationProfile.update({
      where: { userId },
      data: { 
        totalXp: { increment: amount },
        lastActivityAt: new Date()
      }
    });

    // Verificar nivel up
    const newLevel = this.calculateLevel(profile.totalXp);
    if (newLevel > profile.level) {
      await this.levelUp(userId, newLevel);
    }

    // Emitir evento
    this.eventEmitter.emit('xp.awarded', { userId, amount, source });

    return { 
      awarded: amount, 
      totalXp: profile.totalXp,
      leveledUp: newLevel > profile.level,
      newLevel: newLevel > profile.level ? newLevel : null
    };
  }

  async checkAndAwardBadges(userId: string): Promise<Badge[]> {
    const newBadges: Badge[] = [];
    
    // Obtener badges que el usuario no tiene
    const availableBadges = await this.prisma.badge.findMany({
      where: {
        isActive: true,
        userBadges: { none: { userId } }
      }
    });

    // Verificar cada badge
    for (const badge of availableBadges) {
      const earned = await this.checkBadgeCriteria(userId, badge);
      if (earned) {
        await this.awardBadge(userId, badge.id);
        newBadges.push(badge);
      }
    }

    return newBadges;
  }

  async updateStreak(userId: string): Promise<StreakUpdate> {
    const profile = await this.prisma.gamificationProfile.findUnique({
      where: { userId }
    });

    const lastActivity = profile.lastActivityAt;
    const today = new Date();
    const yesterday = subDays(today, 1);

    let newStreak = profile.currentStreak;

    if (isSameDay(lastActivity, today)) {
      // Ya actividad hoy, no cambia
      return { streak: newStreak, continued: true };
    } else if (isSameDay(lastActivity, yesterday)) {
      // Actividad ayer, streak continúa
      newStreak += 1;
    } else {
      // Se rompió la racha
      newStreak = 1;
    }

    // Actualizar
    await this.prisma.gamificationProfile.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, profile.longestStreak),
        lastActivityAt: today
      }
    });

    // Verificar badges de racha
    await this.checkStreakBadges(userId, newStreak);

    return { 
      streak: newStreak, 
      continued: newStreak > 1,
      isMilestone: [3, 7, 14, 30, 60, 100].includes(newStreak)
    };
  }

  private calculateLevel(totalXp: number): number {
    const levels = [
      { level: 1, xp: 0 },
      { level: 2, xp: 100 },
      { level: 3, xp: 300 },
      { level: 4, xp: 600 },
      { level: 5, xp: 1000 },
      { level: 6, xp: 2000 },
      { level: 7, xp: 4000 },
      { level: 8, xp: 8000 },
      { level: 9, xp: 15000 },
      { level: 10, xp: 30000 }
    ];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalXp >= levels[i].xp) {
        return levels[i].level;
      }
    }
    return 1;
  }

  private async levelUp(userId: string, newLevel: number): Promise<void> {
    await this.prisma.gamificationProfile.update({
      where: { userId },
      data: { level: newLevel }
    });

    // Notificar
    await this.notificationService.send({
      userId,
      type: 'level_up',
      title: `¡Nivel ${newLevel}!`,
      message: `Has alcanzado el nivel ${newLevel}. ¡Descubre tus nuevas recompensas!`,
      actionUrl: '/gamification/unlocks'
    });

    // Emitir evento
    this.eventEmitter.emit('user.leveled_up', { userId, newLevel });
  }
}
```
