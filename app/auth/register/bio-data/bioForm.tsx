import Link from "next/link";
import AuthButton from "@/components/AuthButton";


export default function BioForm() {
    return (
        <> 
            <form action="" className="pb-10">
                <div className="pb-5">
                    <label className="block text-sm font-bold text-gray-500">Full Name</label>
                    <input
                        type="email"
                        placeholder="Your Email"
                        className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
                    />
                </div>
                <div className="pb-5">
                    <label className="block text-sm font-bold text-gray-500">Phone Number</label>
                    <input
                        type="tel"
                        placeholder="Phone number"
                        className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
                    />
                </div>
                <div className="pb-5">
                    <label className="block text-sm font-bold text-gray-500">Password</label>
                    <input
                        type="email"
                        placeholder="Password"
                        className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
                    />
                </div>
                <div className="pb-5">
                    <label className="block text-sm font-bold text-gray-500">Verify Password</label>
                    <input
                        type="email"
                        placeholder="Verify Password"
                        className="mt-1 w-full px-4 p-2  h-13 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
                    />
                </div>
                <Link href="/auth/register/email-otp/">
                    <AuthButton variant="primary" type="button">
            Next
          </AuthButton>
                </Link>
                
                </form>
        </>
    );
}