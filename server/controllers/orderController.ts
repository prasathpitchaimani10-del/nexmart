import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DbService } from '../services/dbService';
import { OrderService } from '../services/orderService';
import { sendSuccess, sendError } from '../utils/response';

export class OrderController {
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        items,
        address,
        deliveryMethod,
        couponCode,
        paymentMethod,
        paymentDetails,
        clearCartOnSuccess = true,
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return sendError(res, 'At least one item is required to place an order.', 400);
      }

      if (!address || !address.name || !address.phone || !address.street || !address.city || !address.pincode) {
        return sendError(res, 'Valid delivery address snapshot is required.', 400);
      }

      if (!paymentMethod) {
        return sendError(res, 'Payment method is required.', 400);
      }

      // Authoritative order creation with revalidation and stock deduction
      const order = await OrderService.createOrder({
        customerId: req.user!.userId,
        items,
        address,
        deliveryMethod,
        couponCode,
        paymentMethod,
        paymentDetails,
      });

      // Clear purchased items from user's cart
      if (clearCartOnSuccess) {
        try {
          const cart = await DbService.getCart(req.user!.userId);
          const remainingItems = (cart.items || []).filter((cartItem: any) => {
            return !items.some(
              (orderItem: any) =>
                String(orderItem.productId) === String(cartItem.product) &&
                (orderItem.variantSku || '') === (cartItem.variantSku || '')
            );
          });
          await DbService.updateCart(req.user!.userId, remainingItems);
        } catch (e) {
          console.warn('[Cart] Post-order cart sync warning:', e);
        }
      }

      return sendSuccess(res, 'Order placed successfully!', { order }, 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Order creation failed.', 400);
    }
  }

  static async getMyOrders(req: AuthenticatedRequest, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const result = await DbService.getOrdersByCustomer(req.user!.userId, page, limit);

      return sendSuccess(res, 'Orders retrieved.', result.orders, 200, {
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getOrderById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const order = await DbService.getOrderById(id);

      if (!order) {
        return sendError(res, 'Order not found.', 404);
      }

      // Customer authorization check: customer can only view their own order
      if (req.user!.role !== 'admin' && String(order.customer.id) !== String(req.user!.userId)) {
        return sendError(res, 'Unauthorized to view this order.', 403);
      }

      return sendSuccess(res, 'Order details retrieved.', { order });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async cancelOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reason = 'Cancelled by customer' } = req.body;

      const updated = await OrderService.cancelOrder(id, req.user!.userId, reason);
      return sendSuccess(res, 'Order has been successfully cancelled.', { order: updated });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async requestReturn(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { reason, description, images = [] } = req.body;

      if (!reason || !description) {
        return sendError(res, 'Return reason and description are mandatory.', 400);
      }

      const updated = await OrderService.requestReturn(
        id,
        req.user!.userId,
        reason,
        description,
        images
      );

      return sendSuccess(res, 'Return/Replacement request submitted successfully.', { order: updated });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  static async reorder(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const order = await DbService.getOrderById(id);

      if (!order) {
        return sendError(res, 'Order not found.', 404);
      }

      if (String(order.customer.id) !== String(req.user!.userId)) {
        return sendError(res, 'Unauthorized.', 403);
      }

      const availableItems = [];
      const unavailableItems = [];

      for (const item of order.items) {
        const product = await DbService.getProductBySlugOrId(item.product);
        if (!product || !product.isActive || product.stock < item.quantity) {
          unavailableItems.push(item.productName);
        } else {
          availableItems.push({
            product: String(product._id),
            variantSku: item.variantSku,
            quantity: item.quantity,
          });
        }
      }

      if (availableItems.length === 0) {
        return sendError(res, 'None of the items from this order are currently available in stock.', 400);
      }

      // Merge into customer's active cart
      const cart = await DbService.getCart(req.user!.userId);
      const currentItems = [...(cart.items || [])];

      for (const item of availableItems) {
        const idx = currentItems.findIndex(
          (ci) => String(ci.product) === item.product && (ci.variantSku || '') === (item.variantSku || '')
        );
        if (idx > -1) {
          currentItems[idx].quantity += item.quantity;
        } else {
          currentItems.push(item);
        }
      }

      await DbService.updateCart(req.user!.userId, currentItems);

      return sendSuccess(res, 'Items added to cart for reorder.', {
        reorderedCount: availableItems.length,
        unavailableItems,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getInvoice(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const order = await DbService.getOrderById(id);

      if (!order) {
        return sendError(res, 'Order not found.', 404);
      }

      if (req.user!.role !== 'admin' && String(order.customer.id) !== String(req.user!.userId)) {
        return sendError(res, 'Unauthorized.', 403);
      }

      const invoiceData = {
        invoiceNumber: order.invoiceNumber,
        invoiceDate: order.createdAt,
        seller: {
          name: 'NexMart Retail Technologies Pvt Ltd',
          gstin: '29ABCDE1234F1Z5',
          address: '42 Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka, 560103',
          supportEmail: 'support@nexmart.com',
        },
        customer: order.customer,
        shippingAddress: order.address,
        orderNumber: order.orderNumber,
        paymentMethod: order.paymentMethod.toUpperCase(),
        paymentStatus: order.paymentStatus.toUpperCase(),
        items: order.items,
        pricing: order.pricing,
      };

      return sendSuccess(res, 'Invoice generated.', { invoice: invoiceData });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
