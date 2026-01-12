import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#FFD666] rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">SL</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">Smart Leads</span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-gray-900 transition">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-[#FFD666] text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-[#FFC233] hover:shadow-lg transition"
              >
                Start for Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 md:p-12 shadow-sm">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
            <p className="text-gray-500 mb-8">Last updated: January 2025</p>

            <div className="prose prose-gray max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
                <p className="text-gray-600 mb-4">
                  By accessing or using Smart Leads ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you do not have permission to access the Service.
                </p>
                <p className="text-gray-600">
                  These Terms apply to all visitors, users, and others who access or use the Service. We reserve the right to update these Terms at any time without notice. Your continued use of the Service after any changes constitutes acceptance of those changes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-600 mb-4">
                  Smart Leads provides an AI-powered lead generation and email outreach platform that helps businesses identify and contact potential customers using data from public sources including Google Maps.
                </p>
                <p className="text-gray-600">
                  Our Service includes lead scraping, email generation, campaign management, and automated outreach features. The specific features available to you depend on your subscription plan.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Registration</h2>
                <p className="text-gray-600 mb-4">
                  To use certain features of the Service, you must register for an account. When creating an account, you agree to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  We reserve the right to suspend or terminate accounts that violate these Terms or contain inaccurate information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
                <p className="text-gray-600 mb-4">
                  You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Send unsolicited emails that violate anti-spam laws (CAN-SPAM, GDPR, etc.)</li>
                  <li>Harvest, collect, or store personal data without proper consent</li>
                  <li>Use the Service for any illegal or unauthorized purpose</li>
                  <li>Transmit viruses, malware, or other harmful code</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>Attempt to gain unauthorized access to any part of the Service</li>
                  <li>Use the Service to send misleading or deceptive content</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Resell or redistribute the Service without authorization</li>
                  <li>Use automated means to scrape or extract data from the Service</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Email Compliance</h2>
                <p className="text-gray-600 mb-4">
                  When using our email outreach features, you are solely responsible for ensuring compliance with all applicable email marketing laws, including but not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>CAN-SPAM Act (United States)</li>
                  <li>GDPR (European Union)</li>
                  <li>CASL (Canada)</li>
                  <li>Other applicable local and international regulations</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  You must include accurate sender information, provide a clear unsubscribe mechanism, and honor opt-out requests promptly. Smart Leads is not responsible for your compliance with these laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Subscription and Payment</h2>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing</h3>
                <p className="text-gray-600 mb-4">
                  Paid subscriptions are billed in advance on a monthly or annual basis. By subscribing, you authorize us to charge your payment method for the subscription fee.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Credits</h3>
                <p className="text-gray-600 mb-4">
                  Your subscription includes a monthly allocation of credits for lead generation. Unused credits may roll over to the next month depending on your plan. Credits have no cash value and cannot be transferred.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cancellation</h3>
                <p className="text-gray-600 mb-4">
                  You may cancel your subscription at any time through your account settings. Cancellation takes effect at the end of the current billing period. No refunds will be provided for partial months.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">Refunds</h3>
                <p className="text-gray-600">
                  We offer a 14-day money-back guarantee for new subscribers. After this period, all sales are final except where required by law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
                <p className="text-gray-600 mb-4">
                  The Service and its original content, features, and functionality are owned by Smart Leads and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p className="text-gray-600">
                  You retain ownership of any content you create using the Service. By using the Service, you grant us a limited license to use, store, and process your content solely for the purpose of providing the Service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data and Privacy</h2>
                <p className="text-gray-600 mb-4">
                  Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to the collection and use of information as described in the Privacy Policy.
                </p>
                <p className="text-gray-600">
                  You are responsible for ensuring you have the right to use any data you input into or extract from the Service, and for complying with all applicable data protection laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
                <p className="text-gray-600 mb-4">
                  The Service may integrate with third-party services (such as email providers, Google Maps, etc.). Your use of these integrations is subject to the terms and privacy policies of those third parties.
                </p>
                <p className="text-gray-600">
                  We are not responsible for the availability, accuracy, or content of third-party services, or for any damage or loss caused by your use of such services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimer of Warranties</h2>
                <p className="text-gray-600 mb-4">
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Warranties of merchantability or fitness for a particular purpose</li>
                  <li>Warranties regarding the accuracy or completeness of lead data</li>
                  <li>Warranties that the Service will be uninterrupted or error-free</li>
                  <li>Warranties regarding the results obtained from using the Service</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
                <p className="text-gray-600 mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, SMART LEADS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Loss of profits, revenue, or data</li>
                  <li>Business interruption</li>
                  <li>Cost of substitute services</li>
                  <li>Any other intangible losses</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  Our total liability for any claims under these Terms shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
                <p className="text-gray-600">
                  You agree to indemnify, defend, and hold harmless Smart Leads and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, your violation of these Terms, or your violation of any third-party rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Termination</h2>
                <p className="text-gray-600 mb-4">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms.
                </p>
                <p className="text-gray-600">
                  Upon termination, your right to use the Service will cease immediately. All provisions of these Terms that should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law</h2>
                <p className="text-gray-600">
                  These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts located in Delaware.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Changes to Terms</h2>
                <p className="text-gray-600">
                  We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on this page and updating the "Last updated" date. Your continued use of the Service after changes are posted constitutes acceptance of the modified Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-gray-800 font-medium">Smart Leads</p>
                  <p className="text-gray-600">Email: legal@smartleads.io</p>
                  <p className="text-gray-600">Support: support@smartleads.io</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-stone-900 border-t border-stone-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-[#FFD666] rounded-lg flex items-center justify-center">
                <span className="text-gray-900 font-bold text-sm">SL</span>
              </div>
              <span className="text-white font-bold text-xl">Smart Leads</span>
            </div>
            <div className="flex items-center space-x-6 text-stone-400 text-sm">
              <Link to="/privacy" className="hover:text-white transition">Privacy</Link>
              <span className="text-white">Terms</span>
              <a href="mailto:support@smartleads.io" className="hover:text-white transition">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-stone-800 text-center text-stone-500 text-sm">
            © {new Date().getFullYear()} Smart Leads. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
