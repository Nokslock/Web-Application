import Link from "next/link";
import RegisterApple from "./actions/registerApple";
import RegisterGoogle from "./actions/registerGoogle";
import RegisterForm from "./actions/registerForm";

export default function RegisterPage() {
  return (
    <>
      <div className="text-center px-15">
        <p className="lg:text-5xl md:text-4xl font-bold">Join Us</p>

        <p className="text-lg text-center break-all font-thin py-5 ">
          Create your account to unlock a more secure, organized digital life.
          <br />
          Your personal space, simplified and protected.
        </p>
      </div>
      <div className="px-25">
        <RegisterForm />
        <p className="text-center pb-8">or continue with</p>

        <div className="grid lg:grid-cols-1 md:grid-cols-1 gap-2 pb-10">
          <div>
            <RegisterApple />
          </div>
          <div>
            <RegisterGoogle />
          </div>
        </div>

        <p className="text-center pb-10 ">
          Already have an Account? &nbsp;
          <Link href="/auth/login" className="text-blue-400">
            Login
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-2 ">
        <div className="text-start font-bold">&copy; Nockslock 2025</div>
        <div className="text-end">
          <p className="text-blue-400">Privacy Policy</p>
        </div>
      </div>
    </>
  );
}
