import { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { asyncHandler } from '../../shared/middleware/errorHandler';

// Get user gamification profile
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const profile = await prisma.gamificationProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          userBadges: {
            include: {
              badge: true,
            },
            orderBy: {
              earnedAt: 'desc',
            },
            take: 10,
          },
        },
      },
    },
  });

  // Get XP for next level
  const levels = [
    { level: 1, xp: 0 },
    { level: 2, xp: 100 },
    { level: 3, xp: 300 },
    { level: 4, xp: 600 },
    { level: 5, xp: 1000 },
    { level: 6, xp: 2000 },
    { level: 7, xp: 4000 },
    { level: 8, xp: 8000 },
    { level: 9, xp: 15000 },
    { level: 10, xp: 30000 },
  ];

  const currentLevel = levels.find((l) => l.level === (profile?.level || 1));
  const nextLevel = levels.find((l) => l.level === ((profile?.level || 1) + 1));

  res.json({
    success: true,
    data: {
      profile,
      xpForNextLevel: nextLevel?.xp || null,
      xpProgress: nextLevel
        ? ((profile?.totalXp || 0) - (currentLevel?.xp || 0)) /
          ((nextLevel?.xp || 0) - (currentLevel?.xp || 0))
        : 1,
      recentBadges: profile?.user.userBadges || [],
    },
  });
});

// Get leaderboard
export const getLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const { scope = 'global', period = 'allTime' } = req.query;

  const leaderboard = await prisma.gamificationProfile.findMany({
    take: 100,
    orderBy: {
      totalXp: 'desc',
    },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
        },
      },
    },
  });

  const ranked = leaderboard.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    name: `${entry.user.firstName} ${entry.user.lastName}`,
    avatarUrl: entry.user.avatarUrl,
    level: entry.level,
    totalXp: entry.totalXp,
    currentStreak: entry.currentStreak,
  }));

  res.json({
    success: true,
    data: ranked,
  });
});

// Get all badges
export const getBadges = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const badges = await prisma.badge.findMany({
    where: { isActive: true },
    orderBy: { xpValue: 'desc' },
    include: {
      userBadges: {
        where: { userId },
      },
    },
  });

  const withStatus = badges.map((badge) => ({
    ...badge,
    earned: badge.userBadges.length > 0,
    earnedAt: badge.userBadges[0]?.earnedAt || null,
  }));

  res.json({
    success: true,
    data: withStatus,
  });
});

// Award XP (internal use)
export const awardXP = async (userId: string, amount: number, source: string) => {
  // Create XP log
  await prisma.xpLog.create({
    data: {
      userId,
      amount,
      source,
    },
  });

  // Update profile
  const profile = await prisma.gamificationProfile.update({
    where: { userId },
    data: {
      totalXp: { increment: amount },
      lastActivityAt: new Date(),
    },
  });

  // Check for level up
  const levels = [
    { level: 1, xp: 0 },
    { level: 2, xp: 100 },
    { level: 3, xp: 300 },
    { level: 4, xp: 600 },
    { level: 5, xp: 1000 },
    { level: 6, xp: 2000 },
    { level: 7, xp: 4000 },
    { level: 8, xp: 8000 },
    { level: 9, xp: 15000 },
    { level: 10, xp: 30000 },
  ];

  const newLevel = levels.reduce((acc, curr) => {
    if (profile.totalXp >= curr.xp) {
      return curr.level;
    }
    return acc;
  }, 1);

  if (newLevel > profile.level) {
    await prisma.gamificationProfile.update({
      where: { userId },
      data: { level: newLevel },
    });

    return { leveledUp: true, newLevel };
  }

  return { leveledUp: false };
};
