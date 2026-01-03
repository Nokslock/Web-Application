import Link from "next/link";
import EmailForm from "./actions/emailForm";
import { FaArrowLeft } from "react-icons/fa6";

export default function ForgotPassword() {
  return (
    <>
      <div className="text-center px-5 mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white md:text-4xl lg:text-5xl tracking-tighter mb-4">
          Vault Recovery
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 md:text-lg">
          Lost access? Enter your credentials to initiate the recovery protocol.
        </p>
      </div>
      
      <div className="w-full">
        <EmailForm />
        
        <div className="mt-8 flex justify-center">
          <Link 
            href="/login" 
            className="flex items-center text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors gap-2"
          >
            <FaArrowLeft /> Return to Login
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-900 flex justify-between items-center text-xs text-gray-400">
        <div className="font-medium">&copy; Nokslock 2025</div>
        <Link href="#" className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
          Privacy & Security
        </Link>
      </div>
    </>
  );
}
