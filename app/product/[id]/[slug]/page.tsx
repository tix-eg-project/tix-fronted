import { redirect } from 'next/navigation'

type Props = { params: Promise<{ id: string; slug: string }> }

// Backward-compat: /product/79/slug → /product/slug/79
export default async function OldProductRoute({ params }: Props) {
  const { id, slug } = await params
  redirect(`/product/${slug}/${id}`)
}
