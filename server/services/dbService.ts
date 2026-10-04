import mongoose from 'mongoose';
import { UserModel, IUser } from '../models/User';
import { ProductModel, IProduct } from '../models/Product';
import { CategoryModel, ICategory } from '../models/Category';
import { OrderModel, IOrder } from '../models/Order';
import { CouponModel, ICoupon } from '../models/Coupon';
import { ReviewModel, IReview } from '../models/Review';
import { QuestionModel, IQuestion } from '../models/Question';
import { NotificationModel, INotification } from '../models/Notification';
import { PaymentModel, IPayment } from '../models/Payment';
import { CartModel, ICart } from '../models/Cart';
import { WishlistModel, IWishlist } from '../models/Wishlist';
import { getInitialSeedData } from '../utils/seedData';

class MemoryStore {
  users: any[] = [];
  products: any[] = [];
  categories: any[] = [];
  orders: any[] = [];
  coupons: any[] = [];
  reviews: any[] = [];
  questions: any[] = [];
  notifications: any[] = [];
  payments: any[] = [];
  carts: Map<string, any> = new Map();
  wishlists: Map<string, any> = new Map();
  isInitialized = false;

  async init() {
    if (this.isInitialized) return;
    const seed = await getInitialSeedData();
    this.users = [...seed.users];
    this.products = [...seed.products];
    this.categories = [...seed.categories];
    this.orders = [...seed.orders];
    this.coupons = [...seed.coupons];
    this.reviews = [...seed.reviews];
    this.questions = [...seed.questions];
    this.notifications = [...seed.notifications];
    this.isInitialized = true;
    console.info('[Store] In-memory fallback dataset initialized with rich seed data.');
  }
}

export const memoryStore = new MemoryStore();

export const isDbConnected = () => mongoose.connection.readyState === 1;

export class DbService {
  static async initialize() {
    await memoryStore.init();

    // If MongoDB Atlas is connected, verify if seeded; if empty, seed Atlas collections
    if (isDbConnected()) {
      try {
        const count = await ProductModel.countDocuments();
        if (count === 0) {
          console.info('[Database] MongoDB Atlas connected but empty. Seeding initial records...');
          const seed = await getInitialSeedData();
          await UserModel.insertMany(seed.users);
          await CategoryModel.insertMany(seed.categories);
          await ProductModel.insertMany(seed.products);
          await CouponModel.insertMany(seed.coupons);
          await ReviewModel.insertMany(seed.reviews);
          await QuestionModel.insertMany(seed.questions);
          await OrderModel.insertMany(seed.orders);
          await NotificationModel.insertMany(seed.notifications);
          console.info('[Database] MongoDB Atlas seeded successfully.');
        }
      } catch (err: any) {
        console.warn('[Database] Seeding check skipped/failed on Atlas:', err.message);
      }
    }
  }

  // --- USER OPERATIONS ---
  static async findUserByEmail(email: string): Promise<any | null> {
    const normalized = email.toLowerCase().trim();
    if (isDbConnected()) {
      return UserModel.findOne({ email: normalized }).lean();
    }
    return memoryStore.users.find((u) => u.email.toLowerCase() === normalized) || null;
  }

  static async findUserById(id: string): Promise<any | null> {
    if (isDbConnected()) {
      return UserModel.findById(id).lean();
    }
    return memoryStore.users.find((u) => String(u._id) === String(id)) || null;
  }

  static async createUser(userData: any): Promise<any> {
    if (isDbConnected()) {
      const user = new UserModel(userData);
      await user.save();
      return user.toObject();
    }
    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      addresses: [],
      role: 'customer',
      isVerified: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    };
    memoryStore.users.push(newUser);
    return newUser;
  }

  static async updateUser(id: string, updates: any): Promise<any | null> {
    if (isDbConnected()) {
      return UserModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    }
    const idx = memoryStore.users.findIndex((u) => String(u._id) === String(id));
    if (idx === -1) return null;
    memoryStore.users[idx] = {
      ...memoryStore.users[idx],
      ...updates,
      updatedAt: new Date(),
    };
    return memoryStore.users[idx];
  }

  static async getAllUsers(query: { search?: string; role?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const filter: any = {};
      if (query.role) filter.role = query.role;
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { email: { $regex: query.search, $options: 'i' } },
          { phone: { $regex: query.search, $options: 'i' } },
        ];
      }
      const [users, total] = await Promise.all([
        UserModel.find(filter).select('-passwordHash').skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
        UserModel.countDocuments(filter),
      ]);
      return { users, total, page, totalPages: Math.ceil(total / limit) };
    }

    let filtered = [...memoryStore.users];
    if (query.role) {
      filtered = filtered.filter((u) => u.role === query.role);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.phone && u.phone.includes(s))
      );
    }
    const total = filtered.length;
    const paged = filtered.slice(skip, skip + limit).map((u) => {
      const { passwordHash, ...rest } = u;
      return rest;
    });
    return { users: paged, total, page, totalPages: Math.ceil(total / limit) };
  }

  // --- PRODUCT OPERATIONS ---
  static async getProducts(params: {
    search?: string;
    category?: string;
    subcategory?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    inStock?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
    featured?: boolean;
    trending?: boolean;
    newArrival?: boolean;
    activeOnly?: boolean;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 12;
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const filter: any = {};
      if (params.activeOnly !== false) filter.isActive = true;
      if (params.category) filter.category = params.category;
      if (params.subcategory) filter.subcategory = params.subcategory;
      if (params.brand) filter.brand = params.brand;
      if (params.featured) filter.isFeatured = true;
      if (params.trending) filter.isTrending = true;
      if (params.newArrival) filter.isNewArrival = true;
      if (params.inStock) filter.stock = { $gt: 0 };
      if (params.rating) filter.rating = { $gte: Number(params.rating) };
      if (params.minPrice || params.maxPrice) {
        filter['pricing.price'] = {};
        if (params.minPrice) filter['pricing.price'].$gte = Number(params.minPrice);
        if (params.maxPrice) filter['pricing.price'].$lte = Number(params.maxPrice);
      }
      if (params.search) {
        filter.$or = [
          { name: { $regex: params.search, $options: 'i' } },
          { description: { $regex: params.search, $options: 'i' } },
          { brand: { $regex: params.search, $options: 'i' } },
          { category: { $regex: params.search, $options: 'i' } },
        ];
      }

      let sortObj: any = { createdAt: -1 };
      if (params.sort === 'price_asc') sortObj = { 'pricing.price': 1 };
      else if (params.sort === 'price_desc') sortObj = { 'pricing.price': -1 };
      else if (params.sort === 'rating') sortObj = { rating: -1 };
      else if (params.sort === 'popularity') sortObj = { reviewCount: -1 };
      else if (params.sort === 'newest') sortObj = { createdAt: -1 };

      const [products, total] = await Promise.all([
        ProductModel.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
        ProductModel.countDocuments(filter),
      ]);

      return { products, total, page, totalPages: Math.ceil(total / limit) };
    }

    let items = [...memoryStore.products];
    if (params.activeOnly !== false) {
      items = items.filter((p) => p.isActive);
    }
    if (params.category) {
      items = items.filter((p) => p.category.toLowerCase() === params.category!.toLowerCase());
    }
    if (params.subcategory) {
      items = items.filter((p) => p.subcategory.toLowerCase() === params.subcategory!.toLowerCase());
    }
    if (params.brand) {
      items = items.filter((p) => p.brand.toLowerCase() === params.brand!.toLowerCase());
    }
    if (params.featured) {
      items = items.filter((p) => p.isFeatured);
    }
    if (params.trending) {
      items = items.filter((p) => p.isTrending);
    }
    if (params.newArrival) {
      items = items.filter((p) => p.isNewArrival);
    }
    if (params.inStock) {
      items = items.filter((p) => p.stock > 0);
    }
    if (params.rating) {
      items = items.filter((p) => p.rating >= Number(params.rating));
    }
    if (params.minPrice) {
      items = items.filter((p) => p.pricing.price >= Number(params.minPrice));
    }
    if (params.maxPrice) {
      items = items.filter((p) => p.pricing.price <= Number(params.maxPrice));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q)
      );
    }

    // Sort
    if (params.sort === 'price_asc') {
      items.sort((a, b) => a.pricing.price - b.pricing.price);
    } else if (params.sort === 'price_desc') {
      items.sort((a, b) => b.pricing.price - a.pricing.price);
    } else if (params.sort === 'rating') {
      items.sort((a, b) => b.rating - a.rating);
    } else if (params.sort === 'popularity') {
      items.sort((a, b) => b.reviewCount - a.reviewCount);
    } else {
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = items.length;
    const paginated = items.slice(skip, skip + limit);
    return { products: paginated, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async getProductBySlugOrId(identifier: string): Promise<any | null> {
    if (isDbConnected()) {
      let product = await ProductModel.findOne({ slug: identifier.toLowerCase() }).lean();
      if (!product && mongoose.Types.ObjectId.isValid(identifier)) {
        product = await ProductModel.findById(identifier).lean();
      }
      return product;
    }
    return (
      memoryStore.products.find(
        (p) =>
          p.slug.toLowerCase() === identifier.toLowerCase() ||
          String(p._id) === String(identifier)
      ) || null
    );
  }

  static async createProduct(data: any): Promise<any> {
    if (isDbConnected()) {
      const product = new ProductModel(data);
      await product.save();
      return product.toObject();
    }
    const newProduct = {
      _id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      rating: 0,
      reviewCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    memoryStore.products.unshift(newProduct);
    return newProduct;
  }

  static async updateProduct(id: string, updates: any): Promise<any | null> {
    if (isDbConnected()) {
      return ProductModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    }
    const idx = memoryStore.products.findIndex((p) => String(p._id) === String(id));
    if (idx === -1) return null;
    memoryStore.products[idx] = {
      ...memoryStore.products[idx],
      ...updates,
      updatedAt: new Date(),
    };
    return memoryStore.products[idx];
  }

  static async deleteProduct(id: string): Promise<boolean> {
    if (isDbConnected()) {
      const res = await ProductModel.findByIdAndDelete(id);
      return !!res;
    }
    const idx = memoryStore.products.findIndex((p) => String(p._id) === String(id));
    if (idx === -1) return false;
    memoryStore.products.splice(idx, 1);
    return true;
  }

  // --- CATEGORIES ---
  static async getCategories(): Promise<any[]> {
    if (isDbConnected()) {
      return CategoryModel.find().lean();
    }
    return memoryStore.categories;
  }

  static async getCategoryBySlug(slug: string): Promise<any | null> {
    if (isDbConnected()) {
      return CategoryModel.findOne({ slug }).lean();
    }
    return memoryStore.categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  static async createCategory(data: any): Promise<any> {
    if (isDbConnected()) {
      const cat = new CategoryModel(data);
      await cat.save();
      return cat.toObject();
    }
    const newCat = {
      _id: `cat_${Date.now()}`,
      productCount: 0,
      ...data,
    };
    memoryStore.categories.push(newCat);
    return newCat;
  }

  // --- CART & WISHLIST ---
  static async getCart(userId: string): Promise<any> {
    if (isDbConnected()) {
      let cart = await CartModel.findOne({ user: userId }).lean();
      if (!cart) {
        cart = await CartModel.create({ user: userId, items: [] });
      }
      return cart;
    }
    if (!memoryStore.carts.has(userId)) {
      memoryStore.carts.set(userId, { user: userId, items: [] });
    }
    return memoryStore.carts.get(userId);
  }

  static async updateCart(userId: string, items: any[]): Promise<any> {
    if (isDbConnected()) {
      return CartModel.findOneAndUpdate(
        { user: userId },
        { $set: { items, updatedAt: new Date() } },
        { new: true, upsert: true }
      ).lean();
    }
    const cart = { user: userId, items, updatedAt: new Date() };
    memoryStore.carts.set(userId, cart);
    return cart;
  }

  static async getWishlist(userId: string): Promise<any> {
    if (isDbConnected()) {
      let wishlist = await WishlistModel.findOne({ user: userId }).lean();
      if (!wishlist) {
        wishlist = await WishlistModel.create({ user: userId, products: [] });
      }
      return wishlist;
    }
    if (!memoryStore.wishlists.has(userId)) {
      memoryStore.wishlists.set(userId, { user: userId, products: [] });
    }
    return memoryStore.wishlists.get(userId);
  }

  static async updateWishlist(userId: string, products: string[]): Promise<any> {
    if (isDbConnected()) {
      return WishlistModel.findOneAndUpdate(
        { user: userId },
        { $set: { products, updatedAt: new Date() } },
        { new: true, upsert: true }
      ).lean();
    }
    const wishlist = { user: userId, products, updatedAt: new Date() };
    memoryStore.wishlists.set(userId, wishlist);
    return wishlist;
  }

  // --- COUPONS ---
  static async getCouponByCode(code: string): Promise<any | null> {
    const normalized = code.trim().toUpperCase();
    if (isDbConnected()) {
      return CouponModel.findOne({ code: normalized, isActive: true }).lean();
    }
    return (
      memoryStore.coupons.find(
        (c) => c.code.toUpperCase() === normalized && c.isActive
      ) || null
    );
  }

  static async getAllCoupons(isAdmin = false): Promise<any[]> {
    if (isDbConnected()) {
      const filter = isAdmin ? {} : { isActive: true };
      return CouponModel.find(filter).sort({ createdAt: -1 }).lean();
    }
    return isAdmin ? memoryStore.coupons : memoryStore.coupons.filter((c) => c.isActive);
  }

  static async createCoupon(data: any): Promise<any> {
    if (isDbConnected()) {
      const c = new CouponModel(data);
      await c.save();
      return c.toObject();
    }
    const coupon = {
      _id: `cpn_${Date.now()}`,
      usedCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
      code: data.code.toUpperCase().trim(),
    };
    memoryStore.coupons.push(coupon);
    return coupon;
  }

  static async updateCoupon(id: string, updates: any): Promise<any | null> {
    if (isDbConnected()) {
      return CouponModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    }
    const idx = memoryStore.coupons.findIndex((c) => String(c._id) === String(id));
    if (idx === -1) return null;
    memoryStore.coupons[idx] = {
      ...memoryStore.coupons[idx],
      ...updates,
      updatedAt: new Date(),
    };
    return memoryStore.coupons[idx];
  }

  // --- ORDERS ---
  static async createOrder(orderData: any): Promise<any> {
    if (isDbConnected()) {
      const order = new OrderModel(orderData);
      await order.save();
      return order.toObject();
    }
    const newOrder = {
      _id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...orderData,
    };
    memoryStore.orders.unshift(newOrder);
    return newOrder;
  }

  static async getOrderById(id: string): Promise<any | null> {
    if (isDbConnected()) {
      let order = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        order = await OrderModel.findById(id).lean();
      }
      if (!order) {
        order = await OrderModel.findOne({ orderNumber: id }).lean();
      }
      return order;
    }
    return (
      memoryStore.orders.find(
        (o) => String(o._id) === String(id) || o.orderNumber === id
      ) || null
    );
  }

  static async getOrdersByCustomer(customerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    if (isDbConnected()) {
      const [orders, total] = await Promise.all([
        OrderModel.find({ 'customer.id': customerId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        OrderModel.countDocuments({ 'customer.id': customerId }),
      ]);
      return { orders, total, page, totalPages: Math.ceil(total / limit) };
    }
    const customerOrders = memoryStore.orders.filter((o) => String(o.customer.id) === String(customerId));
    const total = customerOrders.length;
    const paginated = customerOrders.slice(skip, skip + limit);
    return { orders: paginated, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async getAllOrders(query: { status?: string; search?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    const skip = (page - 1) * limit;

    if (isDbConnected()) {
      const filter: any = {};
      if (query.status) filter.orderStatus = query.status;
      if (query.search) {
        filter.$or = [
          { orderNumber: { $regex: query.search, $options: 'i' } },
          { 'customer.name': { $regex: query.search, $options: 'i' } },
          { 'customer.email': { $regex: query.search, $options: 'i' } },
        ];
      }
      const [orders, total] = await Promise.all([
        OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        OrderModel.countDocuments(filter),
      ]);
      return { orders, total, page, totalPages: Math.ceil(total / limit) };
    }

    let items = [...memoryStore.orders];
    if (query.status) {
      items = items.filter((o) => o.orderStatus === query.status);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      items = items.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(s) ||
          o.customer.name.toLowerCase().includes(s) ||
          o.customer.email.toLowerCase().includes(s)
      );
    }
    const total = items.length;
    const paginated = items.slice(skip, skip + limit);
    return { orders: paginated, total, page, totalPages: Math.ceil(total / limit) };
  }

  static async updateOrder(id: string, updates: any): Promise<any | null> {
    if (isDbConnected()) {
      return OrderModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    }
    const idx = memoryStore.orders.findIndex(
      (o) => String(o._id) === String(id) || o.orderNumber === id
    );
    if (idx === -1) return null;
    memoryStore.orders[idx] = {
      ...memoryStore.orders[idx],
      ...updates,
      updatedAt: new Date(),
    };
    return memoryStore.orders[idx];
  }

  // --- REVIEWS & RATINGS ---
  static async getProductReviews(productId: string): Promise<any[]> {
    if (isDbConnected()) {
      return ReviewModel.find({ productId }).sort({ createdAt: -1 }).lean();
    }
    return memoryStore.reviews
      .filter((r) => String(r.productId) === String(productId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
    if (isDbConnected()) {
      const order = await OrderModel.findOne({
        'customer.id': userId,
        'items.product': productId,
        orderStatus: { $in: ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'] },
      }).lean();
      return !!order;
    }
    return memoryStore.orders.some(
      (o) =>
        String(o.customer.id) === String(userId) &&
        ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'].includes(o.orderStatus) &&
        o.items.some((i: any) => String(i.product) === String(productId))
    );
  }

  static async createReview(data: any): Promise<any> {
    if (isDbConnected()) {
      const rev = new ReviewModel(data);
      await rev.save();
      // recalculate product rating & review count
      const allReviews = await ReviewModel.find({ productId: data.productId });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await ProductModel.findByIdAndUpdate(data.productId, {
        rating: Number(avg.toFixed(1)),
        reviewCount: allReviews.length,
      });
      return rev.toObject();
    }
    const review = {
      _id: `rev_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    memoryStore.reviews.unshift(review);

    // update product rating in memory
    const productReviews = memoryStore.reviews.filter((r) => String(r.productId) === String(data.productId));
    const avg = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    const pIdx = memoryStore.products.findIndex((p) => String(p._id) === String(data.productId));
    if (pIdx !== -1) {
      memoryStore.products[pIdx].rating = Number(avg.toFixed(1));
      memoryStore.products[pIdx].reviewCount = productReviews.length;
    }
    return review;
  }

  static async getAllReviews(): Promise<any[]> {
    if (isDbConnected()) {
      return ReviewModel.find().sort({ createdAt: -1 }).lean();
    }
    return memoryStore.reviews;
  }

  static async deleteReview(id: string): Promise<boolean> {
    if (isDbConnected()) {
      const res = await ReviewModel.findByIdAndDelete(id);
      return !!res;
    }
    const idx = memoryStore.reviews.findIndex((r) => String(r._id) === String(id));
    if (idx === -1) return false;
    memoryStore.reviews.splice(idx, 1);
    return true;
  }

  // --- QUESTIONS & ANSWERS ---
  static async getProductQuestions(productId: string): Promise<any[]> {
    if (isDbConnected()) {
      return QuestionModel.find({ productId, isPublished: true }).sort({ createdAt: -1 }).lean();
    }
    return memoryStore.questions
      .filter((q) => String(q.productId) === String(productId) && q.isPublished)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async getAllQuestions(): Promise<any[]> {
    if (isDbConnected()) {
      return QuestionModel.find().sort({ createdAt: -1 }).lean();
    }
    return memoryStore.questions;
  }

  static async createQuestion(data: any): Promise<any> {
    if (isDbConnected()) {
      const q = new QuestionModel(data);
      await q.save();
      return q.toObject();
    }
    const q = {
      _id: `qna_${Date.now()}`,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    memoryStore.questions.unshift(q);
    return q;
  }

  static async answerQuestion(id: string, answer: string, answeredBy = 'NexMart Support'): Promise<any | null> {
    if (isDbConnected()) {
      return QuestionModel.findByIdAndUpdate(
        id,
        {
          $set: {
            answer,
            answeredBy,
            answeredAt: new Date(),
          },
        },
        { new: true }
      ).lean();
    }
    const idx = memoryStore.questions.findIndex((q) => String(q._id) === String(id));
    if (idx === -1) return null;
    memoryStore.questions[idx] = {
      ...memoryStore.questions[idx],
      answer,
      answeredBy,
      answeredAt: new Date(),
      updatedAt: new Date(),
    };
    return memoryStore.questions[idx];
  }

  // --- NOTIFICATIONS ---
  static async getNotifications(userId?: string): Promise<any[]> {
    if (isDbConnected()) {
      return NotificationModel.find({
        $or: [{ userId }, { userId: '' }, { userId: null }],
      })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();
    }
    return memoryStore.notifications
      .filter((n) => !n.userId || n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static async createNotification(data: any): Promise<any> {
    if (isDbConnected()) {
      const notif = new NotificationModel(data);
      await notif.save();
      return notif.toObject();
    }
    const notif = {
      _id: `notif_${Date.now()}`,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    memoryStore.notifications.unshift(notif);
    return notif;
  }

  static async markNotificationRead(id: string): Promise<boolean> {
    if (isDbConnected()) {
      await NotificationModel.findByIdAndUpdate(id, { $set: { isRead: true } });
      return true;
    }
    const n = memoryStore.notifications.find((item) => String(item._id) === String(id));
    if (n) n.isRead = true;
    return true;
  }
}
