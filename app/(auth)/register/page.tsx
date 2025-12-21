import Link from "next/link";
import RegisterApple from "./actions/registerApple";
import RegisterGoogle from "./actions/registerGoogle";
import RegisterForm from "./actions/registerForm";

export default function RegisterPage() {
  return (
    <>
      <div className="text-center px-5 md:px-10 lg:px-10">
        <p className="text-3xl font-bold md:text-4xl lg:text-5xl">Join Us</p>

        <p className="break-words py-5 text-center text-base font-thin md:text-lg lg:text-xl">
          Create your account to unlock a more secure, organized digital life.
          Your personal space, simplified and protected.
        </p>
      </div>
      <div className="lg:px-10 md:px-10 px-5">
        <RegisterForm />
        <p className="text-center lg:pb-8">or continue with</p>

        <div className="grid lg:grid-cols-2 md:grid-cols-1 lg:gap-6 md:gap-4 gap-3 pb-10">
          <div>
            <RegisterApple />
          </div>
          <div>
            <RegisterGoogle />
          </div>
        </div>

        <p className="text-center pb-10 ">
          Already have an Account? &nbsp;
          <Link href="/login" className="text-blue-400">
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
