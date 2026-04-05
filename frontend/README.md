# EduPlatform Frontend

Frontend de la plataforma educativa EduPlatform construido con React, TypeScript y Tailwind CSS.

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 3. Compilar para producción

```bash
npm run build
```

## 📋 Requisitos Previos

- Node.js >= 20.0.0
- Backend de EduPlatform corriendo en `http://localhost:3001`

## 🔧 Configuración

El frontend se conecta automáticamente al backend mediante el proxy configurado en `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
}
```

## 📚 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run preview` | Previsualiza build de producción |
| `npm run lint` | Ejecuta ESLint |

## 🗄️ Estructura de Carpetas

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes shadcn/ui
│   │   ├── common/          # Componentes comunes
│   │   └── layout/          # Layouts (Main, Auth, Dashboard)
│   ├── pages/
│   │   ├── public/          # Páginas públicas
│   │   ├── student/         # Panel de estudiante
│   │   ├── teacher/         # Panel de maestro
│   │   └── admin/           # Panel de administrador
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand stores
│   ├── services/            # API services
│   ├── types/               # TypeScript types
│   └── utils/               # Utilidades
├── public/                  # Archivos estáticos
└── package.json
```

## 🎨 Componentes UI

Usamos [shadcn/ui](https://ui.shadcn.com/) como base de componentes:

- Button
- Card
- Dialog
- Dropdown Menu
- Input
- Label
- Progress
- Select
- Tabs
- Toast
- Tooltip

## 🌐 Rutas

### Públicas
- `/` - Home
- `/login` - Inicio de sesión
- `/register` - Registro
- `/pricing` - Planes y precios

### Estudiante
- `/student/dashboard` - Dashboard
- `/student/curriculum` - Currículo
- `/student/lesson/:id` - Lección
- `/student/assessment/:id` - Evaluación
- `/student/progress` - Progreso
- `/student/gamification` - Gamificación

### Maestro
- `/teacher/dashboard` - Dashboard
- `/teacher/content` - Gestionar contenido
- `/teacher/assessment/create` - Crear evaluación
- `/teacher/students` - Progreso de estudiantes

### Admin
- `/admin/dashboard` - Dashboard
- `/admin/users` - Gestión de usuarios
- `/admin/content` - Gestión de contenido
- `/admin/settings` - Configuración del sistema

## 🔐 Autenticación

El estado de autenticación se maneja con Zustand:

```typescript
const { user, isAuthenticated, login, logout } = useAuthStore();
```

## 📡 API

Las llamadas a la API se hacen con Axios:

```typescript
import api from '@/services/api';

const response = await api.get('/users/me');
```

## 🎯 State Management

- **Zustand**: Estado global (auth, UI)
- **React Query**: Server state (caché, fetching)

## 📄 Licencia

MIT
