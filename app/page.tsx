import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <Image src="/images/inner-clarity-logo.png" alt="Inner Clarity" width={120} height={40} />
        </div>

        <nav className="hidden md:flex space-x-8">
          <Link href="/" className="text-gray-800 hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-gray-800 hover:text-blue-600 transition-colors">
            About
          </Link>
          <Link href="/services" className="text-gray-800 hover:text-blue-600 transition-colors">
            Services
          </Link>
          <Link href="/contact" className="text-gray-800 hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link href="/auth/signin" className="text-blue-600 hover:text-blue-800 transition-colors">
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Your Journey to <span className="text-blue-600">Mental Wellness</span> Starts Here
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Secure, HIPAA-compliant mental health services with personalized care, professional therapy, and a
            comprehensive patient portal designed for your privacy and peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/auth/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Start Your Journey
            </Link>
            <Link
              href="/auth/signin"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-lg font-medium"
            >
              Patient Portal
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
