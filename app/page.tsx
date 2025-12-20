import Link from "next/link";
import Image from "next/image";
import BgImg from "@/public/hero-img.png";
import "./globals.css";
import NavBar from "@/components/NavBar";
import AuthButton from "@/components/AuthButton";
import LandingOne from "@/components/LandingOne";
import Footer from "@/components/Footer";
export default function Home() {
  return (
    <>
      <NavBar />
      <div className="w-screen mx-auto lg:px-20 lg:pt-33 lg:pb-20 md:px-15 md:pt-25 md:pb-10 px-5 pt-20 pb-5  hero-section">
        <div className="grid lg:grid-cols-2 md:grid-cols-3 sm:grid-cols-1 gap-10 ">
          <div className="lg:col-span-1 md:col-span-2 self-center">
            <p className="lg:text-6xl md:text-3xl text-2xl font-black lg:pb-10 md:pb-5 p-2">
              Take Full Control of your Digital Security
            </p>
            <p className="lg:text-2xl md:text-base font-thin pb-10 md:pb-5">
              Log in to a simpler, more secure online experience.
              <br /> Your digital world, protected and organized.
            </p>
            <div className="grid grid-cols-3">
              <div className="md:col-span-1 lg:col-span-1 col-span-2">
                <AuthButton variant="dark" type="button">
                  Get the App
                </AuthButton>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Image
              src={BgImg}
              alt="A description of my hero image"
              className="max-h-full"
            />
          </div>
        </div>
      </div>
      <LandingOne />
      <Footer />
    </>
  );
}
