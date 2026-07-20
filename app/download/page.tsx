import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import StoreButtons from "@/components/StoreButtons";
import { FaCircleCheck, FaShieldHalved } from "react-icons/fa6";

export const metadata = {
  title: "Nokslock - Get the App",
  description: "Download the Nokslock app to subscribe and manage your plan on iOS and Android.",
};

const perks = [
  "Subscribe and manage your plan securely",
  "Full vault access on the go",
  "Biometric unlock on supported devices",
  "Instant Dead Man's Switch alerts",
];

export default function DownloadPage() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen flex flex-col transition-colors duration-300">
      <NavBar />

      <main className="flex-1 pt-28 pb-20 px-5 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3 uppercase tracking-wider">
            Get the App
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight mb-4">
            Subscribe in the app
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Plans are managed through the Nokslock mobile app. Download it on iOS
            or Android to subscribe and unlock every premium feature.
          </p>

          {/* Store buttons */}
          <StoreButtons className="mt-10" />

          {/* Perks */}
          <div className="mt-12 max-w-md mx-auto text-left bg-gray-50/60 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FaShieldHalved className="text-blue-500 text-sm" />
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                In the app
              </span>
            </div>
            <ul className="space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3">
                  <FaCircleCheck className="text-green-500 flex-shrink-0" size={16} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-6">
            Already subscribed in the app? Just log in here — your plan carries over.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
