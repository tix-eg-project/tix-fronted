import { NextRequest, NextResponse } from 'next/server';

const mockProducts = [
  { id: 1, name: 'سماعة رأس لاسلكية' },
  { id: 2, name: 'ساعة ذكية' },
  { id: 3, name: 'كاميرا ويب احترافية' },
  { id: 4, name: 'جهاز شحن سريع' },
  { id: 5, name: 'قميص فضفاض مريح' },
  { id: 6, name: 'جينز أزرق كلاسيكي' },
  { id: 7, name: 'حذاء رياضي أنيق' },
  { id: 8, name: 'خلفية الماكياج المثالية' },
  { id: 9, name: 'أحمر شفاه فاخر' },
  { id: 10, name: 'كريم الوجه المرطب' },
  { id: 11, name: 'منظف العميق للبشرة' },
  { id: 12, name: 'سوار معدني فاخر' },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q')?.toLowerCase() || '';

  if (!q) {
    return NextResponse.json({ status: true, data: [] });
  }

  const results = mockProducts.filter(p => p.name.includes(q));

  return NextResponse.json({
    status: true,
    data: results,
  });
}
