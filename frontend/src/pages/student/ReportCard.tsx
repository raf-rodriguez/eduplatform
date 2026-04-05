import { useState, useMemo } from 'react'
import {
  FileText,
  Printer,
  Download,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// --- Types ---

interface AssessmentScore {
  name: string
  score: number
  maxScore: number
}

interface SubjectGrade {
  subject: string
  code: string
  assessments: AssessmentScore[]
  termAverage: number
  letterGrade: string
  passed: boolean
}

interface TermData {
  term: string
  subjects: SubjectGrade[]
  gpa: number
}

// --- Mock Data ---

const MOCK_TERMS: TermData[] = [
  {
    term: 'Term 1',
    gpa: 3.4,
    subjects: [
      {
        subject: 'Mathematics',
        code: 'MATH-101',
        assessments: [
          { name: 'Quiz 1', score: 85, maxScore: 100 },
          { name: 'Quiz 2', score: 78, maxScore: 100 },
          { name: 'Midterm', score: 82, maxScore: 100 },
        ],
        termAverage: 82,
        letterGrade: 'B',
        passed: true,
      },
      {
        subject: 'Spanish Language',
        code: 'SPAN-101',
        assessments: [
          { name: 'Essay 1', score: 90, maxScore: 100 },
          { name: 'Quiz 1', score: 88, maxScore: 100 },
          { name: 'Oral Exam', score: 92, maxScore: 100 },
        ],
        termAverage: 90,
        letterGrade: 'A',
        passed: true,
      },
      {
        subject: 'Science',
        code: 'SCI-101',
        assessments: [
          { name: 'Lab Report', score: 70, maxScore: 100 },
          { name: 'Quiz 1', score: 75, maxScore: 100 },
          { name: 'Midterm', score: 68, maxScore: 100 },
        ],
        termAverage: 71,
        letterGrade: 'C',
        passed: true,
      },
      {
        subject: 'History',
        code: 'HIST-101',
        assessments: [
          { name: 'Quiz 1', score: 60, maxScore: 100 },
          { name: 'Essay 1', score: 55, maxScore: 100 },
          { name: 'Midterm', score: 58, maxScore: 100 },
        ],
        termAverage: 58,
        letterGrade: 'F',
        passed: false,
      },
      {
        subject: 'Physical Education',
        code: 'PE-101',
        assessments: [
          { name: 'Fitness Test', score: 95, maxScore: 100 },
          { name: 'Team Sports', score: 88, maxScore: 100 },
        ],
        termAverage: 92,
        letterGrade: 'A',
        passed: true,
      },
    ],
  },
  {
    term: 'Term 2',
    gpa: 3.6,
    subjects: [
      {
        subject: 'Mathematics',
        code: 'MATH-101',
        assessments: [
          { name: 'Quiz 1', score: 88, maxScore: 100 },
          { name: 'Quiz 2', score: 90, maxScore: 100 },
          { name: 'Midterm', score: 86, maxScore: 100 },
        ],
        termAverage: 88,
        letterGrade: 'A',
        passed: true,
      },
      {
        subject: 'Spanish Language',
        code: 'SPAN-101',
        assessments: [
          { name: 'Essay 1', score: 92, maxScore: 100 },
          { name: 'Quiz 1', score: 85, maxScore: 100 },
          { name: 'Oral Exam', score: 90, maxScore: 100 },
        ],
        termAverage: 89,
        letterGrade: 'A',
        passed: true,
      },
      {
        subject: 'Science',
        code: 'SCI-101',
        assessments: [
          { name: 'Lab Report', score: 80, maxScore: 100 },
          { name: 'Quiz 1', score: 78, maxScore: 100 },
          { name: 'Midterm', score: 82, maxScore: 100 },
        ],
        termAverage: 80,
        letterGrade: 'B',
        passed: true,
      },
      {
        subject: 'History',
        code: 'HIST-101',
        assessments: [
          { name: 'Quiz 1', score: 72, maxScore: 100 },
          { name: 'Essay 1', score: 68, maxScore: 100 },
          { name: 'Midterm', score: 70, maxScore: 100 },
        ],
        termAverage: 70,
        letterGrade: 'C',
        passed: true,
      },
      {
        subject: 'Physical Education',
        code: 'PE-101',
        assessments: [
          { name: 'Fitness Test', score: 93, maxScore: 100 },
          { name: 'Team Sports', score: 90, maxScore: 100 },
        ],
        termAverage: 92,
        letterGrade: 'A',
        passed: true,
      },
    ],
  },
  {
    term: 'Term 3',
    gpa: 3.7,
    subjects: [
      {
        subject: 'Mathematics',
        code: 'MATH-101',
        assessments: [
          { name: 'Quiz 1', score: 92, maxScore: 100 },
          { name: 'Quiz 2', score: 88, maxScore: 100 },
          { name: 'Midterm', score: 90, maxScore: 100 },
        ],
        termAverage: 90,
        letterGrade: 'A',
        passed: true,
      },
      {
        subject: 'Spanish Language',
        code: 'SPAN-101',
        assessments: [
          { name: 'Essay 1', score: 94, maxScore: 100 },
          { name: 'Quiz 1', score: 91, maxScore: 100 },
          { name: 'Oral Exam', score: 93, maxScore: 100 },
        ],
        termAverage: 93,
        letterGrade: 'A',
        passed: true,
      },
      {
        subject: 'Science',
        code: 'SCI-101',
        assessments: [
          { name: 'Lab Report', score: 85, maxScore: 100 },
          { name: 'Quiz 1', score: 82, maxScore: 100 },
          { name: 'Midterm', score: 88, maxScore: 100 },
        ],
        termAverage: 85,
        letterGrade: 'A',
        passed: true,
      },
      {
        subject: 'History',
        code: 'HIST-101',
        assessments: [
          { name: 'Quiz 1', score: 78, maxScore: 100 },
          { name: 'Essay 1', score: 80, maxScore: 100 },
          { name: 'Midterm', score: 75, maxScore: 100 },
        ],
        termAverage: 78,
        letterGrade: 'B',
        passed: true,
      },
      {
        subject: 'Physical Education',
        code: 'PE-101',
        assessments: [
          { name: 'Fitness Test', score: 96, maxScore: 100 },
          { name: 'Team Sports', score: 94, maxScore: 100 },
        ],
        termAverage: 95,
        letterGrade: 'A',
        passed: true,
      },
    ],
  },
  {
    term: 'Term 4',
    gpa: 3.8,
    subjects: [
      {
        subject: 'Mathematics',
        code: 'MATH-101',
        assessments: [
          { name: 'Quiz 1', score: 95, maxScore: 100 },
          { name: 'Quiz 2', score: 92, maxScore: 100 },
          { name: 'Final Exam', score: 94, maxScore: 100 },
        ],
        termAverage: 94,
        letterGrade: 'A',
        passed: true,
      },
      {
        subject: 'Spanish Language',
        code: 'SPAN-101',
        assessments: [
          { name: 'Essay 1', score: 96, maxScore: 100 },
          { name: 'Quiz 1', score: 93, maxScore: 100 },
          { name: 'Final Oral', score: 95, maxScore: 100 },
        ],
        termAverage: 95,
        letterGrade: 'A',
        passed: true,
      },
      {
        subject: 'Science',
        code: 'SCI-101',
        assessments: [
          { name: 'Lab Report', score: 90, maxScore: 100 },
          { name: 'Quiz 1', score: 88, maxScore: 100 },
          { name: 'Final Exam', score: 92, maxScore: 100 },
        ],
        termAverage: 90,
        letterGrade: 'A',
        passed: true,
      },
      {
        subject: 'History',
        code: 'HIST-101',
        assessments: [
          { name: 'Quiz 1', score: 84, maxScore: 100 },
          { name: 'Essay 1', score: 82, maxScore: 100 },
          { name: 'Final Exam', score: 86, maxScore: 100 },
        ],
        termAverage: 84,
        letterGrade: 'B',
        passed: true,
      },
      {
        subject: 'Physical Education',
        code: 'PE-101',
        assessments: [
          { name: 'Fitness Test', score: 98, maxScore: 100 },
          { name: 'Team Sports', score: 95, maxScore: 100 },
        ],
        termAverage: 97,
        letterGrade: 'A',
        passed: true,
      },
    ],
  },
]

const TEACHER_COMMENTS = [
  {
    subject: 'Mathematics',
    teacher: 'Prof. Garcia',
    comment:
      'Excellent improvement throughout the year. Shows strong problem-solving skills and consistent effort.',
  },
  {
    subject: 'Spanish Language',
    teacher: 'Prof. Martinez',
    comment:
      'Outstanding writing and comprehension. A natural communicator with great potential in literature.',
  },
  {
    subject: 'Science',
    teacher: 'Prof. Lopez',
    comment:
      'Good progress in lab work. Recommend focusing more on theoretical concepts to boost exam scores.',
  },
  {
    subject: 'History',
    teacher: 'Prof. Rodriguez',
    comment:
      'Steady improvement. Needs to participate more in class discussions and submit assignments on time.',
  },
  {
    subject: 'Physical Education',
    teacher: 'Prof. Hernandez',
    comment:
      'Exceptional athletic performance and team leadership. A role model for classmates.',
  },
]

// --- Helpers ---

function getGradeColor(letter: string): string {
  switch (letter) {
    case 'A':
      return 'text-green-600'
    case 'B':
      return 'text-blue-600'
    case 'C':
      return 'text-yellow-600'
    case 'D':
      return 'text-orange-600'
    case 'F':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

function getBadgeVariant(passed: boolean): 'default' | 'destructive' {
  return passed ? 'default' : 'destructive'
}

function getImprovementTip(subject: string): string {
  const tips: Record<string, string> = {
    Mathematics: 'Practice more problem sets daily and review formula sheets.',
    'Spanish Language': 'Read more literature and practice essay writing weekly.',
    Science: 'Focus on understanding core theories before lab experiments.',
    History: 'Create timelines and flashcards for key events and dates.',
    'Physical Education': 'Maintain current routine; focus on endurance training.',
  }
  return tips[subject] || 'Review class notes regularly and seek teacher feedback.'
}

function getOverallGPA(terms: TermData[]): number {
  if (terms.length === 0) return 0
  const total = terms.reduce((sum, t) => sum + t.gpa, 0)
  return Math.round((total / terms.length) * 100) / 100
}

// --- Sub-components ---

function MiniBarChart({ terms }: { terms: TermData[] }) {
  const maxGpa = 4.0
  return (
    <div className="flex items-end justify-between gap-2 h-32 px-2">
      {terms.map((t) => {
        const heightPct = (t.gpa / maxGpa) * 100
        return (
          <div key={t.term} className="flex flex-col items-center flex-1">
            <span className="text-xs font-semibold mb-1">{t.gpa.toFixed(1)}</span>
            <div className="w-full bg-secondary rounded-t-md relative" style={{ height: '80px' }}>
              <div
                className="absolute bottom-0 w-full bg-primary rounded-t-md transition-all"
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground mt-1">{t.term.replace('Term', 'T')}</span>
          </div>
        )
      })}
    </div>
  )
}

function GpaTrendIndicator({ currentGpa, previousGpa }: { currentGpa: number; previousGpa: number }) {
  const diff = currentGpa - previousGpa
  if (diff > 0) {
    return (
      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
        <TrendingUp className="h-4 w-4" />
        +{diff.toFixed(1)}
      </span>
    )
  }
  if (diff < 0) {
    return (
      <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
        <TrendingDown className="h-4 w-4" />
        {diff.toFixed(1)}
      </span>
    )
  }
  return <span className="text-sm text-muted-foreground">No change</span>
}

// --- Main Component ---

export default function ReportCard() {
  const [selectedTerm, setSelectedTerm] = useState('Term 1')
  const terms = MOCK_TERMS

  const currentTermData = useMemo(
    () => terms.find((t) => t.term === selectedTerm)!,
    [selectedTerm, terms]
  )

  const overallGpa = useMemo(() => getOverallGPA(terms), [terms])

  // Best & worst subjects across all terms
  const allSubjects = useMemo(() => {
    const map = new Map<string, number[]>()
    terms.forEach((t) =>
      t.subjects.forEach((s) => {
        if (!map.has(s.subject)) map.set(s.subject, [])
        map.get(s.subject)!.push(s.termAverage)
      })
    )
    return Array.from(map.entries()).map(([name, avgs]) => ({
      subject: name,
      avg: Math.round(avgs.reduce((a, b) => a + b, 0) / avgs.length),
    }))
  }, [terms])

  const bestSubject = useMemo(
    () => allSubjects.reduce((best, s) => (s.avg > best.avg ? s : best), allSubjects[0]),
    [allSubjects]
  )
  const worstSubject = useMemo(
    () => allSubjects.reduce((worst, s) => (s.avg < worst.avg ? s : worst), allSubjects[0]),
    [allSubjects]
  )

  const currentIndex = terms.findIndex((t) => t.term === selectedTerm)
  const prevIndex = currentIndex - 1
  const prevGpa = prevIndex >= 0 ? terms[prevIndex].gpa : null

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = () => {
    // TODO: integrate jsPDF or server-side PDF generation
    alert('PDF download coming soon!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Report Card
          </h1>
          <p className="text-muted-foreground">Term-by-term academic performance</p>
        </div>
        <div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" onClick={handleDownloadPdf}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Term Selector Tabs */}
      <Tabs value={selectedTerm} onValueChange={setSelectedTerm}>
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          {terms.map((t) => (
            <TabsTrigger key={t.term} value={t.term}>
              {t.term}
            </TabsTrigger>
          ))}
        </TabsList>

        {terms.map((term) => (
          <TabsContent key={term.term} value={term.term} className="space-y-6">
            {/* GPA Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Term GPA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{term.gpa.toFixed(2)}</div>
                  {prevGpa !== null && (
                    <div className="mt-1">
                      <GpaTrendIndicator currentGpa={term.gpa} previousGpa={prevGpa} />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Overall GPA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold flex items-center gap-2">
                    <Award className="h-6 w-6 text-yellow-500" />
                    {overallGpa.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Across all terms</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Subjects Passed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {term.subjects.filter((s) => s.passed).length}/{term.subjects.length}
                  </div>
                  <Progress
                    value={
                      (term.subjects.filter((s) => s.passed).length / term.subjects.length) * 100
                    }
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Grade Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{term.term} Grades</CardTitle>
                <CardDescription>Detailed assessment scores and term averages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Subject</th>
                        <th className="text-left py-3 px-2 font-medium">Assessments</th>
                        <th className="text-center py-3 px-2 font-medium">Term Avg</th>
                        <th className="text-center py-3 px-2 font-medium">Grade</th>
                        <th className="text-center py-3 px-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {term.subjects.map((subj) => (
                        <tr key={subj.code} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-3 px-2">
                            <div className="font-medium">{subj.subject}</div>
                            <div className="text-xs text-muted-foreground">{subj.code}</div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="space-y-1">
                              {subj.assessments.map((a) => (
                                <div key={a.name} className="flex items-center gap-2 text-xs">
                                  <span className="text-muted-foreground w-20">{a.name}</span>
                                  <Progress value={a.score} className="h-1.5 flex-1 max-w-[80px]" />
                                  <span className="font-medium">
                                    {a.score}/{a.maxScore}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="text-lg font-bold">{subj.termAverage}%</span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`text-2xl font-bold ${getGradeColor(subj.letterGrade)}`}>
                              {subj.letterGrade}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center">
                            <Badge variant={getBadgeVariant(subj.passed)}>
                              {subj.passed ? 'Aprobado' : 'No Aprobado'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* GPA Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            GPA Trend
          </CardTitle>
          <CardDescription>Term-by-term GPA comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <MiniBarChart terms={terms} />
        </CardContent>
      </Card>

      {/* Subject Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Best Subject */}
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-green-700">
              <Star className="h-5 w-5 fill-green-500 text-green-500" />
              Best Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestSubject.subject}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Average: {bestSubject.avg}%
            </div>
            <Progress value={bestSubject.avg} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Outstanding performance! Keep up the excellent work.
            </p>
          </CardContent>
        </Card>

        {/* Worst Subject with Tips */}
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
              <TrendingDown className="h-5 w-5" />
              Needs Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{worstSubject.subject}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Average: {worstSubject.avg}%
            </div>
            <Progress value={worstSubject.avg} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              <span className="font-medium">Tip:</span>{' '}
              {getImprovementTip(worstSubject.subject)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* All Subjects Average Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subject Ranking (All Terms)</CardTitle>
          <CardDescription>Overall average per subject across all terms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allSubjects
              .sort((a, b) => b.avg - a.avg)
              .map((subj, idx) => (
                <div key={subj.subject} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-6 text-center text-muted-foreground">
                    #{idx + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium">{subj.subject}</span>
                  <div className="w-32">
                    <Progress value={subj.avg} className="h-2" />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">{subj.avg}%</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Teacher Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Teacher Comments</CardTitle>
          <CardDescription>Feedback from your teachers this year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {TEACHER_COMMENTS.map((c) => (
              <div
                key={c.subject}
                className="rounded-lg border p-4 bg-muted/30"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{c.subject}</span>
                  <span className="text-xs text-muted-foreground">{c.teacher}</span>
                </div>
                <p className="text-sm text-muted-foreground">{c.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
