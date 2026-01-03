import Link from "next/link";
import BioForm from "./bioForm"; // Ensure this matches your filename case-sensitively
import { FaAngleLeft } from "react-icons/fa6";

export default function RegisterBioDataPage() {
  return (
    <>
      {/* FIXED HEADER SECTION */}
      <div className="flex-none pb-4">
        <div className="pb-6">
          <Link href="/register">
            <div className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors text-sm font-medium hover:-translate-x-1 duration-200">
              <FaAngleLeft /> Back to Register
            </div>
          </Link>
        </div>

        <div className="text-center lg:text-left">
          <h1 className="text-3xl font-black md:text-4xl text-gray-900 dark:text-white mb-3 tracking-tight">
            Bio Data
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-normal text-base leading-relaxed">
            We need some additional information to complete your registration securely.
          </p>
        </div>
      </div>

      {/* SCROLLABLE FORM SECTION */}
      <div className="flex-1 overflow-y-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
         <div className="w-full py-2">
            <BioForm />
         </div>
      </div>
    </>
  );
}