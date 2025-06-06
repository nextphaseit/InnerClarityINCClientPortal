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
          <Link href="/portal/auth/signin" className="text-blue-600 hover:text-blue-800 transition-colors">
            Patient Sign In
          </Link>
          <Link href="/admin/login" className="text-gray-600 hover:text-gray-800 transition-colors text-sm">
            Admin
          </Link>
          <Link
            href="/portal/auth/signup"
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
              href="/portal/auth/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium"
            >
              Start Your Journey
            </Link>
            <Link
              href="/portal/auth/signin"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors text-lg font-medium"
            >
              Patient Portal
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">HIPAA Compliant</h3>
            <p className="text-gray-600">
              Your privacy and security are our top priorities with end-to-end encryption.
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Professional Care</h3>
            <p className="text-gray-600">Licensed therapists and mental health professionals ready to support you.</p>
          </div>

          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Comprehensive Portal</h3>
            <p className="text-gray-600">
              Manage appointments, access resources, and track your progress all in one place.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Image src="/images/inner-clarity-logo.png" alt="Inner Clarity" width={100} height={33} />
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
              <Link href="/hipaa-notice" className="hover:text-blue-600 transition-colors">
                HIPAA Notice
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-6 pt-6 text-center text-sm text-gray-500">
            <p>&copy; 2024 Inner Clarity INC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
