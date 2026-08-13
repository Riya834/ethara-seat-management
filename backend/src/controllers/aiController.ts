import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { processAIQuery } from '../services/aiService';

export const handleAIQuery = async (req: AuthRequest, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Prompt parameter is required.' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const result = await processAIQuery(prompt, req.user.role, req.user.employeeId);

    return res.json({
      prompt,
      response: result.textResponse,
      toolCalled: result.toolCalled,
      toolResult: result.toolResult
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
