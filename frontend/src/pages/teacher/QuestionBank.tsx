import React, { useState, useMemo } from 'react';
import {
  Database,
  Plus,
  Search,
  Filter,
  Edit,
  Trash,
  Upload,
  Download,
  Tag,
  X,
  Check,
  Eye,
  BarChart3,
  FileText,
  HelpCircle
} from 'lucide-react';

// TODO: Import actual types from your shared types file
// import { Question, QuestionType, DifficultyLevel } from '@/types';

type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
type DifficultyLevel = 'facil' | 'medio' | 'dificil';

interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  subject: string;
  topic: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  questionText: string;
  options?: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  tags: string[];
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

// TODO: Replace with actual API calls
// import { getQuestions, createQuestion, updateQuestion, deleteQuestion, importQuestions, exportQuestions } from '@/api/questions';

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: 'Opción Múltiple',
  true_false: 'Verdadero/Falso',
  short_answer: 'Respuesta Corta',
  essay: 'Ensayo'
};

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  facil: 'Fácil',
  medio: 'Medio',
  dificil: 'Difícil'
};

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  facil: 'bg-green-100 text-green-800',
  medio: 'bg-yellow-100 text-yellow-800',
  dificil: 'bg-red-100 text-red-800'
};

const SUBJECTS = [
  'Matemáticas',
  'Ciencias',
  'Historia',
  'Lenguaje',
  'Inglés',
  'Geografía',
  'Física',
  'Química',
  'Biología'
];

// TODO: Replace simulated data with API response
const SIMULATED_QUESTIONS: Question[] = [
  {
    id: 'q1',
    subject: 'Matemáticas',
    topic: 'Álgebra',
    type: 'multiple_choice',
    difficulty: 'facil',
    questionText: '¿Cuál es el resultado de 2x + 6 = 14 cuando x = ?',
    options: [
      { id: 'a', text: '2', isCorrect: false },
      { id: 'b', text: '4', isCorrect: true },
      { id: 'c', text: '6', isCorrect: false },
      { id: 'd', text: '8', isCorrect: false }
    ],
    correctAnswer: '4',
    explanation: 'Despejando x: 2x = 14 - 6, entonces 2x = 8, por lo tanto x = 4.',
    tags: ['álgebra', 'ecuaciones', 'básico'],
    usageCount: 5,
    createdAt: '2026-01-15',
    updatedAt: '2026-03-20'
  },
  {
    id: 'q2',
    subject: 'Ciencias',
    topic: 'Biología Celular',
    type: 'true_false',
    difficulty: 'medio',
    questionText: 'La mitocondria es el organelo responsable de la producción de energía en la célula.',
    correctAnswer: 'Verdadero',
    explanation: 'La mitocondria realiza la respiración celular, produciendo ATP que es la energía de la célula.',
    tags: ['célula', 'organelos', 'energía'],
    usageCount: 8,
    createdAt: '2026-02-10',
    updatedAt: '2026-02-28'
  },
  {
    id: 'q3',
    subject: 'Historia',
    topic: 'Revolución Francesa',
    type: 'short_answer',
    difficulty: 'dificil',
    questionText: 'Menciona tres causas principales de la Revolución Francesa.',
    correctAnswer: 'Desigualdad social, crisis económica, influencia de la Ilustración',
    explanation: 'La Revolución Francesa (1789) tuvo múltiples causas: la desigualdad de los tres estados, la crisis económica del reino, y las ideas ilustradas que cuestionaban el absolutismo.',
    tags: ['revolución', 'francia', 'causas'],
    usageCount: 3,
    createdAt: '2026-01-20',
    updatedAt: '2026-01-20'
  },
  {
    id: 'q4',
    subject: 'Lenguaje',
    topic: 'Gramática',
    type: 'multiple_choice',
    difficulty: 'facil',
    questionText: '¿Cuál es el sujeto en la oración: "Los estudiantes aprobaron el examen"?',
    options: [
      { id: 'a', text: 'aprobaron', isCorrect: false },
      { id: 'b', text: 'el examen', isCorrect: false },
      { id: 'c', text: 'Los estudiantes', isCorrect: true },
      { id: 'd', text: 'aprobaron el examen', isCorrect: false }
    ],
    correctAnswer: 'Los estudiantes',
    explanation: 'El sujeto es quien realiza la acción del verbo. En este caso, "Los estudiantes" son quienes aprobaron.',
    tags: ['gramática', 'sujeto', 'oraciones'],
    usageCount: 12,
    createdAt: '2026-03-01',
    updatedAt: '2026-03-15'
  },
  {
    id: 'q5',
    subject: 'Física',
    topic: 'Cinemática',
    type: 'essay',
    difficulty: 'dificil',
    questionText: 'Explica la diferencia entre velocidad y aceleración. Incluye ejemplos y fórmulas.',
    correctAnswer: 'La velocidad es el cambio de posición por unidad de tiempo (v = d/t), mientras que la aceleración es el cambio de velocidad por unidad de tiempo (a = Δv/Δt).',
    explanation: 'Velocidad mide qué tan rápido cambia la posición. Aceleración mide qué tan rápido cambia la velocidad. Un auto a 60 km/h constante tiene velocidad pero aceleración cero.',
    tags: ['velocidad', 'aceleración', 'movimiento'],
    usageCount: 2,
    createdAt: '2026-02-15',
    updatedAt: '2026-03-01'
  },
  {
    id: 'q6',
    subject: 'Matemáticas',
    topic: 'Geometría',
    type: 'multiple_choice',
    difficulty: 'medio',
    questionText: '¿Cuál es el área de un triángulo con base 10 cm y altura 6 cm?',
    options: [
      { id: 'a', text: '60 cm²', isCorrect: false },
      { id: 'b', text: '30 cm²', isCorrect: true },
      { id: 'c', text: '16 cm²', isCorrect: false },
      { id: 'd', text: '36 cm²', isCorrect: false }
    ],
    correctAnswer: '30 cm²',
    explanation: 'El área del triángulo = (base × altura) / 2 = (10 × 6) / 2 = 30 cm².',
    tags: ['geometría', 'área', 'triángulo'],
    usageCount: 7,
    createdAt: '2026-01-25',
    updatedAt: '2026-02-10'
  },
  {
    id: 'q7',
    subject: 'Química',
    topic: 'Tabla Periódica',
    type: 'true_false',
    difficulty: 'facil',
    questionText: 'El oxígeno es un gas noble.',
    correctAnswer: 'Falso',
    explanation: 'El oxígeno es un no metal del grupo 16. Los gases nobles son el helio, neón, argón, kriptón, xenón y radón (grupo 18).',
    tags: ['elementos', 'tabla periódica', 'gases'],
    usageCount: 15,
    createdAt: '2026-02-01',
    updatedAt: '2026-03-10'
  },
  {
    id: 'q8',
    subject: 'Inglés',
    topic: 'Grammar',
    type: 'multiple_choice',
    difficulty: 'medio',
    questionText: 'Choose the correct form: "She ___ to school every day."',
    options: [
      { id: 'a', text: 'go', isCorrect: false },
      { id: 'b', text: 'goes', isCorrect: true },
      { id: 'c', text: 'going', isCorrect: false },
      { id: 'd', text: 'gone', isCorrect: false }
    ],
    correctAnswer: 'goes',
    explanation: 'Third person singular in present simple requires -es ending: "She goes".',
    tags: ['grammar', 'present simple', 'third person'],
    usageCount: 9,
    createdAt: '2026-03-05',
    updatedAt: '2026-03-25'
  }
];

interface QuestionFormData {
  subject: string;
  topic: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  questionText: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
  tags: string;
}

const emptyFormData: QuestionFormData = {
  subject: '',
  topic: '',
  type: 'multiple_choice',
  difficulty: 'medio',
  questionText: '',
  options: [
    { id: 'a', text: '', isCorrect: false },
    { id: 'b', text: '', isCorrect: false },
    { id: 'c', text: '', isCorrect: false },
    { id: 'd', text: '', isCorrect: false }
  ],
  correctAnswer: '',
  explanation: '',
  tags: ''
};

type TabType = 'bank' | 'create' | 'faq';

export default function QuestionBank() {
  const [activeTab, setActiveTab] = useState<TabType>('bank');
  const [questions, setQuestions] = useState<Question[]>(SIMULATED_QUESTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState<QuestionFormData>(emptyFormData);
  const [tagFilter, setTagFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [showBulkTagDialog, setShowBulkTagDialog] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState('');

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    questions.forEach((q) => q.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch =
        !searchQuery ||
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSubject = !selectedSubject || q.subject === selectedSubject;
      const matchesDifficulty = !selectedDifficulty || q.difficulty === selectedDifficulty;
      const matchesType = !selectedType || q.type === selectedType;
      const matchesTag = !tagFilter || q.tags.includes(tagFilter);

      return matchesSearch && matchesSubject && matchesDifficulty && matchesType && matchesTag;
    });
  }, [questions, searchQuery, selectedSubject, selectedDifficulty, selectedType, tagFilter]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedDifficulty('');
    setSelectedType('');
    setTagFilter('');
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuestions.map((q) => q.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    // TODO: Call API to bulk delete questions
    // await api.deleteQuestions(Array.from(selectedIds));
    setQuestions((prev) => prev.filter((q) => !selectedIds.has(q.id)));
    setSelectedIds(new Set());
  };

  const handleBulkTag = () => {
    if (selectedIds.size === 0 || !bulkTagInput.trim()) return;
    const newTags = bulkTagInput.split(',').map((t) => t.trim()).filter(Boolean);
    // TODO: Call API to bulk tag questions
    setQuestions((prev) =>
      prev.map((q) =>
        selectedIds.has(q.id)
          ? { ...q, tags: [...new Set([...q.tags, ...newTags])] }
          : q
      )
    );
    setBulkTagInput('');
    setShowBulkTagDialog(false);
  };

  const openCreateDialog = () => {
    setFormData({ ...emptyFormData, options: getEmptyOptionsForType('multiple_choice') });
    setEditingQuestion(null);
    setShowCreateDialog(true);
  };

  const openEditDialog = (question: Question) => {
    setFormData({
      subject: question.subject,
      topic: question.topic,
      type: question.type,
      difficulty: question.difficulty,
      questionText: question.questionText,
      options: question.options || getEmptyOptionsForType(question.type),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      tags: question.tags.join(', ')
    });
    setEditingQuestion(question);
    setShowCreateDialog(true);
  };

  const getEmptyOptionsForType = (type: QuestionType): QuestionOption[] => {
    if (type === 'multiple_choice') {
      return [
        { id: 'a', text: '', isCorrect: false },
        { id: 'b', text: '', isCorrect: false },
        { id: 'c', text: '', isCorrect: false },
        { id: 'd', text: '', isCorrect: false }
      ];
    }
    if (type === 'true_false') {
      return [
        { id: 'true', text: 'Verdadero', isCorrect: false },
        { id: 'false', text: 'Falso', isCorrect: false }
      ];
    }
    return [];
  };

  const handleTypeChange = (type: QuestionType) => {
    setFormData((prev) => ({
      ...prev,
      type,
      options: getEmptyOptionsForType(type),
      correctAnswer: type === 'true_false' ? '' : prev.correctAnswer
    }));
  };

  const handleSaveQuestion = () => {
    if (!formData.subject || !formData.questionText || !formData.correctAnswer) {
      // TODO: Add proper validation and error messages
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    const now = new Date().toISOString().split('T')[0];

    if (editingQuestion) {
      // TODO: Call API to update question
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingQuestion.id
            ? {
              ...q,
              subject: formData.subject,
              topic: formData.topic,
              type: formData.type,
              difficulty: formData.difficulty,
              questionText: formData.questionText,
              options: formData.type === 'multiple_choice' ? formData.options : undefined,
              correctAnswer: formData.correctAnswer,
              explanation: formData.explanation,
              tags: formData.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
              updatedAt: now
            }
            : q
        )
      );
    } else {
      // TODO: Call API to create question
      const newQuestion: Question = {
        id: `q${Date.now()}`,
        subject: formData.subject,
        topic: formData.topic,
        type: formData.type,
        difficulty: formData.difficulty,
        questionText: formData.questionText,
        options: formData.type === 'multiple_choice' ? formData.options : undefined,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        usageCount: 0,
        createdAt: now,
        updatedAt: now
      };
      setQuestions((prev) => [newQuestion, ...prev]);
    }

    setShowCreateDialog(false);
    setEditingQuestion(null);
    setFormData(emptyFormData);
  };

  const handleDeleteQuestion = (id: string) => {
    // TODO: Call API to delete question
    if (confirm('¿Estás seguro de eliminar esta pregunta?')) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleExportQuestions = () => {
    // TODO: Implement actual export (CSV, JSON, etc.)
    const dataToExport = selectedIds.size > 0
      ? questions.filter((q) => selectedIds.has(q.id))
      : questions;

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'preguntas_exportadas.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportQuestions = () => {
    // TODO: Implement file picker and import logic
    alert('Funcionalidad de importación por implementar.\nSe espera seleccionar un archivo JSON con preguntas.');
  };

  const handleOptionChange = (index: number, field: keyof QuestionOption, value: string | boolean) => {
    setFormData((prev) => {
      const newOptions = [...prev.options];
      if (field === 'isCorrect' && value === true) {
        // When setting one as correct, unset others for radio behavior
        const answerText = newOptions[index].text;
        newOptions.forEach((opt, i) => {
          if (i === index) {
            newOptions[i] = { ...opt, isCorrect: true };
          } else {
            newOptions[i] = { ...opt, isCorrect: false };
          }
        });
        return { ...prev, options: newOptions, correctAnswer: answerText };
      }
      if (field === 'text') {
        newOptions[index] = { ...newOptions[index], text: value as string };
        // If this was the correct answer, update the answer text
        if (newOptions[index].isCorrect) {
          return { ...prev, options: newOptions, correctAnswer: value as string };
        }
      }
      return { ...prev, options: newOptions };
    });
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'bank', label: 'Banco de Preguntas', icon: <Database className="w-4 h-4" /> },
    { id: 'create', label: 'Crear Pregunta', icon: <Plus className="w-4 h-4" /> },
    { id: 'faq', label: 'Preguntas Frecuentes', icon: <HelpCircle className="w-4 h-4" /> }
  ];

  const faqs = [
    {
      question: '¿Cómo creo una pregunta de opción múltiple?',
      answer: 'Ve a la pestaña "Crear Pregunta", selecciona "Opción Múltiple" como tipo, completa el texto de la pregunta, las opciones y marca la respuesta correcta.'
    },
    {
      question: '¿Puedo importar preguntas desde un archivo?',
      answer: 'Sí, usa el botón "Importar" en el Banco de Preguntas. El archivo debe estar en formato JSON con la estructura correcta de preguntas.'
    },
    {
      question: '¿Cómo veo cuántas veces se ha usado una pregunta?',
      answer: 'En la tabla del Banco de Preguntas, la columna "Uso" muestra cuántas evaluaciones han utilizado cada pregunta.'
    },
    {
      question: '¿Puedo editar preguntas ya creadas?',
      answer: 'Sí, haz clic en el botón de editar (ícono de lápiz) junto a cualquier pregunta para modificarla.'
    },
    {
      question: '¿Cómo filtro preguntas por dificultad?',
      answer: 'Haz clic en el botón "Filtros" y selecciona el nivel de dificultad deseado: Fácil, Medio o Difícil.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Database className="w-7 h-7 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Banco de Preguntas</h1>
                <p className="text-gray-600 mt-1">
                  Gestiona y organiza todas tus preguntas para evaluaciones
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleImportQuestions}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Importar</span>
              </button>
              <button
                onClick={handleExportQuestions}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
              <button
                onClick={openCreateDialog}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nueva Pregunta</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'create') {
                      openCreateDialog();
                      setActiveTab('bank');
                    }
                  }}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Preguntas</p>
                <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
              </div>
              <Database className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Opción Múltiple</p>
                <p className="text-2xl font-bold text-blue-600">
                  {questions.filter((q) => q.type === 'multiple_choice').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Más Usada</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {Math.max(...questions.map((q) => q.usageCount))}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Etiquetas</p>
                <p className="text-2xl font-bold text-amber-600">{allTags.length}</p>
              </div>
              <Tag className="w-8 h-8 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por texto, tema o etiqueta..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters || selectedSubject || selectedDifficulty || selectedType
                  ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todas las materias</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dificultad</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todas</option>
                  <option value="facil">Fácil</option>
                  <option value="medio">Medio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todos los tipos</option>
                  {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-3 flex items-center justify-between">
                {tagFilter && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Etiqueta:</span>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {tagFilter}
                    </span>
                    <button onClick={() => setTagFilter('')} className="text-gray-400 hover:text-gray-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {(selectedSubject || selectedDifficulty || selectedType || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-indigo-800 font-medium">
                {selectedIds.size} pregunta{selectedIds.size > 1 ? 's' : ''} seleccionada{selectedIds.size > 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkTagDialog(true)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white border border-indigo-300 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Etiquetar
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  <Trash className="w-3.5 h-3.5" />
                  Eliminar
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="text-indigo-600 hover:text-indigo-800 text-sm ml-2"
                >
                  Deseleccionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Questions Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredQuestions.length && filteredQuestions.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pregunta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Materia
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Dificultad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Uso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">No se encontraron preguntas</p>
                      <p className="text-sm mt-1">
                        Intenta ajustar los filtros o crea una nueva pregunta
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((question) => (
                    <tr
                      key={question.id}
                      className={`hover:bg-gray-50 transition-colors ${selectedIds.has(question.id) ? 'bg-indigo-50' : ''
                        }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(question.id)}
                          onChange={() => toggleSelect(question.id)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3 max-w-md">
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => setViewingQuestion(question)}
                            className="text-left text-sm text-gray-900 hover:text-indigo-600 line-clamp-2 flex-1"
                          >
                            {question.questionText}
                          </button>
                          <Eye
                            className="w-4 h-4 text-gray-400 hover:text-indigo-600 cursor-pointer flex-shrink-0 mt-0.5"
                            onClick={() => setViewingQuestion(question)}
                          />
                        </div>
                        {question.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {question.tags.slice(0, 3).map((tag) => (
                              <button
                                key={tag}
                                onClick={() => setTagFilter(tag)}
                                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-indigo-100 hover:text-indigo-700"
                              >
                                {tag}
                              </button>
                            ))}
                            {question.tags.length > 3 && (
                              <span className="text-xs text-gray-400">+{question.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{question.subject}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">
                          {QUESTION_TYPE_LABELS[question.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[question.difficulty]
                            }`}
                        >
                          {DIFFICULTY_LABELS[question.difficulty]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {question.usageCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditDialog(question)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {filteredQuestions.length} de {questions.length} preguntas
            </p>
          </div>
        </div>

        {/* Create/Edit Question Dialog */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingQuestion ? 'Editar Pregunta' : 'Crear Nueva Pregunta'}
                </h2>
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Materia *
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar...</option>
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Ej: Álgebra"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Pregunta *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      {Object.entries(QUESTION_TYPE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dificultad
                    </label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({ ...formData, difficulty: e.target.value as DifficultyLevel })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="facil">Fácil</option>
                      <option value="medio">Medio</option>
                      <option value="dificil">Difícil</option>
                    </select>
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto de la Pregunta *
                  </label>
                  <textarea
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Escribe aquí la pregunta..."
                  />
                </div>

                {/* Options for Multiple Choice */}
                {formData.type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opciones (selecciona la correcta)
                    </label>
                    <div className="space-y-2">
                      {formData.options.map((option, index) => (
                        <div key={option.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={option.isCorrect}
                            onChange={() => handleOptionChange(index, 'isCorrect', true)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-sm font-medium text-gray-600">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* True/False */}
                {formData.type === 'true_false' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Respuesta Correcta
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, correctAnswer: 'Verdadero' })
                        }
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${formData.correctAnswer === 'Verdadero'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        <Check className="w-5 h-5 mx-auto mb-1" />
                        Verdadero
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, correctAnswer: 'Falso' })
                        }
                        className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${formData.correctAnswer === 'Falso'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                      >
                        <X className="w-5 h-5 mx-auto mb-1" />
                        Falso
                      </button>
                    </div>
                  </div>
                )}

                {/* Short Answer */}
                {formData.type === 'short_answer' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Respuesta Esperada *
                    </label>
                    <input
                      type="text"
                      value={formData.correctAnswer}
                      onChange={(e) =>
                        setFormData({ ...formData, correctAnswer: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Respuesta esperada..."
                    />
                  </div>
                )}

                {/* Essay */}
                {formData.type === 'essay' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Criterios de Evaluación / Respuesta Modelo *
                    </label>
                    <textarea
                      value={formData.correctAnswer}
                      onChange={(e) =>
                        setFormData({ ...formData, correctAnswer: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      placeholder="Describe los puntos clave que debe incluir la respuesta..."
                    />
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explicación (opcional)
                  </label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Explicación de la respuesta correcta..."
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Etiquetas (separadas por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="ej: álgebra, ecuaciones, básico"
                  />
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-xl">
                <button
                  onClick={() => setShowCreateDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveQuestion}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingQuestion ? 'Guardar Cambios' : 'Crear Pregunta'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Question Dialog */}
        {viewingQuestion && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Detalle de la Pregunta</h3>
                <button
                  onClick={() => setViewingQuestion(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[viewingQuestion.difficulty]
                      }`}
                  >
                    {DIFFICULTY_LABELS[viewingQuestion.difficulty]}
                  </span>
                  <span className="text-sm text-gray-600">
                    {QUESTION_TYPE_LABELS[viewingQuestion.type]}
                  </span>
                  <span className="text-sm text-gray-600">• {viewingQuestion.subject}</span>
                </div>

                <p className="text-gray-900 font-medium">{viewingQuestion.questionText}</p>

                {viewingQuestion.options && viewingQuestion.options.length > 0 && (
                  <div className="space-y-2">
                    {viewingQuestion.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`px-3 py-2 rounded-lg border ${opt.isCorrect
                            ? 'border-green-300 bg-green-50 text-green-800'
                            : 'border-gray-200 text-gray-700'
                          }`}
                      >
                        <span className="font-medium">{opt.text}</span>
                        {opt.isCorrect && (
                          <Check className="w-4 h-4 inline ml-2 text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {viewingQuestion.explanation && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800 mb-1">Explicación:</p>
                    <p className="text-sm text-blue-700">{viewingQuestion.explanation}</p>
                  </div>
                )}

                {viewingQuestion.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {viewingQuestion.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Usada en <strong>{viewingQuestion.usageCount}</strong> evaluaciones
                  </span>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    openEditDialog(viewingQuestion);
                    setViewingQuestion(null);
                  }}
                  className="flex items-center gap-1 px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => setViewingQuestion(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Tag Dialog */}
        {showBulkTagDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Etiquetar {selectedIds.size} preguntas
                </h3>
                <button
                  onClick={() => setShowBulkTagDialog(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  type="text"
                  value={bulkTagInput}
                  onChange={(e) => setBulkTagInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="ej: repaso, importante"
                  autoFocus
                />
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowBulkTagDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleBulkTag}
                  disabled={!bulkTagInput.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Aplicar Etiquetas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Tab Content */}
        {activeTab === 'faq' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              Preguntas Frecuentes
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors"
                >
                  <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
