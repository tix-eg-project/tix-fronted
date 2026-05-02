import { NextResponse } from 'next/server';

const mockCategories = [
  { id: 1, name: { ar: 'إلكترونيات', en: 'Electronics' }, slug: 'electronics' },
  { id: 2, name: { ar: 'ملابس وأحذية', en: 'Clothing' }, slug: 'clothing' },
  { id: 3, name: { ar: 'مستحضرات تجميل', en: 'Beauty' }, slug: 'beauty' },
  { id: 4, name: { ar: 'إكسسوارات', en: 'Accessories' }, slug: 'accessories' },
];

export async function GET() {
  return NextResponse.json({
    status: true,
    data: mockCategories,
  });
}
