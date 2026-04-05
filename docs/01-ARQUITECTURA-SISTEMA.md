# 🎓 EduPlatform - Arquitectura del Sistema

## Visión General

EduPlatform es una plataforma educativa digital completa diseñada para estudiantes desde Pre-Kínder hasta grado 12, con capacidad de evolución hacia un sistema de homeschooling estructurado.

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAPA DE PRESENTACIÓN                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Web App    │  │  Mobile App  │  │   PWA        │  │   Admin      │    │
│  │   (React)    │  │  (React      │  │  (Offline)   │  │   Panel      │    │
│  │              │  │   Native)    │  │              │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAPA DE API GATEWAY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    Express.js + TypeScript API Gateway                  │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │ │
│  │  │   Auth      │ │   Rate      │ │   Request   │ │   Load          │  │ │
│  │  │ Middleware  │ │   Limiting  │ │   Validation│ │   Balancer      │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE MICROSERVICIOS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │   Usuarios   │ │   Contenido  │ │ Evaluaciones │ │  Progreso    │        │
│  │   Service    │ │   Service    │ │   Service    │ │   Service    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │Gamificación  │ │   Agentes    │ │  Notificac.  │ │  Reportes    │        │
│  │   Service    │ │   IA Service │ │   Service    │ │   Service    │        │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CAPA DE DATOS                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  PostgreSQL  │ │    Redis     │ │   MongoDB    │ │ Elasticsearch│        │
│  │  (Datos      │ │   (Cache     │ │  (Contenido  │ │  (Búsqueda   │        │
│  │   Relacional)│ │   Sesiones)  │ │   NoSQL)     │ │   Avanzada)  │        │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐                                           │
│  │    MinIO     │ │   RabbitMQ   │                                           │
│  │  (Archivos   │ │   (Colas     │                                           │
│  │   Media)     │ │   Mensajes)  │                                           │
│  └──────────────┘ └──────────────┘                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CAPA DE INTELIGENCIA ARTIFICIAL                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    Sistema de Agentes Inteligentes                      │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │ │
│  │  │   Agente    │ │   Agente    │ │   Agente    │ │   Agente    │       │ │
│  │  │  Generador  │ │  Evaluador  │ │  Tutor      │ │  Analítico  │       │ │
│  │  │  Contenido  │ │  Automático │ │  Personal   │ │  Predictivo │       │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │  │              LLM Integration (OpenAI/Claude/Local)               │   │ │
│  │  └─────────────────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 18.x | Framework UI principal |
| TypeScript | 5.x | Tipado estático |
| Vite | 5.x | Build tool |
| Tailwind CSS | 3.4.x | Estilos |
| shadcn/ui | Latest | Componentes UI |
| Zustand | 4.x | State management |
| React Query | 5.x | Data fetching |
| React Router | 6.x | Routing |
| Socket.io-client | 4.x | Tiempo real |
| Recharts | 2.x | Gráficos |
| Framer Motion | 11.x | Animaciones |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | 20.x | Runtime |
| Express.js | 4.x | Framework web |
| TypeScript | 5.x | Tipado estático |
| Prisma | 5.x | ORM |
| JWT | 9.x | Autenticación |
| bcrypt | 5.x | Hashing |
| Socket.io | 4.x | WebSockets |
| Bull | 4.x | Job queues |
| Express-validator | 7.x | Validación |
| Helmet | 7.x | Seguridad |
| CORS | 2.x | Cross-origin |

### Base de Datos
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| PostgreSQL | 16.x | Base de datos principal |
| Redis | 7.x | Cache y sesiones |
| MongoDB | 7.x | Contenido flexible |
| Elasticsearch | 8.x | Búsqueda |
| MinIO | Latest | Almacenamiento archivos |

### IA/ML
| Tecnología | Propósito |
|------------|-----------|
| OpenAI API | LLM para agentes |
| LangChain | Orquestación agentes |
| TensorFlow.js | Modelos locales |
| Natural | NLP básico |

### DevOps
| Tecnología | Propósito |
|------------|-----------|
| Docker | Contenedores |
| Docker Compose | Orquestación local |
| GitHub Actions | CI/CD |
| Nginx | Reverse proxy |
| Prometheus | Métricas |
| Grafana | Dashboards |

---

## 🔐 Sistema de Autenticación y Roles

### Jerarquía de Roles

```
SUPER_ADMIN
    │
    ├── ADMIN_SISTEMA (gestión completa)
    │
    ├── ADMIN_ACADEMICO
    │   ├── Maestro (múltiples grados/materias)
    │   └── Tutor (solo sus estudiantes)
    │
    ├── ESTUDIANTE
    │   ├── Pre-K a 5to (Interfaz infantil)
    │   └── 6to a 12mo (Interfaz juvenil)
    │
    └── PADRE/TUTOR
        └── Solo visualización de progreso
```

### Permisos por Rol

| Funcionalidad | Super Admin | Admin | Maestro | Estudiante | Padre |
|--------------|-------------|-------|---------|------------|-------|
| Gestión usuarios | ✅ | ✅ | ❌ | ❌ | ❌ |
| Config sistema | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear contenido | ✅ | ✅ | ✅ | ❌ | ❌ |
| Evaluar | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver progreso todos | ✅ | ✅ | ✅* | ❌ | ❌ |
| Ver progreso propio | ❌ | ❌ | ❌ | ✅ | ❌ |
| Ver progreso hijo | ❌ | ❌ | ❌ | ❌ | ✅ |
| Tomar evaluaciones | ❌ | ❌ | ❌ | ✅ | ❌ |
| Acceder contenido | ✅ | ✅ | ✅ | ✅ | ❌ |

*Solo sus estudiantes asignados

---

## 🎯 Estructura de Carpetas del Proyecto

```
eduplatform/
├── 📁 docs/                          # Documentación
│   ├── 01-ARQUITECTURA-SISTEMA.md
│   ├── 02-BASE-DE-DATOS.md
│   ├── 03-FLUJOS-USUARIO.md
│   ├── 04-AGENTES-IA.md
│   ├── 05-GAMIFICACION.md
│   ├── 06-MODELO-NEGOCIO.md
│   └── 07-ROADMAP.md
│
├── 📁 backend/                       # API Node.js
│   ├── src/
│   │   ├── config/                   # Configuraciones
│   │   ├── modules/                  # Módulos de negocio
│   │   │   ├── auth/                 # Autenticación
│   │   │   ├── users/                # Usuarios
│   │   │   ├── content/              # Contenido educativo
│   │   │   ├── assessments/          # Evaluaciones
│   │   │   ├── progress/             # Progreso
│   │   │   ├── gamification/         # Gamificación
│   │   │   ├── agents/               # Agentes IA
│   │   │   ├── notifications/        # Notificaciones
│   │   │   └── reports/              # Reportes
│   │   ├── shared/                   # Utilidades compartidas
│   │   ├── prisma/                   # Esquema Prisma
│   │   └── index.ts                  # Entry point
│   ├── tests/
│   ├── Dockerfile
│   └── package.json
│
├── 📁 frontend/                      # Aplicación React
│   ├── src/
│   │   ├── components/               # Componentes reutilizables
│   │   │   ├── ui/                   # Componentes base (shadcn)
│   │   │   ├── common/               # Componentes comunes
│   │   │   └── layout/               # Layouts
│   │   ├── pages/                    # Páginas
│   │   │   ├── public/               # Páginas públicas
│   │   │   ├── student/              # Panel estudiante
│   │   │   ├── teacher/              # Panel maestro
│   │   │   └── admin/                # Panel admin
│   │   ├── hooks/                    # Custom hooks
│   │   ├── stores/                   # Zustand stores
│   │   ├── services/                 # API services
│   │   ├── types/                    # TypeScript types
│   │   └── utils/                    # Utilidades
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── 📁 agents/                        # Servicio de Agentes IA
│   ├── src/
│   │   ├── agents/                   # Implementación agentes
│   │   ├── llm/                      # Integración LLM
│   │   ├── tools/                    # Herramientas agentes
│   │   └── index.ts
│   └── package.json
│
├── 📁 database/                      # Scripts y migraciones
│   ├── migrations/
│   ├── seeds/
│   └── docker-compose.db.yml
│
├── 📁 infrastructure/                # Infraestructura
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
│
└── 📁 scripts/                       # Scripts de utilidad
    ├── setup.sh
    └── deploy.sh
```

---

## 🔄 Flujo de Datos

### Flujo de Aprendizaje

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Acceso    │────▶│  Contenido  │────▶│  Actividad  │────▶│   Quiz      │
│   Grado/    │     │   Lección   │     │  Interactiva│     │  Lección    │
│   Materia   │     │  (Video+    │     │             │     │             │
│             │     │   Texto)    │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
                              ┌─────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   ¿Aprobado?    │
                    │    (70% min)    │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │ SÍ                          │ NO
              ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │  Siguiente      │           │  Contenido      │
    │  Lección        │           │  Refuerzo       │
    │                 │           │  (IA detecta    │
    │                 │           │   debilidad)    │
    └────────┬────────┘           └────────┬────────┘
             │                             │
             └──────────────┬──────────────┘
                            ▼
                  ┌─────────────────┐
                  │  Fin Módulo     │
                  │  → Examen       │
                  │    Módulo       │
                  └─────────────────┘
```

---

## 📊 Escalabilidad

### Estrategias de Escalado

1. **Horizontal Scaling**: Múltiples instancias de microservicios
2. **Database Sharding**: Por región/escuela/grado
3. **CDN**: Contenido estático y videos
4. **Caching**: Redis para datos frecuentes
5. **Async Processing**: Colas para tareas pesadas
6. **Read Replicas**: PostgreSQL para consultas

### Métricas de Escalado

| Métrica | Umbral | Acción |
|---------|--------|--------|
| CPU | >70% | Scale up |
| Memory | >80% | Scale up |
| Response Time | >500ms | Add instances |
| Queue Depth | >1000 | Add workers |
| DB Connections | >80% | Add read replica |

---

## 🔒 Seguridad

### Medidas Implementadas

1. **Autenticación**: JWT con refresh tokens
2. **Autorización**: RBAC (Role-Based Access Control)
3. **Encriptación**: TLS 1.3, AES-256
4. **Validación**: Input sanitization, SQL injection prevention
5. **Rate Limiting**: Por IP y usuario
6. **Audit Logging**: Todas las acciones críticas
7. **Data Privacy**: GDPR, FERPA compliance

---

## 🚀 Deployment

### Entornos

| Entorno | Propósito | URL |
|---------|-----------|-----|
| Development | Desarrollo local | localhost:3000 |
| Staging | Pruebas QA | staging.eduplatform.com |
| Production | Producción | eduplatform.com |

### Pipeline CI/CD

```
Push to develop
      │
      ▼
┌─────────────┐
│   Lint      │
│   & Test    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Build     │
│   Docker    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Deploy    │
│   Staging   │
└──────┬──────┘
       │
       ▼ (manual)
┌─────────────┐
│   Deploy    │
│  Production │
└─────────────┘
```
