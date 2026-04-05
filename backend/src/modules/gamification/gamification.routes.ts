import { Router } from 'express';
import { getProfile, getLeaderboard, getBadges } from './gamification.controller';
import { authenticate } from '../../shared/middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.get('/leaderboard', getLeaderboard);
router.get('/badges', getBadges);

export default router;
