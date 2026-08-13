"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAIQuery = void 0;
const aiService_1 = require("../services/aiService");
const handleAIQuery = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ message: 'Prompt parameter is required.' });
        }
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const result = await (0, aiService_1.processAIQuery)(prompt, req.user.role, req.user.employeeId);
        return res.json({
            prompt,
            response: result.textResponse,
            toolCalled: result.toolCalled,
            toolResult: result.toolResult
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.handleAIQuery = handleAIQuery;
