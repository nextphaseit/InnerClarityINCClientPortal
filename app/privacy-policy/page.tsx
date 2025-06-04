import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Lock } from "lucide-react"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-clarity-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="shadow-lg">
          <CardHeader className="bg-clarity-blue-50 border-b">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-clarity-blue-600" />
              <div>
                <CardTitle className="text-3xl text-gray-900">Privacy Policy</CardTitle>
                <p className="text-gray-600 mt-2">Last updated: January 1, 2024</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Inner Clarity Inc. ("we," "our," or "us") is committed to protecting your privacy and ensuring the
                security of your personal health information. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our mental health services and patient portal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Name, address, phone number, and email address</li>
                    <li>Date of birth and demographic information</li>
                    <li>Insurance information and billing details</li>
                    <li>Emergency contact information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Health Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Medical history and mental health records</li>
                    <li>Treatment plans and progress notes</li>
                    <li>Appointment records and communications</li>
                    <li>Assessment results and therapeutic outcomes</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Technical Information</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>IP address and device information</li>
                    <li>Browser type and operating system</li>
                    <li>Usage patterns and portal activity</li>
                    <li>Login timestamps and access logs</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide mental health treatment and care coordination</li>
                <li>Schedule appointments and send reminders</li>
                <li>Process billing and insurance claims</li>
                <li>Communicate about your treatment and care</li>
                <li>Maintain accurate medical records</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Improve our services and patient experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing and Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  <strong>With your consent:</strong> When you explicitly authorize us to share information
                </li>
                <li>
                  <strong>For treatment:</strong> With other healthcare providers involved in your care
                </li>
                <li>
                  <strong>For payment:</strong> With insurance companies and billing services
                </li>
                <li>
                  <strong>For healthcare operations:</strong> For quality assurance and administrative purposes
                </li>
                <li>
                  <strong>Legal requirements:</strong> When required by law or court order
                </li>
                <li>
                  <strong>Emergency situations:</strong> To prevent serious harm to you or others
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <div className="bg-clarity-blue-50 p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Lock className="h-6 w-6 text-clarity-blue-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Security Measures</h3>
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      <li>End-to-end encryption for all data transmission</li>
                      <li>Secure servers with 24/7 monitoring</li>
                      <li>Multi-factor authentication for portal access</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>Employee training on privacy and security protocols</li>
                      <li>HIPAA-compliant data handling procedures</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Under HIPAA and applicable privacy laws, you have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Access and review your health information</li>
                <li>Request corrections to your medical records</li>
                <li>Request restrictions on how your information is used</li>
                <li>Request confidential communications</li>
                <li>File a complaint about privacy practices</li>
                <li>Receive a copy of this Privacy Policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Privacy Officer:</strong> Inner Clarity Inc.
                  </p>
                  <p>
                    <strong>Address:</strong> 508 River Dell Townes Ave, Clayton, NC
                  </p>
                  <p>
                    <strong>Phone:</strong> (984) 274-3723
                  </p>
                  <p>
                    <strong>Email:</strong> support@innerclarityinc.com
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by
                posting the new Privacy Policy on our website and updating the "Last updated" date. Your continued use
                of our services after any changes indicates your acceptance of the updated policy.
              </p>
            </section>
          </CardContent>
        </Card>

        {/* Back to Home Button */}
        <div className="mt-8 text-center">
          <Button asChild size="lg">
            <Link href="/">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
