import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DbService } from '../services/dbService';
import { sendSuccess, sendError } from '../utils/response';

export class ReviewController {
  static async getProductReviews(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const reviews = await DbService.getProductReviews(productId);
      return sendSuccess(res, 'Reviews retrieved.', { reviews });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async createReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { productId, rating, title, comment, photos = [] } = req.body;

      if (!productId || !rating || !title || !comment) {
        return sendError(res, 'Product ID, rating (1-5), title, and review comment are required.', 400);
      }

      const numRating = Number(rating);
      if (numRating < 1 || numRating > 5) {
        return sendError(res, 'Rating must be an integer between 1 and 5.', 400);
      }

      const product = await DbService.getProductBySlugOrId(productId);
      if (!product) {
        return sendError(res, 'Product not found.', 404);
      }

      const user = await DbService.findUserById(req.user!.userId);
      if (!user) {
        return sendError(res, 'User not found.', 404);
      }

      // Mandatory security check: The backend determines verified purchase from actual order history
      const hasPurchased = await DbService.hasUserPurchasedProduct(req.user!.userId, String(product._id));

      const review = await DbService.createReview({
        productId: String(product._id),
        userId: req.user!.userId,
        userName: user.name,
        rating: numRating,
        title: title.trim(),
        comment: comment.trim(),
        photos,
        verifiedPurchase: hasPurchased,
      });

      return sendSuccess(res, 'Your review has been published.', { review }, 201);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
