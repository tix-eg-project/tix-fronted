# TIX - Next.js E-commerce Frontend

TIX is a Next.js-based e-commerce frontend tailored for Arabic (RTL) users in Egypt. It provides product browsing, cart and wishlist management, authentication, and checkout flows, and is designed to integrate with a headless API backend.

## Key Features

- Next.js 15 with TypeScript
- RTL-first layout and Arabic typography (Tajawal)
- Auth (token in cookie), Cart, Wishlist contexts
- Product listing and detail pages, search and filters
- Localized UI utilities and price formatting
- Toast notifications and client-side form handling
- Image remote patterns configured for admin/API/cloudinary

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS + PostCSS
- Axios (centralized `lib/api.ts`) + SWR
- React Hook Form + Zod for forms/validation
- Framer Motion, Swiper for UI
- react-toastify for notifications

## Repository Structure (high-level)

- `app/` — Next.js app routes and pages (server and client components)
- `components/` — Reusable UI components (Header, Footer, ProductCard, etc.)
- `context/` — React Context providers: `AuthContext`, `CartContext`, `WishlistContext`
- `lib/` — `api.ts` Axios instance and API base export
- `utils/` — helpers, formatters, type helpers
- `public/` — static assets
- `next.config.mjs`, `tailwind.config.ts`, `Dockerfile`, `nginx.conf` — deployment and build config

## Environment & Configuration

Required environment variables (at least in production):

- `NEXT_PUBLIC_API_URL` — Base URL for the backend API (example: `https://api.tix-eg.com`)

The Axios instance in `lib/api.ts` prepends `/api` to `NEXT_PUBLIC_API_URL`. The app relies on a cookie named `auth_token` for user authentication.

## Scripts

- `npm run dev` — Start Next.js dev server
- `npm run build` — Build for production
- `npm run start` — Start Next.js production server (after build)
- `npm run lint` — Run ESLint
- `npm run type-check` — Run TypeScript checks

## Running Locally

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file and set `NEXT_PUBLIC_API_URL`:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
```

3. Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 to view the app.

## Deployment Notes

- `next.config.mjs` sets `output: 'standalone'` — the project can be packaged for container deployment.
- `Dockerfile` and `nginx.conf` are present for containerized deployment; ensure `NEXT_PUBLIC_API_URL` is configured in the runtime environment.
- The Next `images.remotePatterns` include `admin.tix-eg.com`, `api.tix-eg.com`, and common CDNs.

## API & Auth Behavior

- All HTTP requests use the Axios instance in `lib/api.ts`.
- `auth_token` cookie is attached to requests if present; 401 responses clear the cookie and redirect to `/login`.

## Localization & Accessibility

- RTL layout (`lang="ar"`, `dir="rtl"`) and Arabic font (`Tajawal`) are configured in `app/layout.tsx`.
- Price formatting uses locale `ar-EG`.

## Contributing

- Follow existing code style and TypeScript types.
- Run `npm run type-check` and `npm run lint` before creating PRs.

## Files to Inspect

- [app/layout.tsx](app/layout.tsx)
- [lib/api.ts](lib/api.ts)
- [components/Header.tsx](components/Header.tsx)
- [context/AuthContext.tsx](context/AuthContext.tsx)
- [utils/helpers.ts](utils/helpers.ts)

## Pages Map

This section lists the application routes (under `app/`) and a short description of each page's purpose.

- `/` — Home page: landing content, hero banners, featured and recommended products.
- `/about` — About TIX: company/product information and mission.
- `/account` — Account dashboard (layout and overview for authenticated users).
  - `/account` — Account overview: profile summary and quick links.
  - `/account/orders` — Orders list: displays user's past orders.
  - `/account/orders/[id]` — Order detail: shows order items, status, and tracking info.
  - `/account/wishlist` — Wishlist: saved products for later (managed via `WishlistContext`).
- `/cart` — Shopping cart: list of selected products, quantity controls, and totals.
- `/checkout` — Checkout flow: collect shipping/payment info and submit order.
- `/contact` — Contact page: contact form or support information.
- `/forgot-password` — Password reset: request/reset password flows.
- `/login` — Login page: user authentication form.
- `/offers` — Offers/Deals: promotional and discounted products listing.
- `/privacy` — Privacy policy: legal/privacy information.
- `/product/[id]` — Product detail page: detailed product information, images, and add-to-cart.
  - Client helper: `ProductDetailClient.tsx` contains client-side product UI and interactions.
- `/products` — Product listing: browse products, categories, and filters.
- `/register` — Registration page: create a new account.
- `/return-policy` — Return policy: returns and refunds information.
- `/terms` — Terms and conditions: legal terms for using the service.
- `/sitemap` — Auto-generated sitemap route (if enabled).

## Contact

For questions about the frontend or API contract, reach out to the project maintainers.
