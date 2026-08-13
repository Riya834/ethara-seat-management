import { Router } from 'express';
import { getUtilizationDashboard, getNewJoinerPendingList } from '../controllers/analyticsController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

// Admin, HR, PM only
router.get('/dashboard', authorizeRoles('admin', 'hr', 'pm'), getUtilizationDashboard);
router.get('/new-joiners', authorizeRoles('admin', 'hr', 'pm'), getNewJoinerPendingList);

export default router;
