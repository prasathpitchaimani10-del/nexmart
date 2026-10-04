import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DbService } from '../services/dbService';
import { sendSuccess, sendError } from '../utils/response';

export class QuestionController {
  static async getProductQuestions(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const questions = await DbService.getProductQuestions(productId);
      return sendSuccess(res, 'Questions retrieved.', { questions });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async askQuestion(req: AuthenticatedRequest, res: Response) {
    try {
      const { productId, question } = req.body;
      if (!productId || !question || !question.trim()) {
        return sendError(res, 'Product ID and question text are required.', 400);
      }

      const product = await DbService.getProductBySlugOrId(productId);
      if (!product) {
        return sendError(res, 'Product not found.', 404);
      }

      const user = await DbService.findUserById(req.user!.userId);
      if (!user) {
        return sendError(res, 'User not found.', 404);
      }

      const q = await DbService.createQuestion({
        productId: String(product._id),
        userId: req.user!.userId,
        userName: user.name,
        question: question.trim(),
      });

      return sendSuccess(res, 'Question submitted. It will appear with verified answers shortly.', { question: q }, 201);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
