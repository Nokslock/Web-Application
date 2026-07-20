import { FaApple, FaGooglePlay } from "react-icons/fa6";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/payments";

/**
 * App Store + Google Play download buttons. URLs come from lib/payments
 * (NEXT_PUBLIC_APP_STORE_URL / NEXT_PUBLIC_PLAY_STORE_URL).
 */
export default function StoreButtons({
  className = "",
  align = "center",
}: {
  className?: string;
  align?: "center" | "start";
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row gap-4 ${
        align === "center" ? "items-center justify-center" : "items-stretch sm:items-center"
      } ${className}`}
    >
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 justify-center px-7 py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
      >
        <FaApple className="text-2xl" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-normal opacity-70">Download on the</span>
          <span className="block text-base font-bold -mt-0.5">App Store</span>
        </span>
      </a>

      <a
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 justify-center px-7 py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold shadow-lg transition-transform hover:-translate-y-0.5"
      >
        <FaGooglePlay className="text-xl" />
        <span className="text-left leading-tight">
          <span className="block text-[10px] font-normal opacity-70">GET IT ON</span>
          <span className="block text-base font-bold -mt-0.5">Google Play</span>
        </span>
      </a>
    </div>
  );
}
