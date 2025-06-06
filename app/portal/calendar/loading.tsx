export default function CalendarLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading calendar...</p>
      </div>
    </div>
  )
}
