import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import NextOfKinForm from "./NextOfKinForm"; // Import the new component

export default async function Settings() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch Auth Metadata (Existing logic)
  const fullName = user.user_metadata?.full_name || "";
  const email = user.email || "";
  const phone = user.phone || "";

  // 2. NEW: Fetch Next of Kin Data from DB
  const { data: nokData } = await supabase
    .from("next_of_kin")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 pb-10">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* CARD 1: PERSONAL INFORMATION (Read Only for now) */}
        <div className="card">
          <div className="grid grid-cols-3 pb-5">
            <div className="col-span-2">
              <p className="text-gray-600 font-bold text-xl">Personal Information</p>
            </div>
            {/* Note: If you want to make this editable, you'd create a separate component like NextOfKinForm */}
            <div className="text-end text-blue-500 cursor-pointer">edit</div>
          </div>

          <div className="text-center p-5 mb-5 border border-gray-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto overflow-hidden bg-gray-50">
             <span className="text-4xl text-gray-300">Img</span>
          </div>

          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">Full Name</label>
            <input disabled type="text" defaultValue={fullName} className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700" />
          </div>
          <div className="pb-5">
            <label className="block text-sm font-bold text-gray-500">Email</label>
            <input disabled type="email" defaultValue={email} className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700" />
          </div>
          <div className="pb-5">
             <label className="block text-sm font-bold text-gray-500">Phone Number</label>
             <input disabled type="tel" defaultValue={phone} placeholder="No phone linked" className="mt-1 w-full px-4 p-2 h-13 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-700" />
          </div>
        </div>

        {/* CARD 2: NEXT OF KIN (Now fully functional) */}
        <NextOfKinForm initialData={nokData} userId={user.id} />

        {/* CARD 3: THIRD PARTY */}
        <div className="card">
          <div className="pb-5">
            <p className="text-gray-600 font-bold text-xl">Third Party Connections</p>
          </div>
          
          {/* Example Connections */}
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 rounded-md border border-gray-200">
                <div className="flex items-center gap-3">
                   <FaGoogle className="text-red-500"/> Google
                </div>
                <div className="text-sm text-gray-400 cursor-pointer hover:text-red-500">Unlink</div>
             </div>
             
             <div className="flex items-center justify-between p-4 rounded-md border border-gray-200">
                <div className="flex items-center gap-3">
                   <FaApple className="text-black"/> Apple
                </div>
                <div className="text-sm text-gray-400 cursor-pointer hover:text-red-500">Unlink</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}