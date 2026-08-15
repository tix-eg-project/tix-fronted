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

  // extract name string from either plain string or {ar, en} object
  function extractName(name) {
    if (!name) return ''
    if (typeof name === 'string') return name
    return name.ar || name.en || ''
  }

  for (const product of products) {
    const nameStr = extractName(product.name)
    const slug = generateSlug(nameStr)
    if (slug) slugMap[String(product.id)] = slug
  }

  const outPath = path.join(__dirname, '../lib/product-slug-map.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(slugMap, null, 2))
  console.log(`Slug map generated: ${Object.keys(slugMap).length} products → lib/product-slug-map.json`)
}

generateSlugMap().catch((e) => {
  console.error('Failed to generate slug map:', e.message)
  process.exit(0) // don't fail the build
})
