import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const metadata: Metadata = {
  title: {
    default: 'TIX - تسوق أفضل المنتجات بأفضل الأسعار',
    template: '%s | TIX',
  },
  description: 'منصة TIX للتجارة الإلكترونية في مصر - ملابس، إلكترونيات، مستحضرات تجميل مع توصيل سريع لجميع أنحاء مصر',
  keywords: ['تسوق اون لاين', 'تيكس', 'منتجات مصر', 'تسوق', 'أون لاين', 'TIX'],
  openGraph: {
    title: 'TIX - منصة التسوق الإلكتروني',
    description: 'تسوق أفضل المنتجات بأفضل الأسعار مع توصيل سريع لجميع أنحاء مصر',
    url: 'https://tix-eg.com',
    siteName: 'TIX',
    locale: 'ar_EG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TIX - منصة التسوق الإلكتروني',
    description: 'تسوق أفضل المنتجات بأفضل الأسعار',
  },
  icons: {
    icon: '/logo.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
              <ToastContainer
                position="top-left"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
