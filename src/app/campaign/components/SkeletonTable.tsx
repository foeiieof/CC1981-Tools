export default function SkeletonTable() {
  return (
    <div className="w-full animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between py-4 border-t">
          <div className="flex flex-row gap-4">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
            <div className="ml-20 h-4 w-24 bg-gray-200 rounded"></div>
          </div>

          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
      ))}
      <div className="w-full flex justify-center mt-4">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
}
