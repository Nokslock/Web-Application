import Image from "next/image";
import Img from "@/public/not-available.png";
import AuthButton from "@/components/AuthButton";
import { FaApple, FaGooglePlay } from "react-icons/fa"; // Optional: Added icons for better UX

export default function Vault() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-4">Vault</h1>
      <p className="text-gray-600 mb-10">
        Manage your secure vault settings and view your stored assets.
      </p>

      {/* Main Content - Centered Vertically & Horizontally */}
      <div className="flex-1 flex flex-col items-center justify-center text-center pb-20">
        
        {/* Image Container */}
        <div className="relative mb-6">
          <Image 
            src={Img} 
            alt="Vault not available on web" 
            className="rounded-full w-64 h-auto object-cover mx-auto"
            placeholder="blur" // Optional if you have blurDataURL, otherwise remove
          />
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8 px-4">
            The Vault feature is currently optimized for mobile security. 
            Please download our mobile app to access your encrypted assets.
        </p>

        {/* Buttons Container */}
        {/* Mobile: 1 Column (Stacked) | Tablet+: 2 Columns (Side-by-Side) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md px-6">
          <div>
            <AuthButton variant="primary" type="button">
              <span className="flex items-center justify-center gap-2">
                 <FaGooglePlay /> Android
              </span>
            </AuthButton>
          </div>
          <div>
            <AuthButton variant="dark" type="button">
              <span className="flex items-center justify-center gap-2">
                 <FaApple /> iOS
              </span>
            </AuthButton>
          </div>
        </div>
      </div>
    </div>
  );
}