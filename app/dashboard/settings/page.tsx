import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { createSupabaseServerClient } from "@/lib/supabase/server-client"; // Make sure this path matches your project
import { redirect } from "next/navigation";

export default async function Settings() {
  // 1. Fetch User Data on the Server
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 2. Security Check: If no user, kick them to login
  if (!user) {
    redirect("/login");
  }

  // 3. Extract known data (Metadata + Auth details)
  const fullName = user.user_metadata?.full_name || "";
  const email = user.email || "";
  const phone = user.phone || ""; // This will only show if they signed up via Phone Auth

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 pb-10">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* CARD 1: PERSONAL INFORMATION */}
        <div className="card">
          <div className="grid grid-cols-3 pb-5">
            <div className="col-span-2">
              <p className="text-gray-600 font-bold text-xl">
                Personal Information
              </p>
            </div>
            <div className="text-end text-blue-500 cursor-pointer">edit</div>
          </div>

          <div className="text-center p-5 mb-5 border border-gray-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto overflow-hidden bg-gray-50">
             {/* You can add the Profile Picture logic here later */}
             <span className="text-4xl text-gray-300">Img</span>
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Full Name
            </label>
            <input
              disabled
              type="text"
              defaultValue={fullName} // Dynamic Data
              placeholder="No name set"
              className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700"
            />
          </div>
          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Email
            </label>
            <input
              disabled
              type="email"
              defaultValue={email} // Dynamic Data
              className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700"
            />
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Password
            </label>
            <input
              disabled
              type="password"
              defaultValue="********" // For security, we never show the real password
              className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700"
            />
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Phone Number
            </label>
            <input
              disabled
              type="tel"
              defaultValue={phone}
              placeholder="No phone linked"
              className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700"
            />
          </div>
        </div>

        {/* CARD 2: NEXT OF KIN (Example Data) */}
        {/* Note: 'Next of Kin' data usually lives in a database table, not in Auth User Metadata. 
            For now, these are kept blank or placeholder until you create that table. */}
        <div className="card">
          <div className="grid grid-cols-2 pb-5">
            <div>
              <p className="text-gray-600 font-bold text-xl">Next of Kin</p>
            </div>
            <div className="text-end text-blue-500 cursor-pointer">edit</div>
          </div>
          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Full Name
            </label>
            <input
              disabled
              type="text"
              placeholder="Add next of kin"
              className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700"
            />
          </div>
          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Email
            </label>
            <input
              disabled
              type="email"
              placeholder="Add email"
              className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700"
            />
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Alternative Email
            </label>
            <input
              disabled
              type="email"
              placeholder="Add alternative email"
              className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700"
            />
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              Phone Number
            </label>
            <input
              disabled
              type="tel"
              placeholder="Add phone number"
              className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700"
            />
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">
              National Identification Number (NIN)
            </label>
            <input
              disabled
              type="number"
              placeholder="Add NIN"
              className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700"
            />
          </div>
        </div>

        {/* CARD 3: THIRD PARTY */}
        <div className="card">
          <div className="grid grid-cols-4 pb-5">
            <div className="col-span-3">
              <p className="text-gray-600 font-bold text-xl">
                Third Party Connections
              </p>
            </div>
            <div className="col-span-1 text-end text-blue-500 cursor-pointer">edit</div>
          </div>
          <div className="mb-5 p-4 rounded-md border border-gray-200">
            <div className="w-full grid grid-cols-5 items-center">
                <div className="flex col-span-4 text-start gap-3 items-center">
                    <FaGoogle className="text-red-500"/> Google
                </div>
                <div className="text-end cols-1 text-sm text-gray-400 cursor-pointer hover:text-red-500">
                    Unlink
                </div>
            </div>
          </div>

          <div className="mb-5 p-4 rounded-md border border-gray-200">
           <div className="w-full grid grid-cols-5 items-center">
                <div className="flex col-span-4 text-start gap-3 items-center">
                    <FaApple className="text-black"/> Apple
                </div>
                <div className="text-end cols-1 text-sm text-gray-400 cursor-pointer hover:text-red-500">
                    Unlink
                </div>
            </div>
          </div>

          <div className="flex p-4 rounded-md border border-gray-200">
           <div className="w-full grid grid-cols-5 items-center">
                <div className="flex col-span-4 text-start gap-3 items-center">
                    <FaFacebook className="text-blue-600"/> Facebook
                </div>
                <div className="text-end cols-1 text-sm text-gray-400 cursor-pointer hover:text-red-500">
                    Unlink
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}