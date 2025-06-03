import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Eye, Heart, Users, Calendar } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Image
                src="/images/inner-clarity-logo.png"
                alt="Inner Clarity"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">Inner Clarity</span>
            </div>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Image
              src="/images/inner-clarity-logo.png"
              alt="Inner Clarity"
              width={120}
              height={120}
              className="h-30 w-auto mx-auto mb-8"
            />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your Mental Health Journey,{" "}
            <span className="bg-gradient-to-r from-clarity-blue-600 to-clarity-green-600 bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            A secure, HIPAA-compliant portal connecting clients with mental health providers. Manage appointments,
            communicate safely, and track your progress all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link href="/auth/signin">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need for Mental Health Care
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our comprehensive platform provides tools for both clients and providers to ensure the best possible care
              experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-clarity-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Easy Scheduling</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Book, reschedule, and manage appointments with your mental health provider through our intuitive
                  calendar system.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-clarity-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">HIPAA Compliant</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your health information is protected with enterprise-grade security and full HIPAA compliance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Lock className="h-12 w-12 text-clarity-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Secure Messaging</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Communicate safely with your provider through encrypted messaging with full audit trails.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-clarity-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Provider Tools</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Comprehensive admin dashboard for providers to manage clients, appointments, and documentation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 text-clarity-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Progress Tracking</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor your mental health journey with integrated forms, assessments, and progress reports.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-clarity-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Audit Trail</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete transparency with detailed audit logs for all activities and access to your health
                  information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Your Privacy is Our Priority
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="space-y-4">
              <Lock className="h-16 w-16 text-clarity-blue-500 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">End-to-End Encryption</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All data is encrypted in transit and at rest using industry-standard protocols.
              </p>
            </div>

            <div className="space-y-4">
              <Shield className="h-16 w-16 text-clarity-green-500 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">HIPAA Compliance</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Full compliance with HIPAA regulations and healthcare privacy standards.
              </p>
            </div>

            <div className="space-y-4">
              <Eye className="h-16 w-16 text-clarity-blue-500 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Complete Transparency</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed audit logs show exactly who accessed your information and when.
              </p>
            </div>
          </div>

          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/auth/signin">Start Your Secure Journey</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Image
                src="/images/inner-clarity-logo.png"
                alt="Inner Clarity"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-lg font-bold">Inner Clarity</span>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-400 mb-2">© 2024 Inner Clarity. All rights reserved.</p>
              <p className="text-sm text-gray-500">HIPAA Compliant Mental Health Platform</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
