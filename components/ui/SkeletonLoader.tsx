export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton h-4 rounded ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      <div className="flex items-start gap-4 mb-4">
        <div className="skeleton w-10 h-10 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-24" />
          <SkeletonLine className="w-16 h-6" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-4/5" />
        <SkeletonLine className="w-3/5" />
      </div>
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <SkeletonLine className="w-24 h-3" />
            <SkeletonLine className="w-16 h-7" />
            <SkeletonLine className="w-full h-2 rounded-full" />
          </div>
        ))}
      </div>
      {/* Tab bar */}
      <div className="flex gap-4 border-b border-gray-200 pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`skeleton h-4 rounded ${i === 0 ? "w-20" : "w-16"}`} />
        ))}
      </div>
      {/* Content area */}
      <div className="space-y-4">
        <SkeletonLine className="w-48 h-6" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
