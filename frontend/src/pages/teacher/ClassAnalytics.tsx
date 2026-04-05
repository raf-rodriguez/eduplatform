import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  Award,
  Target,
} from 'lucide-react';

// TODO: Replace simulated data with backend API calls
// GET /api/classes/:classId/analytics
// GET /api/classes/:classId/students/performance
// GET /api/classes/:classId/trends

const classId = 'CL-2024-001'; // TODO: Get from URL params

// Simulated data - TODO: Fetch from backend
const subjectScores = [
  { subject: 'Matemáticas', average: 78, highest: 98, lowest: 42, studentsCount: 32, completionRate: 92 },
  { subject: 'Español', average: 82, highest: 96, lowest: 55, studentsCount: 32, completionRate: 95 },
  { subject: 'Ciencias', average: 74, highest: 95, lowest: 38, studentsCount: 32, completionRate: 88 },
  { subject: 'Historia', average: 85, highest: 100, lowest: 52, studentsCount: 32, completionRate: 97 },
  { subject: 'Inglés', average: 71, highest: 93, lowest: 45, studentsCount: 32, completionRate: 85 },
  { subject: 'Arte', average: 88, highest: 99, lowest: 60, studentsCount: 32, completionRate: 98 },
];

const scoreDistribution = [
  { range: '0-49', count: 5, percentage: 8, color: '#ef4444' },
  { range: '50-59', count: 8, percentage: 12, color: '#f97316' },
  { range: '60-69', count: 15, percentage: 22, color: '#eab308' },
  { range: '70-79', count: 22, percentage: 32, color: '#22c55e' },
  { range: '80-89', count: 16, percentage: 18, color: '#3b82f6' },
  { range: '90-100', count: 6, percentage: 8, color: '#8b5cf6' },
];

const trendsData = [
  { month: 'Ago', average: 72, completion: 85 },
  { month: 'Sep', average: 74, completion: 87 },
  { month: 'Oct', average: 73, completion: 86 },
  { month: 'Nov', average: 76, completion: 89 },
  { month: 'Dic', average: 78, completion: 90 },
  { month: 'Ene', average: 77, completion: 88 },
  { month: 'Feb', average: 79, completion: 91 },
  { month: 'Mar', average: 80, completion: 92 },
];

const atRiskStudents = [
  { id: 1, name: 'Carlos Mendoza', average: 52, subjects: 3, trend: 'down', lastSubmission: 'Hace 5 días', risk: 'Alto' },
  { id: 2, name: 'Maria Rodriguez', average: 55, subjects: 2, trend: 'down', lastSubmission: 'Hace 4 días', risk: 'Alto' },
  { id: 3, name: 'Javier Silva', average: 58, subjects: 2, trend: 'stable', lastSubmission: 'Hace 3 días', risk: 'Medio' },
  { id: 4, name: 'Ana Gutierrez', average: 60, subjects: 1, trend: 'up', lastSubmission: 'Hace 2 días', risk: 'Medio' },
  { id: 5, name: 'Pedro Ramirez', average: 62, subjects: 1, trend: 'down', lastSubmission: 'Hace 3 días', risk: 'Bajo' },
  { id: 6, name: 'Sofia Lopez', average: 63, subjects: 1, trend: 'stable', lastSubmission: 'Hace 1 día', risk: 'Bajo' },
];

const studentComparison = [
  { id: 1, name: 'Diego Fernandez', average: 95, subjects: 6, trend: 'up' },
  { id: 2, name: 'Valentina Torres', average: 92, subjects: 6, trend: 'up' },
  { id: 3, name: 'Mateo Ruiz', average: 89, subjects: 6, trend: 'stable' },
  { id: 4, name: 'Isabella Morales', average: 87, subjects: 6, trend: 'up' },
  { id: 5, name: 'Lucas Herrera', average: 84, subjects: 6, trend: 'down' },
  { id: 6, name: 'Camila Vargas', average: 82, subjects: 6, trend: 'up' },
  { id: 7, name: 'Sebastian Diaz', average: 78, subjects: 6, trend: 'stable' },
  { id: 8, name: 'Daniela Castro', average: 75, subjects: 6, trend: 'down' },
];

const classOverview = {
  totalStudents: 32,
  overallAverage: 79.7,
  overallCompletionRate: 92.5,
  averageImprovement: '+2.3',
  topPerformers: 8,
  atRiskCount: 6,
};

function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e';
  if (score >= 80) return '#3b82f6';
  if (score >= 70) return '#eab308';
  if (score >= 60) return '#f97316';
  return '#ef4444';
}

function getRiskBadgeColor(risk: string): string {
  switch (risk) {
    case 'Alto': return '#ef4444';
    case 'Medio': return '#f97316';
    case 'Bajo': return '#eab308';
    default: return '#6b7280';
  }
}

function getTrendIcon(trend: string) {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
  return <span className="text-gray-400 text-sm">-</span>;
}

function BarChart({ data }: { data: typeof scoreDistribution }) {
  const maxCount = Math.max(...data.map((d) => d.count));
  const chartHeight = 200;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Distribucion de Calificaciones</h3>
      </div>
      <div className="flex items-end justify-between gap-2" style={{ height: chartHeight + 40 }}>
        {data.map((item) => {
          const barHeight = (item.count / maxCount) * chartHeight;
          return (
            <div key={item.range} className="flex flex-col items-center flex-1">
              <span className="text-xs font-medium text-gray-600 mb-1">{item.count}</span>
              <div
                className="w-full rounded-t-md transition-all hover:opacity-80"
                style={{
                  height: `${barHeight}px`,
                  backgroundColor: item.color,
                  minHeight: '8px',
                }}
                title={`${item.range}: ${item.count} estudiantes (${item.percentage}%)`}
              />
              <span className="text-xs text-gray-500 mt-2">{item.range}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineChart({ data }: { data: typeof trendsData }) {
  const chartWidth = 600;
  const chartHeight = 200;
  const padding = 40;
  const maxAvg = 100;
  const minAvg = 60;

  const getX = (index: number) => padding + (index * (chartWidth - padding * 2)) / (data.length - 1);
  const getY = (value: number) => chartHeight - padding - ((value - minAvg) / (maxAvg - minAvg)) * (chartHeight - padding * 2);

  const pathPoints = data.map((d, i) => `${getX(i)},${getY(d.average)}`).join(' ');

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Tendencia de Promedio General</h3>
      </div>
      <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="max-w-full">
        {/* Grid lines */}
        {[60, 70, 80, 90, 100].map((value) => (
          <g key={value}>
            <line
              x1={padding}
              y1={getY(value)}
              x2={chartWidth - padding}
              y2={getY(value)}
              stroke="#e5e7eb"
              strokeDasharray="4,4"
            />
            <text x={padding - 5} y={getY(value) + 4} textAnchor="end" fontSize="11" fill="#6b7280">
              {value}
            </text>
          </g>
        ))}
        {/* Line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          points={pathPoints}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(d.average)} r="5" fill="#3b82f6" stroke="white" strokeWidth="2" />
            <text x={getX(i)} y={chartHeight - padding + 20} textAnchor="middle" fontSize="11" fill="#6b7280">
              {d.month}
            </text>
            <text x={getX(i)} y={getY(d.average) - 12} textAnchor="middle" fontSize="10" fill="#3b82f6" fontWeight="600">
              {d.average}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function CompletionBarChart({ data }: { data: typeof subjectScores }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Tasas de Completitud por Materia</h3>
      </div>
      <div className="space-y-3">
        {data
          .sort((a, b) => b.completionRate - a.completionRate)
          .map((item) => (
            <div key={item.subject}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                <span className="text-sm font-semibold" style={{ color: getScoreColor(item.completionRate) }}>
                  {item.completionRate}%
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.completionRate}%`,
                    backgroundColor: getScoreColor(item.completionRate),
                  }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function SubjectRanking({ data }: { data: typeof subjectScores }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Ranking de Materias por Promedio</h3>
      </div>
      <div className="space-y-3">
        {data
          .sort((a, b) => b.average - a.average)
          .map((item, index) => (
            <div key={item.subject} className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? 'bg-yellow-400 text-yellow-900'
                    : index === 1
                      ? 'bg-gray-300 text-gray-700'
                      : index === 2
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                }`}
              >
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.subject}</span>
                  <span className="text-sm font-bold" style={{ color: getScoreColor(item.average) }}>
                    {item.average}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.average}%`, backgroundColor: getScoreColor(item.average) }}
                  />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default function ClassAnalytics() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Rendimiento General', 'Por Materia', 'Tendencias', 'Estudiantes en Riesgo'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analiticos de la Clase</h1>
        <p className="text-gray-500 mt-1">ID de Clase: {classId} | Total de Estudiantes: {classOverview.totalStudents}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === index
                ? 'bg-white text-blue-600 border-t-2 border-x border-gray-200 -mb-px'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Cards - Always visible */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Estudiantes</p>
              <p className="text-xl font-bold text-gray-800">{classOverview.totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Promedio General</p>
              <p className="text-xl font-bold text-gray-800">{classOverview.overallAverage}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Tasa de Completitud</p>
              <p className="text-xl font-bold text-gray-800">{classOverview.overallCompletionRate}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${parseFloat(classOverview.averageImprovement) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Mejora Promedio</p>
              <p className="text-xl font-bold text-green-600">{classOverview.averageImprovement}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 0 && (
        <div className="space-y-6">
          {/* Score Distribution */}
          <BarChart data={scoreDistribution} />

          {/* Top and Bottom Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-800">Mejores Estudiantes</h3>
              </div>
              <div className="space-y-3">
                {studentComparison.slice(0, 5).map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{student.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: getScoreColor(student.average) }}>
                        {student.average}
                      </span>
                      {getTrendIcon(student.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-800">Estudiantes en Riesgo</h3>
              </div>
              <div className="space-y-3">
                {atRiskStudents.slice(0, 5).map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getRiskBadgeColor(student.risk) }}
                      />
                      <span className="text-sm font-medium text-gray-700">{student.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-red-600">{student.average}</span>
                      {getTrendIcon(student.trend)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <CompletionBarChart data={subjectScores} />
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-6">
          <SubjectRanking data={subjectScores} />

          {/* Subject Details Table */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalle por Materia</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Materia</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Promedio</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Mas Alto</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Mas Bajo</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Estudiantes</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Completitud</th>
                </tr>
              </thead>
              <tbody>
                {subjectScores.map((subject) => (
                  <tr key={subject.subject} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 text-sm font-medium text-gray-800">{subject.subject}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-sm font-bold" style={{ color: getScoreColor(subject.average) }}>
                        {subject.average}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-green-600 font-medium">{subject.highest}</td>
                    <td className="py-3 px-2 text-center text-sm text-red-600 font-medium">{subject.lowest}</td>
                    <td className="py-3 px-2 text-center text-sm text-gray-600">{subject.studentsCount}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-sm font-semibold" style={{ color: getScoreColor(subject.completionRate) }}>
                        {subject.completionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 2 && (
        <div className="space-y-6">
          <LineChart data={trendsData} />

          {/* Trends Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Tendencias</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-xs text-gray-500 mb-1">Mejor Mes</p>
                <p className="text-lg font-bold text-green-600">Marzo</p>
                <p className="text-sm text-green-500">Promedio: 80</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-xs text-gray-500 mb-1">Mejor Materia</p>
                <p className="text-lg font-bold text-blue-600">Arte</p>
                <p className="text-sm text-blue-500">Promedio: 88</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-xs text-gray-500 mb-1">Completitud Actual</p>
                <p className="text-lg font-bold text-purple-600">92%</p>
                <p className="text-sm text-purple-500">+7% vs inicio</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <p className="text-xs text-gray-500 mb-1">Estudiantes Activos</p>
                <p className="text-lg font-bold text-orange-600">28</p>
                <p className="text-sm text-orange-500">de 32 totales</p>
              </div>
            </div>
          </div>

          {/* Monthly Comparison */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparacion Mensual</h3>
            <div className="space-y-3">
              {trendsData.map((trend, index) => {
                const prevAvg = index > 0 ? trendsData[index - 1].average : trend.average;
                const change = trend.average - prevAvg;
                return (
                  <div key={trend.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700 w-8">{trend.month}</span>
                      <div className="flex-1">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${trend.average}%`, backgroundColor: getScoreColor(trend.average) }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className="text-sm font-bold text-gray-800">{trend.average}</span>
                      {index > 0 && (
                        change > 0 ? (
                          <span className="text-xs text-green-600 flex items-center gap-0.5">
                            <TrendingUp className="w-3 h-3" /> +{change}
                          </span>
                        ) : change < 0 ? (
                          <span className="text-xs text-red-600 flex items-center gap-0.5">
                            <TrendingDown className="w-3 h-3" /> {change}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">=</span>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 3 && (
        <div className="space-y-6">
          {/* Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-sm font-semibold text-red-800">Riesgo Alto</h3>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {atRiskStudents.filter((s) => s.risk === 'Alto').length}
              </p>
              <p className="text-xs text-red-500">Estudiantes</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <h3 className="text-sm font-semibold text-orange-800">Riesgo Medio</h3>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {atRiskStudents.filter((s) => s.risk === 'Medio').length}
              </p>
              <p className="text-xs text-orange-500">Estudiantes</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="text-sm font-semibold text-yellow-800">Riesgo Bajo</h3>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {atRiskStudents.filter((s) => s.risk === 'Bajo').length}
              </p>
              <p className="text-xs text-yellow-500">Estudiantes</p>
            </div>
          </div>

          {/* At Risk Students Table */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Lista de Estudiantes en Riesgo</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Estudiante</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Promedio</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Materias Afectadas</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Tendencia</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Ultima Entrega</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Nivel de Riesgo</th>
                  <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Accion</th>
                </tr>
              </thead>
              <tbody>
                {atRiskStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 text-sm font-medium text-gray-800">{student.name}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="text-sm font-bold text-red-600">{student.average}</span>
                    </td>
                    <td className="py-3 px-2 text-center text-sm text-gray-600">{student.subjects}</td>
                    <td className="py-3 px-2 text-center">{getTrendIcon(student.trend)}</td>
                    <td className="py-3 px-2 text-center text-sm text-gray-600">{student.lastSubmission}</td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className="px-2 py-1 text-xs font-semibold text-white rounded-full"
                        style={{ backgroundColor: getRiskBadgeColor(student.risk) }}
                      >
                        {student.risk}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {/* TODO: Add action buttons (send message, create intervention plan) */}
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                        Intervencion
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-800">Recomendaciones</h3>
            </div>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• Contactar a los estudiantes de riesgo alto para ofrecer apoyo personalizado</li>
              <li>• Revisar las materias con menor tasa de completitud (Ingles: 85%, Ciencias: 88%)</li>
              <li>• Implementar sesiones de tutoria para los temas con menor rendimiento</li>
              <li>• Monitorear de cerca a los estudiantes con tendencia descendente</li>
              <li>• Considerar ajustes en el ritmo de enseñanza para materias con promedios bajos</li>
            </ul>
            {/* TODO: Make recommendations dynamic based on actual class data */}
          </div>
        </div>
      )}

      {/* Footer with export button */}
      <div className="mt-6 flex justify-end">
        {/* TODO: Implement PDF/CSV export functionality */}
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Exportar Reporte
        </button>
      </div>
    </div>
  );
}
