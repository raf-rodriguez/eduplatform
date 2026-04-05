import { Request, Response } from 'express';
import OpenAI from 'openai';
import { prisma } from '../../config/database';
import { AppError, asyncHandler } from '../../shared/middleware/errorHandler';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate quiz with AI
export const generateQuiz = asyncHandler(async (req: Request, res: Response) => {
  const { topic, grade, subject, numQuestions = 5, difficulty = 'medium' } = req.body;

  const prompt = `Genera ${numQuestions} preguntas de opción múltiple sobre "${topic}" para estudiantes de ${grade}° grado.
  Nivel de dificultad: ${difficulty}
  
  Formato requerido (JSON):
  {
    "questions": [
      {
        "question": "texto de la pregunta",
        "options": ["opción A", "opción B", "opción C", "opción D"],
        "correctAnswer": 0,
        "explanation": "explicación de la respuesta correcta"
      }
    ]
  }
  
  Instrucciones:
  - Las preguntas deben ser apropiadas para la edad
  - Incluye explicaciones educativas
  - Varía el tipo de preguntas (conceptos, aplicación, análisis)
  - Respuesta en español`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content:
          'Eres un experto educador que crea evaluaciones de alta calidad para estudiantes K-12.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const content = completion.choices[0].message.content;
  const quiz = JSON.parse(content || '{}');

  // Save task
  await prisma.agentTask.create({
    data: {
      agentType: 'content-generator',
      inputData: { topic, grade, subject, numQuestions, difficulty },
      status: 'completed',
      result: quiz,
      createdBy: req.user!.id,
    },
  });

  res.json({
    success: true,
    data: quiz,
  });
});

// Get AI tutor help
export const tutorHelp = asyncHandler(async (req: Request, res: Response) => {
  const { question, context, grade } = req.body;

  const prompt = `Estudiante de ${grade}° grado pregunta: "${question}"
  
  Contexto: ${context || 'No proporcionado'}
  
  Responde como un tutor paciente y alentador. Explica paso a paso, usa ejemplos si es necesario, y verifica la comprensión.`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content:
          'Eres un tutor educativo experto, paciente y alentador. Adaptas tus explicaciones al nivel del estudiante.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  });

  const answer = completion.choices[0].message.content;

  res.json({
    success: true,
    data: {
      answer,
      followUpQuestions: [
        '¿Entendiste la explicación?',
        '¿Te gustaría practicar con un ejercicio similar?',
      ],
    },
  });
});

// Generate content
export const generateContent = asyncHandler(async (req: Request, res: Response) => {
  const { topic, grade, subject, contentType, duration } = req.body;

  const prompt = `Genera contenido educativo sobre "${topic}" para ${grade}° grado de ${subject}.
  
  Tipo de contenido: ${contentType}
  Duración estimada: ${duration} minutos
  
  Incluye:
  1. Objetivos de aprendizaje
  2. Introducción engaging
  3. Contenido principal estructurado
  4. Ejemplos o actividades
  5. Resumen
  6. Preguntas de reflexión
  
  Formato: Markdown
  Tono: Amigable y educativo para niños`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content:
          'Eres un experto en diseño curricular que crea contenido educativo engaging y pedagógicamente sólido.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
  });

  const content = completion.choices[0].message.content;

  res.json({
    success: true,
    data: {
      content,
      topic,
      grade,
      subject,
      contentType,
    },
  });
});

// Get task status
export const getTaskStatus = asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;

  const task = await prisma.agentTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    throw new AppError('Task not found', 404);
  }

  res.json({
    success: true,
    data: task,
  });
});
