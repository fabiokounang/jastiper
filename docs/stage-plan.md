# Jastip SaaS Development Plan (Single App)

This project is built as **one Node.js + Express + EJS + MySQL application** with role-based modules (`admin`, `jastiper`, `buyer`) in a single codebase.

## Stage 1 - Architecture & Foundation

### Files to create
- `app.js`, `index.js`
- `config/db.js`, `config/constants.js`
- `middleware/*` for auth, role, upload, validation, errors
- `routes/*` split by public/auth/admin/jastiper/buyer
- `controllers/*` skeleton controllers
- `sql/001_init_schema.sql`
- `docs/architecture.md`, `docs/stage-plan.md`
- base `views/*` and `public/css/style.css`

### Routes to create
- Public: `/`, `/login`, `/register`, `/trip/:slug`, `/trip/:slug/product/:productSlug`, `/cart`, `/checkout`
- Jastiper: `/jastiper/dashboard`, `/jastiper/profile`, trip/product/order routes
- Buyer: `/buyer/dashboard`, `/buyer/profile`, `/buyer/orders`, `/buyer/payments`
- Admin: `/admin/dashboard`, `/admin/users`, `/admin/verifications`, `/admin/reports`, etc.

### Models needed
- user, userProfile, userVerification
- trip, product, productImage, productVariant
- cart, order, payment
- address, activityLog, adminNote

### Controllers needed
- authController
- publicController
- jastiperTripController, jastiperProductController, jastiperOrderController
- buyerCartController, buyerOrderController, buyerPaymentController
- adminDashboardController + monitoring controllers

### EJS views needed
- Public pages (home/trip/product/cart/checkout)
- Auth pages (login/register)
- Role dashboards
- CRUD forms + list pages per module
- Error pages (403/404/422/500)

### SQL tables involved
- all core tables are created in `sql/001_init_schema.sql`

---

## Stage 2 - Auth + Verification

### Files to create
- `models/userModel.js`, `models/userProfileModel.js`, `models/userVerificationModel.js`
- `controllers/authController.js` (full implementation)
- validators in `middleware` or `utils/validators`

### Routes
- `POST /register`, `POST /login`, `POST /logout` (account flow, mainly for jastiper and optional buyer account)
- optional: `GET /verification/status`
- guest-first strategy note:
  - buyers can continue checkout as guest in Stage 4
  - buyer account becomes optional for faster repeat checkout and order history

### SQL tables involved
- `users`, `user_profiles`, `user_verifications`, `activity_logs`

---

## Stage 3 - Jastiper Core Operations

### Files
- `controllers/jastiper/*.js`
- `models/tripModel.js`, `models/productModel.js`, `models/orderModel.js`

### Routes
- `/jastiper/trips/*`, `/jastiper/products/*`, `/jastiper/orders/*`

### SQL tables involved
- `trips`, `products`, `product_images`, `product_variants`, `orders`, `order_items`, `activity_logs`

---

## Stage 4 - Buyer Browsing + Cart + Checkout

### Files
- `controllers/publicBrowseController.js`, `controllers/buyerCartController.js`, `controllers/buyerOrderController.js`
- `models/cartModel.js`, `models/orderModel.js`, `models/addressModel.js`

### Routes
- `/trip/:slug`, `/trip/:slug/product/:productSlug`
- `/cart` CRUD actions
- `/checkout` submit order
- optional account route after checkout success (`/register?from=checkout` or lightweight account claim flow)

### SQL tables involved
- `carts`, `cart_items`, `orders`, `order_items`, `addresses`, `products`, `trips`
- with guest-first fields in `orders` (`checkout_mode`, `guest_email`, `guest_phone`)

---

## Stage 5 - Payment Architecture

### Files
- `controllers/paymentController.js`
- `models/paymentModel.js`, `models/paymentLogModel.js`
- `routes/paymentWebhookRoutes.js`

### Routes
- `/buyer/payments`
- `/payments/callback/mnc` (webhook)

### SQL tables involved
- `payments`, `payment_logs`, `orders`, `activity_logs`

---

## Stage 6 - Admin Monitoring & Reports

### Files
- `controllers/admin/*.js`
- report query models/services

### Routes
- `/admin/dashboard`, `/admin/users`, `/admin/verifications`, `/admin/trips`, `/admin/orders`, `/admin/reports`

### SQL tables involved
- all tables (read-heavy monitoring + moderation updates)

---

## Stage 7 - Hardening & Optimization

### Files
- validation updates across controllers
- pagination/search utility refinements
- security middleware config

### Focus
- input validation improvements
- pagination/search/filter optimization
- activity logging consistency
- SQL index review and query tuning
