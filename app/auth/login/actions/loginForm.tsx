import AuthButton from "@/components/AuthButton";
import Link from "next/link";

export default function LoginForm() {
  return (
    <>
      <form action="" className="pb-10">
        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">Email</label>
          <input
            type="email"
            placeholder="Your Email"
            className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
          />
        </div>

        <div className="pb-5">
          <label className="block text-sm font-bold text-gray-500">
            Password
          </label>
          <input
            type="password"
            placeholder="Your Password"
            className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
          />
        </div>

        <div className="pb-5">
          <p className="text-md text-end text-blue-400">
            <Link href="/auth/forgot-password">Forgot Password?</Link>
          </p>
        </div>

        <div>
          <Link href="/auth/login/email-otp">
            <AuthButton
                      variant="primary"
                      type="button"
                    >
                     Login
                    </AuthButton>
          </Link>
        </div>
      </form>
    </>
  );
}
