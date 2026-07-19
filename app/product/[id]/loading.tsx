export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image skeleton */}
        <div className="bg-gray-200 rounded-xl aspect-square w-full" />

        {/* Info skeleton */}
        <div className="flex flex-col gap-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
          <div className="flex gap-3 mt-4">
            <div className="h-12 bg-gray-200 rounded flex-1" />
            <div className="h-12 bg-gray-200 rounded flex-1" />
          </div>
        </div>
      </div>
    </div>
  )
}
