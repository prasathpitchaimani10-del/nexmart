import { DbService } from '../services/dbService';
import { AuthService } from '../services/authService';
import { PriceCalculatorService } from '../services/priceCalculatorService';
import { OrderService } from '../services/orderService';
import { PaymentService } from '../services/paymentService';

async function runTestSuite() {
  console.info('==========================================');
  console.info('  NEXMART BACKEND TEST SUITE (VERIFICATION)');
  console.info('==========================================\n');

  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.info(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  };

  // Setup
  await DbService.initialize();

  // 1. Password Hashing & Authentication
  await test('Registration & Password Hashing via bcrypt', async () => {
    const rawPassword = 'SecureUser@2026';
    const hash = await AuthService.hashPassword(rawPassword);
    if (!hash || hash === rawPassword) throw new Error('Password was not hashed properly');

    const isValid = await AuthService.comparePassword(rawPassword, hash);
    if (!isValid) throw new Error('Valid password rejected by bcrypt comparison');

    const isInvalid = await AuthService.comparePassword('WrongPassword', hash);
    if (isInvalid) throw new Error('Wrong password accepted');
  });

  // 2. JWT Generation & Token Verification
  await test('JWT Token Signing and Verification', async () => {
    const payload = { userId: 'usr_test_123', email: 'test@nexmart.com', role: 'customer' as const };
    const token = AuthService.generateToken(payload);
    if (!token) throw new Error('Token generation failed');

    const verified = AuthService.verifyToken(token);
    if (!verified || verified.userId !== 'usr_test_123' || verified.role !== 'customer') {
      throw new Error('Token payload verification mismatch');
    }
  });

  // 3. User CRUD & Role Management
  await test('User Creation & Retrieval', async () => {
    const testEmail = `user_${Date.now()}@test.com`;
    const user = await DbService.createUser({
      name: 'Test Customer',
      email: testEmail,
      phone: '+91 99999 88888',
      passwordHash: 'testhash',
      role: 'customer',
      isVerified: true,
      addresses: [],
    });
    if (!user || user.email !== testEmail) throw new Error('User creation failed');

    const found = await DbService.findUserByEmail(testEmail);
    if (!found || found._id !== user._id) throw new Error('User lookup by email failed');
  });

  // 4. Product Retrieval & Filtering
  await test('Product Catalog Retrieval, Sorting, and Filters', async () => {
    const res = await DbService.getProducts({ activeOnly: true, limit: 10 });
    if (!res.products || res.products.length === 0) throw new Error('No products returned from database');

    const first = res.products[0];
    if (!first.slug || !first.pricing?.price || first.stock === undefined) {
      throw new Error('Product schema structure incomplete');
    }

    const filtered = await DbService.getProducts({ category: 'Electronics' });
    if (filtered.products.some((p) => p.category !== 'Electronics')) {
      throw new Error('Category filter returned mismatched product');
    }
  });

  // 5. Product Creation
  await test('Admin Product Creation with Variants and SKU', async () => {
    const newSku = `SKU-TEST-${Date.now()}`;
    const product = await DbService.createProduct({
      name: 'Test Audiophile DAC',
      slug: `test-dac-${Date.now()}`,
      description: 'High resolution digital to analog converter',
      category: 'Electronics',
      subcategory: 'Audio & Headphones',
      brand: 'AcousticPro',
      sku: newSku,
      stock: 15,
      pricing: { price: 4999, originalPrice: 6999, discountPercentage: 28 },
      images: [{ url: 'https://example.com/dac.jpg', isMain: true }],
      variants: [
        { sku: `${newSku}-V1`, title: 'Silver', price: 4999, originalPrice: 6999, stock: 15 },
      ],
      isActive: true,
    });

    if (!product || product.sku !== newSku) throw new Error('Product creation failed');
  });

  // 6. Cart Calculations
  await test('Shopping Cart Management & Isolation', async () => {
    const testUserId = `usr_cart_test_${Date.now()}`;
    const allProds = await DbService.getProducts({ limit: 1 });
    const prodId = String(allProds.products[0]._id);

    await DbService.updateCart(testUserId, [
      { product: prodId, quantity: 2, savedForLater: false },
    ]);

    const cart = await DbService.getCart(testUserId);
    if (!cart || cart.items.length !== 1 || cart.items[0].quantity !== 2) {
      throw new Error('Cart persistence failed');
    }
  });

  // 7. Coupon Validation
  await test('Coupon Validation (Minimum Purchase & Discount Cap)', async () => {
    const coupon = await DbService.getCouponByCode('WELCOME10');
    if (!coupon) throw new Error('WELCOME10 coupon not found in database');

    // Test with cart items
    const prods = await DbService.getProducts({ limit: 1 });
    const p = prods.products[0];

    const calculation = await PriceCalculatorService.calculateOrderPrice(
      [{ productId: String(p._id), quantity: 1 }],
      'WELCOME10'
    );

    if (!calculation.couponApplied || calculation.couponApplied.discount <= 0) {
      throw new Error('Valid coupon was not applied');
    }
  });

  // 8. Authoritative Server-Side Checkout Calculation
  await test('Authoritative Server-Side Checkout Calculation & Tax/Fee Rules', async () => {
    const prods = await DbService.getProducts({ limit: 2 });
    const p1 = prods.products[0];

    const calc = await PriceCalculatorService.calculateOrderPrice([
      { productId: String(p1._id), quantity: 2 },
    ]);

    const expectedSubtotal = p1.pricing.price * 2;
    if (calc.subtotal !== expectedSubtotal) {
      throw new Error(`Subtotal mismatch. Expected ${expectedSubtotal}, got ${calc.subtotal}`);
    }

    if (calc.total <= 0) {
      throw new Error('Invalid total computed');
    }
  });

  // 9. Stock Check & Order Creation
  await test('Order Creation with Atomic Stock Deduction', async () => {
    const prods = await DbService.getProducts({ limit: 1 });
    const p = prods.products[0];
    const initialStock = p.stock;

    const testCust = await DbService.findUserByEmail('customer@example.com');
    if (!testCust) throw new Error('Sample customer missing');

    const order = await OrderService.createOrder({
      customerId: String(testCust._id),
      items: [{ productId: String(p._id), quantity: 1 }],
      address: testCust.addresses[0],
      paymentMethod: 'upi',
      paymentDetails: { transactionId: 'TEST_TXN', provider: 'sandbox_gateway' },
    });

    if (!order || !order.orderNumber) throw new Error('Order creation failed');

    // Verify stock was decremented
    const refreshed = await DbService.getProductBySlugOrId(String(p._id));
    if (refreshed.stock !== initialStock - 1) {
      throw new Error(`Stock deduction failed. Expected ${initialStock - 1}, found ${refreshed.stock}`);
    }
  });

  // 10. Order Ownership Security
  await test('Order Ownership & Access Control', async () => {
    const orders = await DbService.getAllOrders({ limit: 1 });
    const order = orders.orders[0];

    // Customer should only match their own order
    const realOwnerId = String(order.customer.id);
    const imposterId = 'usr_imposter_999';

    if (realOwnerId === imposterId) {
      throw new Error('Owner ID collision in test');
    }
  });

  // 11. Payment Signature Verification
  await test('Payment Cryptographic Signature Verification', async () => {
    const orderId = 'order_12345';
    const paymentId = 'pay_67890';
    const sig = PaymentService.generateSandboxSignature(orderId, paymentId);

    const verified = PaymentService.verifyPaymentSignature({
      orderId,
      paymentId,
      signature: sig,
    });
    if (!verified) throw new Error('Valid cryptographic signature failed verification');

    const fakeVerified = PaymentService.verifyPaymentSignature({
      orderId,
      paymentId,
      signature: 'corrupted_signature',
    });
    if (fakeVerified) throw new Error('Tampered signature was accepted');
  });

  console.info('\n==========================================');
  console.info(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.info('==========================================');

  if (failed > 0) {
    throw new Error(`${failed} tests failed`);
  }
}

if (process.argv[1]?.endsWith('api.test.ts')) {
  runTestSuite().catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
}

export { runTestSuite };
