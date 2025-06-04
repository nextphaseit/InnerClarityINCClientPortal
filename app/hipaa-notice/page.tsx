import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Eye, Lock, FileText } from "lucide-react"

export default function HipaaNoticePage() {
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
            <h1 className="text-2xl font-bold text-gray-900">HIPAA Notice</h1>
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
                <CardTitle className="text-3xl text-gray-900">Notice of Privacy Practices</CardTitle>
                <p className="text-gray-600 mt-2">HIPAA Compliance Notice - Effective Date: January 1, 2024</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Your Information. Your Rights. Our Responsibilities.
              </h2>
              <p className="text-gray-700 leading-relaxed">
                This notice describes how medical information about you may be used and disclosed and how you can get
                access to this information. Please review it carefully.
              </p>
            </section>

            <section>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-clarity-blue-200">
                  <CardHeader className="pb-3">
                    <Eye className="h-8 w-8 text-clarity-blue-600 mb-2" />
                    <CardTitle className="text-lg">Your Rights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      You have the right to get a copy of your health record, correct it, and request restrictions on
                      its use.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-clarity-green-200">
                  <CardHeader className="pb-3">
                    <Lock className="h-8 w-8 text-clarity-green-600 mb-2" />
                    <CardTitle className="text-lg">Your Choices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      You have choices about how we use and share your information for treatment, payment, and
                      operations.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-clarity-blue-200">
                  <CardHeader className="pb-3">
                    <FileText className="h-8 w-8 text-clarity-blue-600 mb-2" />
                    <CardTitle className="text-lg">Our Uses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      We may use and share your information for treatment, payment, healthcare operations, and other
                      permitted uses.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When it comes to your health information, you have certain rights. This section explains your rights and
                some of our responsibilities to help you.
              </p>

              <div className="space-y-6">
                <div className="border-l-4 border-clarity-blue-500 pl-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Get an electronic or paper copy of your medical record
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>
                      You can ask to see or get an electronic or paper copy of your medical record and other health
                      information we have about you
                    </li>
                    <li>
                      We will provide a copy or a summary of your health information, usually within 30 days of your
                      request
                    </li>
                    <li>We may charge a reasonable, cost-based fee</li>
                  </ul>
                </div>

                <div className="border-l-4 border-clarity-green-500 pl-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ask us to correct your medical record</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>
                      You can ask us to correct health information about you that you think is incorrect or incomplete
                    </li>
                    <li>We may say "no" to your request, but we'll tell you why in writing within 60 days</li>
                  </ul>
                </div>

                <div className="border-l-4 border-clarity-blue-500 pl-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Request confidential communications</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>
                      You can ask us to contact you in a specific way (for example, home or office phone) or to send
                      mail to a different address
                    </li>
                    <li>We will say "yes" to all reasonable requests</li>
                  </ul>
                </div>

                <div className="border-l-4 border-clarity-green-500 pl-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ask us to limit what we use or share</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>
                      You can ask us not to use or share certain health information for treatment, payment, or our
                      operations
                    </li>
                    <li>
                      We are not required to agree to your request, and we may say "no" if it would affect your care
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-clarity-blue-500 pl-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Get a list of those with whom we've shared information
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>
                      You can ask for a list (accounting) of the times we've shared your health information for six
                      years prior to the date you ask
                    </li>
                    <li>This includes who we shared it with and why</li>
                  </ul>
                </div>

                <div className="border-l-4 border-clarity-green-500 pl-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Get a copy of this privacy notice</h3>
                  <p className="text-gray-700">
                    You can ask for a paper copy of this notice at any time, even if you have agreed to receive the
                    notice electronically.
                  </p>
                </div>

                <div className="border-l-4 border-clarity-blue-500 pl-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Choose someone to act for you</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>
                      If you have given someone medical power of attorney or if someone is your legal guardian, that
                      person can exercise your rights and make choices about your health information
                    </li>
                    <li>
                      We will make sure the person has this authority and can act for you before we take any action
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-clarity-green-500 pl-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    File a complaint if you feel your rights are violated
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>
                      You can complain if you feel we have violated your rights by contacting us using the information
                      on page 1
                    </li>
                    <li>
                      You can file a complaint with the U.S. Department of Health and Human Services Office for Civil
                      Rights
                    </li>
                    <li>We will not retaliate against you for filing a complaint</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Choices</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                For certain health information, you can tell us your choices about what we share. If you have a clear
                preference for how we share your information in the situations described below, talk to us.
              </p>

              <div className="bg-clarity-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  In these cases, you have both the right and choice to tell us to:
                </h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Share information with your family, close friends, or others involved in your care</li>
                  <li>Share information in a disaster relief situation</li>
                  <li>Include your information in a hospital directory</li>
                  <li>Contact you for fundraising efforts</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  <strong>If you are not able to tell us your preference,</strong> for example if you are unconscious,
                  we may go ahead and share your information if we believe it is in your best interest.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Uses and Disclosures</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    How do we typically use or share your health information?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    We typically use or share your health information in the following ways:
                  </p>

                  <div className="space-y-4">
                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Treat you</h4>
                      <p className="text-gray-700 text-sm mb-2">
                        We can use your health information and share it with other professionals who are treating you.
                      </p>
                      <p className="text-gray-600 text-sm italic">
                        Example: A doctor treating you for an injury asks another doctor about your overall health
                        condition.
                      </p>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Run our organization</h4>
                      <p className="text-gray-700 text-sm mb-2">
                        We can use and share your health information to run our practice, improve your care, and contact
                        you when necessary.
                      </p>
                      <p className="text-gray-600 text-sm italic">
                        Example: We use health information about you to manage your treatment and services.
                      </p>
                    </div>

                    <div className="border border-gray-200 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Bill for your services</h4>
                      <p className="text-gray-700 text-sm mb-2">
                        We can use and share your health information to bill and get payment from health plans or other
                        entities.
                      </p>
                      <p className="text-gray-600 text-sm italic">
                        Example: We give information about you to your health insurance plan so it will pay for your
                        services.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Privacy Officer</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <strong>Inner Clarity Inc.</strong>
                  </p>
                  <p>
                    <strong>Address:</strong> 123 Wellness Way, Suite 100, Mental Health City, MH 12345
                  </p>
                  <p>
                    <strong>Phone:</strong> (555) 123-4567
                  </p>
                  <p>
                    <strong>Email:</strong> privacy@innerclarity.com
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">File a Federal Complaint</h4>
                  <p className="text-gray-700 text-sm">
                    You can file a complaint about privacy practices with the U.S. Department of Health and Human
                    Services, Office for Civil Rights at:
                  </p>
                  <p className="text-gray-700 text-sm mt-2">
                    <strong>Website:</strong> www.hhs.gov/ocr/privacy/hipaa/complaints/
                    <br />
                    <strong>Phone:</strong> 1-877-696-6775
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Notice</h2>
              <p className="text-gray-700 leading-relaxed">
                We can change the terms of this notice, and the changes will apply to all information we have about you.
                The new notice will be available upon request, in our office, and on our website.
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
