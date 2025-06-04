import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react"

export default function TermsOfServicePage() {
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
            <h1 className="text-2xl font-bold text-gray-900">Terms of Service</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="shadow-lg">
          <CardHeader className="bg-clarity-green-50 border-b">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-clarity-green-600" />
              <div>
                <CardTitle className="text-3xl text-gray-900">Terms of Service</CardTitle>
                <p className="text-gray-600 mt-2">Last updated: January 1, 2024</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using the Inner Clarity Inc. patient portal and mental health services ("Services"),
                you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do
                not use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Services</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Inner Clarity Inc. provides mental health services including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Individual and group therapy sessions</li>
                <li>Psychiatric evaluations and medication management</li>
                <li>Crisis intervention and support services</li>
                <li>Online patient portal for appointment scheduling and communication</li>
                <li>Educational resources and self-help tools</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">3.1 Account Security</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Maintain the confidentiality of your login credentials</li>
                    <li>Notify us immediately of any unauthorized access</li>
                    <li>Use strong passwords and enable two-factor authentication</li>
                    <li>Log out of your account when using shared devices</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">3.2 Appropriate Use</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Provide accurate and complete information</li>
                    <li>Use the portal only for legitimate healthcare purposes</li>
                    <li>Respect the privacy and confidentiality of others</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Prohibited Activities</h2>
              <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                  <div>
                    <h3 className="text-lg font-medium text-red-900 mb-2">You may not:</h3>
                    <ul className="list-disc list-inside text-red-800 space-y-1">
                      <li>Share your account credentials with others</li>
                      <li>Attempt to gain unauthorized access to our systems</li>
                      <li>Use the portal to transmit harmful or malicious content</li>
                      <li>Interfere with the operation of our services</li>
                      <li>Violate any applicable laws or regulations</li>
                      <li>Harass, threaten, or abuse our staff or other users</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Appointment and Cancellation Policy</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">5.1 Scheduling</h3>
                  <p className="text-gray-700">
                    Appointments can be scheduled through our patient portal or by calling our office. We recommend
                    scheduling appointments at least 48 hours in advance.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">5.2 Cancellations</h3>
                  <p className="text-gray-700">
                    Appointments must be cancelled at least 24 hours in advance. Late cancellations or no-shows may
                    result in charges and may affect your ability to schedule future appointments.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Payment and Billing</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Payment is due at the time of service unless other arrangements have been made</li>
                <li>We accept cash, credit cards, and most insurance plans</li>
                <li>You are responsible for understanding your insurance benefits and coverage</li>
                <li>Unpaid balances may be subject to collection procedures</li>
                <li>A service fee may be charged for returned payments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy and Confidentiality</h2>
              <p className="text-gray-700 leading-relaxed">
                We are committed to protecting your privacy and maintaining the confidentiality of your health
                information in accordance with HIPAA and other applicable laws. Please refer to our Privacy Policy for
                detailed information about how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the fullest extent permitted by law, Inner Clarity Inc. shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages arising out of or relating to your use of our
                services, even if we have been advised of the possibility of such damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Emergency Situations</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-yellow-900 mb-2">Important Notice</h3>
                <p className="text-yellow-800">
                  Our patient portal and messaging system are not intended for emergency situations. If you are
                  experiencing a mental health emergency, please call 911, go to your nearest emergency room, or call
                  the National Suicide Prevention Lifeline at (984) 274-3723.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will notify you of any material changes by
                posting the updated Terms on our website and updating the "Last updated" date. Your continued use of our
                services after any changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Inner Clarity Inc.</strong>
                  </p>
                  <p>
                    <strong>Address:</strong> 508 River Dell Townes Ave, Clayton, NC
                  </p>
                  <p>
                    <strong>Phone:</strong> (984) 274-3723
                  </p>
                  <p>
                    <strong>Email:</strong> legal@innerclarityinc.com
                  </p>
                </div>
              </div>
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
