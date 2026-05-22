import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Nokslock - Terms of Service",
  description: "Terms and conditions for using the Nokslock platform.",
};

const lastUpdated = "May 20, 2025";

export default function TermsOfServicePage() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen flex flex-col transition-colors duration-300">
      <NavBar />

      <main className="flex-1 pt-28 pb-20 px-5 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
            Legal
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-li:text-gray-600 dark:prose-li:text-gray-400 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using Nokslock (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service. These Terms constitute a legally binding agreement between you and Nokslock.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Nokslock is a zero-knowledge digital vault platform that provides:
            </p>
            <ul>
              <li><strong>Secure storage</strong> for passwords, payment cards, cryptocurrency keys, and files</li>
              <li><strong>Client-side encryption</strong> using AES-256-GCM, ensuring only you can decrypt your data</li>
              <li><strong>Vault organization</strong> with lockable vaults and customizable categories</li>
              <li><strong>Dead Man&apos;s Switch</strong> &mdash; an automated digital inheritance feature that transfers designated vault access to your Next of Kin after a configurable period of inactivity</li>
              <li><strong>Subscription plans</strong> with free and premium tiers</li>
            </ul>

            <h2>3. Account Registration</h2>

            <h3>3.1 Eligibility</h3>
            <p>
              You must be at least 18 years old to use Nokslock. By creating an account, you represent that you meet this age requirement.
            </p>

            <h3>3.2 Account Security</h3>
            <p>You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your Master Password</li>
              <li>All activity that occurs under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
            <p>
              <strong>Important:</strong> Due to our zero-knowledge architecture, we cannot recover your Master Password or decrypt your vault if you lose your password. You are solely responsible for remembering your credentials.
            </p>

            <h3>3.3 Account Information</h3>
            <p>
              You agree to provide accurate and complete information during registration and to keep this information up to date.
            </p>

            <h2>4. Subscription and Payments</h2>

            <h3>4.1 Free Tier</h3>
            <p>
              Nokslock offers a free tier with limited storage (2 GB). Free accounts are subject to feature restrictions as described on our pricing page.
            </p>

            <h3>4.2 Premium Plans</h3>
            <p>
              Premium subscriptions are available on monthly, 6-month, and yearly billing cycles. All prices are displayed in your selected currency and are inclusive of applicable fees.
            </p>

            <h3>4.3 Payment Processing</h3>
            <p>
              Payments are processed securely by Paystack. By subscribing, you authorize Paystack to charge your selected payment method according to your chosen billing cycle.
            </p>

            <h3>4.4 Refunds</h3>
            <p>
              We offer a 30-day money-back guarantee on all premium plans. After 30 days, payments are non-refundable. To request a refund, contact us at{" "}
              <a href="mailto:support@nokslock.com">support@nokslock.com</a>.
            </p>

            <h3>4.5 Cancellation</h3>
            <p>
              You may cancel your subscription at any time. Upon cancellation, you retain access to premium features until the end of your current billing period. After that, your account reverts to the free tier. Your encrypted data remains accessible regardless of your plan.
            </p>

            <h2>5. Dead Man&apos;s Switch and Digital Inheritance</h2>

            <h3>5.1 How It Works</h3>
            <p>
              The Dead Man&apos;s Switch monitors your account activity. If you remain inactive beyond the threshold you configure (e.g., 30, 60, 90 days), the system initiates the inheritance process by contacting your designated Next of Kin.
            </p>

            <h3>5.2 Your Responsibilities</h3>
            <ul>
              <li>You are responsible for accurately configuring your Next of Kin information and inactivity threshold</li>
              <li>You must ensure your Next of Kin is aware they have been designated and understands the claim process</li>
              <li>You acknowledge that vault items marked for NOK sharing will be accessible to your Next of Kin upon activation</li>
            </ul>

            <h3>5.3 Emergency Key</h3>
            <p>
              During setup, a 16-word Emergency Key is generated. This key is required for your Next of Kin to decrypt shared vault data. You are responsible for securely providing this key to your NOK. We store only an encrypted (escrowed) copy and cannot use it to access your vault.
            </p>

            <h3>5.4 Death Certificate</h3>
            <p>
              Your Next of Kin may be required to upload a death certificate as part of the claim verification process. We use this document solely for verification purposes.
            </p>

            <h3>5.5 Limitations</h3>
            <p>
              Nokslock is not a legal estate planning service. The Dead Man&apos;s Switch is a digital convenience tool and does not replace a legal will, trust, or estate plan. We strongly recommend consulting a legal professional for comprehensive estate planning.
            </p>

            <h2>6. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any illegal purpose or to store illegal content</li>
              <li>Attempt to bypass, disable, or circumvent any security features</li>
              <li>Share your account credentials with others</li>
              <li>Interfere with or disrupt the Service or its infrastructure</li>
              <li>Use automated tools to access the Service without our consent</li>
              <li>Impersonate another person or misrepresent your identity</li>
              <li>Upload malicious files or code to the vault</li>
            </ul>

            <h2>7. Intellectual Property</h2>
            <p>
              The Nokslock name, logo, design, and all related trademarks, software, and content are the exclusive property of Nokslock. You may not copy, modify, distribute, or create derivative works based on our intellectual property without prior written consent.
            </p>
            <p>
              You retain full ownership of the data you store in your vault.
            </p>

            <h2>8. Zero-Knowledge Architecture Disclaimer</h2>
            <p>
              Nokslock uses a zero-knowledge encryption model. This means:
            </p>
            <ul>
              <li>We <strong>cannot</strong> access, view, or decrypt your vault contents</li>
              <li>We <strong>cannot</strong> recover your Master Password if lost</li>
              <li>If you forget your Master Password, your vault data becomes permanently inaccessible (a password reset generates a new Vault Key, and all previous data is lost)</li>
              <li>We <strong>cannot</strong> comply with data access requests for your encrypted vault contents, as we do not possess the decryption keys</li>
            </ul>
            <p>
              You accept full responsibility for safeguarding your Master Password and Emergency Key.
            </p>

            <h2>9. Service Availability</h2>
            <p>
              We strive to maintain high availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We will make reasonable efforts to notify users of planned downtime.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law:
            </p>
            <ul>
              <li>Nokslock is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind</li>
              <li>We are not liable for any loss of data resulting from forgotten passwords, lost Emergency Keys, or corrupted encryption keys</li>
              <li>We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Service</li>
              <li>Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim</li>
            </ul>

            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify and hold Nokslock harmless from any claims, damages, or expenses arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
            </p>

            <h2>12. Account Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account if you violate these Terms. You may delete your account at any time through the settings page. Upon deletion, all your data (including encrypted vault contents) will be permanently removed within 30 days.
            </p>

            <h2>13. Modifications to Terms</h2>
            <p>
              We may update these Terms from time to time. Material changes will be communicated via email or an in-app notification. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms.
            </p>

            <h2>14. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to conflict of law principles.
            </p>

            <h2>15. Contact Us</h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a href="mailto:support@nokslock.com">support@nokslock.com</a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
