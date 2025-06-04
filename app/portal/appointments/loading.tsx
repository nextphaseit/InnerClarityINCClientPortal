export default function AppointmentsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="h-8 w-64 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upcoming Appointments Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="h-6 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="h-4 w-48 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Appointments Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="h-6 w-40 bg-gray-200 rounded mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 opacity-75">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="h-5 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      <div className="h-4 w-48 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="flex flex-wrap gap-4">
            <div className="h-12 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-12 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
