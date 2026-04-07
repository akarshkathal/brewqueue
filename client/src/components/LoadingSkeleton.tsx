export default function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4"
        >
          {/* Position circle skeleton */}
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />

          {/* Text skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>

          {/* Button skeletons */}
          <div className="flex gap-2">
            <div className="w-16 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-16 h-8 bg-gray-200 rounded-lg animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}