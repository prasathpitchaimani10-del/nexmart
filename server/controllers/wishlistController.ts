import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DbService } from '../services/dbService';
import { sendSuccess, sendError } from '../utils/response';

export class WishlistController {
  static async getWishlist(req: AuthenticatedRequest, res: Response) {
    try {
      const wishlist = await DbService.getWishlist(req.user!.userId);
      const productIds = wishlist.products || [];

      const populated = [];
      for (const id of productIds) {
        const p = await DbService.getProductBySlugOrId(id);
        if (p && p.isActive) populated.push(p);
      }

      return sendSuccess(res, 'Wishlist retrieved.', {
        products: populated,
        count: populated.length,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async toggleWishlist(req: AuthenticatedRequest, res: Response) {
    try {
      const { productId } = req.body;
      if (!productId) return sendError(res, 'Product ID is required.', 400);

      const product = await DbService.getProductBySlugOrId(productId);
      if (!product) return sendError(res, 'Product not found.', 404);

      const wishlist = await DbService.getWishlist(req.user!.userId);
      let products: string[] = wishlist.products || [];

      const exists = products.some((id) => String(id) === String(product._id));
      let action = 'added';

      if (exists) {
        products = products.filter((id) => String(id) !== String(product._id));
        action = 'removed';
      } else {
        products.push(String(product._id));
      }

      await DbService.updateWishlist(req.user!.userId, products);
      return sendSuccess(res, `Product ${action} to wishlist.`, {
        isWishlisted: !exists,
        count: products.length,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
