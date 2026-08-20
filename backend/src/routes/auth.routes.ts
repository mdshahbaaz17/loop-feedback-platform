import { Router } from 'express';
import { signup, login, getMe, getWorkspaceUsers, createUser, updateUserRole } from '../controllers/auth.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getMe);

// Workspace user management (ADMIN only)
router.get('/users', authenticate, requireRole(['ADMIN']), getWorkspaceUsers);
router.post('/users', authenticate, requireRole(['ADMIN']), createUser);
router.patch('/users/:id/role', authenticate, requireRole(['ADMIN']), updateUserRole);

export default router;

