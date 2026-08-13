"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const importController_1 = require("../controllers/importController");
const auth_1 = require("../middleware/auth");
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
router.use(auth_1.authenticateJWT);
router.get('/template', importController_1.getCSVTemplate);
// ADMIN & HR ONLY can perform bulk CSV import
router.post('/csv', (0, auth_1.authorizeRoles)('admin', 'hr'), upload.single('file'), importController_1.bulkImportEmployees);
exports.default = router;
