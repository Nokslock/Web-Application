import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/logo.svg";

export default function HomeLogo() {
  return (
    <div className="pb-10">
      <Link href="/">
        <Image src={Logo} alt="Nockslock Logo" width={200} />
      </Link>
    </div>
  );
}