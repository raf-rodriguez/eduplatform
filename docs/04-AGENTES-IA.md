# 🤖 EduPlatform - Sistema de Agentes Inteligentes

## Arquitectura del Sistema de Agentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE ORQUESTACIÓN                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    AGENT ORCHESTRATOR                               │   │
│   │                                                                     │   │
│   │  • Enrutamiento de tareas          • Gestión de colas              │   │
│   │  • Balanceo de carga               • Monitoreo de agentes          │   │
│   │  • Fallback y recuperación         • Logging y auditoría           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
└────────────────────────────────────┼────────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  AGENT TASK     │         │  AGENT TASK     │         │  AGENT TASK     │
│  QUEUE          │         │  QUEUE          │         │  QUEUE          │
│  (Alta prio)    │         │  (Media prio)   │         │  (Baja prio)    │
│                 │         │                 │         │                 │
│ • Evaluaciones  │         │ • Contenido     │         │ • Analytics     │
│ • Tutoría       │         │ • Reportes      │         │ • Recomendac.   │
│ • Alertas       │         │ • Sugerencias   │         │ • Limpieza      │
└────────┬────────┘         └────────┬────────┘         └────────┬────────┘
         │                           │                           │
         └───────────────────────────┼───────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENTES ESPECIALIZADOS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  🤖 GENERADOR   │  │  🤖 EVALUADOR   │  │  🤖 TUTOR       │             │
│  │   DE CONTENIDO  │  │   AUTOMÁTICO    │  │   PERSONAL      │             │
│  │                 │  │                 │  │                 │             │
│  │  generate()     │  │  evaluate()     │  │  tutor()        │             │
│  │  adapt()        │  │  grade()        │  │  explain()      │             │
│  │  enrich()       │  │  feedback()     │  │  recommend()    │             │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘             │
│           │                    │                    │                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │  📊 ANALÍTICO   │  │  🔍 DETECTOR    │  │  💡 RECOMENDADOR│             │
│  │   PREDICTIVO    │  │   DE RIESGO     │  │   DE CONTENIDO  │             │
│  │                 │  │                 │  │                 │             │
│  │  predict()      │  │  detect()       │  │  recommend()    │             │
│  │  analyze()      │  │  alert()        │  │  personalize()  │             │
│  │  forecast()     │  │  intervene()    │  │  adapt()        │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTEGRACIÓN LLM                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│   │   OpenAI        │  │   Anthropic     │  │   Local Models  │            │
│   │   GPT-4         │  │   Claude        │  │   (Llama/etc)   │            │
│   │                 │  │                 │  │                 │            │
│   │  • Alto rend.   │  │  • Contexto     │  │  • Privacidad   │            │
│   │  • Multimodal   │  │    largo        │  │  • Costo bajo   │            │
│   │  • Costo medio  │  │  • Razonamiento │  │  • Rendimiento  │            │
│   │                 │  │                 │  │    variable     │            │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    LANGCHAIN / LLAMAINDEX                           │   │
│   │                                                                     │   │
│   │  • RAG (Retrieval Augmented Generation)                            │   │
│   │  • Memory y contexto                                               │   │
│   │  • Tool calling                                                    │   │
│   │  • Chain orchestration                                             │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agente Generador de Contenido

### Propósito
Generar automáticamente material educativo de alta calidad alineado con el currículo.

### Capacidades

```typescript
interface ContentGeneratorAgent {
  // Generar lección completa
  generateLesson(params: {
    grade: number;
    subject: string;
    topic: string;
    learningObjectives: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // minutos
    style: 'fun' | 'formal' | 'interactive';
  }): Promise<{
    videoScript: VideoScript;
    writtenMaterial: WrittenMaterial;
    quiz: Quiz;
    activities: Activity[];
  }>;

  // Adaptar contenido existente
  adaptContent(params: {
    contentId: string;
    targetLevel: number;
    adaptations: ('simplify' | 'enrich' | 'translate')[];
  }): Promise<AdaptedContent>;

  // Generar variaciones
  generateVariations(params: {
    contentId: string;
    count: number;
    variationType: 'difficulty' | 'style' | 'examples';
  }): Promise<ContentVariation[]>;
}
```

### Prompt del Sistema

```
Eres un experto educador con 20 años de experiencia en diseño curricular para 
estudiantes de Pre-K a 12mo grado. Tu tarea es crear contenido educativo 
enganchador, pedagógicamente sólido y alineado con estándares educativos.

PRINCIPIOS PEDAGÓGICOS:
1. Aprendizaje activo: El estudiante debe interactuar, no solo consumir
2. Diferenciación: Adaptar a diferentes estilos de aprendizaje
3. Evaluación formativa: Verificar comprensión continuamente
4. Conexiones reales: Relacionar con experiencias del estudiante
5. Progresión lógica: De lo simple a lo complejo, de lo concreto a lo abstracto

ESTRUCTURA DE LECCIÓN:
1. Gancho/Hook (2 min): Captar atención con pregunta intrigante o problema
2. Exploración (40%): Presentar conceptos con ejemplos visuales
3. Práctica guiada (30%): Ejercicios con apoyo
4. Práctica independiente (20%): Aplicación individual
5. Cierre (5%): Resumen y conexión con siguiente lección

REGLAS:
- Usar lenguaje apropiado para la edad
- Incluir ejemplos culturalmente relevantes para Puerto Rico
- Proporcionar múltiples representaciones (visual, verbal, kinestésica)
- Anticipar conceptos erróneos comunes y abordarlos
- Incluir preguntas de reflexión
```

### Ejemplo de Uso

```typescript
// Generar lección de fracciones para 3er grado
const lesson = await contentAgent.generateLesson({
  grade: 3,
  subject: 'MAT',
  topic: 'Multiplicación de fracciones',
  learningObjectives: [
    'Comprender el concepto de multiplicación de fracciones',
    'Aplicar el procedimiento paso a paso',
    'Resolver problemas de la vida real'
  ],
  difficulty: 'intermediate',
  duration: 45,
  style: 'fun'
});

// Resultado:
{
  videoScript: {
    duration: '8:30',
    scenes: [
      {
        timestamp: '00:00',
        visual: 'Animación de pizza siendo compartida',
        narration: '¿Alguna vez has compartido pizza con tus amigos?...',
        props: ['pizza_animation', 'friends_characters']
      },
      // ... más escenas
    ]
  },
  writtenMaterial: {
    pages: 3,
    content: '...',
    worksheets: ['practice_1', 'practice_2'],
    keyVocabulary: ['numerador', 'denominador', 'producto']
  },
  quiz: {
    questions: 5,
    timeLimit: 15,
    autoGradable: true
  }
}
```

---

## 🤖 Agente Evaluador Automático

### Propósito
Calificar evaluaciones automáticamente con alta precisión.

### Capacidades

```typescript
interface AutoEvaluatorAgent {
  // Evaluar respuesta
  evaluate(params: {
    question: Question;
    studentAnswer: string;
    context?: StudentContext;
  }): Promise<EvaluationResult>;

  // Generar feedback
  generateFeedback(params: {
    evaluation: EvaluationResult;
    style: 'encouraging' | 'direct' | 'detailed';
    includeHints: boolean;
  }): Promise<Feedback>;

  // Calificar ensayos
  gradeEssay(params: {
    essay: string;
    rubric: Rubric;
    maxScore: number;
  }): Promise<EssayGrade>;

  // Evaluar código
  evaluateCode(params: {
    code: string;
    language: string;
    testCases: TestCase[];
  }): Promise<CodeEvaluation>;
}

interface EvaluationResult {
  isCorrect: boolean;
  score: number;
  maxScore: number;
  confidence: number; // 0-1
  partialCredit?: number;
  misconceptions?: string[];
}
```

### Prompt del Sistema

```
Eres un evaluador educativo experto, justo y consistente. Tu tarea es calificar 
respuestas de estudiantes con precisión y proporcionar feedback constructivo.

CRITERIOS DE EVALUACIÓN:
1. Exactitud: ¿La respuesta es correcta según el conocimiento aceptado?
2. Completitud: ¿Incluye todos los componentes necesarios?
3. Claridad: ¿Está expresada de manera comprensible?
4. Razonamiento: ¿Muestra proceso de pensamiento válido?

TIPOS DE PREGUNTAS:
- Opción múltiple: Comparar con respuesta correcta
- Respuesta corta: Evaluar equivalencia semántica
- Ensayo: Usar rúbrica detallada, evaluar por criterios
- Código: Ejecutar tests, analizar eficiencia y estilo
- Matemáticas: Verificar procedimiento y resultado

FEEDBACK:
- Ser específico sobre qué está bien/qué mejorar
- Sugerir próximos pasos concretos
- Mantener tono alentador pero honesto
- Referenciar conceptos específicos del material

REGLAS:
- Dar crédito parcial cuando sea apropiado
- Identificar conceptos erróneos subyacentes
- Sugerir recursos de refuerzo específicos
- Marcar para revisión humana si confianza < 0.8
```

### Ejemplo de Uso

```typescript
// Evaluar respuesta de estudiante
const evaluation = await evaluatorAgent.evaluate({
  question: {
    type: 'short_answer',
    text: '¿Cuál es el resultado de 1/2 × 1/3?',
    correctAnswer: '1/6',
    acceptableAnswers: ['1/6', 'un sexto', '0.166...']
  },
  studentAnswer: '2/5',
  context: {
    grade: 3,
    previousMistakes: ['adding_numerators'],
    skillLevel: 'developing'
  }
});

// Resultado:
{
  isCorrect: false,
  score: 0,
  maxScore: 10,
  confidence: 0.95,
  misconceptions: ['multiplication_as_addition'],
  feedback: {
    summary: 'Parece que multiplicaste los numeradores (1×1=2) y denominadores (2×3=5)',
    correction: 'Recuerda: numerador × numerador, denominador × denominador',
    hint: '1×1 = ? y 2×3 = ?',
    resources: ['lesson_3_2_remediation', 'practice_fractions_1']
  }
}
```

---

## 🤖 Agente Tutor Personal

### Propósito
Proporcionar tutoría personalizada adaptada al estudiante.

### Capacidades

```typescript
interface PersonalTutorAgent {
  // Explicar concepto
  explain(params: {
    concept: string;
    studentId: string;
    explanationStyle: 'visual' | 'step_by_step' | 'analogy' | 'formal';
    depth: 'overview' | 'detailed' | 'deep_dive';
  }): Promise<Explanation>;

  // Responder pregunta
  answerQuestion(params: {
    question: string;
    studentId: string;
    context?: LessonContext;
  }): Promise<Answer>;

  // Generar ejercicios de refuerzo
  generatePractice(params: {
    studentId: string;
    weakAreas: string[];
    count: number;
    difficulty: 'easier' | 'same' | 'harder';
  }): Promise<PracticeSet>;

  // Crear plan de estudio
  createStudyPlan(params: {
    studentId: string;
    goal: string;
    deadline: Date;
    availableTime: number; // horas por semana
  }): Promise<StudyPlan>;
}
```

### Prompt del Sistema

```
Eres un tutor paciente, alentador y altamente efectivo. Adaptas tu enseñanza 
al estilo de aprendizaje y nivel de cada estudiante.

PRINCIPIOS DE TUTORÍA:
1. Conocer al estudiante: Revisar historial antes de responder
2. Guiar, no dar respuestas: Preguntar para guiar al descubrimiento
3. Múltiples explicaciones: Ofrecer diferentes formas de entender
4. Verificar comprensión: Pedir al estudiante que explique con sus palabras
5. Construir confianza: Celebrar progreso, normalizar dificultades

ESTRATEGIAS EXPLICATIVAS:
- Analogías: Relacionar con experiencias cotidianas
- Visualización: Describir imágenes mentales
- Paso a paso: Descomponer en pasos manejables
- Ejemplos: Mostrar con casos específicos antes de generalizar
- Conexiones: Vincular con conocimiento previo

INTERACCIÓN:
- Preguntar qué ya sabe el estudiante
- Identificar dónde se atasca específicamente
- Ofrecer pistas, no respuestas completas
- Pedir que prediga resultados antes de calcular
- Reforzar cuando el estudiante razona correctamente

RESTRICCIONES:
- Nunca dar respuesta directa en primera interacción
- Siempre verificar comprensión antes de avanzar
- Sugerir pausas si hay frustración
- Escalar a maestro humano si persisten dificultades
```

### Ejemplo de Uso

```typescript
// Estudiante pregunta sobre fracciones
const explanation = await tutorAgent.explain({
  concept: 'multiplicación de fracciones',
  studentId: 'student_123',
  explanationStyle: 'analogy',
  depth: 'detailed'
});

// Resultado:
{
  explanation: `
    Imagina que tienes media pizza (1/2) y quieres compartirla 
    entre 3 amigos. Cada amigo recibe 1/3 de la mitad.
    
    Visualmente: Toma la mitad de la pizza y divídela en 3 partes.
    Cada parte es 1/6 de la pizza completa.
    
    Matemáticamente: 1/2 × 1/3 = (1×1)/(2×3) = 1/6
    
    La regla: Numerador × Numerador, Denominador × Denominador
  `,
  followUpQuestions: [
    '¿Puedes explicarme con tus palabras por qué multiplicamos así?',
    '¿Qué crees que pasaría si tuviéramos 2/3 × 1/4?'
  ],
  practiceProblems: [
    { problem: '1/3 × 1/4', hint: '1×1=?, 3×4=?' },
    { problem: '2/5 × 3/4', hint: 'Recuerda simplificar al final' }
  ],
  resources: ['video_fractions_visual', 'interactive_fraction_tool']
}
```

---

## 📊 Agente Analítico Predictivo

### Propósito
Detectar patrones, predecir resultados y generar alertas tempranas.

### Capacidades

```typescript
interface PredictiveAnalyticsAgent {
  // Predecir riesgo de abandono
  predictDropoutRisk(params: {
    studentId: string;
    lookAheadDays: number;
  }): Promise<DropoutRisk>;

  // Predecir rendimiento
  predictPerformance(params: {
    studentId: string;
    assessmentId: string;
  }): Promise<PerformancePrediction>;

  // Detectar anomalías
  detectAnomalies(params: {
    scope: 'student' | 'class' | 'school';
    id: string;
    metric: string;
  }): Promise<Anomaly[]>;

  // Generar insights
  generateInsights(params: {
    studentId?: string;
    classId?: string;
    timeRange: DateRange;
  }): Promise<Insight[]>;
}

interface DropoutRisk {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  probability: number;
  factors: RiskFactor[];
  recommendations: string[];
}
```

### Modelos de Predicción

```typescript
// Factores de riesgo de abandono
const dropoutRiskFactors = {
  engagement: {
    loginFrequency: 'daily_logins_last_30_days',
    timeOnPlatform: 'avg_minutes_per_session',
    contentCompletion: 'lessons_completed_vs_assigned'
  },
  performance: {
    recentScores: 'avg_score_last_5_assessments',
    trend: 'improving | stable | declining',
    struggleIndicators: 'repeated_failures_same_topic'
  },
  behavioral: {
    helpSeeking: 'tutor_requests_frequency',
    socialInteraction: 'peer_collaboration_count',
    frustrationSignals: 'rage_clicks_abandoned_attempts'
  },
  contextual: {
    gradeLevel: 'appropriate_for_age',
    externalFactors: 'known_challenges_from_parents'
  }
};

// Umbrales de alerta
const alertThresholds = {
  low: { probability: 0.2, action: 'monitor' },
  medium: { probability: 0.4, action: 'notify_teacher' },
  high: { probability: 0.6, action: 'intervention_required' },
  critical: { probability: 0.8, action: 'immediate_action' }
};
```

### Ejemplo de Uso

```typescript
// Analizar riesgo de estudiante
const risk = await analyticsAgent.predictDropoutRisk({
  studentId: 'student_456',
  lookAheadDays: 30
});

// Resultado:
{
  riskLevel: 'high',
  probability: 0.67,
  factors: [
    {
      factor: 'login_frequency',
      impact: 0.35,
      description: 'Solo 3 logins en últimos 14 días (promedio: 12)',
      trend: 'declining'
    },
    {
      factor: 'assessment_performance',
      impact: 0.28,
      description: '2 exámenes fallados consecutivamente',
      topic: 'fracciones'
    },
    {
      factor: 'time_on_task',
      impact: 0.22,
      description: 'Tiempo promedio disminuyó 60%'
    }
  ],
  recommendations: [
    'Contactar padres para entender situación',
    'Asignar tutoría personalizada en fracciones',
    'Revisar si hay problemas técnicos',
    'Considerar ajuste de dificultad temporal'
  ],
  predictedOutcome: 'Sin intervención, 67% probabilidad de inactividad en 30 días'
}
```

---

## 🔍 Agente Detector de Riesgo

### Propósito
Monitorear continuamente y alertar sobre estudiantes en riesgo académico.

### Implementación

```typescript
class RiskDetectionAgent {
  // Ejecutar cada hora
  async runHourlyScan(): Promise<void> {
    const atRiskStudents = await this.identifyAtRiskStudents();
    
    for (const student of atRiskStudents) {
      await this.createAlert({
        type: 'academic_risk',
        severity: student.riskLevel,
        studentId: student.id,
        message: this.generateAlertMessage(student),
        recommendedAction: this.getRecommendedAction(student),
        notify: ['teacher', 'parent', 'student']
      });
    }
  }

  // Detectar caída repentina
  async detectSuddenDrop(studentId: string): Promise<boolean> {
    const recentScores = await this.getRecentScores(studentId, 5);
    const previousScores = await this.getPreviousScores(studentId, 5);
    
    const recentAvg = average(recentScores);
    const previousAvg = average(previousScores);
    
    // Alerta si caída > 20 puntos
    return (previousAvg - recentAvg) > 20;
  }

  // Detectar inactividad
  async detectInactivity(): Promise<InactivityAlert[]> {
    const inactiveStudents = await db.students.findMany({
      where: {
        lastLoginAt: { lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        isActive: true
      }
    });
    
    return inactiveStudents.map(s => ({
      studentId: s.id,
      daysInactive: daysSince(s.lastLoginAt),
      riskLevel: daysSince(s.lastLoginAt) > 7 ? 'high' : 'medium'
    }));
  }
}
```

---

## 💡 Agente Recomendador de Contenido

### Propósito
Personalizar el contenido y actividades para cada estudiante.

### Algoritmo de Recomendación

```typescript
class ContentRecommenderAgent {
  async generateRecommendations(studentId: string): Promise<Recommendation[]> {
    const student = await this.getStudentProfile(studentId);
    const recommendations: Recommendation[] = [];

    // 1. Remediación: Cubrir gaps
    const knowledgeGaps = await this.identifyKnowledgeGaps(studentId);
    for (const gap of knowledgeGaps) {
      recommendations.push({
        type: 'remediation',
        priority: gap.impact > 0.5 ? 'high' : 'medium',
        content: await this.findRemediationContent(gap),
        reason: `Necesitas reforzar: ${gap.skillName}`,
        estimatedTime: gap.estimatedRemediationTime
      });
    }

    // 2. Prerrequisitos: Preparar para próximos temas
    const upcomingLessons = await this.getUpcomingLessons(studentId);
    for (const lesson of upcomingLessons) {
      const missingPrereqs = await this.checkPrerequisites(studentId, lesson);
      if (missingPrereqs.length > 0) {
        recommendations.push({
          type: 'prerequisite',
          priority: 'high',
          content: await this.findPrerequisiteContent(missingPrereqs),
          reason: `Prepárate para: ${lesson.title}`,
          deadline: lesson.startDate
        });
      }
    }

    // 3. Enriquecimiento: Para estudiantes avanzados
    if (student.performanceLevel === 'advanced') {
      const enrichment = await this.findEnrichmentContent(student);
      recommendations.push({
        type: 'enrichment',
        priority: 'low',
        content: enrichment,
        reason: 'Contenido adicional para tu nivel'
      });
    }

    // 4. Refuerzo de habilidades débiles
    const weakSkills = await this.getWeakSkills(studentId);
    for (const skill of weakSkills.slice(0, 3)) {
      recommendations.push({
        type: 'skill_practice',
        priority: 'medium',
        content: await this.findSkillPractice(skill),
        reason: `Practica: ${skill.name}`
      });
    }

    return this.prioritizeRecommendations(recommendations);
  }
}
```

---

## 🔧 Configuración y Despliegue

### Variables de Entorno

```bash
# LLM Configuration
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=4000

# Fallback LLM
FALLBACK_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-opus-20240229

# Local LLM (opcional)
LOCAL_LLM_ENABLED=false
LOCAL_LLM_URL=http://localhost:11434

# Agent Configuration
AGENT_MAX_CONCURRENT_TASKS=10
AGENT_TASK_TIMEOUT_MS=30000
AGENT_QUEUE_MAX_SIZE=1000
AGENT_RETRY_ATTEMPTS=3

# Rate Limiting
AGENT_RATE_LIMIT_PER_MINUTE=60
AGENT_RATE_LIMIT_PER_HOUR=1000

# Monitoring
AGENT_LOG_LEVEL=info
AGENT_METRICS_ENABLED=true
```

### Estructura del Servicio

```typescript
// agents/src/index.ts
import express from 'express';
import { AgentOrchestrator } from './orchestrator';
import { ContentGeneratorAgent } from './agents/content-generator';
import { AutoEvaluatorAgent } from './agents/auto-evaluator';
import { PersonalTutorAgent } from './agents/personal-tutor';
import { PredictiveAnalyticsAgent } from './agents/predictive-analytics';
import { RiskDetectionAgent } from './agents/risk-detection';
import { ContentRecommenderAgent } from './agents/content-recommender';

const app = express();
const orchestrator = new AgentOrchestrator();

// Registrar agentes
orchestrator.registerAgent('content-generator', new ContentGeneratorAgent());
orchestrator.registerAgent('auto-evaluator', new AutoEvaluatorAgent());
orchestrator.registerAgent('personal-tutor', new PersonalTutorAgent());
orchestrator.registerAgent('predictive-analytics', new PredictiveAnalyticsAgent());
orchestrator.registerAgent('risk-detection', new RiskDetectionAgent());
orchestrator.registerAgent('content-recommender', new ContentRecommenderAgent());

// API Endpoints
app.post('/api/agents/task', async (req, res) => {
  const { agentType, params, priority = 5 } = req.body;
  
  const task = await orchestrator.createTask({
    agentType,
    params,
    priority,
    createdBy: req.user.id
  });
  
  res.json({ taskId: task.id, status: task.status });
});

app.get('/api/agents/task/:taskId', async (req, res) => {
  const task = await orchestrator.getTask(req.params.taskId);
  res.json(task);
});

app.post('/api/agents/tutor/ask', async (req, res) => {
  const { question, studentId, context } = req.body;
  
  const tutor = orchestrator.getAgent('personal-tutor') as PersonalTutorAgent;
  const answer = await tutor.answerQuestion({ question, studentId, context });
  
  res.json(answer);
});

// Webhook para eventos del sistema
app.post('/webhooks/system-event', async (req, res) => {
  const { event, data } = req.body;
  
  // Trigger agentes basados en eventos
  switch (event) {
    case 'assessment_completed':
      await orchestrator.triggerAgent('auto-evaluator', data);
      break;
    case 'lesson_completed':
      await orchestrator.triggerAgent('content-recommender', data);
      break;
    case 'login':
      await orchestrator.triggerAgent('risk-detection', data);
      break;
  }
  
  res.json({ received: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    agents: orchestrator.getAgentStatuses(),
    queueSize: orchestrator.getQueueSize()
  });
});

app.listen(3003, () => {
  console.log('Agent service running on port 3003');
});
```

---

## 📊 Métricas y Monitoreo

### Métricas Clave

| Métrica | Descripción | Target |
|---------|-------------|--------|
| Task Success Rate | % de tareas completadas exitosamente | > 95% |
| Average Response Time | Tiempo promedio de respuesta | < 5s |
| LLM Cost per Task | Costo promedio por tarea | < $0.05 |
| User Satisfaction | Satisfacción con respuestas IA | > 4.0/5 |
| Human Escalation Rate | % de casos escalados a humanos | < 10% |

### Dashboard de Monitoreo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD DE AGENTES IA                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ESTADO GENERAL                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   🟢        │  │   1,234     │  │   4.2s      │  │   $124.50   │        │
│  │  Saludable  │  │  Tareas hoy │  │  Tiempo prom│  │  Costo hoy  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ESTADO POR AGENTE                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Agente           │ Estado │ Tareas/h │ Éxito │ Tiempo │ Costo/task│   │
│  │  ─────────────────┼────────┼──────────┼───────┼────────┼───────────│   │
│  │  Content Generator│ 🟢     │ 45       │ 98%   │ 8.2s   │ $0.08     │   │
│  │  Auto Evaluator   │ 🟢     │ 120      │ 96%   │ 2.1s   │ $0.02     │   │
│  │  Personal Tutor   │ 🟢     │ 89       │ 94%   │ 4.5s   │ $0.05     │   │
│  │  Risk Detection   │ 🟢     │ 1        │ 100%  │ 15.3s  │ $0.12     │   │
│  │  Recommender      │ 🟡     │ 200      │ 87%   │ 6.7s   │ $0.04     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  COLA DE TAREAS                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Alta prioridad: 3    Media: 12    Baja: 45                        │   │
│  │  [████████████████████░░░░░░░░░░░░░░░░░░░░] 60% capacidad          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ERRORES RECIENTES                                                          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  14:32 - Timeout en evaluación de código (student_789)             │   │
│  │  14:15 - Rate limit excedido (OpenAI) - Fallback activado          │   │
│  │  13:48 - Error de validación en contenido generado                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
