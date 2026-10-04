import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { PaymentService } from '../services/paymentService';
import { sendSuccess, sendError } from '../utils/response';

export class PaymentController {
  static async createOrder(req: AuthenticatedRequest, res: Response) {
    try {
      const { amount, currency = 'INR', receipt = `rec_${Date.now()}` } = req.body;
      if (!amount || amount <= 0) {
        return sendError(res, 'Valid amount is required.', 400);
      }

      const paymentOrder = await PaymentService.createGatewayOrder({
        amount: Math.round(amount),
        currency,
        receipt,
      });

      return sendSuccess(res, 'Gateway payment session generated.', paymentOrder);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async verifyPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { orderId, paymentId, signature } = req.body;

      if (!orderId || !paymentId || !signature) {
        return sendError(res, 'Missing required payment verification payload.', 400);
      }

      const isValid = PaymentService.verifyPaymentSignature({
        orderId,
        paymentId,
        signature,
      });

      if (!isValid) {
        return sendError(res, 'Payment verification failed: Invalid transaction signature.', 400);
      }

      return sendSuccess(res, 'Payment verified successfully.', {
        verified: true,
        orderId,
        paymentId,
      });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async getSandboxSignature(req: AuthenticatedRequest, res: Response) {
    try {
      const { orderId, paymentId } = req.body;
      const signature = PaymentService.generateSandboxSignature(
        orderId || `order_${Date.now()}`,
        paymentId || `pay_${Date.now()}`
      );
      return sendSuccess(res, 'Sandbox signature generated.', { signature });
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
