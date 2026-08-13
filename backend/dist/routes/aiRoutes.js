"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
// All roles can use AI assistant (role scoping enforced inside function layer)
router.post('/query', (0, auth_1.authorizeRoles)('admin', 'hr', 'pm', 'employee'), aiController_1.handleAIQuery);
exports.default = router;
