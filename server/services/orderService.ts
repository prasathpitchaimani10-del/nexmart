import { DbService } from './dbService';
import { PriceCalculatorService, CheckoutItemInput } from './priceCalculatorService';
import { IAddress } from '../models/User';

export interface CreateOrderInput {
  customerId: string;
  items: CheckoutItemInput[];
  address: IAddress;
  deliveryMethod?: {
    type: 'standard' | 'express';
    title: string;
    estimatedDays: number;
  };
  couponCode?: string;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'wallet' | 'cod';
  paymentDetails?: {
    transactionId?: string;
    provider?: string;
    paidAt?: Date;
  };
}

export class OrderService {
  static generateOrderNumber(): string {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `NXM-${dateStr}-${rand}`;
  }

  static generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `INV-${year}-${rand}`;
  }

  static async createOrder(input: CreateOrderInput) {
    const user = await DbService.findUserById(input.customerId);
    if (!user) {
      throw new Error('User not found.');
    }

    const deliveryType = input.deliveryMethod?.type || 'standard';

    // 1. Re-validate prices, stock, variants, discounts, coupons, taxes completely on backend
    const pricing = await PriceCalculatorService.calculateOrderPrice(
      input.items,
      input.couponCode,
      deliveryType
    );

    const orderNumber = this.generateOrderNumber();
    const invoiceNumber = this.generateInvoiceNumber();

    const isCod = input.paymentMethod === 'cod';
    const initialStatus = isCod ? 'confirmed' : 'confirmed'; // when online payment verified
    const paymentStatus = isCod ? 'pending' : 'completed';

    const orderData = {
      orderNumber,
      customer: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        phone: user.phone || input.address.phone,
      },
      items: pricing.items.map((item) => ({
        product: item.product,
        productName: item.productName,
        productImage: item.productImage,
        variantSku: item.variantSku,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        price: item.price,
        originalPrice: item.originalPrice,
        itemTotal: item.itemTotal,
      })),
      address: input.address,
      pricing: {
        subtotal: pricing.subtotal,
        productDiscount: pricing.productDiscount,
        couponDiscount: pricing.couponDiscount,
        tax: pricing.tax,
        deliveryFee: pricing.deliveryFee,
        total: pricing.total,
      },
      couponApplied: pricing.couponApplied
        ? {
            code: pricing.couponApplied.code,
            discount: pricing.couponApplied.discount,
          }
        : undefined,
      deliveryMethod: input.deliveryMethod || {
        type: 'standard',
        title: 'Standard Ground Delivery',
        estimatedDays: 3,
      },
      paymentMethod: input.paymentMethod,
      paymentStatus,
      paymentDetails: input.paymentDetails || {
        transactionId: isCod ? `COD-${Date.now()}` : `TXN-${Date.now()}`,
        provider: isCod ? 'cod' : 'sandbox_gateway',
        paidAt: isCod ? undefined : new Date(),
      },
      orderStatus: initialStatus,
      trackingHistory: [
        {
          status: 'confirmed',
          timestamp: new Date(),
          note: isCod
            ? 'Order confirmed. Payment to be collected upon delivery.'
            : 'Payment verified successfully and order confirmed.',
        },
      ],
      invoiceNumber,
    };

    // 2. Decrement inventory
    for (const item of pricing.items) {
      const product = await DbService.getProductBySlugOrId(item.product);
      if (product) {
        const newProductStock = Math.max(0, product.stock - item.quantity);
        let updatedVariants = product.variants;
        if (item.variantSku && updatedVariants) {
          updatedVariants = updatedVariants.map((v: any) => {
            if (v.sku === item.variantSku) {
              return { ...v, stock: Math.max(0, v.stock - item.quantity) };
            }
            return v;
          });
        }
        await DbService.updateProduct(String(product._id), {
          stock: newProductStock,
          variants: updatedVariants,
        });
      }
    }

    // 3. Increment coupon usage if used
    if (pricing.couponApplied) {
      const coupon = await DbService.getCouponByCode(pricing.couponApplied.code);
      if (coupon) {
        await DbService.updateCoupon(String(coupon._id), {
          usedCount: (coupon.usedCount || 0) + 1,
        });
      }
    }

    // 4. Save order to database
    const savedOrder = await DbService.createOrder(orderData);

    // 5. Emit user notification
    await DbService.createNotification({
      userId: String(user._id),
      title: 'Order Placed Successfully',
      message: `Your order #${orderNumber} for ₹${pricing.total.toLocaleString()} has been confirmed.`,
      type: 'order',
      link: `/orders/${savedOrder._id}`,
    });

    return savedOrder;
  }

  static async cancelOrder(orderId: string, customerId: string, reason: string) {
    const order = await DbService.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found.');
    }

    if (String(order.customer.id) !== String(customerId)) {
      throw new Error('Unauthorized to cancel this order.');
    }

    const cancelableStatuses = ['pending', 'confirmed', 'processing'];
    if (!cancelableStatuses.includes(order.orderStatus)) {
      throw new Error(
        `Order cannot be cancelled in its current state (${order.orderStatus}). Please request a return once delivered.`
      );
    }

    // Restock items
    for (const item of order.items) {
      const product = await DbService.getProductBySlugOrId(item.product);
      if (product) {
        const newStock = product.stock + item.quantity;
        let variants = product.variants;
        if (item.variantSku && variants) {
          variants = variants.map((v: any) =>
            v.sku === item.variantSku ? { ...v, stock: v.stock + item.quantity } : v
          );
        }
        await DbService.updateProduct(String(product._id), {
          stock: newStock,
          variants,
        });
      }
    }

    const updates: any = {
      orderStatus: 'cancelled',
      cancellationReason: reason,
      trackingHistory: [
        ...order.trackingHistory,
        {
          status: 'cancelled',
          timestamp: new Date(),
          note: `Cancelled by customer: ${reason}`,
        },
      ],
    };

    if (order.paymentStatus === 'completed') {
      updates.paymentStatus = 'refunded';
      updates.refundDetails = {
        amount: order.pricing.total,
        reason: `Order cancelled by customer: ${reason}`,
        refundId: `RFND-${Date.now()}`,
        refundedAt: new Date(),
        status: 'processed',
      };
    }

    const updated = await DbService.updateOrder(orderId, updates);

    await DbService.createNotification({
      userId: customerId,
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber} was cancelled. Any online payment will be refunded to source.`,
      type: 'order',
      link: `/orders/${orderId}`,
    });

    return updated;
  }

  static async requestReturn(
    orderId: string,
    customerId: string,
    reason: string,
    description: string,
    images: string[] = []
  ) {
    const order = await DbService.getOrderById(orderId);
    if (!order) {
      throw new Error('Order not found.');
    }

    if (String(order.customer.id) !== String(customerId)) {
      throw new Error('Unauthorized.');
    }

    if (order.orderStatus !== 'delivered') {
      throw new Error('Return can only be requested for delivered orders.');
    }

    const updates = {
      orderStatus: 'return_requested',
      returnDetails: {
        reason,
        description,
        images,
        requestedAt: new Date(),
        status: 'requested',
      },
      trackingHistory: [
        ...order.trackingHistory,
        {
          status: 'return_requested',
          timestamp: new Date(),
          note: `Return requested: ${reason}`,
        },
      ],
    };

    const updated = await DbService.updateOrder(orderId, updates);

    await DbService.createNotification({
      userId: customerId,
      title: 'Return Request Received',
      message: `Your return request for order #${order.orderNumber} is under review.`,
      type: 'order',
      link: `/orders/${orderId}`,
    });

    return updated;
  }
}
