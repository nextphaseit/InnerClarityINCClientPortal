"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Shield,
  Heart,
  Users,
  Calendar,
  MessageSquare,
  FileText,
  CreditCard,
  Lock,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"

export default function HomePage() {
  const { user, status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect authenticated users to their appropriate dashboard
    if (status === "authenticated" && user) {
      if (user.role === "admin") {
        router.push("/admin")
      } else if (user.role === "patient") {
        router.push("/dashboard")
      }
    }
  }, [user, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-clarity-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-clarity-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/placeholder.svg?height=40&width=40&text=IC"
                alt="Inner Clarity Inc."
                width={40}
                height={40}
                className="rounded-lg"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Inner Clarity Inc.</h1>
                <p className="text-sm text-clarity-blue-600">Mental Health Services</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 bg-white/50 text-clarity-blue-700 border-clarity-blue-200">
            <Shield className="mr-2 h-4 w-4" />
            HIPAA Compliant & Secure
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Mental Health Journey, <span className="text-clarity-blue-600">Simplified</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-4 max-w-3xl mx-auto">Where Healing Begins, Peace Follows</p>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Access your secure patient portal to manage appointments, communicate with your care team, and track your
            mental health journey—all in one HIPAA-compliant platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-clarity-blue-600 hover:bg-clarity-blue-700">
              <Link href="/register">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">Sign In to Portal</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Comprehensive Mental Health Care</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our secure portal provides everything you need to manage your mental health journey with confidence and
              privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Patient Features */}
            <Card className="border-clarity-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="h-8 w-8 text-clarity-blue-600 mb-2" />
                <CardTitle>Appointment Management</CardTitle>
                <CardDescription>Schedule, reschedule, and manage your therapy sessions with ease.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-clarity-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-clarity-green-600 mb-2" />
                <CardTitle>Secure Messaging</CardTitle>
                <CardDescription>
                  Communicate directly with your care team through encrypted, HIPAA-compliant messaging.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-clarity-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-8 w-8 text-clarity-blue-600 mb-2" />
                <CardTitle>Document Management</CardTitle>
                <CardDescription>
                  Securely upload and access your treatment documents, forms, and resources.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-clarity-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CreditCard className="h-8 w-8 text-clarity-green-600 mb-2" />
                <CardTitle>Billing & Payments</CardTitle>
                <CardDescription>
                  View invoices, make payments, and manage your billing information securely.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-clarity-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-8 w-8 text-clarity-blue-600 mb-2" />
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor your mental health journey with personalized insights and progress reports.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-clarity-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-8 w-8 text-clarity-green-600 mb-2" />
                <CardTitle>Care Team Access</CardTitle>
                <CardDescription>
                  Connect with your therapists, psychiatrists, and support staff in one place.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-clarity-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Shield className="h-16 w-16 text-clarity-blue-600 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Your Privacy is Our Priority</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We maintain the highest standards of security and compliance to protect your sensitive health information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-sm">
                <Lock className="h-8 w-8 text-clarity-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">HIPAA Compliant</h3>
              <p className="text-sm text-gray-600">Full compliance with healthcare privacy regulations</p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-sm">
                <Shield className="h-8 w-8 text-clarity-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">End-to-End Encryption</h3>
              <p className="text-sm text-gray-600">All data encrypted in transit and at rest</p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-sm">
                <CheckCircle className="h-8 w-8 text-clarity-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Authentication</h3>
              <p className="text-sm text-gray-600">Multi-factor authentication and role-based access</p>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-full p-4 w-16 h-16 mx-auto mb-4 shadow-sm">
                <Star className="h-8 w-8 text-clarity-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">SOC 2 Certified</h3>
              <p className="text-sm text-gray-600">Independently verified security controls</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions about our services or need technical support? We're here to help.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Phone className="h-8 w-8 text-clarity-blue-600 mx-auto mb-2" />
                <CardTitle>Phone Support</CardTitle>
                <CardDescription>
                  Call us during business hours
                  <br />
                  <span className="font-semibold text-gray-900">(984) 274-3723</span>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Mail className="h-8 w-8 text-clarity-green-600 mx-auto mb-2" />
                <CardTitle>Email Support</CardTitle>
                <CardDescription>
                  Send us a message anytime
                  <br />
                  <span className="font-semibold text-gray-900">support@innerclarityinc.com</span>
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-8 w-8 text-clarity-blue-600 mx-auto mb-2" />
                <CardTitle>Office Location</CardTitle>
                <CardDescription>
                  Visit us in person
                  <br />
                  <span className="font-semibold text-gray-900">508 River Dell Townes Ave, Clayton, NC</span>
                  <br />
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src="/placeholder.svg?height=32&width=32&text=IC"
                  alt="Inner Clarity Inc."
                  width={32}
                  height={32}
                  className="rounded"
                />
                <span className="text-xl font-bold">Inner Clarity Inc.</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Providing compassionate, evidence-based mental health care through innovative technology and
                personalized treatment approaches.
              </p>
              <div className="flex space-x-4">
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  HIPAA Compliant
                </Badge>
                <Badge variant="outline" className="text-gray-400 border-gray-600">
                  SOC 2 Certified
                </Badge>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/auth/signin" className="hover:text-white transition-colors">
                    Patient Portal
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signin" className="hover:text-white transition-colors">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/hipaa-notice" className="hover:text-white transition-colors">
                    HIPAA Notice
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Inner Clarity Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
