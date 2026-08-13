import { Router } from 'express';
import multer from 'multer';
import { bulkImportEmployees, getCSVTemplate } from '../controllers/importController';
import { authenticateJWT, authorizeRoles } from '../middleware/auth';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.use(authenticateJWT);

router.get('/template', getCSVTemplate);

// ADMIN & HR ONLY can perform bulk CSV import
router.post('/csv', authorizeRoles('admin', 'hr'), upload.single('file'), bulkImportEmployees);

export default router;
