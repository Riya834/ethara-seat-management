"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Zone = exports.Floor = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const FloorSchema = new mongoose_1.Schema({
    floorNumber: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    building: { type: String, required: true, default: 'Ethara HQ - Tower A' }
}, { timestamps: true });
exports.Floor = mongoose_1.default.model('Floor', FloorSchema);
const ZoneSchema = new mongoose_1.Schema({
    floorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Floor', required: true },
    zoneName: { type: String, required: true },
    capacity: { type: Number, required: true, default: 40 }
}, { timestamps: true });
ZoneSchema.index({ floorId: 1, zoneName: 1 }, { unique: true });
exports.Zone = mongoose_1.default.model('Zone', ZoneSchema);
