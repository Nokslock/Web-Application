import LoginGoogle from "./actions/loginGoogle";
import LoginApple from "./actions/loginApple";
import LoginForm from "./actions/loginForm";
import Image from "next/image";
import Logo from "@/public/logo.svg";
import BgImg from "@/public/login-bg-img.png";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
            <div className="text-center px-20">
              <p className="lg:text-5xl md:text-4xl font-bold">Welcome Back</p>
              
                <p className="text-lg text-center break-all font-thin py-5 ">
                  Log in to a simpler, more secure online experience.<br /> Your
                  digital world, protected and organized.
                </p>
                
            </div>
            <div className="px-25">
              <LoginForm />
              <p className="text-center pb-8">or continue with</p>

              <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-6 pb-10">
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
