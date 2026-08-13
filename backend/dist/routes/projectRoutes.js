"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.get('/', projectController_1.getProjects);
router.get('/:id', projectController_1.getProjectById);
// Admin, HR, and PM can manage projects & team members
router.post('/', (0, auth_1.authorizeRoles)('admin', 'hr'), projectController_1.createProject);
router.post('/reserve-block', (0, auth_1.authorizeRoles)('admin', 'hr'), projectController_1.reserveProjectBlock);
router.post('/:id/members', (0, auth_1.authorizeRoles)('admin', 'hr', 'pm'), projectController_1.addProjectMembers);
router.delete('/:id/members/:employeeId', (0, auth_1.authorizeRoles)('admin', 'hr', 'pm'), projectController_1.removeProjectMember);
exports.default = router;
