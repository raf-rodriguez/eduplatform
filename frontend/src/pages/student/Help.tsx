import { useState } from 'react'
import {
  HelpCircle,
  Search,
  Mail,
  Phone,
  BookOpen,
  Video,
  MessageCircle,
  FileText,
  Send,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface FAQItem {
  question: string
  answer: string
}

interface FAQSection {
  title: string
  badge: string
  badgeVariant?: 'default' | 'secondary' | 'outline'
  items: FAQItem[]
}

const faqData: FAQSection[] = [
  {
    title: 'C\u00f3mo usar la plataforma',
    badge: 'Inicio',
    badgeVariant: 'default',
    items: [
      {
        question: '\u00bfC\u00f3mo comienzo a usar EduPlatform?',
        answer:
          'Para comenzar, inicia sesi\u00f3n con tus credenciales. En el panel principal encontrar\u00e1s tu progreso, lecciones recomendadas y accesos r\u00e1pidos. Navega por el men\u00fa lateral para explorar todas las funciones disponibles.',
      },
      {
        question: '\u00bfC\u00f3mo accedo a mis cursos?',
        answer:
          'Haz clic en "Mi Curr\u00edculo" en el men\u00fa lateral. Ah\u00ed ver\u00e1s todos tus cursos organizados por materia y m\u00f3dulo. Selecciona cualquier lecci\u00f3n para comenzar.',
      },
      {
        question: '\u00bfPuedo descargar contenido para ver sin conexi\u00f3n?',
        answer:
          'Actualmente el contenido se carga en l\u00ednea. Sin embargo, puedes tomar notas y guardar marcadores que se sincronizar\u00e1n autom\u00e1ticamente cuando vuelvas a estar conectado.',
      },
    ],
  },
  {
    title: 'Problemas t\u00e9cnicos',
    badge: 'Soporte',
    badgeVariant: 'destructive',
    items: [
      {
        question: '\u00bfQu\u00e9 hago si la p\u00e1gina no carga?',
        answer:
          'Intenta refrescar la p\u00e1gina (F5 o Ctrl+R). Si el problema persiste, limpia la cach\u00e9 de tu navegador o prueba con otro navegador. Si contin\u00faa el problema, reporta el incidente usando el formulario de contacto.',
      },
      {
        question: '\u00bfPor qu\u00e9 no puedo iniciar sesi\u00f3n?',
        answer:
          'Verifica que tu correo y contrase\u00f1a sean correctos. Si olvidaste tu contrase\u00f1a, usa la opci\u00f3n "\u00bfOlvidaste tu contrase\u00f1a?" en la pantalla de inicio de sesi\u00f3n. Si el problema persiste, contacta a soporte.',
      },
      {
        question: '\u00bfLos videos se ven mal o no reproducen?',
        answer:
          'Aseg\u00farate de tener una conexi\u00f3n estable a internet. Intenta reducir la calidad del video en la configuraci\u00f3n del reproductor. Si usas un bloqueador de anuncios, desact\u00edvalo temporalmente.',
      },
    ],
  },
  {
    title: 'Pagos y suscripciones',
    badge: 'Facturaci\u00f3n',
    badgeVariant: 'secondary',
    items: [
      {
        question: '\u00bfCu\u00e1les son los planes disponibles?',
        answer:
          'Ofrecemos planes mensual, trimestral y anual. Cada plan incluye acceso completo a todo el contenido, seguimiento de progreso y soporte t\u00e9cnico. El plan anual incluye un descuento especial.',
      },
      {
        question: '\u00bfC\u00f3mo puedo actualizar mi plan?',
        answer:
          'Ve a Configuraci\u00f3n > Suscripci\u00f3n para ver tu plan actual y las opciones de actualizaci\u00f3n. Los cambios se aplican de forma inmediata y el cobro se prorratea.',
      },
      {
        question: '\u00bfPuedo obtener un reembolso?',
        answer:
          'Ofrecemos garant\u00eda de devoluci\u00f3n de 7 d\u00edas en todos los planes. Contacta a soporte dentro de este per\u00edodo para procesar tu reembolso.',
      },
    ],
  },
  {
    title: 'Gamificaci\u00f3n',
    badge: 'Logros',
    badgeVariant: 'default',
    items: [
      {
        question: '\u00bfC\u00f3mo gano XP?',
        answer:
          'Ganas XP completando lecciones, aprobando evaluaciones, manteniendo rachas diarias y participando en desaf\u00edos. Cada actividad otorga una cantidad diferente de puntos de experiencia.',
      },
      {
        question: '\u00bfQu\u00e9 son las rachas y c\u00f3mo mantenerlas?',
        answer:
          'Una racha es el n\u00famero de d\u00edas consecutivos en los que has completado al menos una actividad. Para mantener tu racha, aseg\u00farate de interactuar con la plataforma todos los d\u00edas.',
      },
      {
        question: '\u00bfC\u00f3mo desbloqueo logros?',
        answer:
          'Los logros se desbloquean al alcanzar ciertos hitos: completar un n\u00famero de lecciones, obtener puntuaciones perfectas, mantener rachas largas y m\u00e1s. Revisa la secci\u00f3n de Logros para ver todos los disponibles.',
      },
    ],
  },
  {
    title: 'Evaluaciones',
    badge: 'Ex\u00e1menes',
    badgeVariant: 'outline',
    items: [
      {
        question: '\u00bfC\u00f3mo funcionan las evaluaciones?',
        answer:
          'Las evaluaciones est\u00e1n al final de cada m\u00f3dulo. Incluyen preguntas de opci\u00f3n m\u00faltiple, verdadero/falso y preguntas abiertas. Necesitas una calificaci\u00f3n m\u00ednima para aprobar y avanzar al siguiente m\u00f3dulo.',
      },
      {
        question: '\u00bfPuedo repetir una evaluaci\u00f3n si no apruebo?',
        answer:
          'S\u00ed, puedes repetir las evaluaciones despu\u00e9s de un per\u00edodo de espera de 24 horas. Te recomendamos repasar el material antes de intentar nuevamente.',
      },
      {
        question: '\u00bfC\u00f3mo veo mis resultados?',
        answer:
          'Los resultados est\u00e1n disponibles inmediatamente despu\u00e9s de completar la evaluaci\u00f3n. Puedes ver tu calificaci\u00f3n, las preguntas correctas e incorrectas, y una explicaci\u00f3n de cada respuesta en la secci\u00f3n de Progreso.',
      },
    ],
  },
]

const quickLinks = [
  {
    title: 'Gu\u00eda del estudiante',
    description: 'Documento PDF con instrucciones detalladas',
    icon: FileText,
    href: '#',
  },
  {
    title: 'Tutoriales en video',
    description: 'Aprende con nuestros videos explicativos',
    icon: Video,
    href: '#',
  },
  {
    title: 'Reportar un problema',
    description: 'Env\u00edanos un reporte detallado',
    icon: Mail,
    href: '#contact-form',
  },
]

export default function Help() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredSections = faqData
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.items.length > 0)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: 'Mensaje enviado',
      description: 'Hemos recibido tu mensaje. Te responderemos pronto.',
    })

    setFormData({ name: '', email: '', subject: '', message: '' })
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <HelpCircle className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Centro de Ayuda</h1>
          <p className="text-muted-foreground">
            Encuentra respuestas y soporte para todas tus dudas.
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar en las preguntas frecuentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ Sections */}
        <div className="lg:col-span-2 space-y-6">
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>{section.title}</CardTitle>
                    <Badge variant={section.badgeVariant || 'default'}>
                      {section.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {section.items.map((item) => (
                      <AccordionItem key={item.question} value={item.question}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent>{item.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No se encontraron resultados
                </h3>
                <p className="text-muted-foreground text-center">
                  No hay preguntas que coincidan con "{searchQuery}". Intenta con otros t\u00e9rminos o cont\u00e1ctanos.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Enlaces r\u00e1pidos</CardTitle>
              <CardDescription>
                Recursos \u00fatiles para estudiantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                >
                  <div className="mt-0.5 rounded-md bg-primary/10 p-2">
                    <link.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{link.title}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {link.description}
                    </p>
                  </div>
                </a>
              ))}
            </CardContent>
          </Card>

          {/* Contact Card */}
          <Card>
            <CardHeader>
              <CardTitle>Cont\u00e1ctanos</CardTitle>
              <CardDescription>
                \u00bfNecesitas ayuda personalizada?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>soporte@eduplatform.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span>Lun - Vie, 9:00 - 18:00</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Form */}
      <Card id="contact-form">
        <CardHeader>
          <CardTitle>Env\u00edanos un mensaje</CardTitle>
          <CardDescription>
            Completa el formulario y te responderemos lo antes posible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electr\u00f3nico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="\u00bfSobre qu\u00e9 nos quieres contactar?"
                value={formData.subject}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Describe tu consulta en detalle..."
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  </span>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar mensaje
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          onClick={() =>
            toast({
              title: 'Chat en vivo',
              description: 'El soporte en vivo estar\u00e1 disponible pr\u00f3ximamente.',
            })
          }
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
