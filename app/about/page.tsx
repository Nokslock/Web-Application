import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import StoreButtons from "@/components/StoreButtons";
import {
  FaShieldHalved, FaLock, FaHandHoldingHeart, FaEyeSlash, FaArrowRight,
} from "react-icons/fa6";

export const metadata = {
  title: "Nokslock - About Us",
  description: "Nokslock is a zero-knowledge digital vault for passwords, crypto keys, and files — with a Dead Man's Switch that passes your digital legacy to the people you trust.",
};

const values = [
  {
    Icon: FaEyeSlash,
    title: "Zero-knowledge by design",
    body: "Your data is encrypted before it ever leaves your device. We can't read it, and we never will — your key, your control.",
  },
  {
    Icon: FaLock,
    title: "Security without compromise",
    body: "AES-256 encryption at rest and in transit, biometric access, and a security model built for the things you can't afford to lose.",
  },
  {
    Icon: FaHandHoldingHeart,
    title: "Built for what comes after",
    body: "Our Dead Man's Switch and Next-of-Kin release mean your passwords, crypto, and memories reach your loved ones — even when you can't hand them over yourself.",
  },
  {
    Icon: FaShieldHalved,
    title: "Trust, earned transparently",
    body: "No hidden data collection, no selling your information. Clear policies, honest defaults, and encryption you can rely on.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen flex flex-col transition-colors duration-300">
      <NavBar />

      <main className="flex-1 pt-28 pb-20 px-5 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
            About Nokslock
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
            Your digital life, secured — and passed on.
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
            Nokslock is a secure digital vault for the things that matter most:
            your passwords, payment cards, cryptocurrency keys, and important
            files. But we go a step further than a password manager — we help you
            plan for the day you&apos;re no longer around to unlock them.
          </p>
        </div>

        {/* Mission */}
        <div className="max-w-3xl mx-auto mt-14 space-y-5 text-gray-600 dark:text-gray-300 leading-relaxed">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Why we exist</h2>
          <p>
            More of our lives live behind logins than ever — crypto wallets, cloud
            accounts, private files, years of memories. Yet almost none of it is
            planned for. When someone passes away, families are often locked out of
            the very things meant to support them.
          </p>
          <p>
            Nokslock was built to solve both problems at once: give you a genuinely
            secure place to store your digital life today, and a trusted way to pass
            it on tomorrow. Our <span className="font-semibold text-gray-900 dark:text-white">Dead
            Man&apos;s Switch</span> quietly watches for your activity, and if you go
            silent for a period you choose, it releases access to the beneficiaries
            you&apos;ve designated — with legal verification, on your terms.
          </p>
        </div>

        {/* Values */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            What we stand for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40"
              >
                <div className="h-11 w-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                  <Icon className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white p-8 sm:p-10 text-center">
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-400 rounded-full blur-3xl opacity-20 pointer-events-none" />
            <div className="absolute -bottom-14 -right-10 w-52 h-52 bg-violet-500 rounded-full blur-3xl opacity-30 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-black mb-3">
                Start protecting your digital legacy
              </h2>
              <p className="text-blue-100 mb-8 max-w-md mx-auto">
                Set up your vault in minutes — free to get started, on web and mobile.
              </p>
              <div className="flex flex-col items-center gap-5">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-blue-700 font-bold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Get Started — It&apos;s Free <FaArrowRight size={13} />
                </Link>
                <StoreButtons />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
