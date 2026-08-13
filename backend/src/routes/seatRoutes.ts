import { Router } from 'express';
import {
  getFloors,
  getZonesByFloor,
  getSeats,
  assignSeatDirect,
  releaseSeatDirect,
  updateSeatStatus
} from '../controllers/seatController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/floors', getFloors);
router.get('/floors/:floorId/zones', getZonesByFloor);
router.get('/', getSeats);

// DIRECT SEAT ASSIGN/RELEASE/UPDATE - ADMIN & HR ONLY (PM gets 403 Forbidden!)
router.post('/assign', authorizeRoles('admin', 'hr'), assignSeatDirect);
router.post('/:seatId/release', authorizeRoles('admin', 'hr'), releaseSeatDirect);
router.patch('/:seatId/status', authorizeRoles('admin', 'hr'), updateSeatStatus);

export default router;
