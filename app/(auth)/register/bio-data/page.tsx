import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logo.svg";
import BioForm from "./bioForm";
import { FaAngleLeft } from "react-icons/fa6";

export default function RegisterBioDataPage() {
  return (
    <>
      <div className="pb-3">
        <Link href="/register">
          <div className="px-5 flex items-center gap-2 text-blue-400 text-lg font-medium">
            <FaAngleLeft /> Back
          </div>
        </Link>
      </div>

      <div className="text-center px-5 md:px-10 lg:px-10">
        <p className="text-3xl font-bold md:text-4xl lg:text-5xl">Bio Data</p>

        <p className="break-words py-5 text-center text-base font-thin md:text-lg lg:text-xl ">
          We need some additional information to complete your
          registration.
        </p>
      </div>
      <div className="lg:px-10 md:px-10 px-5">
        <BioForm />
      </div>
    </>
  );
}
