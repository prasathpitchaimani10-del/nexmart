import { DbService } from './dbService';

export interface CheckoutItemInput {
  productId: string;
  variantSku?: string;
  quantity: number;
}

export interface CalculatedItem {
  product: string;
  productName: string;
  productImage: string;
  variantSku?: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  originalPrice: number;
  itemTotal: number;
  availableStock: number;
}

export interface PricingCalculation {
  items: CalculatedItem[];
  subtotal: number;
  originalTotal: number;
  productDiscount: number;
  couponDiscount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  couponApplied?: {
    code: string;
    discount: number;
    description: string;
  };
}

export class PriceCalculatorService {
  /**
   * Recalculates order and cart pricing strictly on the backend using authoritative product data.
   */
  static async calculateOrderPrice(
    itemsInput: CheckoutItemInput[],
    couponCode?: string,
    deliveryType: 'standard' | 'express' = 'standard'
  ): Promise<PricingCalculation> {
    if (!itemsInput || itemsInput.length === 0) {
      throw new Error('Checkout items list cannot be empty.');
    }

    const calculatedItems: CalculatedItem[] = [];
    let subtotal = 0;
    let originalTotal = 0;

    for (const input of itemsInput) {
      const product = await DbService.getProductBySlugOrId(input.productId);
      if (!product) {
        throw new Error(`Product not found for ID: ${input.productId}`);
      }
      if (!product.isActive) {
        throw new Error(`Product "${product.name}" is no longer available.`);
      }

      let price = product.pricing.price;
      let originalPrice = product.pricing.originalPrice || price;
      let stock = product.stock;
      let variantTitle: string | undefined = undefined;

      if (input.variantSku) {
        const variant = product.variants?.find((v: any) => v.sku === input.variantSku);
        if (!variant) {
          throw new Error(`Variant "${input.variantSku}" does not exist for product "${product.name}".`);
        }
        price = variant.price;
        originalPrice = variant.originalPrice || price;
        stock = variant.stock;
        variantTitle = variant.title;
      }

      const qty = Math.max(1, Math.floor(input.quantity));
      if (stock < qty) {
        throw new Error(
          `Insufficient stock for "${product.name}${variantTitle ? ` (${variantTitle})` : ''}". Requested: ${qty}, Available: ${stock}.`
        );
      }

      const itemTotal = price * qty;
      const originalItemTotal = originalPrice * qty;

      subtotal += itemTotal;
      originalTotal += originalItemTotal;

      const mainImg = product.images?.find((img: any) => img.isMain)?.url || product.images?.[0]?.url || '';

      calculatedItems.push({
        product: String(product._id),
        productName: product.name,
        productImage: mainImg,
        variantSku: input.variantSku,
        variantTitle,
        quantity: qty,
        price,
        originalPrice,
        itemTotal,
        availableStock: stock,
      });
    }

    const productDiscount = Math.max(0, originalTotal - subtotal);

    // Coupon Calculation
    let couponDiscount = 0;
    let couponApplied: PricingCalculation['couponApplied'] = undefined;

    if (couponCode && couponCode.trim()) {
      const coupon = await DbService.getCouponByCode(couponCode.trim().toUpperCase());
      if (!coupon) {
        throw new Error(`Coupon "${couponCode}" is invalid or expired.`);
      }
      if (!coupon.isActive || new Date(coupon.expiresAt).getTime() < Date.now()) {
        throw new Error(`Coupon "${coupon.code}" has expired.`);
      }
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new Error(`Coupon "${coupon.code}" usage limit has been reached.`);
      }
      if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        throw new Error(`Coupon requires a minimum purchase order of ₹${coupon.minPurchase}.`);
      }

      if (coupon.discountType === 'percentage') {
        const calculatedDiscount = Math.round((subtotal * coupon.discountValue) / 100);
        couponDiscount = coupon.maxDiscount && coupon.maxDiscount > 0
          ? Math.min(calculatedDiscount, coupon.maxDiscount)
          : calculatedDiscount;
      } else {
        couponDiscount = Math.min(coupon.discountValue, subtotal);
      }

      couponApplied = {
        code: coupon.code,
        discount: couponDiscount,
        description: coupon.description,
      };
    }

    // Delivery Fee logic
    // Free delivery above ₹1,000, else ₹99. Express delivery adds ₹150.
    let deliveryFee = subtotal >= 1000 ? 0 : 99;
    if (deliveryType === 'express') {
      deliveryFee += 150;
    }

    // Taxes: GST included / calculated standard rate (18% for consumer goods)
    // Here we compute 18% GST portion for transparent invoice transparency
    const taxableAmount = Math.max(0, subtotal - couponDiscount);
    const tax = Math.round((taxableAmount * 0.18) * 100) / 100;

    const total = Math.max(0, taxableAmount + deliveryFee);

    return {
      items: calculatedItems,
      subtotal,
      originalTotal,
      productDiscount,
      couponDiscount,
      deliveryFee,
      tax,
      total,
      couponApplied,
    };
  }
}
