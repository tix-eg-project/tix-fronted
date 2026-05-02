import { NextRequest, NextResponse } from 'next/server';

// منتجات وهمية للعرض
const mockProducts = [
  {
    id: 1,
    name: 'سماعة رأس لاسلكية',
    price_after: 299.99,
    price_before: 499.99,
    discount: 40,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
    reviews: { average_rating: 4.5, count: 128 },
    category_id: 1,
  },
  {
    id: 2,
    name: 'ساعة ذكية',
    price_after: 199.99,
    price_before: 349.99,
    discount: 43,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
    reviews: { average_rating: 4.8, count: 256 },
    category_id: 1,
  },
  {
    id: 3,
    name: 'كاميرا ويب احترافية',
    price_after: 149.99,
    price_before: 249.99,
    discount: 40,
    images: ['https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=500'],
    reviews: { average_rating: 4.3, count: 89 },
    category_id: 1,
  },
  {
    id: 4,
    name: 'جهاز شحن سريع',
    price_after: 79.99,
    price_before: 129.99,
    discount: 38,
    images: ['https://images.unsplash.com/photo-1569163139394-de4798aa62b8?w=500'],
    reviews: { average_rating: 4.6, count: 145 },
    category_id: 1,
  },
  {
    id: 5,
    name: 'قميص فضفاض مريح',
    price_after: 99.99,
    price_before: 179.99,
    discount: 44,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
    reviews: { average_rating: 4.4, count: 203 },
    category_id: 2,
  },
  {
    id: 6,
    name: 'جينز أزرق كلاسيكي',
    price_after: 129.99,
    price_before: 219.99,
    discount: 41,
    images: ['https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500'],
    reviews: { average_rating: 4.7, count: 178 },
    category_id: 2,
  },
  {
    id: 7,
    name: 'حذاء رياضي أنيق',
    price_after: 149.99,
    price_before: 279.99,
    discount: 46,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
    reviews: { average_rating: 4.9, count: 312 },
    category_id: 2,
  },
  {
    id: 8,
    name: 'خلفية الماكياج المثالية',
    price_after: 59.99,
    price_before: 99.99,
    discount: 40,
    images: ['https://images.unsplash.com/photo-1596462502278-bc52fe00eb1e?w=500'],
    reviews: { average_rating: 4.5, count: 234 },
    category_id: 3,
  },
  {
    id: 9,
    name: 'أحمر شفاه فاخر',
    price_after: 89.99,
    price_before: 149.99,
    discount: 40,
    images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500'],
    reviews: { average_rating: 4.6, count: 167 },
    category_id: 3,
  },
  {
    id: 10,
    name: 'كريم الوجه المرطب',
    price_after: 79.99,
    price_before: 129.99,
    discount: 38,
    images: ['https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500'],
    reviews: { average_rating: 4.7, count: 289 },
    category_id: 3,
  },
  {
    id: 11,
    name: 'منظف العميق للبشرة',
    price_after: 69.99,
    price_before: 119.99,
    discount: 42,
    images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500'],
    reviews: { average_rating: 4.4, count: 145 },
    category_id: 3,
  },
  {
    id: 12,
    name: 'سوار معدني فاخر',
    price_after: 199.99,
    price_before: 349.99,
    discount: 43,
    images: ['https://images.unsplash.com/photo-1535872066500-cb06b226d4d7?w=500'],
    reviews: { average_rating: 4.8, count: 98 },
    category_id: 4,
  },
];

const mockCategories = [
  { id: 1, name: { ar: 'إلكترونيات', en: 'Electronics' }, slug: 'electronics' },
  { id: 2, name: { ar: 'ملابس وأحذية', en: 'Clothing' }, slug: 'clothing' },
  { id: 3, name: { ar: 'مستحضرات تجميل', en: 'Beauty' }, slug: 'beauty' },
  { id: 4, name: { ar: 'إكسسوارات', en: 'Accessories' }, slug: 'accessories' },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '8');
  const categoryId = searchParams.get('category_id');
  const query = searchParams.get('q');

  let filtered = [...mockProducts];

  // فلترة حسب الفئة
  if (categoryId) {
    filtered = filtered.filter(p => p.category_id === parseInt(categoryId));
  }

  // بحث
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(p => p.name.includes(q));
  }

  // تحديد العدد
  const products = filtered.slice(0, limit);

  return NextResponse.json({
    status: true,
    data: products,
    total: filtered.length,
  });
}
