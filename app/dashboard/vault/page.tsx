import Image from "next/image";
import Img from "@/public/not-available.png"
import AuthButton from "@/components/AuthButton";
export default function Vault() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Vault</h1>
            <p className="text-gray-600">Manage your secure vault settings and view your stored assets.</p>

            <div className="grid justify-center text-center mt-10">
                <Image src={Img} alt="not-available" className=" rounded-full" />
                <p>Oops!</p>
                <p>Vault is currently not available for the web, please download the mobile versions</p>
            </div>

             <div className="grid grid-cols-2 gap-10 px-100">
              <div>
                <AuthButton variant="primary" type="button">
                  Android
                </AuthButton>
              </div>
              <div>
                <AuthButton variant="dark" type="button">
                  Ios
                </AuthButton>
              </div>
            </div>
        </div>
    );
}