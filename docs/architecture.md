# Jastip Platform Architecture (Stage 1)

## 1) Single-Project Multi-Role Architecture

- One Express app (`app.js`) serves public + admin + jastiper + buyer routes.
- One MySQL database (`jastip_platform`) stores all entities.
- Buyer conversion strategy is **guest-first checkout**:
  - browsing and checkout can be completed without account registration
  - buyer account creation is optional and can be offered after successful checkout/payment
- Role isolation is done via middleware and route namespaces:
  - `/admin/*`
  - `/jastiper/*`
  - `/buyer/*`
  - public routes at `/`

## 2) Folder Structure

```
controllers/
middleware/
models/
routes/
views/
public/
uploads/
utils/
config/
sql/
docs/
app.js
index.js
```

## 3) Route Structure (Stage 1 skeleton)

### Public
- `GET /`
- `GET /login`
- `GET /register`
- `GET /trip/:slug`
- `GET /trip/:slug/product/:productSlug`
- `GET /cart`
- `GET /checkout`

### Auth
- `POST /login`
- `POST /register`
- `POST /logout`

### Jastiper
- `GET /jastiper/dashboard`
- `GET /jastiper/profile`
- `GET /jastiper/trips`
- `GET /jastiper/trips/create`
- `GET /jastiper/trips/:id/edit`
- `GET /jastiper/trips/:id/products`
- `GET /jastiper/products/create`
- `GET /jastiper/products/:id/edit`
- `GET /jastiper/orders`
- `GET /jastiper/orders/:id`

### Buyer
- `GET /buyer/dashboard`
- `GET /buyer/profile`
- `GET /buyer/orders`
- `GET /buyer/orders/:id`
- `GET /buyer/payments`

> Note: `/buyer/*` routes are for optional account users. Core checkout flow remains available for guests.

### Admin
- `GET /admin/dashboard`
- `GET /admin/users`
- `GET /admin/users/:id`
- `GET /admin/verifications`
- `GET /admin/jastipers`
- `GET /admin/trips`
- `GET /admin/products`
- `GET /admin/orders`
- `GET /admin/payments`
- `GET /admin/reports`

## 4) Middleware Plan

- `attachAuthUser`: injects `session.user` and flash messages into EJS locals.
- `authMiddleware`: requires authenticated session user.
- `roleMiddleware`: role-based protection (`admin`, `jastiper`, `buyer`).
- `uploadMiddleware`: multer storage + file validation for KTP and product images.
- `validationMiddleware`: central `express-validator` error handling.
- `notFoundHandler`, `errorHandler`: centralized fallback and exception rendering.

## 5) Database Relationship Overview

- `users` is the core identity table with role, auth, and status.
- `user_profiles` is one-to-one with `users`.
- `user_verifications` tracks KTP verification requests and admin review.
- `trips` belongs to jastiper (`users.id`).
- `products` belongs to trip and jastiper.
- `product_images` and `product_variants` belong to product.
- `carts` belongs to buyer; `cart_items` belong to cart.
- `orders` connects buyer, jastiper, trip, and shipping snapshot.
- `orders.buyer_id` is nullable to support guest checkout. Guest identity can be stored in
  `guest_email` and `guest_phone`.
- `order_items` stores immutable item snapshots per order.
- `payments` belongs to order and buyer; `payment_logs` stores callback history.
- `payments.buyer_id` is nullable for guest payers; guest payment identity can be stored in
  `payer_email` and `payer_phone`.
- `addresses` stores buyer addresses.
- `activity_logs` stores audit trails across entities.
- `admin_notes` stores internal moderation annotations.

See detailed schema and indexes in: `sql/001_init_schema.sql`.

## 6) Production-Minded Principles Applied

- Parameterized SQL only (`?`) will be used at model layer (Stage 2+).
- Controllers stay thin and delegate data/business logic to models/services.
- Status enums centralize lifecycle of users/trips/products/orders/payments.
- Dedicated indexes are added for common filters (role/status/date/destination/reference).
- File upload constraints prevent non-image content and oversized files.
