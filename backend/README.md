# EduPlatform Backend

Backend API para la plataforma educativa EduPlatform.

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

### 3. Generar cliente Prisma

```bash
npx prisma generate
```

### 4. Crear base de datos y ejecutar migraciones

```bash
npx prisma migrate dev --name init
```

### 5. (Opcional) Cargar datos iniciales

```bash
npx prisma db seed
```

### 6. Iniciar servidor de desarrollo

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

## 📋 Requisitos Previos

- Node.js >= 20.0.0
- PostgreSQL >= 14
- Redis (opcional, para caché)

## 🔧 Configuración

Edita el archivo `.env` con tus credenciales:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/eduplatform?schema=public"

# JWT
JWT_SECRET=tu-secreto-super-seguro
JWT_REFRESH_SECRET=tu-refresh-secreto

# OpenAI (para agentes IA)
OPENAI_API_KEY=sk-tu-api-key
```

## 📚 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor en modo desarrollo |
| `npm run build` | Compila TypeScript |
| `npm start` | Inicia servidor en producción |
| `npm run db:generate` | Genera cliente Prisma |
| `npm run db:migrate` | Ejecuta migraciones |
| `npm run db:studio` | Abre Prisma Studio |
| `npm run db:seed` | Carga datos iniciales |
| `npm run lint` | Ejecuta ESLint |

## 🗄️ Estructura de Carpetas

```
backend/
├── prisma/
│   └── schema.prisma      # Esquema de base de datos
├── src/
│   ├── config/            # Configuración (DB, logger)
│   ├── modules/           # Módulos de negocio
│   │   ├── auth/          # Autenticación
│   │   ├── users/         # Gestión de usuarios
│   │   ├── content/       # Contenido educativo
│   │   ├── assessments/   # Evaluaciones
│   │   ├── progress/      # Progreso estudiantil
│   │   ├── gamification/  # Sistema de gamificación
│   │   ├── agents/        # Agentes IA
│   │   ├── notifications/ # Notificaciones
│   │   └── reports/       # Reportes
│   ├── shared/            # Utilidades compartidas
│   └── index.ts           # Punto de entrada
└── package.json
```

## 🔐 Autenticación

La API usa JWT para autenticación. Incluye:
- Access tokens (15 minutos)
- Refresh tokens (7 días)
- Role-based access control (RBAC)

## 🧪 Testing

```bash
npm test
```

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/refresh` - Refrescar token
- `GET /api/auth/me` - Obtener usuario actual

### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `GET /api/users/:id/progress` - Progreso del estudiante

### Contenido
- `GET /api/content/grades` - Listar grados
- `GET /api/content/grades/:id/subjects` - Materias por grado
- `GET /api/content/modules/:id/lessons` - Lecciones por módulo
- `GET /api/content/lessons/:id` - Obtener lección

### Evaluaciones
- `GET /api/assessments/:id` - Obtener evaluación
- `POST /api/assessments/:id/start` - Iniciar evaluación
- `POST /api/assessments/submit-answer` - Enviar respuesta
- `POST /api/assessments/complete` - Completar evaluación

### Gamificación
- `GET /api/gamification/profile` - Perfil de gamificación
- `GET /api/gamification/leaderboard` - Tabla de clasificación
- `GET /api/gamification/badges` - Badges disponibles

## 🤖 Agentes IA

- `POST /api/agents/generate-quiz` - Generar quiz con IA
- `POST /api/agents/tutor-help` - Ayuda del tutor IA
- `POST /api/agents/generate-content` - Generar contenido

## 📄 Licencia

MIT
