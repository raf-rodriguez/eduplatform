import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { asyncHandler, AppError } from '../../shared/middleware/errorHandler';

// List user's conversations
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          isRead: false,
        },
      });

      const otherParticipant = conv.participants.find(
        (p) => p.userId !== userId
      );

      return {
        id: conv.id,
        title: conv.title || (otherParticipant?.user
          ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
          : 'Conversation'),
        type: conv.type,
        lastMessage: conv.messages[0] || null,
        unreadCount,
        updatedAt: conv.updatedAt,
        participants: conv.participants.map((p) => ({
          id: p.user.id,
          firstName: p.user.firstName,
          lastName: p.user.lastName,
          avatarUrl: p.user.avatarUrl,
          lastReadAt: p.lastReadAt,
        })),
      };
    })
  );

  res.json({
    success: true,
    data: conversationsWithUnread,
  });
});

// Create new conversation
export const createConversation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { participantId, title, type = 'direct' } = req.body;

  if (!participantId) {
    throw new AppError('participantId is required', 400);
  }

  // Check if direct conversation already exists between these two users
  if (type === 'direct') {
    const allConvs = await prisma.conversation.findMany({
      where: {
        type: 'direct',
        participants: {
          some: { userId },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    const existing = allConvs.find((conv) => {
      const participantIds = conv.participants.map((p) => p.userId).sort();
      const expectedIds = [userId, participantId].sort();
      return (
        participantIds.length === 2 &&
        participantIds[0] === expectedIds[0] &&
        participantIds[1] === expectedIds[1]
      );
    });

    if (existing) {
      return res.json({
        success: true,
        data: existing,
        message: 'Conversation already exists',
      });
    }
  }

  // Verify participant exists
  const participant = await prisma.user.findUnique({
    where: { id: participantId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
    },
  });

  if (!participant) {
    throw new AppError('Participant not found', 404);
  }

  const conversation = await prisma.conversation.create({
    data: {
      title: title || null,
      type,
      participants: {
        create: [
          { userId },
          { userId: participantId },
        ],
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    data: conversation,
  });
});

// Get conversation with messages
export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;
  const page = parseInt(req.query.page as string || '1');
  const limit = parseInt(req.query.limit as string || '50');

  // Verify user is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  const isParticipant = conversation.participants.some(
    (p) => p.userId === userId
  );

  if (!isParticipant) {
    throw new AppError('Access denied', 403);
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.message.count({
      where: { conversationId: id },
    }),
  ]);

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  // Update participant's lastReadAt
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: id,
      userId,
    },
    data: { lastReadAt: new Date() },
  });

  const otherParticipant = conversation.participants.find(
    (p) => p.userId !== userId
  );

  res.json({
    success: true,
    data: {
      id: conversation.id,
      title: conversation.title || (otherParticipant?.user
        ? `${otherParticipant.user.firstName} ${otherParticipant.user.lastName}`
        : 'Conversation'),
      type: conversation.type,
      participants: conversation.participants.map((p) => ({
        id: p.user.id,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        avatarUrl: p.user.avatarUrl,
      })),
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

// Send message
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;
  const { content, type = 'text', attachments } = req.body;

  if (!content || content.trim().length === 0) {
    throw new AppError('Message content is required', 400);
  }

  // Verify user is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: true,
    },
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  const isParticipant = conversation.participants.some(
    (p) => p.userId === userId
  );

  if (!isParticipant) {
    throw new AppError('Access denied', 403);
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: userId,
      content: content.trim(),
      type,
      attachments: attachments || null,
    },
  });

  // Update conversation updatedAt
  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  res.status(201).json({
    success: true,
    data: message,
  });
});

// Mark conversation as read
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.user!.id;

  // Verify user is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { participants: true },
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404);
  }

  const isParticipant = conversation.participants.some(
    (p) => p.userId === userId
  );

  if (!isParticipant) {
    throw new AppError('Access denied', 403);
  }

  // Mark all messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  });

  // Update participant's lastReadAt
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: id,
      userId,
    },
    data: { lastReadAt: new Date() },
  });

  res.json({
    success: true,
    message: 'Conversation marked as read',
  });
});
