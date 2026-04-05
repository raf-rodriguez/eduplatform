# 🗄️ EduPlatform - Diseño de Base de Datos

## Diagrama Entidad-Relación

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    USUARIOS Y ROLES                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐    │
│   │   users     │◄─────►│ user_roles  │◄─────►│    roles    │       │   schools   │    │
│   ├─────────────┤       ├─────────────┤       ├─────────────┤       ├─────────────┤    │
│   │ id (PK)     │       │ id (PK)     │       │ id (PK)     │       │ id (PK)     │    │
│   │ email       │       │ user_id     │       │ name        │       │ name        │    │
│   │ password    │       │ role_id     │       │ permissions │       │ address     │    │
│   │ first_name  │       │ school_id   │       │ created_at  │       │ phone       │    │
│   │ last_name   │       │ created_at  │       └─────────────┘       │ admin_id    │    │
│   │ birth_date  │       └─────────────┘                             │ created_at  │    │
│   │ avatar_url  │                                                   └─────────────┘    │
│   │ grade_level │                                                                         │
│   │ school_id   │       ┌─────────────┐       ┌─────────────┐                           │
│   │ parent_id   │◄─────►│  parents    │◄─────►│parent_students│                          │
│   │ is_active   │       ├─────────────┤       ├─────────────┤                           │
│   │ created_at  │       │ id (PK)     │       │ id (PK)     │                           │
│   └─────────────┘       │ user_id     │       │ parent_id   │                           │
│                         │ phone       │       │ student_id  │                           │
│                         │ address     │       │ relation    │                           │
│                         │ occupation  │       │ created_at  │                           │
│                         └─────────────┘       └─────────────┘                           │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                ESTRUCTURA ACADÉMICA                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐    │
│   │   grades    │◄─────►│  subjects   │◄─────►│   modules   │◄─────►│   lessons   │    │
│   ├─────────────┤       ├─────────────┤       ├─────────────┤       ├─────────────┤    │
│   │ id (PK)     │       │ id (PK)     │       │ id (PK)     │       │ id (PK)     │    │
│   │ name        │       │ name        │       │ subject_id  │       │ module_id   │    │
│   │ level       │       │ code        │       │ name        │       │ title       │    │
│   │ order_index │       │ grade_id    │       │ description │       │ description │    │
│   │ description │       │ description │       │ order_index │       │ content     │    │
│   │ is_active   │       │ is_stem     │       │ is_active   │       │ video_url   │    │
│   │ created_at  │       │ created_at  │       │ created_at  │       │ order_index │    │
│   └─────────────┘       └─────────────┘       └─────────────┘       │ duration    │    │
│                                                                     │ is_active   │    │
│   ┌─────────────┐                                                   │ created_at  │    │
│   │lesson_resources│                                                └─────────────┘    │
│   ├─────────────┤                                                                         │
│   │ id (PK)     │       ┌─────────────┐                                                  │
│   │ lesson_id   │◄─────►│  activities │                                                  │
│   │ type        │       ├─────────────┤                                                  │
│   │ url         │       │ id (PK)     │                                                  │
│   │ title       │       │ lesson_id   │                                                  │
│   │ created_at  │       │ type        │                                                  │
│   └─────────────┘       │ content     │                                                  │
│                         │ order_index │                                                  │
│                         │ created_at  │                                                  │
│                         └─────────────┘                                                  │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              EVALUACIONES Y PROGRESO                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐    │
│   │ assessments │◄─────►│   quizzes   │◄─────►│quiz_questions│◄────►│quiz_options │    │
│   ├─────────────┤       ├─────────────┤       ├─────────────┤       ├─────────────┤    │
│   │ id (PK)     │       │ id (PK)     │       │ id (PK)     │       │ id (PK)     │    │
│   │ lesson_id   │       │ assessment_id│      │ quiz_id     │       │ question_id │    │
│   │ type        │       │ title       │       │ type        │       │ text        │    │
│   │ title       │       │ description │       │ question    │       │ is_correct  │    │
│   │ description │       │ time_limit  │       │ options     │       │ order_index │    │
│   │ max_score   │       │ max_attempts│       │ correct     │       │ created_at  │    │
│   │ passing_score│      │ is_active   │       │ explanation │       └─────────────┘    │
│   │ created_by  │       │ created_at  │       │ points      │                           │
│   │ created_at  │       └─────────────┘       │ order_index │                           │
│   └─────────────┘                             │ created_at  │                           │
│                                               └─────────────┘                           │
│                                                                                         │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐                          │
│   │student_assessments│◄►│student_answers│    │  progress   │                          │
│   ├─────────────┤       ├─────────────┤       ├─────────────┤                          │
│   │ id (PK)     │       │ id (PK)     │       │ id (PK)     │                          │
│   │ student_id  │       │ attempt_id  │       │ student_id  │                          │
│   │ assessment_id│      │ question_id │       │ lesson_id   │                          │
│   │ attempt_num │       │ answer      │       │ status      │                          │
│   │ score       │       │ is_correct  │       │ score       │                          │
│   │ status      │       │ points      │       │ time_spent  │                          │
│   │ started_at  │       │ created_at  │       │ completed_at│                          │
│   │ completed_at│       └─────────────┘       │ created_at  │                          │
│   │ created_at  │                             └─────────────┘                          │
│   └─────────────┘                                                                       │
│                                                                                         │
│   ┌─────────────┐       ┌─────────────┐                                                 │
│   │ skill_tracking│     │skill_mastery│                                                 │
│   ├─────────────┤       ├─────────────┤                                                 │
│   │ id (PK)     │       │ id (PK)     │                                                 │
│   │ student_id  │       │ student_id  │                                                 │
│   │ skill_name  │       │ skill_id    │                                                 │
│   │ subject_id  │       │ mastery_level│                                                │
│   │ level       │       │ progress    │                                                 │
│   │ created_at  │       │ updated_at  │                                                 │
│   └─────────────┘       └─────────────┘                                                 │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              GAMIFICACIÓN Y LOGROS                                       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐    │
│   │   badges    │◄─────►│user_badges  │◄─────►│   levels    │◄─────►│user_levels  │    │
│   ├─────────────┤       ├─────────────┤       ├─────────────┤       ├─────────────┤    │
│   │ id (PK)     │       │ id (PK)     │       │ id (PK)     │       │ id (PK)     │    │
│   │ name        │       │ user_id     │       │ name        │       │ user_id     │    │
│   │ description │       │ badge_id    │       │ min_xp      │       │ level_id    │    │
│   │ icon_url    │       │ earned_at   │       │ max_xp      │       │ earned_at   │    │
│   │ criteria    │       │ created_at  │       │ benefits    │       │ created_at  │    │
│   │ xp_value    │       └─────────────┘       │ created_at  │       └─────────────┘    │
│   │ created_at  │                             └─────────────┘                          │
│   └─────────────┘                                                                       │
│                                                                                         │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐                          │
│   │    xp_log   │       │ achievements│       │user_achievements│                      │
│   ├─────────────┤       ├─────────────┤       ├─────────────┤                          │
│   │ id (PK)     │       │ id (PK)     │       │ id (PK)     │                          │
│   │ user_id     │       │ name        │       │ user_id     │                          │
│   │ amount      │       │ description │       │ achievement_id│                        │
│   │ source      │       │ criteria    │       │ progress    │                          │
│   │ description │       │ reward_xp   │       │ completed_at│                          │
│   │ created_at  │       │ created_at  │       │ created_at  │                          │
│   └─────────────┘       └─────────────┘       └─────────────┘                          │
│                                                                                         │
│   ┌─────────────┐                                                                       │
│   │ leaderboards│                                                                       │
│   ├─────────────┤                                                                       │
│   │ id (PK)     │                                                                       │
│   │ name        │                                                                       │
│   │ type        │                                                                       │
│   │ scope       │                                                                       │
│   │ period      │                                                                       │
│   │ created_at  │                                                                       │
│   └─────────────┘                                                                       │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           AGENTES IA Y AUTOMATIZACIÓN                                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐                          │
│   │agent_configs│       │ agent_tasks │       │agent_outputs│                          │
│   ├─────────────┤       ├─────────────┤       ├─────────────┤                          │
│   │ id (PK)     │       │ id (PK)     │       │ id (PK)     │                          │
│   │ name        │       │ agent_type  │       │ task_id     │                          │
│   │ type        │       │ status      │       │ output_type │                          │
│   │ config      │       │ input_data  │       │ content     │                          │
│   │ is_active   │       │ priority    │       │ metadata    │                          │
│   │ created_at  │       │ created_by  │       │ created_at  │                          │
│   └─────────────┘       │ created_at  │       └─────────────┘                          │
│                         └─────────────┘                                                 │
│                                                                                         │
│   ┌─────────────┐       ┌─────────────┐                                                 │
│   │ai_suggestions│      │content_recommendations│                                        │
│   ├─────────────┤       ├─────────────┤                                                 │
│   │ id (PK)     │       │ id (PK)     │                                                 │
│   │ student_id  │       │ student_id  │                                                 │
│   │ type        │       │ lesson_id   │                                                 │
│   │ content     │       │ reason      │                                                 │
│   │ context     │       │ priority    │                                                 │
│   │ status      │       │ created_at  │                                                 │
│   │ created_at  │       └─────────────┘                                                 │
│   └─────────────┘                                                                       │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                            │
                                            ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           NOTIFICACIONES Y REPORTES                                      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐                          │
│   │notifications│       │notification_settings│  │  reports    │                          │
│   ├─────────────┤       ├─────────────┤       ├─────────────┤                          │
│   │ id (PK)     │       │ id (PK)     │       │ id (PK)     │                          │
│   │ user_id     │       │ user_id     │       │ type        │                          │
│   │ type        │       │ email_notif │       │ generated_by│                          │
│   │ title       │       │ push_notif  │       │ parameters  │                          │
│   │ message     │       │ frequency   │       │ data        │                          │
│   │ is_read     │       │ created_at  │       │ status      │                          │
│   │ created_at  │       └─────────────┘       │ created_at  │                          │
│   └─────────────┘                             └─────────────┘                          │
│                                                                                         │
│   ┌─────────────┐       ┌─────────────┐                                                 │
│   │report_schedules│    │  audit_log  │                                                 │
│   ├─────────────┤       ├─────────────┤                                                 │
│   │ id (PK)     │       │ id (PK)     │                                                 │
│   │ report_type │       │ user_id     │                                                 │
│   │ frequency   │       │ action      │                                                 │
│   │ recipients  │       │ entity_type │                                                 │
│   │ is_active   │       │ entity_id   │                                                 │
│   │ created_at  │       │ old_value   │                                                 │
│   └─────────────┘       │ new_value   │                                                 │
│                         │ created_at  │                                                 │
│                         └─────────────┘                                                 │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Esquema Prisma Completo

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USUARIOS Y AUTENTICACIÓN
// ============================================

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String    // bcrypt hash
  firstName     String
  lastName      String
  birthDate     DateTime?
  avatarUrl     String?
  phone         String?
  
  // Campos específicos por rol
  gradeLevel    Int?      // Para estudiantes (PreK=0, K=1, 1-12)
  schoolId      String?
  parentId      String?   // Relación padre-hijo
  
  // Estados
  isActive      Boolean   @default(true)
  emailVerified Boolean   @default(false)
  lastLoginAt   DateTime?
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relaciones
  roles         UserRole[]
  studentAssessments StudentAssessment[]
  progress      Progress[]
  xpLogs        XpLog[]
  userBadges    UserBadge[]
  userLevels    UserLevel[]
  notifications Notification[]
  parentStudents ParentStudent[] @relation("StudentParents")
  parentOf      ParentStudent[] @relation("ParentStudents")
  
  @@map("users")
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique // SUPER_ADMIN, ADMIN, TEACHER, STUDENT, PARENT
  description String?
  permissions Json     // Array de permisos
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userRoles   UserRole[]
  
  @@map("roles")
}

model UserRole {
  id        String   @id @default(uuid())
  userId    String
  roleId    String
  schoolId  String?
  
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade)
  
  @@unique([userId, roleId, schoolId])
  @@map("user_roles")
}

model School {
  id          String   @id @default(uuid())
  name        String
  address     String?
  phone       String?
  email       String?
  website     String?
  
  // Configuración
  settings    Json?
  
  // Suscripción
  planType    String   @default("free") // free, premium, homeschool, enterprise
  planExpiresAt DateTime?
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("schools")
}

model ParentStudent {
  id        String   @id @default(uuid())
  parentId  String
  studentId String
  relation  String   // mother, father, guardian, etc.
  
  createdAt DateTime @default(now())

  parent    User     @relation("ParentStudents", fields: [parentId], references: [id], onDelete: Cascade)
  student   User     @relation("StudentParents", fields: [studentId], references: [id], onDelete: Cascade)
  
  @@unique([parentId, studentId])
  @@map("parent_students")
}

// ============================================
// ESTRUCTURA ACADÉMICA
// ============================================

model Grade {
  id          String   @id @default(uuid())
  name        String   // "Pre-Kínder", "Kínder", "Primer Grado", etc.
  level       Int      // 0=PreK, 1=K, 2-13=1-12
  orderIndex  Int
  description String?
  
  // Configuración STEM
  hasStemTrack Boolean @default(false)
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subjects    Subject[]
  
  @@map("grades")
}

model Subject {
  id          String   @id @default(uuid())
  name        String   // "Español", "Matemáticas", "Programación"
  code        String   @unique // "ESP", "MAT", "PROG"
  description String?
  
  gradeId     String
  grade       Grade    @relation(fields: [gradeId], references: [id], onDelete: Cascade)
  
  // Configuración
  isStem      Boolean  @default(false)
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  modules     Module[]
  
  @@map("subjects")
}

model Module {
  id          String   @id @default(uuid())
  subjectId   String
  subject     Subject  @relation(fields: [subjectId], references: [id], onDelete: Cascade)
  
  name        String
  description String?
  orderIndex  Int
  
  // Metadatos
  estimatedHours Int?
  difficulty  String   @default("beginner") // beginner, intermediate, advanced
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  lessons     Lesson[]
  
  @@map("modules")
}

model Lesson {
  id          String   @id @default(uuid())
  moduleId    String
  module      Module   @relation(fields: [moduleId], references: [id], onDelete: Cascade)
  
  title       String
  description String?
  
  // Contenido
  content     Json?    // Estructura flexible del contenido
  videoUrl    String?
  videoDuration Int?   // en segundos
  
  // Configuración
  orderIndex  Int
  duration    Int?     // tiempo estimado en minutos
  isActive    Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  resources   LessonResource[]
  activities  Activity[]
  assessments Assessment[]
  progress    Progress[]
  
  @@map("lessons")
}

model LessonResource {
  id        String   @id @default(uuid())
  lessonId  String
  lesson    Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  type      String   // pdf, image, audio, link, interactive
  title     String
  url       String
  
  createdAt DateTime @default(now())
  
  @@map("lesson_resources")
}

model Activity {
  id          String   @id @default(uuid())
  lessonId    String
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  type        String   // interactive, writing, project, exercise
  title       String
  content     Json     // Configuración específica del activity
  
  orderIndex  Int
  isRequired  Boolean  @default(true)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("activities")
}

// ============================================
// EVALUACIONES
// ============================================

model Assessment {
  id          String   @id @default(uuid())
  lessonId    String
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  type        String   // quiz, module_exam, final_exam, practice
  title       String
  description String?
  
  // Configuración
  maxScore    Int      @default(100)
  passingScore Int     @default(70)
  timeLimit   Int?     // en minutos
  maxAttempts Int      @default(3)
  
  // Condiciones
  requiresPrevious Boolean @default(true) // requiere aprobar lecciones anteriores
  
  isActive    Boolean  @default(true)
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  quizzes     Quiz[]
  studentAssessments StudentAssessment[]
  
  @@map("assessments")
}

model Quiz {
  id            String     @id @default(uuid())
  assessmentId  String
  assessment    Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  
  title         String
  description   String?
  
  // Configuración
  timeLimit     Int?       // en minutos
  maxAttempts   Int        @default(1)
  
  isActive      Boolean    @default(true)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  questions     QuizQuestion[]
  
  @@map("quizzes")
}

model QuizQuestion {
  id          String   @id @default(uuid())
  quizId      String
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  
  type        String   // multiple_choice, true_false, short_answer, essay, code
  question    String
  
  // Para preguntas auto-calificables
  options     Json?    // { text: string, isCorrect: boolean }[]
  correctAnswer String? // Para respuesta corta o código
  explanation String?  // Explicación de la respuesta correcta
  
  // Puntuación
  points      Int      @default(10)
  orderIndex  Int
  
  // IA
  aiGradable  Boolean  @default(false) // Si la IA puede calificar
  rubric      Json?    // Rúbrica para calificación
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  studentAnswers StudentAnswer[]
  
  @@map("quiz_questions")
}

model StudentAssessment {
  id            String     @id @default(uuid())
  studentId     String
  student       User       @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  assessmentId  String
  assessment    Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  
  attemptNumber Int
  
  // Resultados
  score         Float?
  status        String     @default("in_progress") // in_progress, completed, passed, failed
  
  // Tiempos
  startedAt     DateTime   @default(now())
  completedAt   DateTime?
  
  createdAt     DateTime   @default(now())

  answers       StudentAnswer[]
  
  @@unique([studentId, assessmentId, attemptNumber])
  @@map("student_assessments")
}

model StudentAnswer {
  id              String            @id @default(uuid())
  attemptId       String
  attempt         StudentAssessment @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  
  questionId      String
  question        QuizQuestion      @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  answer          String            // JSON stringified para respuestas complejas
  isCorrect       Boolean?
  points          Float?
  
  // IA
  aiFeedback      String?           // Feedback generado por IA
  aiConfidence    Float?            // Confianza de la IA en la calificación
  
  // Manual
  teacherFeedback String?
  teacherId       String?
  
  createdAt       DateTime          @default(now())

  @@map("student_answers")
}

// ============================================
// PROGRESO Y SEGUIMIENTO
// ============================================

model Progress {
  id          String   @id @default(uuid())
  studentId   String
  student     User     @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  lessonId    String
  lesson      Lesson   @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  // Estado
  status      String   @default("not_started") // not_started, in_progress, completed, locked
  
  // Métricas
  score       Float?
  timeSpent   Int      @default(0) // en segundos
  attempts    Int      @default(0)
  
  // Fechas
  startedAt   DateTime?
  completedAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([studentId, lessonId])
  @@map("progress")
}

model Skill {
  id          String   @id @default(uuid())
  name        String
  description String?
  subjectId   String?
  
  // Jerarquía
  parentId    String?
  level       Int      @default(1) // 1-5 niveles de complejidad
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  mastery     SkillMastery[]
  
  @@map("skills")
}

model SkillMastery {
  id          String   @id @default(uuid())
  studentId   String
  skillId     String
  skill       Skill    @relation(fields: [skillId], references: [id], onDelete: Cascade)
  
  // Nivel de dominio: 0-100
  masteryLevel Float   @default(0)
  
  // Progreso
  attempts    Int      @default(0)
  successes   Int      @default(0)
  
  updatedAt   DateTime @updatedAt
  createdAt   DateTime @default(now())

  @@unique([studentId, skillId])
  @@map("skill_mastery")
}

// ============================================
// GAMIFICACIÓN
// ============================================

model Badge {
  id          String   @id @default(uuid())
  name        String
  description String
  iconUrl     String
  
  // Criterios
  criteria    Json     // { type: "lessons_completed", count: 10, subject: "MAT" }
  xpValue     Int      @default(50)
  
  // Restricciones
  gradeLevel  Int?     // null = todos los grados
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  userBadges  UserBadge[]
  
  @@map("badges")
}

model UserBadge {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  badgeId   String
  badge     Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  
  earnedAt  DateTime @default(now())

  @@unique([userId, badgeId])
  @@map("user_badges")
}

model Level {
  id          String   @id @default(uuid())
  name        String
  minXp       Int
  maxXp       Int
  
  // Beneficios
  benefits    Json?    // { badgeUnlocks: [], features: [] }
  
  iconUrl     String?
  createdAt   DateTime @default(now())

  userLevels  UserLevel[]
  
  @@map("levels")
}

model UserLevel {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  levelId   String
  level     Level    @relation(fields: [levelId], references: [id], onDelete: Cascade)
  
  earnedAt  DateTime @default(now())

  @@unique([userId, levelId])
  @@map("user_levels")
}

model XpLog {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  amount      Int
  source      String   // lesson_completed, quiz_passed, badge_earned, streak, etc.
  description String?
  
  // Referencia
  referenceId String?  // ID de la entidad relacionada
  referenceType String? // tipo de entidad
  
  createdAt   DateTime @default(now())

  @@map("xp_log")
}

model Achievement {
  id          String   @id @default(uuid())
  name        String
  description String
  
  // Criterios
  criteria    Json
  
  // Recompensa
  rewardXp    Int      @default(0)
  rewardBadgeId String?
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  userAchievements UserAchievement[]
  
  @@map("achievements")
}

model UserAchievement {
  id            String      @id @default(uuid())
  userId        String
  achievementId String
  achievement   Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  
  progress      Json        // { current: 10, target: 20 }
  completedAt   DateTime?
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@unique([userId, achievementId])
  @@map("user_achievements")
}

model Streak {
  id          String   @id @default(uuid())
  userId      String   @unique
  
  currentStreak Int    @default(0)
  longestStreak Int    @default(0)
  
  lastActivityAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("streaks")
}

// ============================================
// AGENTES IA
// ============================================

model AgentConfig {
  id          String   @id @default(uuid())
  name        String
  type        String   // content_generator, evaluator, tutor, analytics
  
  // Configuración del agente
  config      Json     // { model: "gpt-4", temperature: 0.7, max_tokens: 2000, ... }
  
  // Prompts
  systemPrompt String  @db.Text
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tasks       AgentTask[]
  
  @@map("agent_configs")
}

model AgentTask {
  id          String   @id @default(uuid())
  agentType   String
  
  // Input
  inputData   Json
  
  // Estado
  status      String   @default("pending") // pending, processing, completed, failed
  priority    Int      @default(5) // 1-10
  
  // Resultado
  result      Json?
  error       String?
  
  // Referencias
  createdBy   String?
  completedBy String?  // ID del agente que procesó
  
  createdAt   DateTime @default(now())
  completedAt DateTime?

  outputs     AgentOutput[]
  
  @@map("agent_tasks")
}

model AgentOutput {
  id          String   @id @default(uuid())
  taskId      String
  task        AgentTask @relation(fields: [taskId], references: [id], onDelete: Cascade)
  
  outputType  String   // quiz, content, feedback, recommendation
  content     Json
  
  // Metadatos
  metadata    Json?    // { confidence: 0.95, model: "gpt-4", tokens: 500 }
  
  // Uso
  isUsed      Boolean  @default(false)
  usedAt      DateTime?
  usedBy      String?
  
  createdAt   DateTime @default(now())

  @@map("agent_outputs")
}

model ContentRecommendation {
  id          String   @id @default(uuid())
  studentId   String
  
  // Contenido recomendado
  lessonId    String?
  activityId  String?
  
  // Razón
  reason      String   // "weak_skill", "prerequisite_missing", "enrichment", "remediation"
  reasonData  Json?    // Datos adicionales del análisis
  
  // Prioridad
  priority    Int      @default(5) // 1-10
  
  // Estado
  isViewed    Boolean  @default(false)
  isCompleted Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  expiresAt   DateTime?

  @@map("content_recommendations")
}

// ============================================
// NOTIFICACIONES
// ============================================

model Notification {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type        String   // assessment_due, grade_posted, badge_earned, recommendation, etc.
  title       String
  message     String
  
  // Datos adicionales
  data        Json?
  
  // Estado
  isRead      Boolean  @default(false)
  readAt      DateTime?
  
  // Acción
  actionUrl   String?
  actionText  String?
  
  createdAt   DateTime @default(now())
  expiresAt   DateTime?

  @@map("notifications")
}

model NotificationSetting {
  id              String   @id @default(uuid())
  userId          String   @unique
  
  // Canales
  emailEnabled    Boolean  @default(true)
  pushEnabled     Boolean  @default(true)
  inAppEnabled    Boolean  @default(true)
  
  // Frecuencia
  emailFrequency  String   @default("immediate") // immediate, daily, weekly
  
  // Tipos específicos
  assessmentReminders Boolean @default(true)
  gradeNotifications  Boolean @default(true)
  progressUpdates     Boolean @default(true)
  gamificationUpdates Boolean @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("notification_settings")
}

// ============================================
// REPORTES Y AUDITORÍA
// ============================================

model Report {
  id          String   @id @default(uuid())
  type        String   // student_progress, class_performance, assessment_analysis, etc.
  
  // Quién lo generó
  generatedBy String
  
  // Parámetros
  parameters  Json     // { studentId, dateRange, subjects: [] }
  
  // Datos
  data        Json
  
  // Estado
  status      String   @default("generating") // generating, completed, failed
  
  // Archivo
  fileUrl     String?
  fileFormat  String?  // pdf, excel, csv
  
  createdAt   DateTime @default(now())
  completedAt DateTime?

  @@map("reports")
}

model ReportSchedule {
  id          String   @id @default(uuid())
  reportType  String
  
  // Configuración
  frequency   String   // daily, weekly, monthly
  parameters  Json
  
  // Destinatarios
  recipients  String[] // array de userIds
  
  isActive    Boolean  @default(true)
  lastRunAt   DateTime?
  nextRunAt   DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("report_schedules")
}

model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  
  action      String   // CREATE, UPDATE, DELETE, LOGIN, etc.
  entityType  String   // user, lesson, assessment, etc.
  entityId    String?
  
  // Datos
  oldValue    Json?
  newValue    Json?
  
  // Metadata
  ipAddress   String?
  userAgent   String?
  
  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
  @@index([entityType, entityId])
  @@map("audit_log")
}

// ============================================
// SUSCRIPCIONES Y PAGOS
// ============================================

model Subscription {
  id          String   @id @default(uuid())
  userId      String
  
  // Plan
  planType    String   // free, student, homeschool, school
  planName    String
  
  // Precio
  price       Decimal  @db.Decimal(10, 2)
  currency    String   @default("USD")
  billingCycle String  @default("monthly") // monthly, yearly
  
  // Estado
  status      String   @default("active") // active, cancelled, expired, suspended
  
  // Fechas
  startedAt   DateTime @default(now())
  expiresAt   DateTime
  cancelledAt DateTime?
  
  // Pago
  paymentMethod String?
  lastPaymentAt DateTime?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("subscriptions")
}

model Payment {
  id          String   @id @default(uuid())
  subscriptionId String
  
  amount      Decimal  @db.Decimal(10, 2)
  currency    String   @default("USD")
  
  // Estado
  status      String   @default("pending") // pending, completed, failed, refunded
  
  // Método
  method      String   // stripe, paypal, etc.
  externalId  String?  // ID externo del proveedor
  
  // Datos
  metadata    Json?
  
  createdAt   DateTime @default(now())
  completedAt DateTime?

  @@map("payments")
}
```

---

## 🔍 Índices Recomendados

```sql
-- Usuarios
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_school ON users(school_id);
CREATE INDEX idx_users_grade ON users(grade_level);

-- Progreso
CREATE INDEX idx_progress_student ON progress(student_id);
CREATE INDEX idx_progress_lesson ON progress(lesson_id);
CREATE INDEX idx_progress_status ON progress(status);

-- Evaluaciones
CREATE INDEX idx_student_assessments_student ON student_assessments(student_id);
CREATE INDEX idx_student_assessments_status ON student_assessments(status);
CREATE INDEX idx_student_answers_attempt ON student_answers(attempt_id);

-- Gamificación
CREATE INDEX idx_xp_log_user ON xp_log(user_id);
CREATE INDEX idx_xp_log_source ON xp_log(source);

-- Notificaciones
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Auditoría
CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
```

---

## 📊 Estrategia de Particionamiento

Para tablas grandes, implementar particionamiento:

```sql
-- Particionar xp_log por mes
CREATE TABLE xp_log_2024_01 PARTITION OF xp_log
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Particionar audit_log por mes
CREATE TABLE audit_log_2024_01 PARTITION OF audit_log
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Particionar notifications por semana (para limpieza automática)
CREATE TABLE notifications_2024_w01 PARTITION OF notifications
    FOR VALUES FROM ('2024-01-01') TO ('2024-01-08');
```

---

## 🔄 Estrategia de Backup

| Tipo | Frecuencia | Retención |
|------|------------|-----------|
| Full Backup | Diario | 30 días |
| Incremental | Cada 6 horas | 7 días |
| Transaction Log | Continuo | 24 horas |
| Snapshot | Semanal | 90 días |
