# PRD — Product Requirements Document

## Vision

TIX aims to be a fast, user-friendly Arabic e-commerce frontend for Egyptian shoppers, showcasing curated products with competitive pricing and fast delivery.

## Target Audience

- Arabic-speaking shoppers in Egypt
- Mobile-first users, but responsive across desktop/tablet

## Goals

- Provide clear, trustable product listings with localized pricing
- Make checkout frictionless (guest and authenticated flows)
- Support wishlists and order history for repeat customers

## Key Features (MVP)

1. Product browsing and search
2. Product detail pages with images and variants
3. Cart management and checkout flow
4. User authentication and order history
5. Wishlist

## Prioritization

- Must-have: product browsing, cart, checkout, auth
- Should-have: wishlist persistence to backend, saved addresses
- Nice-to-have: advanced product recommendations, multi-language (future)

## User Stories

- As a shopper, I can browse products by category and search for items.
- As a shopper, I can view product details and see the price and discount.
- As a shopper, I can add items to my cart and adjust quantities.
- As a shopper, I can checkout as a guest or sign in to use saved addresses.
- As a shopper, I can add products to a wishlist.

## Success Metrics

- Conversion rate (visitors → orders)
- Average time to checkout
- Cart abandonment rate
- Page load time and Core Web Vitals

## Release Plan

- Phase 1 (MVP): product browse, product detail, cart, checkout (4 weeks)
- Phase 2: auth, orders, wishlist persistence, performance optimizations (2–3 weeks)
- Phase 3: analytics, recommendations, A/B testing (ongoing)

## Constraints & Risks

- Dependent on backend API endpoints; clearly defined API contract is required.
- Payment gateway integration and PCI compliance are out of scope for initial MVP unless backend handles payment tokenization.

## Stakeholders

- Product Owner: (name/email)
- Engineering Lead: (name/email)
- Design Lead: (name/email)

## Appendix

- See `lib/api.ts` for the frontend Axios instance and auth behavior.
- See `next.config.mjs` for image provider and security header configuration.
