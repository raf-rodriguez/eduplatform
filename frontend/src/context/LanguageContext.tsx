import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'es' | 'en'

interface Translations {
  [key: string]: { es: string; en: string }
}

// ============================================
// TRANSLATION DICTIONARY
// ============================================

const translations: Record<string, Translations> = {
  // Common
  'dashboard': { es: 'Dashboard', en: 'Dashboard' },
  'my_curriculum': { es: 'Mi Currículo', en: 'My Curriculum' },
  'calendar': { es: 'Calendario', en: 'Calendar' },
  'progress': { es: 'Progreso', en: 'Progress' },
  'notes': { es: 'Notas', en: 'Notes' },
  'timer': { es: 'Temporizador', en: 'Study Timer' },
  'daily_challenges': { es: 'Desafíos Diarios', en: 'Daily Challenges' },
  'ai_analysis': { es: 'Análisis IA', en: 'AI Analysis' },
  'achievements': { es: 'Logros', en: 'Achievements' },
  'badges': { es: 'Medallas', en: 'Badges' },
  'leaderboard': { es: 'Ranking', en: 'Leaderboard' },
  'xp_history': { es: 'Historial XP', en: 'XP History' },
  'streak': { es: 'Racha', en: 'Streak' },
  'messages': { es: 'Mensajes', en: 'Messages' },
  'forum': { es: 'Forum', en: 'Forum' },
  'analytics': { es: 'Estudio', en: 'Study Analytics' },
  'report_card': { es: 'Boletín', en: 'Report Card' },
  'help': { es: 'Ayuda', en: 'Help' },
  'settings': { es: 'Configuración', en: 'Settings' },
  'profile': { es: 'Perfil', en: 'Profile' },
  'logout': { es: 'Cerrar sesión', en: 'Logout' },

  // Student Dashboard
  'hello_student': { es: '¡Hola', en: 'Hello' },
  'continue_learning': { es: 'Continúa tu aprendizaje donde lo dejaste.', en: 'Continue your learning where you left off.' },
  'level': { es: 'Nivel', en: 'Level' },
  'xp_total': { es: 'XP total', en: 'XP total' },
  'streak_days': { es: 'días consecutivos', en: 'consecutive days' },
  'completed': { es: 'completadas', en: 'completed' },
  'of_total': { es: 'de', en: 'of' },
  'lessons': { es: 'lecciones', en: 'lessons' },
  'time_this_week': { es: 'esta semana', en: 'this week' },
  'continue_learning_title': { es: 'Continuar aprendiendo', en: 'Continue Learning' },
  'continue': { es: 'Continuar', en: 'Continue' },
  'no_lessons_progress': { es: 'No hay lecciones en progreso', en: 'No lessons in progress' },
  'view_curriculum': { es: 'Ver mi currículo', en: 'View my curriculum' },
  'quick_access': { es: 'Acceso Rápido', en: 'Quick Access' },
  'keep_it_up': { es: '¡Sigue así!', en: 'Keep it up!' },
  'you_have_progress': { es: 'Llevas un', en: "You're at" },
  'advance': { es: 'de avance. Completa más lecciones para subir de nivel.', en: 'progress. Complete more lessons to level up.' },
  'start_your_journey': { es: 'Comienza tu camino', en: 'Start your journey' },
  'explore_curriculum': { es: 'Explora tu currículo y comienza tu primera lección para ganar XP.', en: 'Explore your curriculum and start your first lesson to earn XP.' },

  // Curriculum
  'my_curriculum_page': { es: 'Mi Currículo', en: 'My Curriculum' },
  'subjects_available': { es: 'materias disponibles', en: 'subjects available' },
  'general_progress': { es: 'Progreso General', en: 'Overall Progress' },
  'your_progress': { es: 'Tu avance en', en: 'Your progress in' },
  'core_subjects': { es: '📖 Materias Principales', en: '📖 Core Subjects' },
  'special_subjects': { es: '⭐ Materias Especiales', en: '⭐ Special Subjects' },
  'stem_subjects': { es: '🤖 STEM (Ciencia, Tecnología, Ingeniería y Matemáticas)', en: '🤖 STEM (Science, Technology, Engineering & Math)' },
  'preschool_subjects': { es: '📚 Actividades Básicas', en: '📚 Basic Activities' },
  'other_subjects': { es: '📋 Otras Materias', en: '📋 Other Subjects' },

  // Settings
  'settings_page': { es: 'Configuración', en: 'Settings' },
  'customize_experience': { es: 'Personaliza tu experiencia de aprendizaje', en: 'Customize your learning experience' },
  'appearance': { es: 'Apariencia', en: 'Appearance' },
  'customize_visual': { es: 'Personaliza el aspecto visual de la aplicación', en: 'Customize the visual look of the app' },
  'dark_mode': { es: 'Modo Oscuro', en: 'Dark Mode' },
  'switch_theme': { es: 'Cambia entre tema claro y oscuro', en: 'Switch between light and dark theme' },
  'light': { es: 'Claro', en: 'Light' },
  'dark': { es: 'Oscuro', en: 'Dark' },
  'security': { es: 'Seguridad', en: 'Security' },
  'change_password_desc': { es: 'Cambia tu contraseña de acceso', en: 'Change your access password' },
  'current_password': { es: 'Contraseña Actual', en: 'Current Password' },
  'enter_current_password': { es: 'Ingresa tu contraseña actual', en: 'Enter your current password' },
  'new_password': { es: 'Nueva Contraseña', en: 'New Password' },
  'min_8_chars': { es: 'Mínimo 8 caracteres', en: 'Minimum 8 characters' },
  'confirm_new_password': { es: 'Confirmar Nueva Contraseña', en: 'Confirm New Password' },
  'repeat_password': { es: 'Repite la nueva contraseña', en: 'Repeat the new password' },
  'password_min_8': { es: 'La contraseña debe tener al menos 8 caracteres', en: 'Password must be at least 8 characters' },
  'passwords_no_match': { es: 'Las contraseñas no coinciden', en: 'Passwords do not match' },
  'change_password': { es: 'Cambiar Contraseña', en: 'Change Password' },
  'changing': { es: 'Cambiando...', en: 'Changing...' },
  'password_updated': { es: 'Contraseña actualizada', en: 'Password updated' },
  'password_updated_desc': { es: 'Tu contraseña ha sido cambiada exitosamente.', en: 'Your password has been changed successfully.' },
  'password_error': { es: 'No se pudo cambiar la contraseña. Verifica tu contraseña actual.', en: 'Could not change password. Verify your current password.' },

  // Notifications
  'notifications': { es: 'Notificaciones', en: 'Notifications' },
  'control_notifications': { es: 'Controla qué notificaciones recibes', en: 'Control what notifications you receive' },
  'email_notifications': { es: 'Notificaciones por Email', en: 'Email Notifications' },
  'email_updates': { es: 'Recibe actualizaciones por correo electrónico', en: 'Receive updates via email' },
  'push_notifications': { es: 'Notificaciones Push', en: 'Push Notifications' },
  'browser_alerts': { es: 'Alertas en el navegador', en: 'Browser alerts' },
  'assessment_reminders': { es: 'Recordatorios de Evaluaciones', en: 'Assessment Reminders' },
  'exam_notices': { es: 'Avisos sobre exámenes próximos', en: 'Notices about upcoming exams' },
  'progress_updates': { es: 'Actualizaciones de Progreso', en: 'Progress Updates' },
  'weekly_summaries': { es: 'Resúmenes semanales de tu avance', en: 'Weekly summaries of your progress' },
  'gamification_updates': { es: 'Logros y Gamificación', en: 'Achievements & Gamification' },
  'xp_level_notifications': { es: 'Notificaciones sobre XP, niveles y medallas', en: 'Notifications about XP, levels and badges' },

  // Language
  'language': { es: 'Idioma', en: 'Language' },
  'select_language': { es: 'Selecciona tu idioma preferido', en: 'Select your preferred language' },

  // Lesson
  'back': { es: 'Volver', en: 'Back' },
  'mark_complete': { es: 'Marcar como completada', en: 'Mark as complete' },
  'excellent': { es: '¡Excelente!', en: 'Excellent!' },
  'lesson_completed': { es: 'Lección completada', en: 'Lesson completed' },
  'lesson_not_found': { es: 'Lección no encontrada', en: 'Lesson not found' },
  'video': { es: 'Video', en: 'Video' },
  'material': { es: 'Material', en: 'Material' },
  'activities': { es: 'Actividades', en: 'Activities' },
  'evaluation': { es: 'Evaluación', en: 'Assessment' },
  'no_video': { es: 'No hay video disponible', en: 'No video available' },
  'no_material': { es: 'No hay material escrito disponible', en: 'No written material available' },
  'additional_resources': { es: 'Recursos adicionales', en: 'Additional resources' },
  'no_activities': { es: 'No hay actividades disponibles', en: 'No activities available' },
  'start_activity': { es: 'Comenzar actividad', en: 'Start activity' },
  'start_assessment': { es: 'Comenzar evaluación', en: 'Start assessment' },
  'time_limit': { es: 'Tiempo', en: 'Time' },
  'unlimited': { es: 'Ilimitado', en: 'Unlimited' },
  'min_score': { es: 'Puntuación mínima', en: 'Minimum score' },
  'previous': { es: 'Anterior', en: 'Previous' },
  'next': { es: 'Siguiente', en: 'Next' },
  'duration': { es: 'Duración', en: 'Duration' },
  'content': { es: 'Contenido', en: 'Content' },
  'module': { es: 'Módulo', en: 'Module' },
  'subject': { es: 'Materia', en: 'Subject' },

  // Errors
  'error': { es: 'Error', en: 'Error' },
  'could_not_load': { es: 'No se pudo cargar', en: 'Could not load' },
  'contact_admin': { es: 'Contacta a tu administrador para configurar tu plan de estudios.', en: 'Contact your administrator to set up your curriculum.' },
  'curriculum_not_found': { es: 'No se encontró currículo', en: 'Curriculum not found' },

  // Profile
  'my_profile': { es: 'Mi Perfil', en: 'My Profile' },
  'manage_personal': { es: 'Gestiona tu información personal', en: 'Manage your personal information' },
  'edit_profile': { es: 'Editar Perfil', en: 'Edit Profile' },
  'save': { es: 'Guardar', en: 'Save' },
  'cancel': { es: 'Cancelar', en: 'Cancel' },
  'saving': { es: 'Guardando...', en: 'Saving...' },
  'first_name': { es: 'Nombre', en: 'First Name' },
  'last_name': { es: 'Apellido', en: 'Last Name' },
  'email': { es: 'Correo electrónico', en: 'Email' },
  'phone': { es: 'Teléfono', en: 'Phone' },
  'birth_date': { es: 'Fecha de nacimiento', en: 'Birth date' },
  'grade_level': { es: 'Nivel de grado', en: 'Grade level' },
  'student_info': { es: 'Información del Estudiante', en: 'Student Information' },
  'contact_info': { es: 'Información de Contacto', en: 'Contact Information' },
  'academic_info': { es: 'Información Académica', en: 'Academic Information' },
  'bio': { es: 'Biografía', en: 'Bio' },
  'not_set': { es: 'No establecido', en: 'Not set' },
}

// ============================================
// CONTEXT
// ============================================

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('edu-language')
    return (saved as Language) || 'es'
  })

  useEffect(() => {
    localStorage.setItem('edu-language', language)
    // Update html lang attribute
    document.documentElement.lang = language
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (key: string): string => {
    const translation = translations[key]
    if (!translation) return key
    return translation[language] || translation.es
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
