import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { AppError, asyncHandler } from '../../shared/middleware/errorHandler';
import { logger } from '../../config/logger';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AiTask {
  task: string; // quiz, exam, pdf-content, pptx-outline, lesson-plan, worksheet, rubric
  subject: string;
  grade: string;
  topic: string;
  details?: string;
  language?: string;
  count?: number; // number of questions
}

export const generateContent = asyncHandler(async (req: Request, res: Response) => {
  const { task, subject, grade, topic, details, language = 'es', count = 10 }: AiTask = req.body;

  if (!task || !subject || !grade || !topic) {
    throw new AppError('task, subject, grade, y topic son requeridos', 400);
  }

  const prompts: Record<string, string> = {
    quiz: `Genera un quiz de ${count} preguntas sobre "${topic}" para ${grade} grado de ${subject}.
Idioma: ${language}.
Formato JSON:
{
  "title": "Título del quiz",
  "questions": [
    {"question": "Pregunta?", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Explicación"}
  ]
}
${details ? 'Detalles adicionales: ' + details : ''}
Solo devuelve el JSON, sin texto adicional.`,

    exam: `Genera un examen completo de ${count} preguntas sobre "${topic}" para ${grade} grado de ${subject}.
Idioma: ${language}.
Incluye preguntas de opción múltiple, verdadero/falso, y preguntas abiertas.
Formato JSON:
{
  "title": "Título del examen",
  "instructions": "Instrucciones del examen",
  "sections": [
    {"name": "Opción Múltiple", "questions": [{"question": "...", "options": ["A","B","C","D"], "correct": 0}]},
    {"name": "Verdadero/Falso", "questions": [{"question": "...", "correct": true, "explanation": "..."}]},
    {"name": "Preguntas Abiertas", "questions": [{"question": "...", "rubric": "..."}]}
  ]
}
${details ? 'Detalles adicionales: ' + details : ''}
Solo devuelve el JSON, sin texto adicional.`,

    'lesson-plan': `Genera un plan de lección detallado sobre "${topic}" para ${grade} grado de ${subject}.
Idioma: ${language}.
Formato JSON:
{
  "title": "Título de la lección",
  "objectives": ["Objetivo 1", "Objetivo 2"],
  "duration": "60 minutos",
  "materials": ["Material 1", "Material 2"],
  "introduction": {"time": "10 min", "activity": "Descripción"},
  "development": [{"time": "15 min", "activity": "Descripción"}, {"time": "20 min", "activity": "Descripción"}],
  "closure": {"time": "10 min", "activity": "Descripción"},
  "assessment": "Método de evaluación",
  "homework": "Tarea asignada"
}
${details ? 'Detalles adicionales: ' + details : ''}
Solo devuelve el JSON, sin texto adicional.`,

    worksheet: `Genera una hoja de trabajo sobre "${topic}" para ${grade} grado de ${subject}.
Idioma: ${language}.
Formato JSON:
{
  "title": "Título de la hoja de trabajo",
  "instructions": "Instrucciones",
  "exercises": [
    {"type": "fill-blank", "content": "Oración con ____"},
    {"type": "matching", "content": [{"left": "A", "right": "1"}]},
    {"type": "short-answer", "content": "Pregunta corta"},
    {"type": "drawing", "content": "Dibuja/describe"}
  ],
  "answerKey": ["Respuesta 1", "Respuesta 2"]
}
${details ? 'Detalles adicionales: ' + details : ''}
Solo devuelve el JSON, sin texto adicional.`,

    rubric: `Genera una rúbrica de evaluación para "${topic}" de ${subject} para ${grade} grado.
Idioma: ${language}.
Formato JSON:
{
  "title": "Título de la rúbrica",
  "criteria": [
    {"name": "Criterio", "levels": [
      {"level": "Excelente", "points": 4, "description": "..."},
      {"level": "Bueno", "points": 3, "description": "..."},
      {"level": "Regular", "points": 2, "description": "..."},
      {"level": "Necesita Mejorar", "points": 1, "description": "..."}
    ]}
  ],
  "totalPoints": 20
}
${details ? 'Detalles adicionales: ' + details : ''}
Solo devuelve el JSON, sin texto adicional.`,

    'pdf-content': `Genera contenido para un PDF educativo sobre "${topic}" para ${grade} grado de ${subject}.
Idioma: ${language}.
Formato JSON:
{
  "title": "Título del documento",
  "subtitle": "Subtítulo",
  "sections": [
    {"heading": "Sección 1", "content": "Contenido detallado y educativo"},
    {"heading": "Sección 2", "content": "Más contenido"},
    {"heading": "Actividades", "content": "Actividades para estudiantes"}
  ],
  "conclusion": "Resumen final",
  "references": ["Referencia 1", "Referencia 2"]
}
${details ? 'Detalles adicionales: ' + details : ''}
Solo devuelve el JSON, sin texto adicional.`,

    'pptx-outline': `Genera un esquema para una presentación de PowerPoint sobre "${topic}" para ${grade} grado de ${subject}.
Idioma: ${language}.
Formato JSON:
{
  "title": "Título de la presentación",
  "slides": [
    {"title": "Introducción", "bulletPoints": ["Punto 1", "Punto 2"], "notes": "Notas del presentador"},
    {"title": "Concepto Principal", "bulletPoints": ["Punto 1", "Punto 2", "Punto 3"], "notes": "Notas"},
    {"title": "Ejemplos", "bulletPoints": ["Ejemplo 1", "Ejemplo 2"], "notes": "Notas"},
    {"title": "Actividad", "bulletPoints": ["Instrucción 1", "Instrucción 2"], "notes": "Notas"},
    {"title": "Resumen", "bulletPoints": ["Punto clave 1", "Punto clave 2"], "notes": "Notas"}
  ]
}
${details ? 'Detalles adicionales: ' + details : ''}
Solo devuelve el JSON, sin texto adicional.`,

    'study-guide': `Genera una guía de estudio sobre "${topic}" para ${grade} grado de ${subject}.
Idioma: ${language}.
Formato JSON:
{
  "title": "Guía de Estudio",
  "keyConcepts": ["Concepto 1", "Concepto 2"],
  "definitions": [{"term": "Término", "definition": "Definición"}],
  "practiceQuestions": [{"question": "...", "answer": "..."}],
  "tips": ["Consejo 1", "Consejo 2"],
  "resources": ["Recurso 1", "Recurso 2"]
}
${details ? 'Detalles adicionales: ' + details : ''}
Solo devuelve el JSON, sin texto adicional.`,
  };

  const prompt = prompts[task];
  if (!prompt) {
    throw new AppError(`Tipo de tarea no válido: ${task}. Opciones: ${Object.keys(prompts).join(', ')}`, 400);
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente educativo experto. Genera contenido educativo de alta calidad en formato JSON. NO incluyas markdown ni texto fuera del JSON.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content || '';

    // Parse JSON from response
    let parsedContent: any;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsedContent = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'No se pudo generar el contenido', raw: content };
    } catch {
      parsedContent = { error: 'Formato JSON inválido', raw: content };
    }

    // Log the task for audit
    logger.info(`AI Agent: ${task} generated for ${subject} - ${grade} by user ${req.user?.id}`);

    res.json({
      success: true,
      data: {
        task,
        subject,
        grade,
        topic,
        content: parsedContent,
      },
    });
  } catch (error: any) {
    logger.error('AI Agent error:', error);
    throw new AppError(`Error generando contenido con IA: ${error.message}`, 500);
  }
});

// Chat with AI Agent - freeform questions
export const chatWithAgent = asyncHandler(async (req: Request, res: Response) => {
  const { message, context } = req.body;

  if (!message) {
    throw new AppError('Message is required', 400);
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Eres un asistente educativo para maestros de K-12. Puedes ayudar con:
- Crear exámenes, quizzes y evaluaciones
- Planes de lección
- Hojas de trabajo
- Rúbricas de evaluación
- Guías de estudio
- Contenido para PDFs y presentaciones
- Ideas de actividades educativas
- Consejos pedagógicos

Responde de forma útil, práctica y educativa. Si te piden generar contenido estructurado (quiz, examen, etc.), responde en formato JSON.`,
        },
        ...(context || []).map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const reply = response.choices[0]?.message?.content || 'No se pudo generar respuesta';

    res.json({
      success: true,
      data: { reply },
    });
  } catch (error: any) {
    logger.error('AI Chat error:', error);
    throw new AppError(`Error en el chat: ${error.message}`, 500);
  }
});
