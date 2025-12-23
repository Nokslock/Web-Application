import { createSupabaseServerClient } from "@/lib/supabase/server-client"; // Update path to match where your file is located
import { redirect } from "next/navigation";
import { FaIdCard, FaWallet, FaBell } from "react-icons/fa6";

export default async function DashboardPage() {
  // Initialize the client using YOUR existing function
  const supabase = await createSupabaseServerClient();

  // Fetch the user safely from the server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  //Security Check: Kick them out if not logged in
  if (!user) {
    redirect("/login");
  }

  //Extract name safely (falls back to "User" if no name exists)
  const fullName = user.user_metadata?.full_name || "User";
  const email = user.email;
  
  return (
    <>
      <div className="grid grid-cols-3">
        <div className="col-span-2">
          <h1 className="text-3xl font-bold mb-6 pb-10">Dashboard</h1>
        </div>
        <div className="col-span-1 flex gap-3 justify-end">
          <input
            className="rounded-md h-10 border border-gray-200"
            placeholder="search"
            type="search"
          />
          <div className="border bg-white h-10 w-10 items-center border-gray-200 rounded-full p-3 ">
            <FaBell />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-10">
        <div className="card flex flex-row items-center gap-3">
          <div className="border items-center border-gray-200 rounded-full p-3 ">
            <FaIdCard />
          </div>
          Cards
        </div>
        <div className="card flex flex-row items-center gap-3">
          <div className="border items-center border-gray-200 rounded-full p-3 ">
            <FaWallet />
          </div>
          Wallets
        </div>
        <div className="card flex flex-row items-center gap-3">
          <div className="border items-center border-gray-200 rounded-full p-3 ">
            <FaWallet />
          </div>
          Passkeys
        </div>
        <div className="card flex flex-row items-center gap-3">
          <div className="border items-center border-gray-200 rounded-full p-3 ">
            <FaWallet />
          </div>
          Apps
        </div>
        <div className="card flex flex-row items-center gap-3">
          <div className="border items-center border-gray-200 rounded-full p-3 ">
            <FaWallet />
          </div>
          Files
        </div>
      </div>

      <div className="grid grid-cols-7 gap-10 mt-10">
        <div className="card h-64 col-span-4">
          <h2 className="font-bold text-xl mb-5">Passwords</h2>
        </div>
        <div className="card col-span-3 h-64">
          <h2 className="font-bold text-xl mb-5">Statistics</h2>
        </div>
      </div>
    </>
  );
}
