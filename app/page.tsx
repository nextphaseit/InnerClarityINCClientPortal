import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Calendar, MessageSquare, FileText, Heart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inner Clarity</h1>
                <p className="text-sm text-gray-600">Patient Portal</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Button asChild variant="outline">
                <Link href="/portal/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/portal/auth/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Health, <span className="text-blue-600">Simplified</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Access your medical records, schedule appointments, communicate with your healthcare team, and manage your
            health journey all in one secure platform.
          </p>
          <div className="flex justify-center space-x-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/portal/auth/signup">Create Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/portal/auth/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need for Better Health Management</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive patient portal provides secure access to all your healthcare needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Easy Scheduling</CardTitle>
                <CardDescription>
                  Book appointments, view your schedule, and receive automated reminders
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Secure Messaging</CardTitle>
                <CardDescription>
                  Communicate directly with your healthcare team through encrypted messaging
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Medical Records</CardTitle>
                <CardDescription>
                  Access your complete medical history, test results, and treatment plans
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>HIPAA Compliant</CardTitle>
                <CardDescription>Your health information is protected with enterprise-grade security</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Care Team Access</CardTitle>
                <CardDescription>Connect with your entire healthcare team in one centralized platform</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-12 w-12 text-pink-600 mb-4" />
                <CardTitle>Health Tracking</CardTitle>
                <CardDescription>Monitor your health metrics and track progress over time</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who trust Inner Clarity for their healthcare management
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/portal/auth/signup">Get Started Today</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Inner Clarity</span>
              </div>
              <p className="text-gray-400">Empowering patients with secure, easy-to-use healthcare management tools.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/portal/auth/signin" className="hover:text-white">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/portal/auth/signup" className="hover:text-white">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/hipaa-notice" className="hover:text-white">
                    HIPAA Notice
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@nextphaseit.org</li>
                <li>Phone: (555) 123-4567</li>
                <li>Hours: Mon-Fri 8AM-6PM</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Security</h3>
              <ul className="space-y-2 text-gray-400">
                <li>HIPAA Compliant</li>
                <li>SOC 2 Certified</li>
                <li>End-to-End Encryption</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Inner Clarity INC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
