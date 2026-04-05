import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============================================
// CURRICULUM CONFIGURATION
// ============================================

// Core subjects for grades 1-12
const coreSubjects = [
  { name: 'Español', code: 'ESP', description: 'Lengua española, lectura, escritura y gramática' },
  { name: 'Matemáticas', code: 'MAT', description: 'Aritmética, álgebra, geometría y cálculo' },
  { name: 'Ciencia', code: 'CIE', description: 'Ciencias naturales, biología, química y física' },
  { name: 'Historia', code: 'HIS', description: 'Historia universal, geografía y estudios sociales' },
  { name: 'Inglés', code: 'ING', description: 'Gramática, lectura y escritura en inglés' },
  { name: 'Inglés Conversacional', code: 'INC', description: 'Práctica de conversación y comunicación en inglés' },
];

// Special subjects for grades 7-12
const specialSubjects = [
  { name: 'Robótica', code: 'ROB', description: 'Fundamentos de robótica, programación y electrónica', isStem: true },
  { name: 'Finanzas', code: 'FIN', description: 'Educación financiera, presupuesto e inversiones básicos' },
  { name: 'Salud', code: 'SAL', description: 'Salud personal, nutrición y bienestar integral' },
];

// Pre-Kínder and Kínder basic activities
const preschoolSubjects = [
  { name: 'Lectoescritura', code: 'LEC', description: 'Introducción a letras, sonidos y palabras básicas' },
  { name: 'Matemáticas Básicas', code: 'MBAS', description: 'Números, formas, colores y conteo básico' },
  { name: 'Exploración del Medio', code: 'EXP', description: 'Exploración del entorno natural y social' },
  { name: 'Arte y Creatividad', code: 'ART', description: 'Expresión artística, dibujo, pintura y manualidades' },
  { name: 'Música y Movimiento', code: 'MUS', description: 'Ritmo, canciones, danza y expresión corporal' },
];

// Module templates per subject by grade level
const moduleTemplates: Record<string, string[]> = {
  // Elementary (grades 1-3)
  default_elementary: ['Unidad 1: Fundamentos', 'Unidad 2: Práctica', 'Unidad 3: Aplicación', 'Unidad 4: Evaluación'],

  // Middle school (grades 4-6)
  default_middle: ['Unidad 1: Introducción', 'Unidad 2: Desarrollo', 'Unidad 3: Profundización', 'Unidad 4: Proyecto Final'],

  // High school (grades 7-9)
  default_high: ['Unidad 1: Conceptos Básicos', 'Unidad 2: Desarrollo Intermedio', 'Unidad 3: Aplicación Avanzada', 'Unidad 4: Evaluación Integral'],

  // Senior high (grades 10-12)
  default_senior: ['Unidad 1: Fundamentos Teóricos', 'Unidad 2: Metodología', 'Unidad 3: Práctica Especializada', 'Unidad 4: Proyecto Integrador'],

  // Subject-specific modules for specific subjects
  'MAT-1': ['Números y Operaciones', 'Geometría Básica', 'Medición y Datos', 'Resolución de Problemas'],
  'ESP-1': ['Las Vocales y Consonantes', 'Formación de Palabras', 'Lectura Comprensiva', 'Escritura Creativa'],
  'CIE-1': ['Los Seres Vivos', 'El Cuerpo Humano', 'La Naturaleza', 'Experimentos Simples'],
  'HIS-1': ['Mi Familia y Mi Comunidad', 'Mi Pueblo y Mi País', 'Fechas Importantes', 'Tradiciones y Cultura'],
  'ING-1': ['The Alphabet', 'Basic Vocabulary', 'Simple Conversations', 'Reading and Writing'],
  'INC-1': ['Greetings and Introductions', 'Daily Routines', 'At School', 'Fun Activities'],

  'ROB-7': ['Introducción a la Robótica', 'Componentes Electrónicos', 'Programación Básica', 'Proyecto de Robot Simple'],
  'ROB-10': ['Robótica Avanzada', 'Sensores y Actuadores', 'Programación con Arduino', 'Proyecto Final de Robótica'],
  'FIN-7': ['El Dinero y Su Valor', 'Ahorro Básico', 'Presupuesto Personal', 'Mi Primer Plan Financiero'],
  'FIN-10': ['Inversiones Básicas', 'Mercado de Valores', 'Emprendimiento', 'Planificación Financiera'],
  'SAL-7': ['Nutrición y Alimentación', 'Ejercicio y Salud', 'Salud Mental', 'Hábitos Saludables'],
  'SAL-10': ['Salud Integral', 'Prevención de Enfermedades', 'Primeros Auxilios', 'Proyecto de Vida Saludable'],
};

// Lesson templates per module
const lessonTemplates = [
  { title: 'Introducción al Tema', content: 'Vista general de los conceptos fundamentales', duration: 30 },
  { title: 'Desarrollo Teórico', content: 'Explicación detallada de los conceptos', duration: 45 },
  { title: 'Ejercicios Prácticos', content: 'Actividades y ejercicios de aplicación', duration: 40 },
  { title: 'Actividad Colaborativa', content: 'Trabajo en grupo y discusión', duration: 35 },
  { title: 'Evaluación de Unidad', content: 'Quiz o examen de la unidad', duration: 30 },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getModulesForSubject(subjectCode: string, gradeLevel: number): string[] {
  const key = `${subjectCode}-${gradeLevel}`;

  // Check specific subject-grade modules first
  if (moduleTemplates[key]) return moduleTemplates[key];

  // Fall back to grade-level defaults
  if (gradeLevel <= 3) return moduleTemplates.default_elementary;
  if (gradeLevel <= 6) return moduleTemplates.default_middle;
  if (gradeLevel <= 9) return moduleTemplates.default_high;
  return moduleTemplates.default_senior;
}

function getPreschoolModules(): string[] {
  return ['Unidad 1: Descubrimiento', 'Unidad 2: Exploración', 'Unidad 3: Creación', 'Unidad 4: Celebración'];
}

// ============================================
// SEED FUNCTION
// ============================================

async function main() {
  console.log('🌱 Starting FULL curriculum seed...\n');

  // --- Roles ---
  console.log('📋 Creating roles...');
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Super Administrator with full access', permissions: ['*'] },
    { name: 'ADMIN', description: 'Administrator', permissions: ['users:*', 'content:*', 'reports:*'] },
    { name: 'TEACHER', description: 'Teacher', permissions: ['content:read', 'content:create', 'assessments:*', 'progress:read'] },
    { name: 'STUDENT', description: 'Student', permissions: ['content:read', 'assessments:take', 'progress:read'] },
    { name: 'PARENT', description: 'Parent', permissions: ['progress:read'] },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`  ✓ Role: ${role.name}`);
  }

  // --- Grades ---
  console.log('\n📚 Creating grades...');
  const grades = [
    { name: 'Pre-Kínder', level: 0, orderIndex: 0 },
    { name: 'Kínder', level: 1, orderIndex: 1 },
    { name: 'Primer Grado', level: 2, orderIndex: 2 },
    { name: 'Segundo Grado', level: 3, orderIndex: 3 },
    { name: 'Tercer Grado', level: 4, orderIndex: 4 },
    { name: 'Cuarto Grado', level: 5, orderIndex: 5 },
    { name: 'Quinto Grado', level: 6, orderIndex: 6 },
    { name: 'Sexto Grado', level: 7, orderIndex: 7 },
    { name: 'Séptimo Grado', level: 8, orderIndex: 8 },
    { name: 'Octavo Grado', level: 9, orderIndex: 9 },
    { name: 'Noveno Grado', level: 10, orderIndex: 10 },
    { name: 'Décimo Grado', level: 11, orderIndex: 11 },
    { name: 'Undécimo Grado', level: 12, orderIndex: 12 },
    { name: 'Duodécimo Grado', level: 13, orderIndex: 13 },
  ];

  for (const grade of grades) {
    await prisma.grade.upsert({
      where: { level: grade.level },
      update: {},
      create: { ...grade, hasStemTrack: grade.level >= 4 },
    });
    console.log(`  ✓ Grade: ${grade.name}`);
  }

  // --- Subjects ---
  console.log('\n📖 Creating subjects...');

  // Pre-Kínder & Kínder (levels 0-1)
  for (const level of [0, 1]) {
    const grade = await prisma.grade.findUnique({ where: { level } });
    for (const subject of preschoolSubjects) {
      await prisma.subject.upsert({
        where: { code: `${subject.code}_${level}` },
        update: {},
        create: {
          code: `${subject.code}_${level}`,
          name: subject.name,
          description: subject.description,
          gradeId: grade!.id,
        },
      });
      console.log(`  ✓ ${grade!.name}: ${subject.name}`);
    }
  }

  // Grades 1-12 (levels 2-13) -> Core subjects
  for (const level of [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
    const grade = await prisma.grade.findUnique({ where: { level } });
    const gradeNum = level - 1; // Actual grade number (1-12)

    for (const subject of coreSubjects) {
      await prisma.subject.upsert({
        where: { code: `${subject.code}_${level}` },
        update: {},
        create: {
          code: `${subject.code}_${level}`,
          name: subject.name,
          description: subject.description,
          gradeId: grade!.id,
        },
      });
      console.log(`  ✓ ${grade!.name}: ${subject.name}`);
    }

    // Grades 7-12 (levels 8-13) -> Special subjects
    if (level >= 8) {
      for (const subject of specialSubjects) {
        await prisma.subject.upsert({
          where: { code: `${subject.code}_${level}` },
          update: {},
          create: {
            code: `${subject.code}_${level}`,
            name: subject.name,
            description: subject.description,
            gradeId: grade!.id,
            isStem: subject.isStem || false,
          },
        });
        console.log(`  ✓ ${grade!.name}: ${subject.name} (Especial)`);
      }
    }
  }

  // --- Modules & Lessons (sample for demonstration) ---
  console.log('\n📝 Creating modules and lessons (sample)...');

  // We'll create full modules/lessons for a representative sample:
  // - Pre-Kínder (level 0): 1 subject with modules
  // - 1st Grade (level 2): 2 core subjects with modules
  // - 7th Grade (level 8): 2 core + 2 special subjects with modules
  // - 10th Grade (level 11): 2 core + 2 special subjects with modules

  const sampleGrades = [0, 2, 8, 11];

  for (const level of sampleGrades) {
    const grade = await prisma.grade.findUnique({ where: { level } });
    const subjects = await prisma.subject.findMany({ where: { gradeId: grade!.id } });

    // For preschool: take first 2 subjects
    // For others: take first 4 subjects (or all if fewer)
    const subjectsToProcess = level <= 1 ? subjects.slice(0, 2) : subjects.slice(0, 4);

    for (const subject of subjectsToProcess) {
      const subjectCode = subject.code.split('_')[0];
      const modules = getModulesForSubject(subjectCode, level);

      for (let m = 0; m < modules.length; m++) {
        const moduleName = modules[m];
        const existingModule = await prisma.module.findFirst({
          where: { subjectId: subject.id, name: moduleName },
        });

        if (!existingModule) {
          const createdModule = await prisma.module.create({
            data: {
              subjectId: subject.id,
              name: moduleName,
              orderIndex: m + 1,
              description: `Módulo ${m + 1} de ${subject.name}`,
              estimatedHours: 10,
              difficulty: level <= 3 ? 'beginner' : level <= 6 ? 'intermediate' : 'advanced',
            },
          });

          console.log(`  ✓ Module: ${subject.name} > ${moduleName}`);

          // Create lessons for first 2 modules only (to keep seed manageable)
          if (m < 2) {
            for (let l = 0; l < lessonTemplates.length; l++) {
              const lessonTpl = lessonTemplates[l];
              await prisma.lesson.create({
                data: {
                  moduleId: createdModule.id,
                  title: `${lessonTpl.title}`,
                  description: lessonTpl.content,
                  orderIndex: l + 1,
                  duration: lessonTpl.duration,
                  content: {
                    type: 'markdown',
                    body: `# ${lessonTpl.title}\n\n${subject.name} - ${grade!.name}\n\n${lessonTpl.content}\n\n## Objetivos de Aprendizaje\n- Comprender los conceptos fundamentales\n- Aplicar el conocimiento en ejercicios prácticos\n- Reflexionar sobre lo aprendido`,
                  },
                },
              });
            }
            console.log(`    ✓ ${lessonTemplates.length} lessons created`);
          }
        }
      }
    }
  }

  // --- Users ---
  console.log('\n👤 Creating users...');
  const adminPassword = await bcrypt.hash('admin123', 12);
  const studentPassword = await bcrypt.hash('student123', 12);
  const teacherPassword = await bcrypt.hash('teacher123', 12);

  const adminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  const teacherRole = await prisma.role.findUnique({ where: { name: 'TEACHER' } });
  const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eduplatform.com' },
    update: {},
    create: {
      email: 'admin@eduplatform.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      roles: { create: { roleId: adminRole!.id } },
    },
  });
  await prisma.gamificationProfile.upsert({ where: { userId: admin.id }, update: {}, create: { userId: admin.id } });
  console.log(`  ✓ Admin: admin@eduplatform.com / admin123`);

  // Teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@eduplatform.com' },
    update: {},
    create: {
      email: 'teacher@eduplatform.com',
      password: teacherPassword,
      firstName: 'Profa',
      lastName: 'García',
      roles: { create: { roleId: teacherRole!.id } },
    },
  });
  await prisma.gamificationProfile.upsert({ where: { userId: teacher.id }, update: {}, create: { userId: teacher.id } });
  console.log(`  ✓ Teacher: teacher@eduplatform.com / teacher123`);

  // Student (4to grado, level 5)
  const student = await prisma.user.upsert({
    where: { email: 'student@eduplatform.com' },
    update: {},
    create: {
      email: 'student@eduplatform.com',
      password: studentPassword,
      firstName: 'María',
      lastName: 'Rodríguez',
      gradeLevel: 5, // 4to grado
      roles: { create: { roleId: studentRole!.id } },
    },
  });
  await prisma.gamificationProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: { userId: student.id, totalXp: 150, level: 2, currentStreak: 3 },
  });
  console.log(`  ✓ Student: student@eduplatform.com / student123 (4to Grado)`);

  // --- Gamification ---
  console.log('\n🏆 Creating gamification levels...');
  const levels = [
    { name: 'Explorador', minXp: 0, maxXp: 99 },
    { name: 'Aprendiz', minXp: 100, maxXp: 299 },
    { name: 'Estudiante', minXp: 300, maxXp: 599 },
    { name: 'Erudito', minXp: 600, maxXp: 999 },
    { name: 'Experto', minXp: 1000, maxXp: 1999 },
    { name: 'Maestro', minXp: 2000, maxXp: 3999 },
    { name: 'Sabio', minXp: 4000, maxXp: 7999 },
    { name: 'Genio', minXp: 8000, maxXp: 14999 },
    { name: 'Legendario', minXp: 15000, maxXp: 29999 },
    { name: 'Inmortal', minXp: 30000, maxXp: 999999 },
  ];

  for (const level of levels) {
    await prisma.level.upsert({
      where: { name: level.name },
      update: {},
      create: level,
    });
    console.log(`  ✓ Level: ${level.name}`);
  }

  // --- Badges ---
  console.log('\n🎖️ Creating badges...');
  const badges = [
    {
      name: 'Primeros Pasos',
      description: 'Completa tu primera lección',
      iconUrl: '🎯',
      criteria: { type: 'lessons_completed', count: 1 },
      xpValue: 10,
      rarity: 'common',
    },
    {
      name: 'Lector Principiante',
      description: 'Completa 10 lecciones de Español',
      iconUrl: '📖',
      criteria: { type: 'lessons_completed', subject: 'ESP', count: 10 },
      xpValue: 50,
      rarity: 'common',
    },
    {
      name: 'Matemático Rápido',
      description: 'Completa un quiz de matemáticas en menos de 5 minutos',
      iconUrl: '⚡',
      criteria: { type: 'speed_record', subject: 'MAT', percentage: 50 },
      xpValue: 75,
      rarity: 'rare',
    },
    {
      name: 'Racha de 7 Días',
      description: 'Mantén una racha de actividad por 7 días',
      iconUrl: '🔥',
      criteria: { type: 'streak', days: 7 },
      xpValue: 100,
      rarity: 'uncommon',
    },
    {
      name: 'Campeón STEM',
      description: 'Completa 5 proyectos STEM',
      iconUrl: '🚀',
      criteria: { type: 'projects_completed', subject: 'STEM', count: 5 },
      xpValue: 200,
      rarity: 'epic',
    },
    {
      name: 'Robot Master',
      description: 'Completa todos los módulos de Robótica',
      iconUrl: '🤖',
      criteria: { type: 'subject_completed', subject: 'ROB', count: 4 },
      xpValue: 150,
      rarity: 'rare',
    },
    {
      name: 'Financiero Inteligente',
      description: 'Completa el curso de Finanzas',
      iconUrl: '💰',
      criteria: { type: 'subject_completed', subject: 'FIN', count: 4 },
      xpValue: 150,
      rarity: 'rare',
    },
    {
      name: 'Vida Saludable',
      description: 'Completa todos los módulos de Salud',
      iconUrl: '🏃',
      criteria: { type: 'subject_completed', subject: 'SAL', count: 4 },
      xpValue: 150,
      rarity: 'rare',
    },
    {
      name: 'Políglota',
      description: 'Completa Inglés e Inglés Conversacional',
      iconUrl: '🌍',
      criteria: { type: 'subjects_completed', subjects: ['ING', 'INC'], count: 2 },
      xpValue: 250,
      rarity: 'epic',
    },
    {
      name: 'Científico Jr',
      description: 'Completa 20 lecciones de Ciencia',
      iconUrl: '🔬',
      criteria: { type: 'lessons_completed', subject: 'CIE', count: 20 },
      xpValue: 100,
      rarity: 'uncommon',
    },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    });
    console.log(`  ✓ Badge: ${badge.name}`);
  }

  console.log('\n✅ FULL curriculum seed completed!');
  console.log('\n📧 Default accounts:');
  console.log('   Admin:    admin@eduplatform.com / admin123');
  console.log('   Teacher:  teacher@eduplatform.com / teacher123');
  console.log('   Student:  student@eduplatform.com / student123 (4to Grado)');
  console.log('\n📚 Curriculum structure:');
  console.log('   Pre-Kínder/Kínder: 5 subjects each (Lectoescritura, Matemáticas Básicas, etc.)');
  console.log('   Grades 1-6: 6 core subjects (Español, Matemáticas, Ciencia, Historia, Inglés, Ing. Conversacional)');
  console.log('   Grades 7-12: 6 core + 3 special (Robótica, Finanzas, Salud) = 9 subjects each');
  console.log('\n📝 Sample modules/lessons created for: Pre-Kínder, 1st Grade, 7th Grade, 10th Grade');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
