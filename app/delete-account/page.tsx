import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Nokslock - Delete Your Account",
  description:
    "Learn how to request deletion of your Nokslock account and associated data.",
};

export default function DeleteAccountPage() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen flex flex-col transition-colors duration-300">
      <NavBar />

      <main className="flex-1 pt-28 pb-20 px-5 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
            Account
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Delete Your Account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-12">
            How to request deletion of your Nokslock account and data
          </p>

          <div className="prose prose-gray dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-li:text-gray-600 dark:prose-li:text-gray-400 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
            <p>
              Nokslock allows you to permanently delete your account and all
              associated data at any time. This page explains the steps to
              request account deletion and what data is affected.
            </p>

            <h2>How to Delete Your Account</h2>

            <h3>Option 1: Delete from the App</h3>
            <ol>
              <li>
                Log in to your Nokslock account on the website or mobile app.
              </li>
              <li>
                Navigate to{" "}
                <strong>
                  Dashboard &rarr; Settings
                </strong>
                .
              </li>
              <li>
                Scroll to the <strong>Danger Zone</strong> section at the bottom
                of the page.
              </li>
              <li>
                Click <strong>&quot;Delete Account&quot;</strong>.
              </li>
              <li>
                Confirm the deletion when prompted. This action is immediate and
                cannot be undone.
              </li>
            </ol>

            <h3>Option 2: Request Deletion via Email</h3>
            <p>
              If you are unable to access your account, you can request deletion
              by emailing us at{" "}
              <a href="mailto:support@nokslock.com">support@nokslock.com</a>{" "}
              from the email address associated with your Nokslock account. Please
              include &quot;Account Deletion Request&quot; in the subject line.
              We will process your request within 30 days.
            </p>

            <h2>Data That Is Deleted</h2>
            <p>
              When your account is deleted, the following data is permanently
              removed:
            </p>
            <ul>
              <li>
                <strong>Account profile</strong> &mdash; your name, email
                address, profile photo, and all personal information
              </li>
              <li>
                <strong>Vault data</strong> &mdash; all encrypted files,
                documents, passwords, payment cards, cryptocurrency keys, and
                any other items stored in your vaults
              </li>
              <li>
                <strong>Dead Man&apos;s Switch configuration</strong> &mdash;
                next of kin details, inactivity thresholds, and emergency key
                data
              </li>
              <li>
                <strong>Subscription information</strong> &mdash; billing
                history and plan details
              </li>
              <li>
                <strong>Authentication data</strong> &mdash; login credentials
                and linked OAuth accounts
              </li>
              <li>
                <strong>Notification preferences</strong> &mdash; email and
                in-app notification settings
              </li>
            </ul>

            <h2>Data That May Be Retained</h2>
            <p>
              Certain data may be retained for a limited period after deletion as
              required by law or for legitimate business purposes:
            </p>
            <ul>
              <li>
                <strong>Transaction records</strong> &mdash; payment transaction
                logs may be retained for up to 90 days for fraud prevention and
                financial compliance
              </li>
              <li>
                <strong>Backup copies</strong> &mdash; residual copies of your
                data may temporarily remain in encrypted backups for up to 30
                days before being permanently purged
              </li>
              <li>
                <strong>Legal obligations</strong> &mdash; data required to
                comply with applicable laws, resolve disputes, or enforce
                agreements may be retained as necessary
              </li>
            </ul>

            <h2>Important Notes</h2>
            <ul>
              <li>
                Account deletion is <strong>permanent and irreversible</strong>.
                Once deleted, your data cannot be recovered.
              </li>
              <li>
                If you have an active paid subscription, please cancel it before
                deleting your account to avoid future charges. You can manage
                your subscription in{" "}
                <strong>Dashboard &rarr; Subscription</strong>.
              </li>
              <li>
                If your Dead Man&apos;s Switch has already triggered and
                transferred data to a next of kin, that transferred data is not
                affected by your account deletion.
              </li>
            </ul>

            <h2>Contact Us</h2>
            <p>
              If you have questions about account deletion or data retention,
              contact us at{" "}
              <a href="mailto:support@nokslock.com">support@nokslock.com</a> or{" "}
              <a href="mailto:security@nokslock.com">security@nokslock.com</a>.
            </p>
            <p>
              For more information about how we handle your data, see our{" "}
              <Link href="/privacy">Privacy Policy</Link> and{" "}
              <Link href="/terms">Terms of Use</Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
