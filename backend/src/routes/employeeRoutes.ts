import { Router } from 'express';
import {
  getEmployees,
  searchEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../controllers/employeeController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getEmployees);
router.get('/search', searchEmployees);
router.get('/:id', getEmployeeById);

// Admin & HR can create / update
router.post('/', authorizeRoles('admin', 'hr'), createEmployee);
router.put('/:id', authorizeRoles('admin', 'hr'), updateEmployee);

// Admin ONLY can delete employees
router.delete('/:id', authorizeRoles('admin'), deleteEmployee);

export default router;
