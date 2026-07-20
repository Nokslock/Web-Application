import Image from "next/image";
import Shot1 from "@/public/sc-4.png";
import Shot2 from "@/public/sc-7.png";
import Shot3 from "@/public/sc-8.png";
import StoreButtons from "@/components/StoreButtons";
import { FaCircleCheck, FaMobileScreenButton } from "react-icons/fa6";

const points = [
  "Subscribe and manage your plan",
  "Your full vault, anywhere",
  "Biometric unlock & instant alerts",
];

export default function GetTheAppSection() {
  return (
    <section id="get-app" className="py-20 lg:py-28 px-5 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 shadow-2xl">
          {/* glow accents */}
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-400 rounded-full blur-3xl opacity-20 pointer-events-none" />
          <div className="absolute -bottom-20 -right-10 w-80 h-80 bg-violet-500 rounded-full blur-3xl opacity-30 pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-8 items-center p-8 sm:p-12 lg:p-16">
            {/* Copy */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full mb-6">
                <FaMobileScreenButton className="text-sm" /> Mobile App
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
                Take Nokslock everywhere
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-md mx-auto lg:mx-0">
                Download the app to subscribe and keep your digital legacy
                protected — right from your pocket.
              </p>

              <ul className="space-y-3 mb-9 inline-block text-left">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-blue-50">
                    <FaCircleCheck className="text-green-300 flex-shrink-0" size={17} />
                    <span className="text-sm font-medium">{p}</span>
                  </li>
                ))}
              </ul>

              <StoreButtons align="start" className="justify-center lg:justify-start" />
            </div>

            {/* Phone mockups — fanned trio */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative flex items-center justify-center">
                {/* Left phone */}
                <div className="w-28 sm:w-32 lg:w-36 relative z-10 -rotate-[6deg]">
                  <div className="bg-gray-900 rounded-[1.8rem] p-1.5 shadow-xl shadow-black/30 border border-gray-700">
                    <div className="rounded-[1.4rem] overflow-hidden bg-gray-800">
                      <Image src={Shot1} alt="Nokslock app home" className="w-full h-auto" placeholder="blur" />
                    </div>
                  </div>
                </div>
                {/* Center phone — front */}
                <div className="w-28 sm:w-32 lg:w-36 relative z-20 -mx-3 -mt-2">
                  <div className="bg-gray-900 rounded-[1.8rem] p-1.5 shadow-2xl shadow-black/40 border border-gray-600">
                    <div className="rounded-[1.4rem] overflow-hidden bg-gray-800">
                      <Image src={Shot2} alt="Nokslock add crypto wallet" className="w-full h-auto" placeholder="blur" />
                    </div>
                  </div>
                </div>
                {/* Right phone */}
                <div className="w-28 sm:w-32 lg:w-36 relative z-10 rotate-[6deg]">
                  <div className="bg-gray-900 rounded-[1.8rem] p-1.5 shadow-xl shadow-black/30 border border-gray-700">
                    <div className="rounded-[1.4rem] overflow-hidden bg-gray-800">
                      <Image src={Shot3} alt="Nokslock secure file upload" className="w-full h-auto" placeholder="blur" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
