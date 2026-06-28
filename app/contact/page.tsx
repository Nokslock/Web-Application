import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import {
  FaEnvelope, FaClock, FaShieldHalved, FaLifeRing, FaArrowRight,
} from "react-icons/fa6";

export const metadata = {
  title: "Nokslock - Contact Us",
  description: "Get in touch with the Nokslock team. We're here to help with questions about your account, billing, or digital legacy.",
};

const SUPPORT_EMAIL = "support@nokslock.com";

const infoCards = [
  {
    Icon: FaClock,
    title: "Response time",
    body: "We reply within 1–2 business days.",
  },
  {
    Icon: FaLifeRing,
    title: "Priority support",
    body: "Faster response on all paid plans.",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen flex flex-col transition-colors duration-300">
      <NavBar />

      <main className="flex-1 pt-28 pb-20 px-5 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center">
            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
              Contact
            </p>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
              Get in touch
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Questions about your account, billing, or how Nokslock protects your
              digital legacy? We&apos;re here to help.
            </p>
          </div>

          {/* Primary email card */}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="group block mt-12 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white p-8 shadow-xl relative overflow-hidden transition-transform hover:-translate-y-0.5"
          >
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl opacity-30 pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-44 h-44 bg-indigo-500 rounded-full blur-3xl opacity-40 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <FaEnvelope className="text-2xl" />
              </div>
              <div className="min-w-0">
                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Email us</p>
                <p className="text-2xl font-extrabold break-all">{SUPPORT_EMAIL}</p>
              </div>
              <FaArrowRight className="ml-auto flex-shrink-0 opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>

          {/* Secondary info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {infoCards.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Icon className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Security note */}
          <div className="flex items-start gap-3 p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 mt-4">
            <FaShieldHalved className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              For your security, never share passwords, recovery phrases, or vault
              contents over email. Our team will never ask for them.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
