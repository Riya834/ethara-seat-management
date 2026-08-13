import { Router } from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  reserveProjectBlock,
  addProjectMembers,
  removeProjectMember
} from '../controllers/projectController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getProjects);
router.get('/:id', getProjectById);

// Admin, HR, and PM can manage projects & team members
router.post('/', authorizeRoles('admin', 'hr'), createProject);
router.post('/reserve-block', authorizeRoles('admin', 'hr'), reserveProjectBlock);
router.post('/:id/members', authorizeRoles('admin', 'hr', 'pm'), addProjectMembers);
router.delete('/:id/members/:employeeId', authorizeRoles('admin', 'hr', 'pm'), removeProjectMember);

export default router;
