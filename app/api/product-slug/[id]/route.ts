const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.tix-eg.com'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      headers: { Accept: 'application/json', 'Accept-Language': 'ar' },
      next: { revalidate: 300 },
    })
    if (res.ok) {
      const data = await res.json()
      return Response.json({ slug: data?.data?.slug ?? null })
    }
  } catch {}
  return Response.json({ slug: null })
}
