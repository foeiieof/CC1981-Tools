export default function SkeletonOrderTable() {
  return (
    <div className="w-full animate-pulse gap-2 mt-4">
      <div className="w-full flex justify-between mb-4">
        <div className="h-6 w-50 bg-gray-200 rounded"></div>
        <div className="h-6 w-16 bg-gray-200 rounded"></div>
      </div>

      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center py-4 border-t">
          <div className="flex flex-row justify-center items-center gap-4">
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-10 w-10 bg-gray-200 rounded"></div>
            <div className="ml-20 h-4 w-24 bg-gray-200 rounded"></div>
          </div>

          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
      ))}
      <div className="w-full flex justify-between mt-4">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="flex justify-center items-center gap-2">
          <div className="h-6 w-12 bg-gray-200 rounded"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
          <div className="h-6 w-6 bg-gray-200 rounded"></div>
          <div className="h-6 w-12 bg-gray-200 rounded"></div>
        </div>

      </div>
    </div>
  )
}
