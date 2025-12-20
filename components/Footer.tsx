import Link from "next/link";
import { FaTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa6";

export default function Footer() {
  return (
    <>
      <div className="grid lg:grid-cols-4 md:grid-cols-4 grid-cols-1 lg:px-50 md:px-25 px-15 py-10 gap-5">
        <div className="lg:text-start md:text-start text-center text-lg font-base lg:col-span-3 md:col-span-3 col-span-1">
          &copy; Nockslock 2025, All rights reserved.
        </div>
        <div className="flex justify-center">
          <div>
            <Link href="#">
              <FaTwitter className="text-2xl inline mr-5" />
              <FaInstagram className="text-2xl inline mr-5" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
