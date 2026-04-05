import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const plans = [
  {
    name: 'Gratuito',
    price: '$0',
    period: '/mes',
    description: 'Perfecto para probar la plataforma',
    features: [
      'Acceso a Español y Matemáticas',
      '3 lecciones por semana',
      'Evaluaciones básicas',
      '1 grado activo',
    ],
    cta: 'Comenzar gratis',
    popular: false,
  },
  {
    name: 'Estudiante',
    price: '$9.99',
    period: '/mes',
    description: 'Para estudiantes que necesitan refuerzo',
    features: [
      'Todas las materias principales',
      'Acceso ilimitado a contenido',
      'Todas las evaluaciones',
      'Sistema de progreso completo',
      'Gamificación básica',
      'Reportes mensuales',
    ],
    cta: 'Elegir plan',
    popular: true,
  },
  {
    name: 'Familiar',
    price: '$19.99',
    period: '/mes',
    description: 'Ideal para familias homeschool',
    features: [
      'Hasta 4 estudiantes',
      'STEM completo con proyectos',
      'Agentes IA básicos',
      'Plan de estudios estructurado',
      'Reportes semanales',
      'Seguimiento de horas',
    ],
    cta: 'Elegir plan',
    popular: false,
  },
  {
    name: 'Premium',
    price: '$29.99',
    period: '/mes',
    description: 'La experiencia completa',
    features: [
      'Hasta 6 estudiantes',
      'Agentes IA completos',
      'Tutor personal 24/7',
      'Preparación SAT',
      'Certificados',
      'Transcripciones académicas',
    ],
    cta: 'Elegir plan',
    popular: false,
  },
]

export default function Pricing() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Planes y Precios</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades educativas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                  Más popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Schools CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            ¿Eres una escuela o institución educativa?
          </p>
          <Button variant="outline" size="lg">
            Ver planes para escuelas
          </Button>
        </div>
      </div>
    </div>
  )
}
