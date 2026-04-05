import { useState, useEffect, useRef, useCallback } from 'react'
import {
  MessageCircle,
  Send,
  Plus,
  Search,
  Users,
  Check,
  CheckCheck,
  Clock,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import api from '@/services/api'
import { useToast } from '@/hooks/use-toast'

// ============================================
// Types
// ============================================

interface Participant {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
  lastReadAt?: string
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  type: string
  attachments: Record<string, unknown> | null
  isRead: boolean
  createdAt: string
  updatedAt: string
}

interface Conversation {
  id: string
  title: string
  type: string
  lastMessage: Message | null
  unreadCount: number
  updatedAt: string
  participants: Participant[]
}

interface ConversationDetail {
  id: string
  title: string
  type: string
  participants: Participant[]
  messages: Message[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface Student {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

// ============================================
// Helpers
// ============================================

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'ahora'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString()
}

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0]}${lastName[0]}`.toUpperCase()
}

// Simulated online status (random for demo)
function isOnlineSimulated(userId: string): boolean {
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return hash % 3 !== 0 // ~66% online
}

// ============================================
// Component
// ============================================

export default function TeacherMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<ConversationDetail | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isFetchingStudents, setIsFetchingStudents] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/messages/conversations')
      setConversations(res.data.data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las conversaciones',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Fetch conversation detail with messages
  const fetchConversation = useCallback(async (id: string) => {
    try {
      const res = await api.get(`/messages/conversations/${id}`)
      setActiveConversation(res.data.data)
    } catch (error) {
      console.error('Error fetching conversation:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar la conversaci\xc3\xb3n',
        variant: 'destructive',
      })
    }
  }, [toast])

  // Fetch students for new conversation
  const fetchStudents = useCallback(async () => {
    try {
      setIsFetchingStudents(true)
      // Use the users endpoint with student role filter
      const res = await api.get('/users', { params: { role: 'STUDENT' } })
      setStudents(res.data.data?.users || res.data.data || [])
    } catch (error) {
      console.error('Error fetching students:', error)
      // Still allow the dialog to open even if fetch fails
    } finally {
      setIsFetchingStudents(false)
    }
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages.length])

  // Handle selecting a conversation
  const handleSelectConversation = (convId: string) => {
    fetchConversation(convId)
  }

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!activeConversation || !messageInput.trim() || isSending) return

    try {
      setIsSending(true)
      const res = await api.post(
        `/messages/conversations/${activeConversation.id}/messages`,
        { content: messageInput.trim() }
      )

      const newMessage = res.data.data
      setActiveConversation((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, newMessage],
            }
          : null
      )
      setMessageInput('')

      // Update the conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? { ...c, lastMessage: newMessage, updatedAt: newMessage.createdAt }
            : c
        )
      )

      // Focus textarea again
      setTimeout(() => textareaRef.current?.focus(), 0)
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje',
        variant: 'destructive',
      })
    } finally {
      setIsSending(false)
    }
  }

  // Handle Enter key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle creating a new conversation
  const handleCreateConversation = async () => {
    if (!selectedStudent || isCreating) return

    try {
      setIsCreating(true)
      const res = await api.post('/messages/conversations', {
        participantId: selectedStudent,
      })

      const conv = res.data.data
      setShowNewConversationDialog(false)
      setSelectedStudent('')

      // Refresh conversations and select the new one
      await fetchConversations()
      handleSelectConversation(conv.id)
    } catch (error: any) {
      console.error('Error creating conversation:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear la conversaci\xc3\xb3n',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }

  // Handle opening the new conversation dialog
  const handleOpenNewConversationDialog = (open: boolean) => {
    setShowNewConversationDialog(open)
    if (open && students.length === 0) {
      fetchStudents()
    }
  }

  // Filtered conversations
  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      conv.title.toLowerCase().includes(query) ||
      conv.participants.some(
        (p) =>
          p.firstName.toLowerCase().includes(query) ||
          p.lastName.toLowerCase().includes(query)
      )
    )
  })

  // Get the other participant in a conversation
  const getOtherParticipant = (conv: Conversation | ConversationDetail): Participant | null => {
    return conv.participants[0] || null
  }

  // Total unread messages
  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* ============================================
          Sidebar - Conversation List
          ============================================ */}
      <Card className="w-80 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Mensajes</h2>
              {totalUnread > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {totalUnread}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenNewConversationDialog(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageCircle className="h-7 w-7 text-muted-foreground/60" />
              </div>
              <h3 className="text-sm font-semibold mb-1">
                {searchQuery ? 'Sin coincidencias' : 'A\xc3\xban no hay mensajes'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {searchQuery
                  ? 'Intenta con otro t\xc3\xa9rmino de b\xc3\xbasqueda'
                  : 'Inicia una nueva conversaci\xc3\xb3n con un estudiante'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv)
                const isActive = activeConversation?.id === conv.id
                const online = other ? isOnlineSimulated(other.id) : false

                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50 ${
                      isActive ? 'bg-muted' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={other?.avatarUrl || ''} />
                        <AvatarFallback>
                          {other ? getInitials(other.firstName, other.lastName) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online indicator */}
                      {online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold truncate">
                          {conv.title}
                        </p>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatTime(conv.updatedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="text-xs text-muted-foreground truncate">
                          {conv.lastMessage
                            ? conv.lastMessage.content
                            : 'Sin mensajes a\xc3\xban'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge
                            variant="default"
                            className="ml-2 flex-shrink-0 h-5 min-w-5 px-1 text-[10px] flex items-center justify-center"
                          >
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </Card>

      {/* ============================================
          Main Chat Area
          ============================================ */}
      <Card className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={getOtherParticipant(activeConversation)?.avatarUrl || ''}
                />
                <AvatarFallback>
                  {getOtherParticipant(activeConversation)
                    ? getInitials(
                        getOtherParticipant(activeConversation)!.firstName,
                        getOtherParticipant(activeConversation)!.lastName
                      )
                    : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{activeConversation.title}</p>
                {getOtherParticipant(activeConversation) && (
                  <p className="text-xs text-muted-foreground">
                    {isOnlineSimulated(getOtherParticipant(activeConversation)!.id)
                      ? 'En l\xc3\xadnea'
                      : 'Desconectado'}
                  </p>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation.messages.map((message) => {
                const otherId = activeConversation.participants.find(
                  (_, i) => i !== 0
                )?.id
                const isSentByMe = message.senderId !== otherId

                return (
                  <div
                    key={message.id}
                    className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="flex items-end gap-2 max-w-[70%]">
                      {/* Sender avatar (for received messages) */}
                      {!isSentByMe && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage
                            src={getOtherParticipant(activeConversation)?.avatarUrl || ''}
                          />
                          <AvatarFallback>
                            {getOtherParticipant(activeConversation)
                              ? getInitials(
                                  getOtherParticipant(activeConversation)!.firstName,
                                  getOtherParticipant(activeConversation)!.lastName
                                )
                              : '?'}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-2.5 ${
                          isSentByMe
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 ${
                            isSentByMe
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span className="text-[10px]">
                            {formatMessageTime(message.createdAt)}
                          </span>
                          {isSentByMe && (
                            message.isRead ? (
                              <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2 items-end">
                <Textarea
                  ref={textareaRef}
                  placeholder="Escribe un mensaje..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[44px] max-h-[120px] resize-none"
                  rows={1}
                  disabled={isSending}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || isSending}
                  className="h-11 w-11 flex-shrink-0"
                >
                  {isSending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Presiona Enter para enviar, Shift+Enter para nueva l\xc3\xadnea
              </p>
            </div>
          </>
        ) : (
          /* Empty State - No conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <MessageCircle className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Tus mensajes</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Selecciona una conversaci\xc3\xb3n de la barra lateral o inicia una nueva conversaci\xc3\xb3n con un estudiante
            </p>
            <Button onClick={() => handleOpenNewConversationDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva conversaci\xc3\xb3n
            </Button>
          </div>
        )}
      </Card>

      {/* ============================================
          New Conversation Dialog
          ============================================ */}
      <Dialog open={showNewConversationDialog} onOpenChange={handleOpenNewConversationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva conversaci\xc3\xb3n</DialogTitle>
            <DialogDescription>
              Inicia una nueva conversaci\xc3\xb3n con uno de tus estudiantes.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Selecciona un estudiante
            </label>
            {isFetchingStudents ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground/60 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No hay estudiantes disponibles
                </p>
              </div>
            ) : (
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige un estudiante..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={student.avatarUrl || ''} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(student.firstName, student.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        {student.firstName} {student.lastName}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowNewConversationDialog(false)
                setSelectedStudent('')
              }}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateConversation}
              disabled={!selectedStudent || isCreating}
            >
              {isCreating ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Iniciar conversaci\xc3\xb3n
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
