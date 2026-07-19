const fs = require('fs')
const path = require('path')

function generateSlug(name) {
  return (name || '').trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w؀-ۿ-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80)
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.tix-eg.com'

async function generateSlugMap() {
  console.log('Fetching product list...')

  const listRes = await fetch(`${API_URL}/api/products?per_page=500`, {
    headers: { Accept: 'application/json' },
  })
  if (!listRes.ok) throw new Error(`List fetch failed: ${listRes.status}`)

  const listData = await listRes.json()
  const products = listData.data || []
  console.log(`Found ${products.length} products`)

  const slugMap = {}

  await Promise.all(
    products.map(async (product) => {
      try {
        const res = await fetch(`${API_URL}/api/products/${product.id}`, {
          headers: { Accept: 'application/json', 'Accept-Language': 'ar' },
        })
        if (!res.ok) return
        const data = await res.json()
        const p = data?.data
        // prefer backend slug, fallback to Arabic name slug
        const slug = p?.slug || generateSlug(p?.name?.ar || p?.name?.en || '')
        if (slug) slugMap[String(product.id)] = slug
      } catch {}
    })
  )

  const outPath = path.join(__dirname, '../lib/product-slug-map.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(slugMap, null, 2))
  console.log(`Slug map generated: ${Object.keys(slugMap).length} products → lib/product-slug-map.json`)
}

generateSlugMap().catch((e) => {
  console.error('Failed to generate slug map:', e.message)
  process.exit(0) // don't fail the build
})
