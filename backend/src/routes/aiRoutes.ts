import { Router } from 'express';
import { handleAIQuery } from '../controllers/aiController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// All roles can use AI assistant (role scoping enforced inside function layer)
router.post('/query', authorizeRoles('admin', 'hr', 'pm', 'employee'), handleAIQuery);

export default router;
