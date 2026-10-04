import { Request, Response } from 'express';
import { DbService } from '../services/dbService';
import { sendSuccess, sendError } from '../utils/response';

export class CouponController {
  static async validateCoupon(req: Request, res: Response) {
    try {
      const { code, subtotal } = req.body;
      if (!code) {
        return sendError(res, 'Coupon code is required.', 400);
      }

      const cartSubtotal = Number(subtotal) || 0;
      const coupon = await DbService.getCouponByCode(code.trim().toUpperCase());

      if (!coupon) {
        return sendError(res, 'Invalid coupon code.', 404);
      }

      if (!coupon.isActive || new Date(coupon.expiresAt).getTime() < Date.now()) {
        return sendError(res, 'This coupon code has expired.', 400);
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return sendError(res, 'Coupon usage limit has been reached.', 400);
      }

      if (coupon.minPurchase && cartSubtotal < coupon.minPurchase) {
        return sendError(
          res,
          `This coupon requires a minimum purchase value of ₹${coupon.minPurchase.toLocaleString()}. (Current: ₹${cartSubtotal.toLocaleString()})`,
          400
        );
      }

      let discount = 0;
      if (coupon.discountType === 'percentage') {
        const raw = Math.round((cartSubtotal * coupon.discountValue) / 100);
        discount = coupon.maxDiscount && coupon.maxDiscount > 0 ? Math.min(raw, coupon.maxDiscount) : raw;
      } else {
        discount = Math.min(coupon.discountValue, cartSubtotal);
      }

      return sendSuccess(res, `Coupon "${coupon.code}" applied! You save ₹${discount.toLocaleString()}.`, {
        code: coupon.code,
        discount,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getAvailableCoupons(req: Request, res: Response) {
    try {
      const coupons = await DbService.getAllCoupons(false);
      const validCoupons = coupons.filter(
        (c) => new Date(c.expiresAt).getTime() > Date.now() && (!c.usageLimit || c.usedCount < c.usageLimit)
      );
      return sendSuccess(res, 'Available coupons retrieved.', { coupons: validCoupons });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
