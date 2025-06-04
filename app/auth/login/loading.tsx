export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Skeleton */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-[120px] h-[120px] bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
        </div>

        {/* Form Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-6">
            {/* Email Field Skeleton */}
            <div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-1/3"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Password Field Skeleton */}
            <div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Forgot Password Link Skeleton */}
            <div className="flex justify-end">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
            </div>

            {/* Button Skeleton */}
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Sign Up Link Skeleton */}
          <div className="mt-6 text-center">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mx-auto"></div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="mt-8 text-center">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4 mx-auto"></div>
        </div>
      </div>
    </div>
  )
}
