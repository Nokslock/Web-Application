import Link from "next/link";
import BioForm from "./bioForm"; // Ensure this matches your filename case-sensitively
import { FaAngleLeft } from "react-icons/fa6";

export default function RegisterBioDataPage() {
  return (
    <>
      <div className="pb-6">
        <Link href="/register">
          <div className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 transition-colors text-sm font-medium">
            <FaAngleLeft /> Back to Register
          </div>
        </Link>
      </div>

      <div className="text-center lg:text-left mb-8">
        <h1 className="text-3xl font-bold md:text-4xl text-gray-900 mb-4">
          Bio Data
        </h1>
        <p className="text-gray-500 font-light text-base md:text-lg leading-relaxed">
          We need some additional information to complete your registration securely.
        </p>
      </div>

      <div className="w-full">
        {/* This BioForm contains your long inputs */}
        <BioForm />
      </div>
    </>
  );
}