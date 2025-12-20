import LoginGoogle from "./actions/loginGoogle";
import LoginApple from "./actions/loginApple";
import LoginForm from "./actions/loginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
           <div className="text-center px-5 md:px-10 lg:px-10"> {/* reduced mobile padding slightly */}
  <p className="text-3xl font-bold md:text-4xl lg:text-5xl">Welcome Back</p>

  {/* CHANGED: Removed 'break-all', added 'break-words' (optional, but safer) */}
  <p className="break-words py-5 text-center text-base font-thin md:text-lg lg:text-xl">
    Log in to a simpler, more secure online experience.
    <br /> Your digital world, protected and organized.
  </p>
</div>
            <div className="lg:px-10 md:px-10 px-5">
              <LoginForm />
              <p className="text-center lg:pb-8">or continue with</p>

              <div className="grid lg:grid-cols-2 md:grid-cols-1 lg:gap-6 md:gap-4 gap-3 pb-10">
                <div>
                  <LoginApple />
                </div>
                <div>
                  <LoginGoogle />
                </div>
              </div>
              

              <p className="text-center pb-10 ">Don't have an Account? &nbsp;  

                <Link href="/auth/register" className="text-blue-400">
                   Register
                  </Link>
              </p>
            </div>

            <div className="grid grid-cols-2 ">
              <div className="text-start font-bold">
                &copy; Nockslock 2025
              </div>
              <div className="text-end">
                <p className="text-blue-400">Privacy Policy</p>
              </div>
            </div>
    </>
  );
}
