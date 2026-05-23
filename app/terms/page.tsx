import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Nokslock - Terms of Use",
  description: "Terms and conditions for using the Nokslock platform.",
};

const lastUpdated = "May 23, 2025";

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
            Terms of Use
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-li:text-gray-600 dark:prose-li:text-gray-400 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
            <p>
              Welcome to Nokslock. These Terms of Use govern your access to and use of the Nokslock mobile applications, desktop applications, websites, cloud services, and related platforms (collectively, the &quot;Services&quot;) available on iPhone, iPad, Android, Mac, Windows, web browsers, and other supported devices.
            </p>
            <p>
              By downloading, installing, accessing, or using Nokslock, you acknowledge that you have read, understood, and agreed to be bound by these Terms. If you do not agree to these Terms, you must immediately discontinue use of the Services.
            </p>
            <p>
              Throughout this agreement, &quot;Nokslock,&quot; &quot;we,&quot; &quot;our,&quot; and &quot;us&quot; refer to the owners, developers, operators, licensors, and affiliates of the Services. &quot;You&quot; and &quot;your&quot; refer to any individual, organization, or entity accessing or using the Services.
            </p>

            <h2>1. Description of Services</h2>
            <p>
              Nokslock is a digital proof of no knowledge encrypted vault and file management platform designed to help users securely organize, store, manage, protect, and access files, documents, records, and related information. It also enables the secure transfer of documents, files, and other information records to approved next of kin in accordance with the agreement established by the user to safeguard their digital assets and sensitive information.
            </p>
            <p>Nokslock is not:</p>
            <ul>
              <li>a bank;</li>
              <li>a financial institution;</li>
              <li>an insurance provider;</li>
              <li>a cryptocurrency exchange;</li>
              <li>a regulated custodial service;</li>
              <li>a legal advisory service; or</li>
              <li>an investment platform.</li>
            </ul>
            <p>
              Nokslock does not provide financial, legal, tax, investment, cybersecurity, or professional advice of any kind.
            </p>

            <h2>2. User Responsibilities</h2>
            <p>You are solely responsible for:</p>
            <ul>
              <li>maintaining the confidentiality of your passwords, passcodes, recovery keys, authentication credentials, and devices;</li>
              <li>ensuring your device security and operating system updates;</li>
              <li>maintaining backups of important files and records;</li>
              <li>verifying the accuracy and legality of any content uploaded or stored;</li>
              <li>ensuring you have the legal rights to upload or store any content;</li>
              <li>all activities conducted through your account or devices; and</li>
              <li>ensuring that you keep track of the Dead Man&apos;s Switch and resetting the timer before your account is transferred to the registered next of kin.</li>
            </ul>
            <p>
              You acknowledge that lost passwords, deleted encrypted files, compromised devices, malware infections, phishing attacks, unauthorized access, or forgotten recovery credentials may result in permanent loss of access to content.
            </p>

            <h2>3. Security &amp; Encryption Disclaimer</h2>
            <p>
              Nokslock may use encryption technologies, authentication systems, secure cloud infrastructure, biometric authentication support, and other security measures intended to help protect user data and files.
            </p>
            <p>
              However, no software, cloud platform, device, storage system, or electronic transmission method can ever be guaranteed to be completely secure, uninterrupted, or immune from vulnerabilities, cyberattacks, unauthorized access, hardware failure, human error, or data loss.
            </p>
            <p>To the fullest extent permitted by law:</p>
            <ul>
              <li>Nokslock does not guarantee absolute security;</li>
              <li>Nokslock does not guarantee that files will never be lost, corrupted, deleted, exposed, or inaccessible; and</li>
              <li>Nokslock shall not be liable for security incidents arising from user negligence, compromised credentials, third-party attacks, malware, device theft, or events beyond our reasonable control.</li>
            </ul>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>use the Services for illegal, fraudulent, abusive, harmful, or malicious purposes;</li>
              <li>upload malicious code, ransomware, spyware, or harmful software;</li>
              <li>attempt unauthorized access to systems, servers, or user accounts;</li>
              <li>interfere with or disrupt the operation of the Services;</li>
              <li>reverse engineer, exploit, scrape, or copy the Services;</li>
              <li>violate intellectual property rights or privacy rights of others; or</li>
              <li>use the Services to store unlawful or prohibited material.</li>
            </ul>
            <p>
              We reserve the right to suspend, restrict, or terminate access to the Services at our discretion where misuse, abuse, fraud, illegal activity, or security risks are suspected.
            </p>

            <h2>5. User Content</h2>
            <p>
              You retain ownership of any files, documents, images, records, or other content you upload or store using Nokslock (&quot;User Content&quot;) unless when the account is transferred to the next of kin when the Dead Man&apos;s Switch timer ends and triggers account transfer.
            </p>
            <p>
              By using the Services, you grant Nokslock a limited, non-exclusive, revocable license to host, process, transmit, encrypt, back up, display, and store User Content solely for the purpose of operating, maintaining, improving, and providing the Services. We do not claim ownership of your User Content.
            </p>

            <h2>6. Cloud Storage &amp; Backups</h2>
            <p>
              Certain features may involve cloud storage, synchronization, automated backups, or third-party infrastructure providers.
            </p>
            <p>You acknowledge that:</p>
            <ul>
              <li>synchronization delays or failures may occur;</li>
              <li>deleted content may not be recoverable;</li>
              <li>backups may not always be successful or immediately available; and</li>
              <li>cloud services may experience outages or interruptions beyond our control.</li>
            </ul>
            <p>
              Users are strongly encouraged to maintain independent backups of all important files and information.
            </p>

            <h2>7. Third-Party Services</h2>
            <p>
              Nokslock may integrate with or rely upon third-party platforms, payment processors, analytics providers, cloud hosting providers, authentication services, operating systems, or app marketplaces.
            </p>
            <p>We are not responsible for:</p>
            <ul>
              <li>third-party systems or infrastructure;</li>
              <li>third-party outages or security breaches;</li>
              <li>external websites or links; or</li>
              <li>third-party policies, actions, or content.</li>
            </ul>
            <p>
              Your use of third-party services may also be governed by their own terms and privacy policies.
            </p>

            <h2>8. No Warranty</h2>
            <p>
              The Services are provided on an &quot;as is&quot; and &quot;as available&quot; basis.
            </p>
            <p>
              To the fullest extent permitted by law, Nokslock disclaims all warranties, express, implied, or statutory, including:
            </p>
            <ul>
              <li>merchantability;</li>
              <li>fitness for a particular purpose;</li>
              <li>non-infringement;</li>
              <li>data accuracy;</li>
              <li>security;</li>
              <li>availability; and</li>
              <li>uninterrupted operation.</li>
            </ul>
            <p>We do not guarantee that:</p>
            <ul>
              <li>the Services will always function without errors or downtime;</li>
              <li>files or data will always remain accessible or recoverable;</li>
              <li>the Services will be free from bugs, malware, or vulnerabilities; or</li>
              <li>the Services will meet every user expectation or requirement.</li>
            </ul>

            <h2>9. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, NOKSLOCK AND ITS OWNERS, EMPLOYEES, CONTRACTORS, AFFILIATES, PARTNERS, LICENSORS, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR: indirect damages; consequential damages; incidental damages; punitive damages; loss of profits; loss of revenue; business interruption; data loss; device damage; unauthorized access; or any financial or reputational losses arising from the use of the Services; failure to set the Dead Man&apos;s Switch.
            </p>
            <p>
              THIS LIMITATION APPLIES EVEN IF NOKSLOCK HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL NOKSLOCK HAVE ANY LIABILITY FOR THE LISTED LIMITATIONS ABOVE. YOUR USE OF NOKSLOCK IS AT YOUR OWN RISK.
            </p>

            <h2>10. Intellectual Property</h2>
            <p>
              All software, source code, branding, trademarks, graphics, interfaces, designs, text, logos, features, and related materials associated with Nokslock are owned by or licensed to Nokslock and are protected by intellectual property and copyright laws.
            </p>
            <p>
              You may not reproduce, distribute, modify, sell, reverse engineer, decompile, exploit, or commercially use any portion of the Services without prior written permission. Any third-party trademarks or materials appearing in the app remain the property of their respective owners.
            </p>

            <h2>11. Suspension &amp; Termination</h2>
            <p>
              We reserve the right to suspend, restrict, or permanently terminate access to the Services at any time, with or without notice, where:
            </p>
            <ul>
              <li>these Terms are violated;</li>
              <li>fraud or abuse is suspected;</li>
              <li>distribution of malicious software occurs;</li>
              <li>security concerns arise; or</li>
              <li>required by law or regulatory authorities.</li>
            </ul>
            <p>
              Termination may result in deletion of associated data or loss of access to stored content and may lead to legal action.
            </p>

            <h2>12. Changes to the Services</h2>
            <p>
              We may update, modify, suspend, discontinue, or remove features, functionality, pricing, or portions of the Services at any time without prior notice.
            </p>
            <p>
              We may also revise these Terms periodically. Continued use of the Services after changes become effective constitutes acceptance of the updated Terms.
            </p>

            <h2>13. Subscription Terms</h2>
            <p>
              Certain features of Nokslock may require a paid subscription.
            </p>

            <h3>13.1 Automatic Renewal</h3>
            <p>
              Subscriptions automatically renew unless canceled before the renewal date. Free trial subscriptions automatically convert into paid subscriptions unless canceled before the trial period ends.
            </p>

            <h3>13.2 Billing</h3>
            <p>
              Payments may be processed through Apple App Store, Google Play Store, Stripe, credit card providers, or other authorized payment processors. You authorize recurring charges associated with your selected subscription plan.
            </p>

            <h3>13.3 Managing Subscriptions</h3>
            <p>
              Subscriptions may be managed or canceled through your device account settings or relevant app marketplace account settings. Cancellation must occur at least 24 hours before renewal to avoid being charged for the next billing period.
            </p>

            <h3>13.4 Pricing Changes</h3>
            <p>
              Subscription prices, features, and plans may change at our discretion. Promotional pricing and discounts may be temporary and may not apply retroactively.
            </p>

            <h3>13.5 Refunds</h3>
            <p>
              Refunds are governed by the policies of the platform through which purchases were made, including Apple App Store or Google Play Store policies.
            </p>

            <h2>14. Privacy Policy</h2>
            <p>
              Nokslock values your privacy and is committed to protecting personal information and user content.
            </p>
            <p>We may collect:</p>
            <ul>
              <li>device information;</li>
              <li>app performance data;</li>
              <li>crash reports;</li>
              <li>analytics data;</li>
              <li>subscription and billing status;</li>
              <li>authentication information;</li>
              <li>metadata related to stored files; and</li>
              <li>limited content required to provide core functionality.</li>
            </ul>
            <p>
              We do not sell personal data to third parties.
            </p>
            <p>
              Information may be processed by trusted third-party providers involved in hosting, analytics, authentication, payment processing, customer support, or cloud infrastructure.
            </p>
            <p>
              We may retain information for operational, legal, fraud prevention, backup, security, and compliance purposes.
            </p>
            <p>
              You are responsible for ensuring that any content uploaded or stored complies with applicable laws and does not violate third-party rights.
            </p>

            <h2>15. Data Deletion</h2>
            <p>
              Users may request deletion of their accounts and associated personal data, subject to:
            </p>
            <ul>
              <li>legal obligations;</li>
              <li>fraud prevention requirements;</li>
              <li>backup retention periods; and</li>
              <li>technical limitations.</li>
            </ul>
            <p>
              Certain residual copies may temporarily remain in backups or archived systems.
            </p>

            <h2>16. Governing Law</h2>
            <p>
              These Terms shall be governed and interpreted in accordance with the laws of the Federal Republic of Nigeria, without regard to conflict of law principles.
            </p>
            <p>
              Any disputes arising from or relating to these Terms or the Services shall be subject to the jurisdiction of the appropriate courts in Nigeria.
            </p>

            <h2>17. Contact Information</h2>
            <p>
              For questions, support requests, legal inquiries, or privacy-related concerns, you may contact:
            </p>
            <p>
              <strong>Nokslock Support</strong><br />
              Email:{" "}
              <a href="mailto:support@nokslock.com">support@nokslock.com</a>
              {" "}or{" "}
              <a href="mailto:security@nokslock.com">security@nokslock.com</a>
            </p>
            <p>
              By using Nokslock, you acknowledge and agree to these Terms.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
