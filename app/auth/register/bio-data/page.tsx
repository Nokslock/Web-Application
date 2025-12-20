import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/logo.svg";
import BioForm from "./bioForm";
import { FaAngleLeft } from "react-icons/fa6";

export default function RegisterBioDataPage() {
  return (
    <>
      <div className="pb-3">
        <Link href="/auth/register">
          <div className="px-5 flex items-center gap-2 text-blue-400 text-lg font-medium">
            <FaAngleLeft /> Back
          </div>
        </Link>
      </div>

      <div className="text-center px-25">
        <p className="lg:text-5xl md:text-4xl font-bold">Bio Data</p>

        <p className="text-lg text-center break-all font-thin py-5 ">
          We need some additional information to complete your <br />{" "}
          registration.
        </p>
      </div>
      <div className="px-25">
        <BioForm />
      </div>
    </>
  );
}
