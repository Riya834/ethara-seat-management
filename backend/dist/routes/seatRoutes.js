"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seatController_1 = require("../controllers/seatController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.get('/floors', seatController_1.getFloors);
router.get('/floors/:floorId/zones', seatController_1.getZonesByFloor);
router.get('/', seatController_1.getSeats);
// DIRECT SEAT ASSIGN/RELEASE/UPDATE - ADMIN & HR ONLY (PM gets 403 Forbidden!)
router.post('/assign', (0, auth_1.authorizeRoles)('admin', 'hr'), seatController_1.assignSeatDirect);
router.post('/:seatId/release', (0, auth_1.authorizeRoles)('admin', 'hr'), seatController_1.releaseSeatDirect);
router.patch('/:seatId/status', (0, auth_1.authorizeRoles)('admin', 'hr'), seatController_1.updateSeatStatus);
exports.default = router;
