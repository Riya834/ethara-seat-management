"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
// Admin, HR, PM only
router.get('/dashboard', (0, auth_1.authorizeRoles)('admin', 'hr', 'pm'), analyticsController_1.getUtilizationDashboard);
router.get('/new-joiners', (0, auth_1.authorizeRoles)('admin', 'hr', 'pm'), analyticsController_1.getNewJoinerPendingList);
exports.default = router;
