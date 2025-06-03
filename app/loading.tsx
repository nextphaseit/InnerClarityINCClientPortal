import Image from "next/image"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <Image
          src="/images/inner-clarity-logo.png"
          alt="Inner Clarity"
          width={80}
          height={80}
          className="h-20 w-auto mx-auto mb-4 animate-pulse"
        />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clarity-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
