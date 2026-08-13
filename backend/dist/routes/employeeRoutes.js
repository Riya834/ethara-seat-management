"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const employeeController_1 = require("../controllers/employeeController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.get('/', employeeController_1.getEmployees);
router.get('/search', employeeController_1.searchEmployees);
router.get('/:id', employeeController_1.getEmployeeById);
// Admin & HR can create, update, and delete employees
router.post('/', (0, auth_1.authorizeRoles)('admin', 'hr'), employeeController_1.createEmployee);
router.put('/:id', (0, auth_1.authorizeRoles)('admin', 'hr'), employeeController_1.updateEmployee);
router.delete('/:id', (0, auth_1.authorizeRoles)('admin', 'hr'), employeeController_1.deleteEmployee);
exports.default = router;
