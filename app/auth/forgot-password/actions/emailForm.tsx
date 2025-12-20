import AuthButton from "@/components/AuthButton";
import Link from "next/link";

export default function EmailForm() {
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
        
         <Link href="/auth/forgot-password/email-otp">
          <AuthButton
                      variant="primary"
                      type="button"
                    >
                      Reset Password
                    </AuthButton>
        </Link>
       

        <p className="text-center pt-10 pb-10 ">
          Already have an Account? &nbsp;
          <Link href="/auth/login" className="text-blue-400">
            Login
          </Link>
        </p>
      </form>
    </>
  );
}
