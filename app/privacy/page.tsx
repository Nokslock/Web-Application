import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Nokslock - Privacy Policy",
  description: "How Nokslock collects, uses, and protects your data.",
};

const lastUpdated = "May 20, 2025";

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen flex flex-col transition-colors duration-300">
      <NavBar />

      <main className="flex-1 pt-28 pb-20 px-5 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
            Legal
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-12">
            Last updated: {lastUpdated}
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-li:text-gray-600 dark:prose-li:text-gray-400 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
            <h2>1. Introduction</h2>
            <p>
              Nokslock (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates a digital vault platform that allows users to securely store passwords, payment cards, cryptocurrency keys, files, and manage digital inheritance through a Dead Man&apos;s Switch feature. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>

            <h2>2. Information We Collect</h2>

            <h3>2.1 Account Information</h3>
            <p>When you create an account, we collect:</p>
            <ul>
              <li>Email address</li>
              <li>First and last name</li>
              <li>Phone number</li>
              <li>Authentication credentials (password hash &mdash; we never store your plaintext password)</li>
            </ul>

            <h3>2.2 Next of Kin Information</h3>
            <p>
              If you configure a Next of Kin (NOK) for the Dead Man&apos;s Switch feature, we collect their full name, email address, alternate email, phone number, and NIN. This information is encrypted server-side before storage and is only used to facilitate the digital inheritance process you configure.
            </p>

            <h3>2.3 Vault Data</h3>
            <p>
              All vault items (passwords, cards, crypto keys, files) are <strong>encrypted client-side</strong> before being transmitted to our servers. We use a zero-knowledge encryption architecture, which means:
            </p>
            <ul>
              <li>Your Vault Key is generated in your browser and never sent to our servers</li>
              <li>Your Master Password is used to derive an encryption key locally via PBKDF2</li>
              <li>We store only the AES-GCM-wrapped version of your Vault Key</li>
              <li>We cannot read, access, or decrypt your vault contents under any circumstances</li>
            </ul>

            <h3>2.4 Payment Information</h3>
            <p>
              Payments are processed by Paystack. We do not store your credit card numbers or bank account details. We retain only transaction references, plan type, and payment timestamps for billing records.
            </p>

            <h3>2.5 Usage Data</h3>
            <p>We automatically collect:</p>
            <ul>
              <li>Login timestamps and session activity (for the Dead Man&apos;s Switch inactivity timer)</li>
              <li>Device type and browser information</li>
              <li>IP address</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <ul>
              <li><strong>Provide and maintain the service</strong> &mdash; authenticate your identity, render your encrypted vault, and process your requests</li>
              <li><strong>Dead Man&apos;s Switch</strong> &mdash; monitor heartbeat activity to determine inactivity thresholds and trigger the digital inheritance process when configured</li>
              <li><strong>Billing</strong> &mdash; process subscription payments and manage your plan</li>
              <li><strong>Notifications</strong> &mdash; send transactional emails (verification codes, password resets, NOK alerts, Dead Man&apos;s Switch warnings)</li>
              <li><strong>Security</strong> &mdash; detect and prevent unauthorized access, fraud, and abuse</li>
              <li><strong>Improvement</strong> &mdash; analyze usage patterns to improve the platform (we never analyze your encrypted vault data)</li>
            </ul>

            <h2>4. Data Storage and Security</h2>
            <p>
              Your data is stored on Supabase infrastructure with the following protections:
            </p>
            <ul>
              <li><strong>Encryption at rest</strong> &mdash; all database records are encrypted on disk</li>
              <li><strong>Encryption in transit</strong> &mdash; all communications use TLS/HTTPS</li>
              <li><strong>Zero-knowledge vault</strong> &mdash; vault contents are encrypted client-side with AES-256-GCM before transmission; we hold only ciphertext</li>
              <li><strong>Row-Level Security</strong> &mdash; database policies ensure users can only access their own data</li>
              <li><strong>Server-side escrow encryption</strong> &mdash; sensitive Dead Man&apos;s Switch data (NOK email, emergency key) is additionally encrypted with AES-256-CBC using a server-held escrow key</li>
            </ul>

            <h2>5. Data Sharing and Disclosure</h2>
            <p>We do not sell, rent, or trade your personal information. We may share data only in the following limited cases:</p>
            <ul>
              <li><strong>Dead Man&apos;s Switch activation</strong> &mdash; when your configured inactivity threshold is reached, your Next of Kin receives access to the vault items you designated for sharing, along with the emergency key to decrypt them</li>
              <li><strong>Payment processing</strong> &mdash; transaction data is shared with Paystack to process payments</li>
              <li><strong>Legal obligations</strong> &mdash; we may disclose information if required by law, subpoena, or court order. However, due to our zero-knowledge architecture, we cannot provide decrypted vault contents even under compulsion</li>
            </ul>

            <h2>6. Data Retention</h2>
            <ul>
              <li><strong>Active accounts</strong> &mdash; data is retained for the lifetime of your account</li>
              <li><strong>Deleted accounts</strong> &mdash; account data is permanently deleted within 30 days of account deletion</li>
              <li><strong>Payment records</strong> &mdash; billing records are retained for up to 7 years to comply with tax and financial regulations</li>
              <li><strong>Dead Man&apos;s Switch</strong> &mdash; NOK claim data and death certificates are retained for the duration of the claim process</li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access</strong> your personal data stored in your account settings</li>
              <li><strong>Correct</strong> inaccurate personal information</li>
              <li><strong>Delete</strong> your account and all associated data</li>
              <li><strong>Export</strong> your vault data at any time</li>
              <li><strong>Withdraw consent</strong> for optional data processing</li>
            </ul>

            <h2>8. Cookies</h2>
            <p>
              We use essential cookies only for authentication and session management. We do not use advertising or third-party tracking cookies.
            </p>

            <h2>9. Third-Party Services</h2>
            <ul>
              <li><strong>Supabase</strong> &mdash; database hosting and authentication</li>
              <li><strong>Paystack</strong> &mdash; payment processing</li>
              <li><strong>Google OAuth</strong> &mdash; optional social sign-in</li>
            </ul>
            <p>
              Each third-party service has its own privacy policy governing their use of your data.
            </p>

            <h2>10. Children&apos;s Privacy</h2>
            <p>
              Nokslock is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.
            </p>

            <h2>11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Continued use of the service after changes constitutes acceptance of the revised policy.
            </p>

            <h2>12. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or your data, contact us at{" "}
              <a href="mailto:support@nokslock.com">support@nokslock.com</a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
