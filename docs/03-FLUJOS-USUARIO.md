# 🔄 EduPlatform - Flujos de Usuario

## 1. FLUJO DEL ESTUDIANTE

### 1.1 Registro y Onboarding

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REGISTRO ESTUDIANTE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

[Inicio] 
    │
    ▼
┌─────────────────┐
│  Seleccionar    │
│  tipo usuario   │
│  (Estudiante)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Ingresar datos │────▶│  Validar edad   │
│  personales     │     │  (PreK-12)      │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │ < 13 años               │ ≥ 13 años
                    ▼                         ▼
         ┌─────────────────┐       ┌─────────────────┐
         │  Requerir       │       │  Registro       │
         │  consentimiento │       │  directo        │
         │  padre/tutor    │       │                 │
         └────────┬────────┘       └────────┬────────┘
                  │                         │
                  └────────────┬────────────┘
                               ▼
                  ┌─────────────────┐
                  │  Seleccionar    │
                  │  grado escolar  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Diagnostic     │
                  │  Assessment     │
                  │  (Opcional)     │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Personalizar   │
                  │  avatar/perfil  │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  Tutorial       │
                  │  interactivo    │
                  └────────┬────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  DASHBOARD      │
                  │  ESTUDIANTE     │
                  └─────────────────┘
```

### 1.2 Dashboard del Estudiante

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD ESTUDIANTE (PreK-5to)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🌟 ¡Hola, [Nombre]!    Nivel: 5    ⭐ XP: 1,250    🔥 Racha: 5   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   📚 MIS        │  │   🎯 PROGRESO   │  │   🏆 LOGROS     │             │
│  │   CLASES        │  │                 │  │                 │             │
│  │                 │  │  [████████░░]   │  │  🥇 3 Badges    │             │
│  │  🟢 Español     │  │  80% Completado │  │  ⭐ 12 Estrellas│             │
│  │  🟡 Matemáticas │  │                 │  │                 │             │
│  │  🔵 Ciencias    │  │  Siguiente:     │  │  Ver todos →    │             │
│  │  🟣 Inglés      │  │  Examen Módulo 3│  │                 │             │
│  │                 │  │                 │  │                 │             │
│  │  [Ver todas]    │  │  [Continuar]    │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🔔 RECOMENDACIONES PARA TI                                         │   │
│  │                                                                     │   │
│  │  📌 Refuerza: Multiplicación (detectado débil)     [Practicar]    │   │
│  │  📌 Nuevo: Proyecto STEM "Mi primer robot"         [Explorar]     │   │
│  │  📌 Continuar: Lección 3 - Historia de PR          [Continuar]    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   📅 CALENDARIO │  │   📊 RANKING    │  │   🎮 JUEGOS     │             │
│  │                 │  │                 │  │   EDUCATIVOS    │             │
│  │  Hoy:           │  │  #15 de tu      │  │                 │             │
│  │  - Quiz Español │  │  salón          │  │  🧩 Puzzle      │             │
│  │  - Tarea Matem. │  │                 │  │  🎯 Quiz Race   │             │
│  │                 │  │  [Ver ranking]  │  │  🏗️ Constructor │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Flujo de Aprendizaje

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     FLUJO DE APRENDIZAJE POR LECCIÓN                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   INICIO    │
│   LECCIÓN   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  1. VIDEO       │◄─────────────────────────────────────────┐
│     EDUCATIVO   │                                          │
│                 │     ┌─────────────────┐                  │
│  [████████░░]   │◄────│  Controles:     │                  │
│  80% visto      │     │  ⏯️ ⏪ ⏩ 🔊     │                  │
│                 │     │  [Transcripción]│                  │
│  ✓ Completado   │     │  [Descargar]    │                  │
└────────┬────────┘     └─────────────────┘                  │
         │                                                   │
         ▼                                                   │
┌─────────────────┐                                          │
│  2. MATERIAL    │                                          │
│     LECTURA     │                                          │
│                 │     ┌─────────────────┐                  │
│  📄 Contenido   │◄────│  Herramientas:  │                  │
│     adaptado    │     │  🔍 Zoom        │                  │
│                 │     │  🔊 Leer en voz │                  │
│  ✓ Completado   │     │  📝 Notas       │                  │
└────────┬────────┘     │  🖍️ Resaltar    │                  │
         │              └─────────────────┘                  │
         ▼                                                   │
┌─────────────────┐                                          │
│  3. ACTIVIDAD   │                                          │
│   INTERACTIVA   │                                          │
│                 │                                          │
│  🎯 Ejercicio:  │                                          │
│  Completa la    │                                          │
│  secuencia...   │                                          │
│                 │                                          │
│  [Verificar]    │                                          │
│                 │                                          │
│  ✅ ¡Correcto!  │                                          │
│  +10 XP         │                                          │
└────────┬────────┘                                          │
         │                                                   │
         ▼                                                   │
┌─────────────────┐         ┌─────────────────┐              │
│  4. QUIZ        │         │  ¿Necesitas     │              │
│   DE LECCIÓN    │◄────────│  repasar?       │──────────────┘
│                 │         │  [Ver video]    │
│  Pregunta 1/5   │         └─────────────────┘
│  ⏱️ 10:00       │
│                 │
│  ¿Cuál es...?   │
│                 │
│  ○ Opción A     │
│  ● Opción B ✓   │
│  ○ Opción C     │
│                 │
│  [Siguiente]    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   RESULTADOS    │
│                 │
│  🎯 Score: 8/10 │
│  ✅ APROBADO    │
│                 │
│  +50 XP         │
│  🏆 Badge:      │
│  "Matemático    │
│   Principiante" │
│                 │
│  [Continuar]    │────▶ SIGUIENTE LECCIÓN
│  [Repasar]      │────▶ VOLVER A LECCIÓN
└─────────────────┘
```

### 1.4 Flujo de Evaluación (Bloqueo por No Aprobación)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              SISTEMA DE BLOQUEO - NO AVANZA SIN APROBAR                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   EXAMEN        │
│   MÓDULO 3      │
│   MATEMÁTICAS   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Completando    │
│  examen...      │
│  ⏱️ Tiempo: 15m │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Enviando       │
│  respuestas...  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐         ┌─────────────────┐
│   RESULTADOS    │         │                 │
│                 │         │  ❌ NO          │
│  Score: 65/100  │────────▶│  APROBADO       │
│  Mínimo: 70%    │         │                 │
│                 │         │  Intentos: 1/3  │
│  ❌ NO APROBADO │         │                 │
│                 │         │  [Reintentar]   │
└─────────────────┘         │  [Ver errores]  │
                            │                 │
                            │  📋 Análisis:   │
                            │  - Fracciones   │
                            │    (2/5) ⚠️     │
                            │  - Multiplicac. │
                            │    (3/5) ✓      │
                            │                 │
                            │  💡 Sugerencia: │
                            │  Repasa lección │
                            │  3.2 antes de   │
                            │  reintentar     │
                            │                 │
                            └─────────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  [Ir a          │
                            │   refuerzo]     │
                            └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  CONTENIDO      │
                            │  DE REFUERZO    │
                            │                 │
                            │  🎯 Generado    │
                            │    por IA       │
                            │                 │
                            │  - Video corto  │
                            │  - 3 ejercicios │
                            │    enfocados    │
                            │  - Mini-quiz    │
                            │                 │
                            │  [Completar     │
                            │   refuerzo]     │
                            └─────────────────┘

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────┐         ┌─────────────────┐
│   RESULTADOS    │         │                 │
│                 │         │  ✅ APROBADO!   │
│  Score: 85/100  │────────▶│                 │
│  Mínimo: 70%    │         │  🎉 ¡Felicidades│
│                 │         │     avanzas!    │
│  ✅ APROBADO!   │         │                 │
│                 │         │  +100 XP        │
└─────────────────┘         │  🏆 Nuevo Badge │
                            │  🌟 Nivel Up!   │
                            │                 │
                            │  [Siguiente     │
                            │   módulo]       │
                            └─────────────────┘
```

---

## 2. FLUJO DEL MAESTRO

### 2.1 Dashboard del Maestro

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DASHBOARD MAESTRO                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  👨‍🏫 Prof. [Nombre]    📚 3 Grados    👥 78 Estudiantes            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ⚡ ACCIONES RÁPIDAS                                                 │   │
│  │                                                                     │   │
│  │  [+ Nueva Clase]  [+ Crear Quiz]  [+ Asignar Tarea]  [📊 Reportes] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐  │
│  │  📊 RESUMEN ESTUDIANTES     │  │  🤖 AGENTES IA ACTIVOS             │  │
│  │                             │  │                                     │  │
│  │  Total: 78                  │  │  ✅ Generador de Quizzes    [ON]   │  │
│  │  ● Activos hoy: 45 (58%)    │  │  ✅ Evaluador Automático    [ON]   │  │
│  │  ⚠️ Riesgo bajo: 12 (15%)   │  │  ✅ Detector de Riesgo      [ON]   │  │  │
│  │  📈 Promedio: 82%           │  │  ✅ Recomendador Contenido  [ON]   │  │
│  │                             │  │                                     │  │
│  │  [Ver detalles]             │  │  [Configurar agentes]              │  │
│  └─────────────────────────────┘  └─────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🔔 ALERTAS Y NOTIFICACIONES                                        │   │
│  │                                                                     │   │
│  │  ⚠️ 5 estudiantes no han iniciado el módulo 3                       │   │
│  │  📋 12 evaluaciones pendientes de revisión                          │   │
│  │  🎯 3 estudiantes detectados con dificultades en fracciones         │   │
│  │  📅 Examen final programado para el 15 de marzo                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📚 MIS CLASES Y GRUPOS                                             │   │
│  │                                                                     │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │  │ 3er Grado   │ │ 4to Grado   │ │ 5to Grado   │ │ STEM Club   │   │   │
│  │  │ Matemáticas │ │ Ciencias    │ │ Programación│ │ Avanzado    │   │   │
│  │  │             │ │             │ │             │ │             │   │   │
│  │  │ 👥 28       │ │ 👥 25       │ │ 👥 15       │ │ 👥 10       │   │   │
│  │  │ 📊 85% prom │ │ 📊 78% prom │ │ 📊 92% prom │ │ 📊 95% prom │   │   │
│  │  │             │ │             │ │             │ │             │   │   │
│  │  │ [Gestionar] │ │ [Gestionar] │ │ [Gestionar] │ │ [Gestionar] │   │   │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📈 ANÁLISIS POR MATERIA                                            │   │
│  │                                                                     │   │
│  │  Matemáticas  [████████░░] 80%  │  Español    [██████████] 95%     │   │
│  │  Ciencias     [██████░░░░] 65%  │  Inglés     [███████░░░] 72%     │   │
│  │  Historia     [████████░░] 82%  │  Programac. [█████████░] 88%     │   │
│  │                                                                     │   │
│  │  [Ver análisis detallado]                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Creación de Contenido con Agentes IA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              CREACIÓN DE CONTENIDO CON AGENTES IA                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  PANEL MAESTRO  │
│  [+ Nueva Clase]│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  CONFIGURAR NUEVA CLASE                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Grado: [3er Grado ▼]    Materia: [Matemáticas ▼]    Módulo: [3 ▼]       │
│                                                                             │
│  Título de la lección: [Multiplicación de fracciones                ]      │
│                                                                             │
│  Objetivos de aprendizaje:                                                  │
│  [Comprender el concepto de multiplicación de fracciones            ]      │
│  [Aplicar en problemas de la vida real                              ]      │
│                                                                             │
│  Nivel de dificultad: (●) Básico  ( ) Intermedio  ( ) Avanzado             │
│                                                                             │
│  Duración estimada: [45] minutos                                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🤖 GENERAR CON IA                                                  │   │
│  │                                                                     │   │
│  │  Selecciona qué quieres que la IA genere:                          │   │
│  │                                                                     │   │
│  │  [✓] Guion de video educativo          [✓] 5 preguntas de quiz     │   │
│  │  [✓] Material escrito                  [✓] Ejercicios prácticos    │   │
│  │  [✓] Actividad interactiva             [ ] Proyecto STEM           │   │
│  │                                                                     │   │
│  │  Tono del contenido: [Amigable y divertido ▼]                      │   │
│  │                                                                     │   │
│  │  [🤖 GENERAR CONTENIDO CON IA]                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  🤖 AGENTE IA TRABAJANDO...                                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │   Analizando objetivos...                    ✓ Completado         │   │
│  │   Generando guion de video...                ✓ Completado         │   │
│  │   Creando material escrito...                ✓ Completado         │   │
│  │   Diseñando actividad interactiva...         ✓ Completado         │   │
│  │   Generando preguntas de evaluación...       ● Procesando...      │   │
│  │                                                                     │   │
│  │   [████████████████████████████░░░░░░░░░░] 75%                    │   │
│  │                                                                     │   │
│  │   Tiempo estimado: 15 segundos                                      │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  REVISAR Y EDITAR CONTENIDO GENERADO                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [📹 Video]  [📄 Material]  [🎯 Quiz]  [🎮 Actividad]  [✓ Revisar todo]   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📹 GUION DE VIDEO (Generado por IA)                                │   │
│  │                                                                     │   │
│  │  Duración: 8:30 minutos                                             │   │
│  │                                                                     │   │
│  │  [00:00] Introducción animada con personajes                        │   │
│  │  [00:45] "¿Sabías que las fracciones están en todas partes?"       │   │
│  │  [01:30] Explicación visual con pizza dividida                      │   │
│  │  [03:00] Paso a paso: numerador × numerador                         │   │
│  │  [04:30] Paso a paso: denominador × denominador                     │   │
│  │  [06:00] Ejemplo práctico: receta de galletas                       │   │
│  │  [07:30] Resumen y tips                                             │   │
│  │  [08:30] Pregunta para reflexionar                                  │   │
│  │                                                                     │   │
│  │  [✏️ Editar guion]  [🎬 Generar video]  [🔊 Generar audio]          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🎯 QUIZ GENERADO (5 preguntas)                                     │   │
│  │                                                                     │   │
│  │  Pregunta 1: ¿Cuál es el resultado de 1/2 × 1/3?                   │   │
│  │  ○ 1/5  ● 1/6  ○ 2/5  ○ 3/2                                        │   │
│  │  [✏️] [🗑️]                                                          │   │
│  │                                                                     │   │
│  │  Pregunta 2: [Ver más...]                                          │   │
│  │                                                                     │   │
│  │  [+ Agregar pregunta]  [🤖 Regenerar todo]  [✓ Aprobar]            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [💾 Guardar borrador]    [✅ Publicar clase]    [🗑️ Descartar]           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Flujo de Evaluación y Seguimiento

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              EVALUACIÓN Y SEGUIMIENTO DE ESTUDIANTES                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Ver estudiante │
│  [Juan Pérez]   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PERFIL DEL ESTUDIANTE: Juan Pérez                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  👤 Juan Pérez    3er Grado    ⭐ Nivel 8    🔥 Racha: 12 días     │   │
│  │  📧 juan@email.com    📞 787-555-0123                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [📊 Resumen]  [📈 Progreso]  [📝 Evaluaciones]  [⚠️ Alertas]  [✉️ Mensaje]│
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📊 RENDIMIENTO GENERAL                                             │   │
│  │                                                                     │   │
│  │  Promedio general: 87%  [██████████░░]                              │   │
│  │                                                                     │   │
│  │  Matemáticas:    92%  [███████████░]  ↑ +5%                        │   │
│  │  Español:        95%  [███████████░]  → 0%                         │   │
│  │  Ciencias:       78%  [████████░░░░]  ↓ -3%                        │   │
│  │  Inglés:         82%  [████████░░░░]  ↑ +2%                        │   │
│  │  Programación:   88%  [█████████░░░]  ↑ +8%                        │   │
│  │                                                                     │   │
│  │  [Ver detalle por materia]                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ⚠️ ALERTAS DETECTADAS POR IA                                       │   │
│  │                                                                     │   │
│  │  🟡 Dificultad en fracciones (últimas 3 evaluaciones)              │   │
│  │     Recomendación: Asignar refuerzo del módulo 2.3                 │   │
│  │     [Asignar refuerzo]  [Marcar como atendido]                     │   │
│  │                                                                     │   │
│  │  🟡 Tiempo de inactividad: 3 días                                  │   │
│  │     Última actividad: 15 de marzo                                  │   │
│  │     [Enviar recordatorio]  [Contactar padres]                      │   │
│  │                                                                     │   │
│  │  🟢 ¡Excelente progreso en programación!                           │   │
│  │     Ha completado 5 proyectos esta semana                          │   │
│  │     [Enviar reconocimiento]                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📈 PROGRESO EN EL TIEMPO                                           │   │
│  │                                                                     │   │
│  │  100% │                                          ╭─╮               │   │
│  │   80% │                              ╭──────────╯ │               │   │
│  │   60% │          ╭────╮    ╭────────╯            │               │   │
│  │   40% │    ╭────╯    ╰────╯                     │               │   │
│  │   20% │╭───╯                                    ╰──               │   │
│  │    0% └───────────────────────────────────────────────────────    │   │
│  │       Ene  Feb  Mar  Abr  May  Jun  Jul  Ago  Sep  Oct  Nov      │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🎯 HABILIDADES EN DESARROLLO                                       │   │
│  │                                                                     │   │
│  │  Multiplicación      [██████████░░] 80%  ● Dominated               │   │
│  │  Fracciones          [██████░░░░░░] 60%  ○ En progreso              │   │
│  │  Resolución problemas[█████████░░░] 75%  ○ En progreso              │   │
│  │  Lógica computacional[████████████] 95%  ● Dominated               │   │
│  │                                                                     │   │
│  │  [Ver plan de habilidades]                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. FLUJO DEL ADMINISTRADOR

### 3.1 Dashboard de Administración

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PANEL DE ADMINISTRACIÓN DEL SISTEMA                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ⚙️ ADMINISTRADOR DEL SISTEMA    🟢 Sistema operativo               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📊 MÉTRICAS GENERALES DEL SISTEMA                                  │   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│   │
│  │  │  👥 2,456   │  │  👨‍🏫 145    │  │  📚 8,932   │  │  🏫 23      ││   │
│  │  │  Estudiantes│  │  Maestros   │  │  Lecciones  │  │  Escuelas   ││   │
│  │  │  ↑ +12%    │  │  ↑ +3%     │  │  ↑ +156    │  │  ↑ +2      ││   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│   │
│  │                                                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│   │
│  │  │  🎯 45,678  │  │  ⭐ 89%     │  │  💰 $23.5K  │  │  🟢 99.9%   ││   │
│  │  │  Evaluac.   │  │  Satisfacc. │  │  MRR        │  │  Uptime     ││   │
│  │  │  esta semana│  │  usuarios   │  │  ↑ +8%     │  │  este mes   ││   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘│   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ⚡ ACCIONES RÁPIDAS                                                 │   │
│  │                                                                     │   │
│  │  [+ Usuario]  [+ Escuela]  [+ Materia]  [📊 Reportes]  [⚙️ Config] │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [👥 Usuarios]  [🏫 Escuelas]  [📚 Contenido]  [🤖 Agentes]  [💰 Billing] │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  👥 GESTIÓN DE USUARIOS                                             │   │
│  │                                                                     │   │
│  │  [Buscar...]  [Filtrar ▼]  [Exportar]                              │   │
│  │                                                                     │   │
│  │  Nombre          │ Rol        │ Escuela      │ Estado   │ Acciones │   │
│  │  ────────────────┼────────────┼──────────────┼──────────┼──────────│   │
│  │  María González  │ Maestro    │ Esc. Primaria│ ● Activo │ [✏️][👁️]│   │
│  │  Carlos Ruiz     │ Estudiante │ Homeschool   │ ● Activo │ [✏️][👁️]│   │
│  │  Ana López       │ Admin      │ Esc. Central │ ● Activo │ [✏️][👁️]│   │
│  │  Pedro Sánchez   │ Estudiante │ Esc. Primaria│ ⚠️ Inact.│ [✏️][👁️]│   │
│  │  ...             │ ...        │ ...          │ ...      │ ...      │   │
│  │                                                                     │   │
│  │  [< Anterior]  Página 1 de 245  [Siguiente >]                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  ⚠️ ALERTAS DEL SISTEMA                                             │   │
│  │                                                                     │   │
│  │  🔴 3 usuarios reportaron problemas de acceso                       │   │
│  │  🟡 Servidor de videos al 85% de capacidad                          │   │
│  │  🟡 5 licencias de escuela expiran esta semana                      │   │
│  │  🟢 Backup automático completado exitosamente                       │   │
│  │                                                                     │   │
│  │  [Ver todas las alertas]                                           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Gestión de Contenido Académico

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              GESTIÓN DE ESTRUCTURA ACADÉMICA                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Menú:          │
│  [📚 Contenido] │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ESTRUCTURA ACADÉMICA                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [+ Nuevo Grado]  [+ Nueva Materia]  [+ Nuevo Módulo]  [Reorganizar]       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │  ▼ 📚 Pre-Kínder (Edad 4-5)                                        │   │
│  │    ├─ 📖 Español                                                   │   │
│  │    │   ├─ Módulo 1: Conociendo las letras                          │   │
│  │    │   │   ├─ Lección 1: La vocal A                                 │   │
│  │    │   │   ├─ Lección 2: La vocal E                                 │   │
│  │    │   │   └─ ...                                                   │   │
│  │    │   └─ Módulo 2: Primeras palabras                               │   │
│  │    ├─ 🔢 Matemáticas (Básicas)                                      │   │
│  │    └─ 🎨 Arte y Creatividad                                         │   │
│  │                                                                     │   │
│  │  ▶ 📚 Kínder (Edad 5-6)                                             │   │
│  │                                                                     │   │
│  │  ▼ 📚 3er Grado (Edad 8-9)                                          │   │
│  │    ├─ 📖 Español                                                    │   │
│  │    ├─ 🔢 Matemáticas                                                │   │
│  │    │   ├─ Módulo 1: Sumas y restas                                  │   │
│  │    │   ├─ Módulo 2: Multiplicación básica                           │   │
│  │    │   └─ Módulo 3: Fracciones [🤖 Generando contenido...]          │   │
│  │    ├─ 🔬 Ciencias                                                   │   │
│  │    ├─ 📜 Historia                                                   │   │
│  │    ├─ 🌍 Inglés                                                     │   │
│  │    ├─ 💻 Tecnología                                                 │   │
│  │    └─ 🚀 Programación (STEM)                                        │   │
│  │        ├─ Módulo 1: Introducción a la lógica                        │   │
│  │        │   ├─ Lección 1: ¿Qué es programar?                         │   │
│  │        │   ├─ Lección 2: Secuencias                                 │   │
│  │        │   ├─ Lección 3: Bucles                                     │   │
│  │        │   └─ Evaluación del módulo                                 │   │
│  │        └─ Módulo 2: Programación con bloques                        │   │
│  │                                                                     │   │
│  │  ▶ 📚 4to Grado (Edad 9-10)                                         │   │
│  │  ▶ 📚 5to Grado (Edad 10-11)                                        │   │
│  │  ▶ 📚 ...                                                           │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  [💾 Guardar cambios]  [🔄 Restaurar versión anterior]  [📤 Exportar]      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. FLUJO DE AGENTES IA

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE AGENTES INTELIGENTES                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         ORQUESTADOR DE AGENTES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐                                                           │
│   │   TAREA     │                                                           │
│   │  ENTRANTE   │                                                           │
│   └──────┬──────┘                                                           │
│          │                                                                  │
│          ▼                                                                  │
│   ┌─────────────────┐                                                       │
│   │  Clasificador   │                                                       │
│   │  de Intención   │                                                       │
│   └────────┬────────┘                                                       │
│            │                                                                │
│    ┌───────┼───────┬─────────────┬─────────────┐                           │
│    │       │       │             │             │                           │
│    ▼       ▼       ▼             ▼             ▼                           │
│ ┌─────┐ ┌─────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                       │
│ │Gen. │ │Eval.│ │  Tutor  │ │Analytics│ │Content  │                       │
│ │Cont.│ │Auto.│ │Personal │ │Predict. │ │Recomm.  │                       │
│ └──┬──┘ └──┬──┘ └────┬────┘ └────┬────┘ └────┬────┘                       │
│    │       │         │           │           │                             │
│    ▼       ▼         ▼           ▼           ▼                             │
│ ┌─────────────────────────────────────────────────┐                       │
│ │              MOTOR DE LLM (GPT-4/Claude)         │                       │
│ │                                                 │                       │
│ │  • Contexto del estudiante                     │                       │
│ │  • Historial académico                         │                       │
│ │  • Objetivos curriculares                      │                       │
│ │  • Parámetros de configuración                 │                       │
│ └─────────────────────────────────────────────────┘                       │
│                            │                                                │
│                            ▼                                                │
│ ┌─────────────────────────────────────────────────┐                       │
│ │              VALIDADOR DE CALIDAD              │                       │
│ │                                                 │                       │
│ │  ✓ Alineación curricular                      │                       │
│   ✓ Nivel apropiado de dificultad               │                       │
│   ✓ Sin contenido inapropiado                   │                       │
│   ✓ Formato correcto                            │                       │
│ └─────────────────────────────────────────────────┘                       │
│                            │                                                │
│                            ▼                                                │
│ ┌─────────────────────────────────────────────────┐                       │
│ │              OUTPUT / RESULTADO                │                       │
│ └─────────────────────────────────────────────────┘                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                    AGENTES Y SUS FUNCIONES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  🤖 AGENTE GENERADOR DE CONTENIDO                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Input:  Objetivos de aprendizaje, grado, materia, estilo          │   │
│  │  Output: Videos, textos, quizzes, actividades                      │   │
│  │                                                                     │   │
│  │  Ejemplo: "Generar lección sobre fracciones para 3er grado"        │   │
│  │  → Guion de video + Material escrito + 5 preguntas + Ejercicios    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  🤖 AGENTE EVALUADOR AUTOMÁTICO                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Input:  Respuestas de estudiantes, rúbricas                        │   │
│  │  Output: Calificaciones, feedback personalizado                     │   │
│  │                                                                     │   │
│  │  Capacidades:                                                       │   │
│  │  • Opción múltiple: 100% automático                                 │   │
│  │  • Respuesta corta: 90% automático (conferible)                     │   │
│  │  • Ensayos: Calificación + feedback (revisión maestro)              │   │
│  │  • Código: Ejecución + análisis estático                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  🤖 AGENTE TUTOR PERSONAL                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Input:  Dificultades del estudiante, historial                    │   │
│  │  Output: Explicaciones, ejercicios de refuerzo, recomendaciones    │   │
│  │                                                                     │   │
│  │  Funciones:                                                         │   │
│  │  • Detectar conceptos débiles                                       │   │
│  │  • Generar explicaciones alternativas                               │   │
│  │  • Crear ejercicios personalizados                                  │   │
│  │  • Responder preguntas del estudiante                               │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  🤖 AGENTE ANALÍTICO PREDICTIVO                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Input:  Datos de progreso, patrones de comportamiento             │   │
│  │  Output: Alertas, predicciones, recomendaciones                    │   │
│  │                                                                     │   │
│  │  Predicciones:                                                      │   │
│  │  • Riesgo de abandono (con 85% de precisión)                        │   │
│  │  • Tiempo estimado de completitud                                   │   │
│  │  • Materias que requerirán refuerzo                                 │   │
│  │  • Momento óptimo para evaluaciones                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  🤖 AGENTE RECOMENDADOR DE CONTENIDO                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Input:  Perfil del estudiante, objetivos, gaps de conocimiento    │   │
│  │  Output: Lecciones, actividades, recursos recomendados             │   │
│  │                                                                     │   │
│  │  Estrategias:                                                       │   │
│  │  • Remediación: Contenido para cubrir gaps                          │   │
│  │  • Enriquecimiento: Material adicional para avanzados               │   │
│  │  • Diferenciación: Adaptar dificultad según rendimiento             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. FLUJO DE GAMIFICACIÓN

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE GAMIFICACIÓN                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   ACCIÓN        │
│   ESTUDIANTE    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MOTOR DE GAMIFICACIÓN                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    EVENT DETECTADO                                  │   │
│   │                                                                     │   │
│   │  • Lección completada    • Quiz aprobado    • Examen aprobado      │   │
│   │  • Racha de días         • Ayuda a compañero • Proyecto completado │   │
│   │  • Mejora en skill       • Tiempo récord    • Perfect score        │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    CALCULADOR DE XP                                 │   │
│   │                                                                     │   │
│   │  Base: 50 XP (lección)                                              │   │
│   │  + Multiplicador de dificultad: ×1.5                                │   │
│   │  + Bonus de racha: +10%                                             │   │
│   │  + Bonus de velocidad: +5 XP                                        │   │
│   │  ─────────────────────────────                                      │   │
│   │  = Total: 87 XP                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                    ┌───────────────┼───────────────┐                        │
│                    │               │               │                        │
│                    ▼               ▼               ▼                        │
│            ┌───────────┐   ┌───────────┐   ┌───────────┐                   │
│            │   CHECK   │   │   CHECK   │   │   CHECK   │                   │
│            │   NIVEL   │   │   BADGE   │   │   LOGRO   │                   │
│            │    UP     │   │   NUEVO   │   │  NUEVO    │                   │
│            └─────┬─────┘   └─────┬─────┘   └─────┬─────┘                   │
│                  │               │               │                          │
│                  ▼               ▼               ▼                          │
│            ┌─────────────────────────────────────────────────┐              │
│            │              NOTIFICACIÓN AL USUARIO             │              │
│            │                                                   │              │
│            │  🎉 ¡Felicidades!                                 │              │
│            │                                                   │              │
│            │  +87 XP ganados                                   │              │
│            │  🏆 Nuevo badge: "Matemático Rápido"              │              │
│            │  ⬆️ ¡Subiste al Nivel 9!                          │              │
│            │                                                   │              │
│            │  [Compartir]  [Ver perfil]  [Continuar]          │              │
│            └─────────────────────────────────────────────────┘              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE NIVELES Y RECOMPENSAS                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  NIVEL  │  XP REQUERIDO  │  NOMBRE              │  BENEFICIOS              │
│  ───────┼────────────────┼──────────────────────┼────────────────────────  │
│  1      │  0             │  Explorador          │  Acceso básico           │
│  2      │  100           │  Aprendiz            │  Avatar básico           │
│  3      │  250           │  Estudiante          │  Temas de color          │
│  4      │  500           │  Erudito             │  Insignia de perfil      │
│  5      │  1,000         │  Experto             │  Desafíos extras         │
│  6      │  2,000         │  Maestro             │  Ayudar a otros (XP)     │
│  7      │  4,000         │  Sabio               │  Contenido avanzado      │
│  8      │  8,000         │  Genio               │  Proyectos especiales    │
│  9      │  15,000        │  Legendario          │  Mentor de nuevos        │
│  10     │  30,000        │  Inmortal            │  Acceso beta features    │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  TIPOS DE BADGES:                                                           │
│                                                                             │
│  📚 Académicos:                                                             │
│  • "Lector Ávido" - Completar 50 lecciones de español                      │
│  • "Matemático" - Aprobar 20 quizzes de matemáticas                        │
│  • "Científico" - Completar 10 proyectos STEM                              │
│  • "Políglota" - Dominar 2 idiomas                                         │
│                                                                             │
│  🎯 Habilidad:                                                              │
│  • "Rápido" - Completar quiz en < 50% del tiempo                           │
│  • "Perfecto" - 100% en 5 evaluaciones seguidas                            │
│  • "Persistente" - Reintentar y aprobar después de 2 fallos                │
│                                                                             │
│  🔥 Social:                                                                 │
│  • "Colaborador" - Ayudar a 5 compañeros                                   │
│  • "Inspirador" - Ser seguido por 10 estudiantes                           │
│  • "Racha" - 30 días consecutivos de actividad                             │
│                                                                             │
│  🏆 Especiales:                                                             │
│  • "Pionero" - Primeros 100 usuarios                                       │
│  • "Fundador" - Contribuir contenido aprobado                              │
│  • "Leyenda" - Alcanzar nivel 10                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
