import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Heart, Users, Clock, CheckCircle, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Inner Clarity Inc</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
                About
              </Link>
              <Link href="/services" className="text-slate-600 hover:text-slate-900 transition-colors">
                Services
              </Link>
              <Link href="/contact" className="text-slate-600 hover:text-slate-900 transition-colors">
                Contact
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Your Journey to
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Mental Wellness{" "}
              </span>
              Starts Here
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Secure, HIPAA-compliant mental health services with personalized care, professional therapy, and a
              comprehensive patient portal designed for your privacy and peace of mind.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Start Your Journey
                </Button>
              </Link>
              <Link href="/portal">
                <Button variant="outline" size="lg">
                  Patient Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Inner Clarity?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We combine professional expertise with cutting-edge technology to provide the highest quality mental
              health care in a secure, supportive environment.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-slate-900">HIPAA Compliant</CardTitle>
                <CardDescription>
                  Your privacy and data security are our top priorities with full HIPAA compliance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <CardTitle className="text-slate-900">Expert Therapists</CardTitle>
                <CardDescription>
                  Licensed mental health professionals with years of experience and specialized training.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-slate-900">Flexible Scheduling</CardTitle>
                <CardDescription>
                  Book appointments that fit your schedule with our easy-to-use online booking system.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Services</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive mental health services tailored to your individual needs and goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Individual Therapy</CardTitle>
                <CardDescription>
                  One-on-one sessions with licensed therapists specializing in anxiety, depression, trauma, and more.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Cognitive Behavioral Therapy (CBT)
                  </li>
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Dialectical Behavior Therapy (DBT)
                  </li>
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Trauma-Informed Care
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="text-slate-900">Group Therapy</CardTitle>
                <CardDescription>
                  Supportive group sessions that foster connection and shared healing experiences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Support Groups
                  </li>
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Skills-Based Groups
                  </li>
                  <li className="flex items-center text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Peer Support Programs
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What Our Clients Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-slate-600">
                    "The care and support I received at Inner Clarity has been life-changing. The therapists are
                    compassionate and the portal makes everything so convenient."
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-slate-900">Anonymous Client</p>
                  <p className="text-sm text-slate-500">Verified Patient</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Begin Your Healing Journey?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Take the first step towards better mental health. Our team is here to support you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                  Get Started Today
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">Inner Clarity Inc</h3>
              </div>
              <p className="text-slate-400">
                Professional mental health services with compassionate care and cutting-edge technology.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/services/individual" className="hover:text-white transition-colors">
                    Individual Therapy
                  </Link>
                </li>
                <li>
                  <Link href="/services/group" className="hover:text-white transition-colors">
                    Group Therapy
                  </Link>
                </li>
                <li>
                  <Link href="/services/assessment" className="hover:text-white transition-colors">
                    Assessment
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link href="/resources" className="hover:text-white transition-colors">
                    Mental Health Resources
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
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

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Inner Clarity Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
