import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DbService } from '../services/dbService';
import { CloudinaryService } from '../services/cloudinaryService';
import { sendSuccess, sendError } from '../utils/response';

export class AdminController {
  static async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const [allProductsResult, allOrdersResult, allUsersResult] = await Promise.all([
        DbService.getProducts({ activeOnly: false, limit: 1000 }),
        DbService.getAllOrders({ limit: 1000 }),
        DbService.getAllUsers({ role: 'customer', limit: 1000 }),
      ]);

      const products = allProductsResult.products;
      const orders = allOrdersResult.orders;
      const customersCount = allUsersResult.total;

      const totalRevenue = orders
        .filter((o) => o.paymentStatus === 'completed' || o.orderStatus === 'delivered')
        .reduce((sum, o) => sum + (o.pricing?.total || 0), 0);

      const pendingOrders = orders.filter((o) => ['pending', 'confirmed', 'processing'].includes(o.orderStatus)).length;
      const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered').length;
      const lowStockProducts = products.filter((p) => p.stock <= 10);

      const recentOrders = orders.slice(0, 6);

      return sendSuccess(res, 'Dashboard statistics compiled.', {
        totalCustomers: customersCount,
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders,
        deliveredOrders,
        revenue: totalRevenue,
        lowStockCount: lowStockProducts.length,
        lowStockProducts: lowStockProducts.map((p) => ({
          id: p._id,
          name: p.name,
          sku: p.sku,
          stock: p.stock,
        })),
        recentOrders,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  // PRODUCTS
  static async createProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        name,
        description,
        category,
        subcategory,
        brand,
        sku,
        stock,
        price,
        originalPrice,
        images = [],
        video,
        specifications = [],
        variants = [],
        isFeatured,
        isTrending,
        isNewArrival,
      } = req.body;

      if (!name || !description || !category || !price || !sku) {
        return sendError(res, 'Name, description, category, price, and SKU are required.', 400);
      }

      // Generate SEO slug
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const existingSlug = await DbService.getProductBySlugOrId(slug);
      const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

      // Handle image uploads if base64 provided
      const processedImages = [];
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (typeof img === 'string' && img.startsWith('data:image')) {
          const upload = await CloudinaryService.uploadMedia(img);
          processedImages.push({
            url: upload.url,
            publicId: upload.publicId,
            isMain: i === 0,
          });
        } else if (typeof img === 'object') {
          processedImages.push(img);
        } else {
          processedImages.push({ url: img, isMain: i === 0 });
        }
      }

      const discountPercentage =
        originalPrice && Number(originalPrice) > Number(price)
          ? Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)
          : 0;

      const product = await DbService.createProduct({
        name: name.trim(),
        slug: finalSlug,
        description: description.trim(),
        category: category.trim(),
        subcategory: subcategory ? subcategory.trim() : category.trim(),
        brand: (brand || 'NexMart Originals').trim(),
        sku: sku.trim().toUpperCase(),
        stock: Number(stock) || 0,
        pricing: {
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : Number(price),
          discountPercentage,
        },
        images: processedImages.length > 0 ? processedImages : [
          { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', isMain: true },
        ],
        video: video || '',
        specifications,
        variants,
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isNewArrival: Boolean(isNewArrival),
        isActive: true,
      });

      return sendSuccess(res, 'Product created successfully.', { product }, 201);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async updateProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (updates.price || updates.originalPrice) {
        const current = await DbService.getProductBySlugOrId(id);
        const newPrice = updates.price !== undefined ? Number(updates.price) : current?.pricing.price;
        const newOriginal =
          updates.originalPrice !== undefined ? Number(updates.originalPrice) : current?.pricing.originalPrice;
        const discountPercentage =
          newOriginal && newOriginal > newPrice
            ? Math.round(((newOriginal - newPrice) / newOriginal) * 100)
            : 0;

        updates.pricing = {
          price: newPrice,
          originalPrice: newOriginal,
          discountPercentage,
        };
        delete updates.price;
        delete updates.originalPrice;
      }

      const updated = await DbService.updateProduct(id, updates);
      if (!updated) return sendError(res, 'Product not found.', 404);

      return sendSuccess(res, 'Product updated successfully.', { product: updated });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async deleteProduct(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const success = await DbService.deleteProduct(id);
      if (!success) return sendError(res, 'Product not found.', 404);
      return sendSuccess(res, 'Product deleted.');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  // ORDERS
  static async getAllOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, search, page, limit } = req.query;
      const result = await DbService.getAllOrders({
        status: status as string,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 15,
      });

      return sendSuccess(res, 'All orders retrieved.', result.orders, 200, {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async updateOrderStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;

      const order = await DbService.getOrderById(id);
      if (!order) return sendError(res, 'Order not found.', 404);

      const statusNotes: Record<string, string> = {
        confirmed: 'Order confirmed and verified by fulfillment team.',
        processing: 'Items picked and packed at regional distribution center.',
        shipped: 'Handed over to carrier for linehaul transit.',
        out_for_delivery: 'Dispatched with local delivery agent for doorstep delivery.',
        delivered: 'Package successfully delivered to recipient.',
        cancelled: 'Order cancelled by administrative control.',
      };

      const newEvent = {
        status,
        timestamp: new Date(),
        note: note || statusNotes[status] || `Status updated to ${status}`,
      };

      const updates: any = {
        orderStatus: status,
        trackingHistory: [...order.trackingHistory, newEvent],
      };

      // If COD order marked delivered, update payment to completed
      if (status === 'delivered' && order.paymentMethod === 'cod') {
        updates.paymentStatus = 'completed';
        updates.paymentDetails = {
          ...order.paymentDetails,
          paidAt: new Date(),
        };
      }

      const updated = await DbService.updateOrder(id, updates);

      // Notify customer
      await DbService.createNotification({
        userId: String(order.customer.id),
        title: `Order Update: ${status.replace(/_/g, ' ').toUpperCase()}`,
        message: `Your order #${order.orderNumber} is now: ${status.replace(/_/g, ' ')}.`,
        type: 'order',
        link: `/orders/${order._id}`,
      });

      return sendSuccess(res, 'Order status updated successfully.', { order: updated });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async handleReturnRequest(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { action, note } = req.body; // 'approve' | 'reject'

      const order = await DbService.getOrderById(id);
      if (!order) return sendError(res, 'Order not found.', 404);

      const isApprove = action === 'approve';
      const updates: any = {
        orderStatus: isApprove ? 'refund_initiated' : 'delivered',
        returnDetails: {
          ...order.returnDetails,
          status: isApprove ? 'approved' : 'rejected',
        },
        trackingHistory: [
          ...order.trackingHistory,
          {
            status: isApprove ? 'refund_initiated' : 'delivered',
            timestamp: new Date(),
            note: note || (isApprove ? 'Return request approved by admin.' : 'Return request declined.'),
          },
        ],
      };

      if (isApprove) {
        updates.paymentStatus = 'refunded';
        updates.refundDetails = {
          amount: order.pricing.total,
          reason: 'Return approved',
          refundId: `RFND-${Date.now()}`,
          refundedAt: new Date(),
          status: 'processed',
        };
      }

      const updated = await DbService.updateOrder(id, updates);

      await DbService.createNotification({
        userId: String(order.customer.id),
        title: `Return Request ${isApprove ? 'Approved' : 'Declined'}`,
        message: `Your return request for order #${order.orderNumber} has been ${isApprove ? 'approved' : 'declined'}.`,
        type: 'order',
        link: `/orders/${order._id}`,
      });

      return sendSuccess(res, `Return request ${action}d successfully.`, { order: updated });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  // CUSTOMERS
  static async getAllCustomers(req: AuthenticatedRequest, res: Response) {
    try {
      const { search, page, limit } = req.query;
      const result = await DbService.getAllUsers({
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      return sendSuccess(res, 'Customers retrieved.', result.users, 200, {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async toggleCustomerActive(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = await DbService.findUserById(id);
      if (!user) return sendError(res, 'Customer not found.', 404);

      const updated = await DbService.updateUser(id, { isActive: !user.isActive });
      return sendSuccess(res, `Customer account ${updated.isActive ? 'activated' : 'deactivated'}.`, {
        isActive: updated.isActive,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  // COUPONS
  static async getAllCoupons(req: AuthenticatedRequest, res: Response) {
    try {
      const coupons = await DbService.getAllCoupons(true);
      return sendSuccess(res, 'All coupons retrieved.', { coupons });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async createCoupon(req: AuthenticatedRequest, res: Response) {
    try {
      const { code, description, discountType, discountValue, minPurchase, maxDiscount, usageLimit, expiresAt } =
        req.body;

      if (!code || !description || !discountType || discountValue === undefined || !expiresAt) {
        return sendError(res, 'Code, description, type, value, and expiry date are required.', 400);
      }

      const existing = await DbService.getCouponByCode(code);
      if (existing) {
        return sendError(res, 'A coupon with this code already exists.', 409);
      }

      const coupon = await DbService.createCoupon({
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        minPurchase: Number(minPurchase) || 0,
        maxDiscount: Number(maxDiscount) || 0,
        usageLimit: Number(usageLimit) || 1000,
        expiresAt: new Date(expiresAt),
        isActive: true,
      });

      return sendSuccess(res, 'Coupon created successfully.', { coupon }, 201);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async updateCoupon(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      if (updates.code) updates.code = updates.code.trim().toUpperCase();

      const updated = await DbService.updateCoupon(id, updates);
      if (!updated) return sendError(res, 'Coupon not found.', 404);

      return sendSuccess(res, 'Coupon updated successfully.', { coupon: updated });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  // QUESTIONS
  static async getAllQuestions(req: AuthenticatedRequest, res: Response) {
    try {
      const questions = await DbService.getAllQuestions();
      return sendSuccess(res, 'Questions retrieved.', { questions });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async answerQuestion(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { answer } = req.body;
      if (!answer || !answer.trim()) {
        return sendError(res, 'Answer text is required.', 400);
      }

      const updated = await DbService.answerQuestion(id, answer.trim());
      if (!updated) return sendError(res, 'Question not found.', 404);

      return sendSuccess(res, 'Answer published successfully.', { question: updated });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  // REVIEWS
  static async getAllReviews(req: AuthenticatedRequest, res: Response) {
    try {
      const reviews = await DbService.getAllReviews();
      return sendSuccess(res, 'Reviews retrieved.', { reviews });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async deleteReview(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const success = await DbService.deleteReview(id);
      if (!success) return sendError(res, 'Review not found.', 404);
      return sendSuccess(res, 'Review deleted.');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
