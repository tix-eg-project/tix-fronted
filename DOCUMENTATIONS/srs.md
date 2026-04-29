# SRS — Software Requirements Specification

## Project Overview

TIX is a localized e-commerce frontend built with Next.js and TypeScript. It targets Arabic-speaking users (RTL) and integrates with a separate backend API for products, authentication, orders, and payments.

### Purpose

This SRS describes the functional and non-functional requirements of the TIX frontend to guide development, testing, and integration with the backend API.

### Scope

- Browsing products (lists, filters, search)
- Product detail pages
- User authentication (sign up, login, logout)
- Shopping cart and checkout flow
- Orders list and order details
- Wishlist management
- Basic notifications and UI state

## System Context

- Frontend: Next.js app (this repository)
- Backend: REST API (base URL defined in `NEXT_PUBLIC_API_URL`)
- Authentication: Token-based using `auth_token` cookie

## Functional Requirements

1. Authentication
   - FR1.1: Users can register and log in via API.
   - FR1.2: On successful login, set `auth_token` cookie and `user_data` cookie (if provided).
   - FR1.3: All authenticated API calls should include the `Authorization: Bearer <token>` header.
   - FR1.4: On 401 responses, the frontend clears auth cookies and redirects to `/login`.

2. Product Catalog
   - FR2.1: Display lists of products with pagination or infinite scroll.
   - FR2.2: Provide product detail pages with images, descriptions, prices, and variants.
   - FR2.3: Show discounts and calculate discount percentage client-side using `utils/helpers.ts`.

3. Cart & Checkout
   - FR3.1: Users can add/remove items from the cart (persisted in context and optionally persisted via API for authenticated users).
   - FR3.2: Cart page shows totals, quantity controls, and price formatting in `ar-EG`.
   - FR3.3: Checkout flow submits order to the backend and handles success/error states.

4. Wishlist
   - FR4.1: Users can add/remove products to a wishlist in `WishlistContext`.
   - FR4.2: Wishlist persists per user if backend supports it.

5. Orders
   - FR5.1: Authenticated users can view past orders and order details.

6. Localization & UI
   - FR6.1: All UI is rendered RTL with Arabic font and strings.
   - FR6.2: Price formatting uses local currency `ج.م`.

## Non-Functional Requirements

- NFR1: Performance — pages should hydrate quickly and images should use optimized formats (AVIF/WebP where possible).
- NFR2: Security — follow secure headers (see `next.config.mjs` headers), sanitize user input.
- NFR3: Availability — app deployable as standalone Next.js app (Docker friendly).
- NFR4: Maintainability — TypeScript types and modular contexts/components.
- NFR5: Accessibility — basic semantic HTML structure and keyboard navigation.

## Data & API Contracts (Frontend Expectations)

- Base API: `${NEXT_PUBLIC_API_URL}/api` (configured in `lib/api.ts`)
- Auth cookie name: `auth_token`
- Standard response: JSON with `data`, `message`, and `errors` fields where applicable.

## Environment Variables

- `NEXT_PUBLIC_API_URL` — required

## Assumptions

- Backend exposes required product, cart, order, and auth endpoints.
- Backend may return localized fields or objects — frontend uses `utils/helpers.t()` to extract localized strings.

## Acceptance Criteria

- All pages render without TypeScript errors.
- Core user flows (browse, view product, add to cart, checkout as guest/auth) function end-to-end against staging API.
- App respects RTL and Arabic localization.
