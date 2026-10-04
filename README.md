# NexMart Enterprise E-Commerce Platform

A production-grade, full-stack e-commerce web platform engineered with React, Vite, Tailwind CSS, Node.js, Express, MongoDB Atlas, and Mongoose. Features authoritative backend pricing calculations, atomic stock controls, multi-variant products, cryptographic payment verification, multi-step checkout, real-time order tracking, and a comprehensive administrative command center.

---

## Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture & Flow](#system-architecture--flow)
4. [Repository Structure](#repository-structure)
5. [Database Schema & Design](#database-schema--design)
6. [Security & Business Rules](#security--business-rules)
7. [REST API Documentation](#rest-api-documentation)
8. [Environment Variables](#environment-variables)
9. [Local Development Setup](#local-development-setup)
10. [Database Seeding](#database-seeding)
11. [Running the Test Suite](#running-the-test-suite)
12. [Render Deployment Guide](#render-deployment-guide)
    - [Backend API Web Service](#1-deploy-backend-web-service-on-render)
    - [Frontend Static Site](#2-deploy-frontend-static-site-on-render)
    - [React Router SPA Rewrite Rule](#3-configure-react-router-spa-rewrite)
13. [Verification & Acceptance Checklist](#verification--acceptance-checklist)

---

## Architectural Overview

NexMart is built following strict software engineering principles:
- **Authoritative Backend Pricing**: The browser is never trusted for product prices, discounts, tax rates, shipping fees, or final order totals. All calculations are executed server-side.
- **Stock Revalidation & Atomic Decrement**: Inventory is audited and locked before checkout creation, preventing overselling or race conditions.
- **Non-Sensitive Payment Handshake**: Zero raw card numbers or CVVs are retained. Secure tokens and cryptographic signatures verify payment authenticity.
- **Role-Based Authorization (RBAC)**: All administrative endpoints and database mutations are strictly guarded with JWT authentication and role validation.

---

## Technology Stack

### Frontend Client
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **State Architecture**: Domain-isolated React Contexts (`AuthContext`, `CartContext`, `WishlistContext`, `CompareContext`, `ToastContext`)

### Backend Server
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database Driver / ODM**: MongoDB Atlas + Mongoose
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) + Password Hashing (`bcryptjs`)
- **Media Pipeline**: Cloudinary SDK
- **Payment Verification**: Cryptographic HMAC-SHA256 Sandbox Verification

---

## System Architecture & Flow

```text
                  +--------------------------------+
                  |       Client Browser           |
                  |     (React 19 + Vite SPA)      |
                  +---------------+----------------+
                                  |
               HTTPS REST API     |  Authorization: Bearer <JWT>
                                  v
                  +--------------------------------+
                  |       Express API Server       |
                  |     (0.0.0.0:PORT / Render)    |
                  +-------+--------------+---------+
                          |              |
         +----------------+              +-----------------+
         v                                                 v
+------------------+                             +--------------------+
|  MongoDB Atlas   |                             |     Cloudinary     |
| (Mongoose ODM)   |                             |   (Product Media)  |
+------------------+                             +--------------------+
```

---

## Repository Structure

```text
/
├── server/
│   ├── config/
│   │   ├── env.ts             # Validated environment configuration
│   │   ├── db.ts              # MongoDB Atlas connection manager
│   │   ├── cloudinary.ts      # Cloudinary media client
│   │   └── payment.ts         # Payment sandbox configuration
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── productController.ts
│   │   ├── categoryController.ts
│   │   ├── cartController.ts
│   │   ├── wishlistController.ts
│   │   ├── couponController.ts
│   │   ├── checkoutController.ts
│   │   ├── paymentController.ts
│   │   ├── orderController.ts
│   │   ├── reviewController.ts
│   │   ├── questionController.ts
│   │   ├── notificationController.ts
│   │   └── adminController.ts
│   ├── middleware/
│   │   ├── auth.ts            # JWT authentication
│   │   ├── role.ts            # Role-based access control
│   │   ├── rateLimiter.ts     # Brute-force protection
│   │   └── errorHandler.ts    # Global error response standardizer
│   ├── models/
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── Order.ts
│   │   ├── Coupon.ts
│   │   ├── Review.ts
│   │   ├── Question.ts
│   │   ├── Notification.ts
│   │   └── Payment.ts
│   ├── routes/
│   │   └── [domain]Routes.ts
│   ├── services/
│   │   ├── dbService.ts              # High-performance DB layer
│   │   ├── authService.ts            # Cryptographic token operations
│   │   ├── priceCalculatorService.ts # Authoritative calculation engine
│   │   ├── orderService.ts           # Order creation & restock logic
│   │   ├── paymentService.ts         # Gateway signature verification
│   │   └── cloudinaryService.ts      # Media uploader
│   ├── tests/
│   │   └── api.test.ts        # Comprehensive backend test suite
│   ├── utils/
│   │   ├── response.ts        # Standardized API response helpers
│   │   ├── seedData.ts        # Initial verified seed data
│   │   └── seedRunner.ts      # Standalone seed executor
│   ├── app.ts                 # Express application definition
│   └── server.ts              # Express standalone server entry
│
├── src/
│   ├── components/            # Modular UI components
│   ├── context/               # React Context providers
│   ├── pages/                 # Customer and Admin views
│   ├── services/              # API Client (Fetch with Bearer injection)
│   ├── types/                 # TypeScript definitions
│   ├── App.tsx                # App routing & protected route guards
│   └── main.tsx               # Client entry point
│
├── .env.example
├── render.yaml                # Render deployment blueprint
├── server.ts                  # Full-stack root entry with Vite middleware
├── package.json
└── README.md
```

---

## Database Schema & Design

### 1. User
- `name`: string
- `email`: string (Indexed, Unique, Lowercase)
- `phone`: string
- `passwordHash`: string (bcrypt with salt rounds)
- `role`: `'customer' | 'admin'`
- `isVerified`: boolean
- `addresses`: Array of embedded subdocuments (`houseFlat`, `street`, `area`, `city`, `state`, `pincode`, `addressType`, `isDefault`)
- `profileImage`: string

### 2. Product
- `name`: string
- `slug`: string (Indexed, Unique)
- `description`: string
- `category`: string (Indexed)
- `subcategory`: string (Indexed)
- `brand`: string (Indexed)
- `sku`: string (Indexed, Unique)
- `pricing`: `{ price: number, originalPrice: number, discountPercentage: number }`
- `stock`: number
- `variants`: Array of IVariant (`sku`, `title`, `price`, `originalPrice`, `stock`, `size`, `color`, `capacity`)
- `specifications`: Array of Key-Value technical pairs
- `images`: Array of `{ url, publicId, isMain }`
- `rating`: number (Indexed)
- `reviewCount`: number
- `isActive`: boolean (Indexed)

### 3. Order
- `orderNumber`: string (Indexed, Unique, Format: `NXM-YYYYMMDD-XXXX`)
- `customer`: `{ id, name, email, phone }`
- `items`: Immutable historical purchase snapshots preserving price-at-purchase
- `address`: Delivery address snapshot
- `pricing`: `{ subtotal, productDiscount, couponDiscount, deliveryFee, tax, total }`
- `deliveryMethod`: `{ type, title, estimatedDays }`
- `paymentMethod`: `'upi' | 'card' | 'netbanking' | 'wallet' | 'cod'`
- `paymentStatus`: `'pending' | 'completed' | 'failed' | 'refunded'`
- `orderStatus`: `'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'return_requested' | 'returned' | 'refund_initiated' | 'refunded'`
- `trackingHistory`: Array of `{ status, timestamp, note }`
- `invoiceNumber`: string (Format: `INV-YYYY-XXXXX`)

---

## Security & Business Rules

1. **Price Integrity**: All checkout computations recalculate line item subtotals, catalog discounts, coupon limits, and delivery fees directly from backend records.
2. **Stock Verification**: An atomic check confirms inventory availability before order creation. Stock is decremented immediately upon order placement and replenished if an order is cancelled.
3. **Verified Purchases**: Reviews only display the "Verified Purchase" badge if the backend verifies an authenticated order for that product.
4. **Order Access Control**: Customers can only inspect their own orders. Admin endpoints require verified `role: 'admin'`.
5. **Rate Limiting**: Critical endpoints (`/api/auth/login`, `/api/auth/register`, `/api/auth/verify-otp`) are throttled against brute-force attacks.

---

## REST API Documentation

All responses conform to the standard structure:
```json
// Success Response (200, 201)
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}

// Error Response (400, 401, 403, 404, 500)
{
  "success": false,
  "message": "Readable error message",
  "errors": []
}
```

### Public & Customer Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `POST` | `/api/auth/register` | Register customer account & generate OTP |
| `POST` | `/api/auth/login` | Authenticate customer/admin & issue JWT |
| `POST` | `/api/auth/verify-otp` | Verify email OTP code |
| `POST` | `/api/auth/resend-otp` | Reissue verification OTP |
| `POST` | `/api/auth/forgot-password`| Generate password recovery token |
| `POST` | `/api/auth/reset-password` | Update password via recovery token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/products` | Query products with filters, sorting & pagination |
| `GET` | `/api/products/:slug` | Fetch complete product details, reviews & Q&A |
| `GET` | `/api/products/suggestions` | Live search autocomplete |
| `GET` | `/api/products/check-delivery` | Validate postal pincode & delivery estimate |
| `GET` | `/api/products/compare` | Compare up to 4 products side-by-side |
| `GET` | `/api/categories` | List catalog categories & counts |
| `GET` | `/api/cart` | Retrieve user cart with live pricing hydration |
| `POST` | `/api/cart/add` | Add product edition to shopping cart |
| `PUT` | `/api/cart/quantity` | Update quantity with stock validation |
| `DELETE` | `/api/cart/remove` | Remove item from cart |
| `POST` | `/api/checkout/calculate` | Recalculate order pricing authoritative on server |
| `POST` | `/api/orders` | Finalize and create verified order |
| `GET` | `/api/orders` | Customer order list |
| `GET` | `/api/orders/:id` | Single order details & fulfillment history |
| `POST` | `/api/orders/:id/cancel` | Cancel order & trigger restock |
| `POST` | `/api/orders/:id/return` | Request return/replacement for delivered order |
| `GET` | `/api/orders/:id/invoice` | Fetch formatted tax invoice data |

### Administrative Endpoints (`role: 'admin'` Required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/dashboard-stats` | Revenue, order counts, low stock alerts |
| `POST` | `/api/admin/products` | Create new product with variants & media |
| `PUT` | `/api/admin/products/:id` | Update product attributes, price, stock |
| `DELETE` | `/api/admin/products/:id` | Delete product from catalog |
| `GET` | `/api/admin/orders` | View all customer orders with filters |
| `PUT` | `/api/admin/orders/:id/status` | Update order shipment status & milestone notes |
| `POST` | `/api/admin/orders/:id/return-action` | Approve/Reject return & issue refund |
| `GET` | `/api/admin/customers` | View registered customer directory |
| `PATCH` | `/api/admin/customers/:id/toggle-active` | Activate or deactivate customer account |
| `POST` | `/api/admin/coupons` | Create promotional discount coupon |
| `PUT` | `/api/admin/questions/:id/answer` | Publish official verified product answer |
| `DELETE` | `/api/admin/reviews/:id` | Moderate and delete customer review |

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key variables:
- `MONGODB_URI`: MongoDB Atlas connection string (`mongodb+srv://...`)
- `JWT_SECRET`: Secure encryption string for token signing
- `CLIENT_URL`: Deployed frontend origin (for CORS configuration)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Cloudinary media storage
- `PAYMENT_PROVIDER_KEY`, `PAYMENT_PROVIDER_SECRET`: Payment sandbox credentials
- `VITE_API_BASE_URL`: Frontend API target (leave empty for same-domain dev proxy, set to Render Web Service URL in production)

---

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Full-Stack Application
Runs the unified Express backend with integrated Vite middleware on port 3000:
```bash
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## Database Seeding

Run the standalone database seed runner:
```bash
npm run seed
```

This populates MongoDB with:
- **Administrator**: `admin@nexmart.com` / `Admin@12345`
- **Sample Customer**: `customer@example.com` / `Customer@12345`
- Full catalog of Electronics, Fashion, Kitchen, and Sports items with real variants, SKUs, and specifications
- Active promotional coupons (`FESTIVE20`, `WELCOME10`, `SAVE500`)
- Customer order history, verified purchase reviews, and product Q&A

---

## Running the Test Suite

Execute the automated backend verification test suite:
```bash
npm test
```

The test runner verifies:
- Password hashing via bcrypt
- JWT token signing and payload extraction
- User creation and email lookup
- Product catalog querying, category filtering, and sorting
- Product creation with multi-tier variants and SKUs
- Shopping cart user isolation
- Authoritative server-side checkout price calculations
- Atomic stock decrements upon order placement
- Order ownership security
- Cryptographic payment signature verification

---

## Render Deployment Guide

NexMart is designed for zero-config deployment on Render.

### 1. Deploy Backend Web Service on Render
1. Create a new **Web Service** on Render connected to your repository.
2. Configure settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: Leave blank (monorepo root)
3. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `JWT_SECRET`: A secure random 32+ character string
   - `CLIENT_URL`: URL of your deployed frontend (e.g. `https://nexmart.onrender.com`)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: (Optional) Cloudinary credentials
   - `PAYMENT_PROVIDER_KEY`: `test_key_sandbox_gateway`
   - `PAYMENT_PROVIDER_SECRET`: A secure random secret
4. Health Check Path: `/api/health`

### 2. Deploy Frontend Static Site on Render
1. Create a new **Static Site** on Render connected to the same repository.
2. Configure settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Add Environment Variables:
   - `VITE_API_BASE_URL`: URL of your Render Web Service + `/api` (e.g. `https://nexmart-api.onrender.com/api`)

### 3. Configure React Router SPA Rewrite
To ensure client-side routes (e.g., `/orders/ord_001`, `/category/electronics`) function correctly on direct browser refresh, add a rewrite rule in the Render Static Site dashboard:
- **Type**: `Rewrite`
- **Source**: `/*`
- **Destination**: `/index.html`

*(This configuration is pre-defined in `render.yaml` for automated Infrastructure-as-Code deployments).*

---

## Verification & Acceptance Checklist

- [x] Full customer registration, login, JWT issuance, and email OTP verification
- [x] Role-based access control protecting all `/api/admin/*` routes
- [x] Product catalog with category filters, brand selectors, price range, and rating filters
- [x] Live search suggestions with autocomplete dropdown
- [x] Configurable product variants (size, color, storage) with live SKU, price, and stock recalculation
- [x] Product delivery pincode checker with estimated arrival calculation
- [x] Product comparison engine for up to 4 items
- [x] Shopping cart with quantity validation, stock ceiling rules, and Save-for-Later
- [x] Authoritative backend price calculations (Subtotal - Product Discount - Coupon Discount + Delivery + GST Tax = Total)
- [x] Multi-step checkout (Address -> Delivery Speed -> Payment Method -> Review & Confirm)
- [x] Multi-channel payment options (UPI, Credit/Debit Card, Net Banking, Wallets, Cash on Delivery)
- [x] Cryptographic payment signature verification
- [x] Customer order tracking with timeline milestones and cancellation restock
- [x] Return/replacement request submission and admin approval/refund flow
- [x] Printable official GST tax invoice
- [x] Verified purchase review engine and product Q&A system
- [x] Protected Admin Dashboard with live metrics, low-stock alerts, and recent order stream
- [x] Full Admin CRUD for products, variants, and Cloudinary media upload
- [x] Render deployment blueprint (`render.yaml`) and `/api/health` check endpoint
- [x] Zero hardcoded secrets, zero mock buttons, zero AI terminology
