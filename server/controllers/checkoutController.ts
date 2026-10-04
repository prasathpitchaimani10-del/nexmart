import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { PriceCalculatorService } from '../services/priceCalculatorService';
import { sendSuccess, sendError } from '../utils/response';

export class CheckoutController {
  static async calculate(req: AuthenticatedRequest, res: Response) {
    try {
      const { items, couponCode, deliveryType = 'standard' } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return sendError(res, 'Checkout requires at least one product item.', 400);
      }

      const calculated = await PriceCalculatorService.calculateOrderPrice(
        items,
        couponCode,
        deliveryType
      );

      return sendSuccess(res, 'Pricing recalculated on authoritative server.', calculated);
    } catch (err: any) {
      return sendError(res, err.message || 'Pricing calculation failed.', 400);
    }
  }
}
