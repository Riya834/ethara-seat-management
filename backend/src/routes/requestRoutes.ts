import { Router } from 'express';
import {
  getSeatRequests,
  createSeatRequest,
  reviewSeatRequest
} from '../controllers/requestController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getSeatRequests);

// PM, HR, Admin can submit requests
router.post('/', authorizeRoles('admin', 'hr', 'pm'), createSeatRequest);

// ADMIN & HR ONLY can approve/reject PM requests
router.put('/:requestId/review', authorizeRoles('admin', 'hr'), reviewSeatRequest);

export default router;
