import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { DbService } from '../services/dbService';
import { sendSuccess, sendError } from '../utils/response';

export class CartController {
  /**
   * Helper that hydrates cart items with latest prices, images, titles, and live stock from database.
   */
  private static async hydrateCart(items: any[]) {
    const activeItems = [];
    const savedForLaterItems = [];
    let subtotal = 0;
    let originalTotal = 0;

    for (const item of items) {
      const product = await DbService.getProductBySlugOrId(item.product);
      if (!product) continue;

      let price = product.pricing.price;
      let originalPrice = product.pricing.originalPrice || price;
      let stock = product.stock;
      let variantTitle = undefined;
      let variantSku = item.variantSku;

      if (variantSku && product.variants) {
        const v = product.variants.find((variant: any) => variant.sku === variantSku);
        if (v) {
          price = v.price;
          originalPrice = v.originalPrice || price;
          stock = v.stock;
          variantTitle = v.title;
        }
      }

      const mainImg = product.images?.find((img: any) => img.isMain)?.url || product.images?.[0]?.url || '';
      const clampedQty = Math.max(1, Math.min(item.quantity, Math.max(1, stock)));

      const hydrated = {
        product: String(product._id),
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        image: mainImg,
        variantSku,
        variantTitle,
        price,
        originalPrice,
        quantity: clampedQty,
        stock,
        isOutOfStock: stock <= 0,
        savedForLater: Boolean(item.savedForLater),
        itemTotal: price * clampedQty,
      };

      if (item.savedForLater) {
        savedForLaterItems.push(hydrated);
      } else {
        activeItems.push(hydrated);
        if (stock > 0) {
          subtotal += hydrated.itemTotal;
          originalTotal += originalPrice * clampedQty;
        }
      }
    }

    const productDiscount = Math.max(0, originalTotal - subtotal);
    const estimatedDeliveryFee = subtotal >= 1000 || subtotal === 0 ? 0 : 99;
    const estimatedTax = Math.round((subtotal * 0.18) * 100) / 100;
    const estimatedTotal = subtotal + estimatedDeliveryFee;

    return {
      items: activeItems,
      savedForLater: savedForLaterItems,
      itemCount: activeItems.reduce((acc, i) => acc + i.quantity, 0),
      subtotal,
      originalTotal,
      productDiscount,
      estimatedDeliveryFee,
      estimatedTax,
      estimatedTotal,
    };
  }

  static async getCart(req: AuthenticatedRequest, res: Response) {
    try {
      const cart = await DbService.getCart(req.user!.userId);
      const hydrated = await CartController.hydrateCart(cart.items || []);
      return sendSuccess(res, 'Cart retrieved.', hydrated);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async addItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { productId, variantSku, quantity = 1 } = req.body;
      if (!productId) {
        return sendError(res, 'Product ID is required.', 400);
      }

      const product = await DbService.getProductBySlugOrId(productId);
      if (!product) {
        return sendError(res, 'Product not found.', 404);
      }

      let maxStock = product.stock;
      if (variantSku && product.variants) {
        const v = product.variants.find((vr: any) => vr.sku === variantSku);
        if (v) maxStock = v.stock;
      }

      if (maxStock <= 0) {
        return sendError(res, 'This item is currently out of stock.', 400);
      }

      const cart = await DbService.getCart(req.user!.userId);
      let items: any[] = [...(cart.items || [])];

      const existingIndex = items.findIndex(
        (i) =>
          String(i.product) === String(product._id) &&
          (i.variantSku || '') === (variantSku || '') &&
          !i.savedForLater
      );

      const requestedQty = Math.max(1, Number(quantity));

      if (existingIndex > -1) {
        const newQty = items[existingIndex].quantity + requestedQty;
        if (newQty > maxStock) {
          return sendError(res, `Cannot add more. Available stock limit is ${maxStock}.`, 400);
        }
        items[existingIndex].quantity = newQty;
      } else {
        if (requestedQty > maxStock) {
          return sendError(res, `Requested quantity exceeds available stock (${maxStock}).`, 400);
        }
        items.push({
          product: String(product._id),
          variantSku,
          quantity: requestedQty,
          savedForLater: false,
        });
      }

      await DbService.updateCart(req.user!.userId, items);
      const hydrated = await CartController.hydrateCart(items);
      return sendSuccess(res, 'Item added to cart.', hydrated);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async updateQuantity(req: AuthenticatedRequest, res: Response) {
    try {
      const { productId, variantSku, quantity } = req.body;
      if (!productId || quantity === undefined) {
        return sendError(res, 'Product ID and quantity are required.', 400);
      }

      const cart = await DbService.getCart(req.user!.userId);
      let items: any[] = [...(cart.items || [])];

      const index = items.findIndex(
        (i) =>
          String(i.product) === String(productId) &&
          (i.variantSku || '') === (variantSku || '') &&
          !i.savedForLater
      );

      if (index === -1) {
        return sendError(res, 'Item not found in cart.', 404);
      }

      const newQty = Math.floor(Number(quantity));
      if (newQty <= 0) {
        // Remove item if quantity set to 0
        items.splice(index, 1);
      } else {
        // Verify stock limit
        const product = await DbService.getProductBySlugOrId(productId);
        let maxStock = product?.stock || 0;
        if (variantSku && product?.variants) {
          const v = product.variants.find((vr: any) => vr.sku === variantSku);
          if (v) maxStock = v.stock;
        }

        if (newQty > maxStock) {
          return sendError(res, `Only ${maxStock} items available in stock.`, 400);
        }

        items[index].quantity = newQty;
      }

      await DbService.updateCart(req.user!.userId, items);
      const hydrated = await CartController.hydrateCart(items);
      return sendSuccess(res, 'Cart updated.', hydrated);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async removeItem(req: AuthenticatedRequest, res: Response) {
    try {
      const { productId, variantSku } = req.body;
      const cart = await DbService.getCart(req.user!.userId);
      const items = (cart.items || []).filter(
        (i: any) =>
          !(
            String(i.product) === String(productId) &&
            (i.variantSku || '') === (variantSku || '')
          )
      );

      await DbService.updateCart(req.user!.userId, items);
      const hydrated = await CartController.hydrateCart(items);
      return sendSuccess(res, 'Item removed from cart.', hydrated);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async toggleSaveForLater(req: AuthenticatedRequest, res: Response) {
    try {
      const { productId, variantSku, saveForLater } = req.body;
      const cart = await DbService.getCart(req.user!.userId);
      const items = (cart.items || []).map((i: any) => {
        if (
          String(i.product) === String(productId) &&
          (i.variantSku || '') === (variantSku || '')
        ) {
          return { ...i, savedForLater: Boolean(saveForLater) };
        }
        return i;
      });

      await DbService.updateCart(req.user!.userId, items);
      const hydrated = await CartController.hydrateCart(items);
      return sendSuccess(
        res,
        saveForLater ? 'Item saved for later.' : 'Item moved back to cart.',
        hydrated
      );
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }

  static async clearCart(req: AuthenticatedRequest, res: Response) {
    try {
      await DbService.updateCart(req.user!.userId, []);
      return sendSuccess(res, 'Cart cleared.');
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  }
}
