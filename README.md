EduPlatform — Plataforma Educativa K-12
Plataforma educativa completa para escuelas K-12 con paneles de administración, maestro y estudiante, sistema de gamificación, asistente IA, y gestión académica integral.

🚀 Características
👑 Panel de Administración
Gestión de usuarios: Crear, editar, desactivar estudiantes y maestros.
Asignación académica: Asignar maestros a materias y grados específicos.
Estructura académica: Creación y gestión de grados y materias.
Roles y permisos: Control de acceso granular (Super Admin, Admin, Maestro, Estudiante, Padre).
Auditoría: Registro completo de actividades del sistema con capacidad de eliminación de logs.
Dashboard analítico: Métricas en tiempo real de usuarios, contenido y actividad.
Exportación de datos: Descarga de listados a CSV.
👩‍🏫 Panel del Maestro
Mi Materia: Página central para subir y gestionar contenido (presentaciones, exámenes, quizzes, prácticas, documentos).
Asistente IA: Generador de contenido inteligente (exámenes, quizzes, planes de lección, rúbricas, guías de estudio) y chat libre.
Lista de Estudiantes: Vista filtrada de los estudiantes asignados a sus materias/grados.
Evaluaciones: Creación y gestión de evaluaciones, plantillas y banco de preguntas.
Seguimiento: Monitoreo de progreso estudiantil y retroalimentación.
Comunicación: Foro de discusión y mensajería interna.
Herramientas: Calendario, control de asistencia y gestión de insignias (badges).
🎓 Panel del Estudiante
Contenido: Acceso a lecciones, videos y recursos asignados.
Evaluaciones: Realización de quizzes y exámenes con retroalimentación inmediata.
Gamificación: Sistema de experiencia (XP), niveles, medallas, rachas y tablas de clasificación.
Progreso: Seguimiento visual de avance por materia y lección.
Herramientas de estudio: Notas personales, desafíos diarios, calendario y foro.
Perfil personalizado: Gestión de datos personales y preferencias.
🛡️ Seguridad
Autenticación JWT con refresh tokens.
Autorización basada en roles (RBAC).
Encriptación de contraseñas con bcrypt (12 rounds).
Protección contra XSS con DOMPurify + marked.
Rate limiting y protección contra fuerza bruta.
Headers de seguridad con Helmet.js.
CORS configurado y restringido.
🛠️ Stack Tecnológico
Frontend
Tecnología	Versión	Descripción
React	18.3	UI Library
TypeScript	5.9	Type safety
Vite	6.4	Build tool
Tailwind CSS	3	Styling
Radix UI	-	Componentes accesibles (headless)
Zustand	5	State management
React Query	-	Data fetching y caching
Axios	-	HTTP client
Backend
Tecnología	Versión	Descripción
Node.js	20+	Runtime
Express	4.21	Framework
TypeScript	5.9	Type safety
Prisma	5.22	ORM
PostgreSQL	16+	Base de datos relacional
JSON Web Token	9.0	Autenticación stateless
bcrypt	5.1	Encriptación de contraseñas
OpenAI	4.76	Integración con asistente IA
Winston	3.17	Logging estructurado
Zod	3.24	Validación de datos
Express Validator	7.2	Validación de requests
📋 Requisitos Previos
Node.js >= 20.0.0
npm >= 9.0.0
PostgreSQL >= 15
⚙️ Instalación
1. Clonar el repositorio
git clone https://github.com/raf-rodriguez/eduplatform.git
cd eduplatform
2. Configurar variables de entorno
Backend — Crea el archivo backend/.env:

# Entorno
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/eduplatform?schema=public"

# Autenticación
# Genera claves seguras con: openssl rand -hex 64
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OpenAI (opcional, requerido para Asistente IA)
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
Frontend — Crea el archivo frontend/.env:

VITE_API_URL=http://localhost:3001/api
3. Instalar dependencias
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
4. Configurar la base de datos
cd backend

# Genera el cliente de Prisma
npx prisma generate

# Ejecuta las migraciones (crea tablas)
npx prisma migrate dev

# Inserta datos iniciales (roles, grados, materias, usuarios demo)
npm run db:seed
🚀 Ejecutar
Modo Desarrollo
Abre dos terminales:

# Terminal 1 — Backend (puerto 3001)
cd backend
npm run dev

# Terminal 2 — Frontend (puerto 5173)
cd frontend
npm run dev
Accede a la app en: http://localhost:5173

Modo Producción
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Sirve la carpeta dist/ con nginx, Vercel, Netlify, etc.
👤 Cuentas por Defecto
Creadas automáticamente al ejecutar npm run db:seed:

Rol	Email	Contraseña
👑 Super Admin	admin@eduplatform.com	admin123
👩‍🏫 Maestro	teacher@eduplatform.com	teacher123
🎓 Estudiante	student@eduplatform.com	student123
⚠️ Cambia estas contraseñas inmediatamente en producción.

📁 Estructura del Proyecto
eduplatform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Modelo completo de base de datos
│   │   ├── migrations/         # Historial de migraciones
│   │   └── seed.ts             # Script de datos iniciales
│   ├── src/
│   │   ├── config/             # Configuración de DB y logger
│   │   ├── modules/
│   │   │   ├── auth/           # Login, registro, refresh token
│   │   │   ├── users/          # CRUD de usuarios y gestión
│   │   │   ├── content/        # Gestión de contenido académico
│   │   │   ├── assessments/    # Evaluaciones y quizzes
│   │   │   ├── progress/       # Seguimiento de progreso
│   │   │   ├── gamification/   # XP, niveles, medallas
│   │   │   ├── agents/         # Agentes IA
│   │   │   ├── notifications/  # Sistema de notificaciones
│   │   │   ├── reports/        # Reportes y estadísticas
│   │   │   ├── audit/          # Registro de auditoría
│   │   │   ├── teachers/       # Asignaciones maestro-materia
│   │   │   ├── messaging/      # Chat y mensajería
│   │   │   ├── studyNotes/     # Notas de estudio
│   │   │   ├── forum/          # Foro de discusión
│   │   │   └── ai/             # Endpoint del asistente IA
│   │   └── shared/             # Middleware (auth, validate, errors)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # DashboardLayout, MainLayout, AuthLayout
│   │   │   ├── ui/             # Componentes shadcn/ui (button, card, dialog...)
│   │   │   └── common/         # ProtectedRoute, NotificationCenter, etc.
│   │   ├── context/            # ThemeContext, LanguageContext
│   │   ├── hooks/              # useMarkdownSafe, useToast
│   │   ├── lib/                # Utilidades (utils.ts)
│   │   ├── pages/
│   │   │   ├── admin/          # Dashboard, ManageStudents, ManageTeachers, AuditLogs...
│   │   │   ├── teacher/        # Dashboard, ManageContent, AIAgent, TeacherSubject...
│   │   │   ├── student/        # Dashboard, Lesson, Gamification, Progress...
│   │   │   └── public/         # Home, Login, Register, Pricing
│   │   ├── services/           # API client (axios instance)
│   │   ├── stores/             # Zustand stores (auth)
│   │   ├── types/              # Definiciones TypeScript
│   │   ├── App.tsx             # Definición de rutas
│   │   └── main.tsx            # Punto de entrada
│   └── package.json
│
└── README.md
📊 Base de Datos — Modelos Principales
Usuarios y Autenticación
User: Información personal, email, password, avatar, estado.
Role: Roles del sistema (SUPER_ADMIN, ADMIN, TEACHER, STUDENT, PARENT) con permisos en JSON.
UserRole: Relación muchos-a-muchos entre usuarios y roles.
RefreshToken: Tokens de refresco para sesiones persistentes.
Estructura Académica
Grade: Niveles educativos (Pre-Kínder a 12vo Grado).
Subject: Materias por grado (Español, Matemáticas, Ciencias, etc.).
Module: Unidades temáticas dentro de cada materia.
Lesson: Lecciones individuales con contenido, videos y recursos.
TeacherSubject: Asignación específica de maestro → materia → grado.
Evaluaciones y Progreso
Assessment: Evaluaciones con puntuación máxima, límite de tiempo e intentos.
Quiz: Cuestionarios con preguntas de opción múltiple, V/F y abiertas.
QuizQuestion: Preguntas con opciones, respuesta correcta y rúbrica de calificación.
StudentAssessment: Intentos de evaluación por estudiante.
StudentAnswer: Respuestas individuales con calificación y feedback IA.
Progress: Progreso del estudiante por lección (status, score, tiempo).
Gamificación
GamificationProfile: XP total, nivel actual, racha de actividad.
Level: Niveles de experiencia (Explorador → Inmortal).
Badge: Medallas desbloqueables con criterios y rareza.
UserBadge: Medallas obtenidas por usuarios.
XpLog: Historial de ganancias de XP.
Comunicación y Auditoría
AuditLog: Registro de todas las acciones del sistema (quién, qué, cuándo, IP).
Notification: Notificaciones push/email/in-app.
Conversation / Message: Sistema de mensajería entre usuarios.
ForumThread / ForumReply: Foros de discusión por materia.
StudyNote: Notas personales del estudiante.
🔌 API Endpoints Principales
Método	Ruta	Descripción	Auth Requerido
POST	/api/auth/register	Registro de nuevo usuario	❌
POST	/api/auth/login	Inicio de sesión	❌
POST	/api/auth/refresh	Refrescar access token	❌
GET	/api/users/students	Lista de estudiantes (con filtros)	TEACHER+
GET	/api/users/teachers	Lista de maestros	ADMIN+
POST	/api/users/:id/reset-password	Resetear contraseña	ADMIN+
PUT	/api/users/:id/role	Cambiar rol de usuario	ADMIN+
POST	/api/users/bulk-import	Importar usuarios masivamente	ADMIN+
POST	/api/teachers/assignments	Asignar maestro a materia/grado	ADMIN+
GET	/api/teachers/assignments	Ver todas las asignaciones	ADMIN+
GET	/api/teachers/my/students	Ver estudiantes asignados	TEACHER
GET	/api/teachers/my	Ver asignaciones del maestro	TEACHER
POST	/api/ai/generate	Generar contenido (quiz, examen, plan)	TEACHER+
POST	/api/ai/chat	Chat libre con asistente IA	TEACHER+
GET	/api/content/grades	Lista de grados	Público
GET	/api/content/my-curriculum	Currículo personalizado	ESTUDIANTE
POST	/api/content/lessons	Crear lección	TEACHER+
GET	/api/progress/	Seguimiento de progreso	ESTUDIANTE
GET	/api/gamification/profile	Perfil de gamificación	ESTUDIANTE
GET	/api/reports/dashboard	Estadísticas del sistema	ADMIN+
GET	/api/audit/	Logs de auditoría	ADMIN+
DELETE	/api/audit/:id	Eliminar log de auditoría	ADMIN+
📜 Scripts Disponibles
Backend
Comando	Descripción
npm run dev	Inicia servidor de desarrollo con auto-reload
npm run build	Compila TypeScript a JavaScript
npm start	Inicia servidor de producción
npm run db:generate	Genera el cliente de Prisma
npm run db:migrate	Ejecuta migraciones pendientes
npm run db:seed	Inserta datos iniciales (roles, usuarios demo)
npm run db:studio	Abre Prisma Studio (interfaz visual de la DB)
npm run lint	Ejecuta ESLint
Frontend
Comando	Descripción
npm run dev	Inicia Vite en modo desarrollo
npm run build	Compila para producción
npm run preview	Previsualiza build localmente
npm run lint	Ejecuta linter
🔒 Seguridad
Aspecto	Implementación
Contraseñas	bcrypt con 12 salt rounds
Tokens	JWT con expiración (15 min access, 7 días refresh)
XSS	DOMPurify + marked sanitization en todo contenido HTML
Inyección SQL	Prisma ORM con consultas parametrizadas automáticas
Rate Limit	1000 requests por IP cada 15 minutos
CORS	Origen restringido al frontend configurado
Headers	Helmet.js con CSP, HSTS, X-Frame-Options, X-Content-Type-Options
Validación	Express Validator + Zod en todos los endpoints
🌍 Idiomas
El frontend soporta Español e Inglés mediante el contexto LanguageContext. Los textos de navegación, etiquetas y mensajes se traducen dinámicamente.

🐛 Solución de Problemas
Error: P1001: Can't reach database server
Verifica que PostgreSQL esté corriendo.
Revisa el DATABASE_URL en backend/.env.
Error: ImportMeta.env no existe
Ejecuta npm run dev en el frontend. Vite define automáticamente import.meta.env.
Asegúrate de tener frontend/.env con VITE_API_URL.
Error: Invalid credentials al iniciar sesión
Ejecuta npm run db:seed en el backend para crear los usuarios iniciales.
Error: Cannot find module '@prisma/client'
Ejecuta npx prisma generate en la carpeta backend/.
📝 Licencia
MIT

👨‍💻 Desarrollado por
EduPlatform Team

