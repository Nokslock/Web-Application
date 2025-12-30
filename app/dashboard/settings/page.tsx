import { FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import NextOfKinForm from "./NextOfKinForm"; 
import ProfileForm from "./profileForm"; // <--- 1. Import the new form

export default async function Settings() {
  const supabase = await createSupabaseServerClient();
  
  // 1. Fetch User
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. Fetch Next of Kin Data
  const { data: nokData } = await supabase
    .from("next_of_kin")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 pb-10">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* CARD 1: PERSONAL INFORMATION (Now Editable Image) */}
        {/* We replaced the hardcoded HTML with the component */}
        <section className="h-full">
           <ProfileForm user={user} />
        </section>

        {/* CARD 2: NEXT OF KIN */}
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