const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.tix-eg.com'

function getLang(req: Request): string {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(/(?:^|;\s*)lang=([^;]+)/)
  return match?.[1] === 'en' ? 'en' : 'ar'
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const lang = getLang(req)
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      headers: { Accept: 'application/json', 'Accept-Language': lang, lang },
      next: { revalidate: 300 },
    })
    if (res.ok) {
      const data = await res.json()
      return Response.json({ slug: data?.data?.slug ?? null })
    }
  } catch {}
  return Response.json({ slug: null })
}
