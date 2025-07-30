interface PageSkeletonProps {
  variant?: "default" | "admin" | "product" | "listing";
}

export default function PageSkeleton({ variant = "default" }: PageSkeletonProps) {
  const renderDefault = () => (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      
      {/* Content blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Admin header */}
      <div className="flex justify-between items-center">
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
      
      {/* Data table */}
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );

  const renderProduct = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
        
        {/* Product details */}
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
          <div className="flex gap-4">
            <div className="h-12 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderListing = () => (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Form header */}
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/3" />
      
      {/* Form fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/4" />
          <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case "admin":
      return renderAdmin();
    case "product":
      return renderProduct();
    case "listing":
      return renderListing();
    default:
      return renderDefault();
  }
}