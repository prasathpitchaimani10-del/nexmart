import { ApiResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  errors: any[];
  statusCode: number;

  constructor(message: string, statusCode = 400, errors: any[] = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('nexmart_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    message: 'Failed to parse server response.',
  }));

  if (!response.ok || !data.success) {
    throw new ApiError(data.message || 'Request failed', response.status, data.errors);
  }

  return (data.data !== undefined ? data.data : (data as any)) as T;
}

export const api = {
  // Health
  checkHealth: () => request<{ message: string; environment: string }>('/health'),

  // Auth
  register: (body: any) => request<{ user: any; token: string; otpCodeForTesting?: string }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<{ user: any; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body: any) => request<{ user: any }>('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  resendOtp: (body: any) => request<{ otpCodeForTesting?: string }>('/auth/resend-otp', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body: any) => request<{ message?: string; resetTokenForTesting?: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body: any) => request<any>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<{ user: any }>('/auth/me'),

  // User Profile & Addresses
  getProfile: () => request<{ user: any }>('/users/profile'),
  updateProfile: (body: any) => request<{ user: any }>('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (body: any) => request<any>('/users/change-password', { method: 'POST', body: JSON.stringify(body) }),
  getAddresses: () => request<{ addresses: any[] }>('/users/addresses'),
  addAddress: (body: any) => request<{ addresses: any[] }>('/users/addresses', { method: 'POST', body: JSON.stringify(body) }),
  updateAddress: (id: string, body: any) => request<{ addresses: any[] }>(`/users/addresses/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAddress: (id: string) => request<{ addresses: any[] }>(`/users/addresses/${id}`, { method: 'DELETE' }),
  setDefaultAddress: (id: string) => request<{ addresses: any[] }>(`/users/addresses/${id}/default`, { method: 'PATCH' }),

  // Products
  getProducts: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        searchParams.append(k, String(v));
      }
    });
    return request<any[]>(`/products?${searchParams.toString()}`);
  },
  getProductBySlug: (slug: string) => request<{ product: any; reviews: any[]; questions: any[] }>(`/products/${slug}`),
  getSearchSuggestions: (query: string) => request<{ suggestions: any[] }>(`/products/suggestions?q=${encodeURIComponent(query)}`),
  checkDeliveryAvailability: (pincode: string) => request<any>(`/products/check-delivery?pincode=${encodeURIComponent(pincode)}`),
  compareProducts: (ids: string[]) => request<{ products: any[]; specificationKeys: string[] }>(`/products/compare?ids=${ids.join(',')}`),

  // Categories
  getCategories: () => request<{ categories: any[] }>('/categories'),
  getCategoryBySlug: (slug: string) => request<{ category: any; products: any[]; totalProducts: number }>(`/categories/${slug}`),

  // Cart
  getCart: () => request<any>('/cart'),
  addToCart: (productId: string, variantSku?: string, quantity = 1) =>
    request<any>('/cart/add', { method: 'POST', body: JSON.stringify({ productId, variantSku, quantity }) }),
  updateCartQuantity: (productId: string, variantSku: string | undefined, quantity: number) =>
    request<any>('/cart/quantity', { method: 'PUT', body: JSON.stringify({ productId, variantSku, quantity }) }),
  removeFromCart: (productId: string, variantSku?: string) =>
    request<any>('/cart/remove', { method: 'DELETE', body: JSON.stringify({ productId, variantSku }) }),
  toggleSaveForLater: (productId: string, variantSku: string | undefined, saveForLater: boolean) =>
    request<any>('/cart/save-for-later', { method: 'POST', body: JSON.stringify({ productId, variantSku, saveForLater }) }),
  clearCart: () => request<any>('/cart/clear', { method: 'DELETE' }),

  // Wishlist
  getWishlist: () => request<{ products: any[]; count: number }>('/wishlist'),
  toggleWishlist: (productId: string) => request<{ isWishlisted: boolean; count: number }>('/wishlist/toggle', { method: 'POST', body: JSON.stringify({ productId }) }),

  // Coupons
  getAvailableCoupons: () => request<{ coupons: any[] }>('/coupons/available'),
  validateCoupon: (code: string, subtotal: number) =>
    request<any>('/coupons/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),

  // Checkout
  calculateCheckout: (items: any[], couponCode?: string, deliveryType = 'standard') =>
    request<any>('/checkout/calculate', { method: 'POST', body: JSON.stringify({ items, couponCode, deliveryType }) }),

  // Payments
  createPaymentOrder: (amount: number, receipt?: string) =>
    request<any>('/payments/create-order', { method: 'POST', body: JSON.stringify({ amount, receipt }) }),
  verifyPayment: (payload: { orderId: string; paymentId: string; signature: string }) =>
    request<any>('/payments/verify', { method: 'POST', body: JSON.stringify(payload) }),
  getSandboxSignature: (orderId: string, paymentId: string) =>
    request<{ signature: string }>('/payments/sandbox-signature', { method: 'POST', body: JSON.stringify({ orderId, paymentId }) }),

  // Orders
  createOrder: (orderPayload: any) => request<{ order: any }>('/orders', { method: 'POST', body: JSON.stringify(orderPayload) }),
  getMyOrders: (page = 1, limit = 10) => request<any[]>(`/orders?page=${page}&limit=${limit}`),
  getOrderById: (id: string) => request<{ order: any }>(`/orders/${id}`),
  cancelOrder: (id: string, reason: string) => request<{ order: any }>(`/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  requestReturn: (id: string, reason: string, description: string, images: string[] = []) =>
    request<{ order: any }>(`/orders/${id}/return`, { method: 'POST', body: JSON.stringify({ reason, description, images }) }),
  reorder: (id: string) => request<any>(`/orders/${id}/reorder`, { method: 'POST' }),
  getInvoice: (id: string) => request<{ invoice: any }>(`/orders/${id}/invoice`),

  // Reviews & Questions
  getProductReviews: (productId: string) => request<{ reviews: any[] }>(`/reviews/product/${productId}`),
  createReview: (reviewPayload: any) => request<{ review: any }>('/reviews', { method: 'POST', body: JSON.stringify(reviewPayload) }),
  getProductQuestions: (productId: string) => request<{ questions: any[] }>(`/questions/product/${productId}`),
  askQuestion: (productId: string, question: string) =>
    request<{ question: any }>('/questions', { method: 'POST', body: JSON.stringify({ productId, question }) }),

  // Notifications
  getNotifications: () => request<{ notifications: any[] }>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Admin
  getAdminStats: () => request<any>('/admin/dashboard-stats'),
  adminCreateProduct: (productData: any) => request<{ product: any }>('/admin/products', { method: 'POST', body: JSON.stringify(productData) }),
  adminUpdateProduct: (id: string, productData: any) => request<{ product: any }>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(productData) }),
  adminDeleteProduct: (id: string) => request<any>(`/admin/products/${id}`, { method: 'DELETE' }),
  adminGetOrders: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') searchParams.append(k, String(v));
    });
    return request<any[]>(`/admin/orders?${searchParams.toString()}`);
  },
  adminUpdateOrderStatus: (id: string, status: string, note?: string) =>
    request<{ order: any }>(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, note }) }),
  adminHandleReturn: (id: string, action: 'approve' | 'reject', note?: string) =>
    request<{ order: any }>(`/admin/orders/${id}/return-action`, { method: 'POST', body: JSON.stringify({ action, note }) }),
  adminGetCustomers: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') searchParams.append(k, String(v));
    });
    return request<any[]>(`/admin/customers?${searchParams.toString()}`);
  },
  adminToggleCustomerActive: (id: string) => request<any>(`/admin/customers/${id}/toggle-active`, { method: 'PATCH' }),
  adminGetCoupons: () => request<{ coupons: any[] }>('/admin/coupons'),
  adminCreateCoupon: (couponData: any) => request<{ coupon: any }>('/admin/coupons', { method: 'POST', body: JSON.stringify(couponData) }),
  adminUpdateCoupon: (id: string, couponData: any) => request<{ coupon: any }>(`/admin/coupons/${id}`, { method: 'PUT', body: JSON.stringify(couponData) }),
  adminGetQuestions: () => request<{ questions: any[] }>('/admin/questions'),
  adminAnswerQuestion: (id: string, answer: string) => request<{ question: any }>(`/admin/questions/${id}/answer`, { method: 'PUT', body: JSON.stringify({ answer }) }),
  adminGetReviews: () => request<{ reviews: any[] }>('/admin/reviews'),
  adminDeleteReview: (id: string) => request<any>(`/admin/reviews/${id}`, { method: 'DELETE' }),
};
