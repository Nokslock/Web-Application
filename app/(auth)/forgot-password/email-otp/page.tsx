"use client";
import AuthButton from "@/components/AuthButton";
import Link from "next/link";
import { FaAngleLeft } from "react-icons/fa6";

export default function EmailOtpVerification() {
  return (
    <>
      <div className="pb-3">
        <Link href="/auth/forgot-password/">
          <div className="px-5 flex items-center gap-2 text-blue-400 text-lg font-medium">
            <FaAngleLeft /> Back
          </div>
        </Link>
      </div>
      <h2 className="lg:text-5xl md:text-4xl font-bold mb-8 text-center text-gray-800">
        Enter Verification Code
      </h2>
      <p className="text-center text-lg pb-5">
        We've sent a verification code to{" "}
        <span className="font-bold">/user-email</span>/
      </p>
      <div className="px-20">
        <form>
          <div className="flex pb-10 pt-10 space-x-10 md:space-x-4 justify-center">
            <div className="w-12 h-12 md:w-14 md:h-14 relative rounded-lg overflow-hidden shadow-sm">
              <label
                className="absolute flex justify-center items-center text-2xl top-0 left-0 w-full h-full rounded-lg
                     transition-all duration-200 ease-in-out"
              ></label>
              <input
                className="absolute  top-0 left-0 w-full h-full text-center text-2xl font-semibold 
                             text-transparent bg-transparent border-none outline-none 
                             caret-blue-500"
              />
            </div>
          </div>

          <AuthButton variant="disabled" type="button">
            Verify OTP
          </AuthButton>
        </form>
      </div>
    </>
  );
}
