import { Request, Response } from 'express';
import { DbService } from '../services/dbService';
import { sendSuccess, sendError } from '../utils/response';

export class ProductController {
  static async getProducts(req: Request, res: Response) {
    try {
      const {
        search,
        category,
        subcategory,
        brand,
        minPrice,
        maxPrice,
        rating,
        inStock,
        sort,
        page,
        limit,
        featured,
        trending,
        newArrival,
      } = req.query;

      const result = await DbService.getProducts({
        search: search as string,
        category: category as string,
        subcategory: subcategory as string,
        brand: brand as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        rating: rating ? Number(rating) : undefined,
        inStock: inStock === 'true',
        sort: sort as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 12,
        featured: featured === 'true',
        trending: trending === 'true',
        newArrival: newArrival === 'true',
        activeOnly: true,
      });

      return sendSuccess(res, 'Products retrieved successfully.', result.products, 200, {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch products.', 500);
    }
  }

  static async getProductBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const product = await DbService.getProductBySlugOrId(slug);
      if (!product) {
        return sendError(res, 'Product not found.', 404);
      }

      const reviews = await DbService.getProductReviews(String(product._id));
      const questions = await DbService.getProductQuestions(String(product._id));

      return sendSuccess(res, 'Product details retrieved.', {
        product,
        reviews,
        questions,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getSearchSuggestions(req: Request, res: Response) {
    try {
      const query = (req.query.q as string || '').toLowerCase().trim();
      if (!query || query.length < 2) {
        return sendSuccess(res, 'Suggestions retrieved.', { suggestions: [] });
      }

      const productsResult = await DbService.getProducts({ search: query, limit: 6 });
      const categories = await DbService.getCategories();

      const productSuggestions = productsResult.products.map((p: any) => ({
        type: 'product',
        title: p.name,
        slug: p.slug,
        category: p.category,
        price: p.pricing.price,
        image: p.images?.[0]?.url || '',
      }));

      const categorySuggestions = categories
        .filter((c: any) => c.name.toLowerCase().includes(query) || c.subcategories?.some((s: string) => s.toLowerCase().includes(query)))
        .map((c: any) => ({
          type: 'category',
          title: c.name,
          slug: c.slug,
        }));

      return sendSuccess(res, 'Suggestions retrieved.', {
        suggestions: [...categorySuggestions, ...productSuggestions].slice(0, 8),
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async checkDeliveryAvailability(req: Request, res: Response) {
    try {
      const { pincode } = req.query;
      if (!pincode || typeof pincode !== 'string') {
        return sendError(res, 'Pincode is required.', 400);
      }

      const cleanPin = pincode.trim();
      // Valid Indian 6-digit postal code check
      const isValidFormat = /^[1-9][0-9]{5}$/.test(cleanPin);
      if (!isValidFormat) {
        return sendSuccess(res, 'Invalid pincode format.', {
          serviceable: false,
          message: 'Please enter a valid 6-digit postal code.',
        });
      }

      // Calculate realistic delivery schedule
      const today = new Date();
      const standardDate = new Date(today);
      standardDate.setDate(today.getDate() + 3);

      const expressDate = new Date(today);
      expressDate.setDate(today.getDate() + 1);

      return sendSuccess(res, 'Delivery is serviceable.', {
        serviceable: true,
        pincode: cleanPin,
        standardDelivery: {
          estimatedDate: standardDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          fee: 'FREE on orders over ₹1,000 (otherwise ₹99)',
        },
        expressDelivery: {
          estimatedDate: expressDate.toLocaleDateString('en-IN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          }),
          fee: '₹150 Next-Day Priority Delivery',
        },
        codAvailable: true,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async compareProducts(req: Request, res: Response) {
    try {
      const idsParam = req.query.ids as string;
      if (!idsParam) {
        return sendError(res, 'Please provide product IDs to compare.', 400);
      }

      const ids = idsParam.split(',').filter(Boolean).slice(0, 4); // max 4 products
      if (ids.length < 2) {
        return sendError(res, 'At least 2 products are required for comparison.', 400);
      }

      const products = [];
      for (const id of ids) {
        const p = await DbService.getProductBySlugOrId(id);
        if (p) products.push(p);
      }

      // Extract unique spec keys across all compared products
      const specKeysSet = new Set<string>();
      products.forEach((p) => {
        p.specifications?.forEach((s: any) => specKeysSet.add(s.key));
      });

      return sendSuccess(res, 'Product comparison data compiled.', {
        products,
        specificationKeys: Array.from(specKeysSet),
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
