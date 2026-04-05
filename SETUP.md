# 🎓 EduPlatform - Guía de Instalación

## Requisitos Previos

- **Node.js** >= 20.0.0
- **PostgreSQL** >= 14
- **npm** o **yarn**

---

## ⚡ Instalación Rápida

### Paso 1: Configurar Backend

```bash
cd backend

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL

# 3. Generar cliente Prisma
npx prisma generate

# 4. Crear base de datos y migraciones
npx prisma migrate dev --name init

# 5. Cargar datos iniciales (roles, grados, usuarios demo)
npx prisma db seed

# 6. Iniciar servidor
npm run dev
```

El backend estará en `http://localhost:3001`

### Paso 2: Configurar Frontend

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

El frontend estará en `http://localhost:5173`

---

## 🔧 Configuración de Variables de Entorno

### Backend (.env)

```env
# Entorno
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173

# Base de datos (REQUERIDO)
DATABASE_URL="postgresql://usuario:password@localhost:5432/eduplatform?schema=public"

# JWT (cambiar en producción)
JWT_SECRET=tu-secreto-super-seguro-minimo-32-caracteres
JWT_REFRESH_SECRET=tu-refresh-secreto-minimo-32-caracteres

# OpenAI (opcional, para agentes IA)
OPENAI_API_KEY=sk-tu-api-key-de-openai
```

### Frontend

No requiere configuración adicional. El proxy está configurado en `vite.config.ts`.

---

## 🧪 Cuentas de Prueba

Después de ejecutar `npx prisma db seed`, tendrás estas cuentas:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@eduplatform.com` | `admin123` |
| Estudiante | `student@eduplatform.com` | `student123` |

---

## 📁 Estructura del Proyecto

```
eduplatform/
├── backend/                 # API Node.js/Express
│   ├── prisma/
│   │   ├── schema.prisma   # Esquema de base de datos
│   │   └── seed.ts         # Datos iniciales
│   ├── src/
│   │   ├── modules/        # Módulos de negocio
│   │   ├── config/         # Configuración
│   │   └── index.ts        # Punto de entrada
│   ├── .env.example        # Variables de entorno de ejemplo
│   └── package.json
│
├── frontend/                # React App
│   ├── src/
│   │   ├── pages/          # Páginas por rol
│   │   ├── components/     # Componentes UI
│   │   └── stores/         # Estado global
│   └── package.json
│
└── docs/                    # Documentación
    ├── 01-ARQUITECTURA-SISTEMA.md
    ├── 02-BASE-DE-DATOS.md
    └── ...
```

---

## 🐛 Solución de Problemas

### Error: "Could not find Prisma Schema"

**Solución:**
```bash
cd backend
npx prisma generate
```

### Error: "@prisma/client did not initialize yet"

**Solución:**
```bash
cd backend
npx prisma generate
```

### Error: "Database does not exist"

**Solución:**
1. Crear base de datos en PostgreSQL:
```sql
CREATE DATABASE eduplatform;
```

2. Ejecutar migraciones:
```bash
npx prisma migrate dev
```

### Error: "Connection refused" al conectar al backend

**Solución:**
1. Verificar que el backend esté corriendo en `http://localhost:3001`
2. Verificar que `FRONTEND_URL` en `.env` del backend sea correcto

---

## 🚀 Comandos Útiles

### Backend

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Base de datos
npx prisma studio          # UI de base de datos
npx prisma migrate dev     # Nueva migración
npx prisma db seed         # Recargar datos iniciales
```

### Frontend

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run preview
```

---

## 📚 Documentación Adicional

- [Arquitectura del Sistema](docs/01-ARQUITECTURA-SISTEMA.md)
- [Base de Datos](docs/02-BASE-DE-DATOS.md)
- [Flujos de Usuario](docs/03-FLUJOS-USUARIO.md)
- [Agentes IA](docs/04-AGENTES-IA.md)
- [Gamificación](docs/05-GAMIFICACION.md)
- [Modelo de Negocio](docs/06-MODELO-NEGOCIO.md)
- [Roadmap](docs/07-ROADMAP.md)

---

## 💬 Soporte

Si encuentras problemas, revisa:
1. Los logs del servidor
2. La consola del navegador
3. La documentación en la carpeta `docs/`

---

## 📄 Licencia

MIT
