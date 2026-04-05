import { Link } from 'react-router-dom'
import { GraduationCap, BookOpen, Trophy, Users, Brain, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: BookOpen,
    title: 'Currículo Completo',
    description: 'Todas las materias desde Pre-K hasta 12º grado, alineadas con estándares educativos.',
  },
  {
    icon: Brain,
    title: 'IA Personalizada',
    description: 'Agentes inteligentes que adaptan el contenido a tu estilo de aprendizaje.',
  },
  {
    icon: Code,
    title: 'STEM Avanzado',
    description: 'Programación, robótica y ciencias con proyectos prácticos.',
  },
  {
    icon: Trophy,
    title: 'Gamificación',
    description: 'Aprende divirtiéndote con niveles, logros y recompensas.',
  },
]

const grades = [
  { name: 'Pre-Kínder', ages: '4-5 años', color: 'bg-pink-100 text-pink-700' },
  { name: 'Kínder', ages: '5-6 años', color: 'bg-purple-100 text-purple-700' },
  { name: 'Primaria (1-5)', ages: '6-11 años', color: 'bg-blue-100 text-blue-700' },
  { name: 'Secundaria (6-8)', ages: '11-14 años', color: 'bg-green-100 text-green-700' },
  { name: 'High School (9-12)', ages: '14-18 años', color: 'bg-orange-100 text-orange-700' },
]

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <GraduationCap className="h-20 w-20 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Aprende, Crece, <span className="text-primary">Triunfa</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            La plataforma educativa más completa para estudiantes de Pre-K a 12.
            Con IA personalizada, gamificación y seguimiento de progreso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Comenzar gratis
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver precios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Todo lo que necesitas para aprender</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Una plataforma diseñada por educadores, para estudiantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <Icon className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Grades Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Para todos los niveles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Contenido adaptado a cada etapa del desarrollo.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {grades.map((grade) => (
              <div
                key={grade.name}
                className={`p-6 rounded-lg text-center ${grade.color}`}
              >
                <h3 className="font-semibold mb-1">{grade.name}</h3>
                <p className="text-sm opacity-80">{grade.ages}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-2xl p-8 lg:p-16 text-center text-primary-foreground">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              ¿Listo para comenzar tu viaje de aprendizaje?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Únete a miles de estudiantes que ya están aprendiendo con EduPlatform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Crear cuenta gratis
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  Ya tengo cuenta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Estudiantes</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Lecciones</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Maestros</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">8</div>
              <div className="text-muted-foreground">Materias</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
