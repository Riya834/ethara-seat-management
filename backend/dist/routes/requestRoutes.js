"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const requestController_1 = require("../controllers/requestController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.get('/', requestController_1.getSeatRequests);
// PM, HR, Admin can submit requests
router.post('/', (0, auth_1.authorizeRoles)('admin', 'hr', 'pm'), requestController_1.createSeatRequest);
// ADMIN & HR ONLY can approve/reject PM requests
router.put('/:requestId/review', (0, auth_1.authorizeRoles)('admin', 'hr'), requestController_1.reviewSeatRequest);
exports.default = router;
