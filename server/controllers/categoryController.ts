import { Request, Response } from 'express';
import { DbService } from '../services/dbService';
import { sendSuccess, sendError } from '../utils/response';

export class CategoryController {
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await DbService.getCategories();
      return sendSuccess(res, 'Categories retrieved.', { categories });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getCategoryBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const category = await DbService.getCategoryBySlug(slug);
      if (!category) {
        return sendError(res, 'Category not found.', 404);
      }

      const productsResult = await DbService.getProducts({
        category: category.name,
        limit: 20,
      });

      return sendSuccess(res, 'Category details retrieved.', {
        category,
        products: productsResult.products,
        totalProducts: productsResult.total,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
