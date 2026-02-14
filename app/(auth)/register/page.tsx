import Link from "next/link";
import RegisterGoogle from "./actions/registerGoogle";
import RegisterForm from "./actions/registerForm";

export default function RegisterPage() {
  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
      <div className="min-h-min flex flex-col justify-center">
        <div className="text-center px-5 mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white md:text-4xl lg:text-5xl tracking-tighter mb-4">
            Create Vault Access
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 md:text-lg">
            Initialize your secure personal space and protect your digital
            assets.
          </p>
        </div>

        <div className="w-full">
          <RegisterForm />

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-950 text-gray-500 uppercase tracking-widest text-xs font-semibold">
                Or join with
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex-1">
              <RegisterGoogle />
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account? &nbsp;
            <Link
              href="/login"
              className="font-bold text-blue-600 dark:text-blue-500 hover:underline"
            >
              Access Vault
            </Link>
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-900 flex justify-between items-center text-xs text-gray-400">
          <div className="font-medium">&copy; Nokslock 2025</div>
          <Link
            href="#"
            className="hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            Privacy & Security
          </Link>
        </div>
      </div>
    </div>
  );
}
