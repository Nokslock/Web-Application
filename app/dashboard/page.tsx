import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import { IoKey } from "react-icons/io5";
import NotificationBell from "@/components/NotificationBell";
import DashboardFab from "@/components/DashboardFab";
import DashboardStatsGrid from "@/components/DashboardStatsGrid"; 

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. FETCH DATA (Get all items to pass to the grid)
  const { data: items } = await supabase
    .from("vault_items")
    .select("id, type, name, ciphertext, created_at")
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="pb-10 fade-in">
        {/* HEADER SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 items-center">
          <div className="col-span-1 md:col-span-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
          </div>
          
          <div className="col-span-1 flex gap-3 justify-start md:justify-end items-center">
            <input
              className="rounded-xl h-10 border border-gray-200 px-4 w-full md:w-64 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition shadow-sm text-sm"
              placeholder="Search assets..."
              type="search"
            />
            <NotificationBell />
          </div>
        </div>

        {/* --- INTERACTIVE GRID (Cards + Popups) --- */}
        <DashboardStatsGrid items={items || []} />

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 md:gap-10">
          
          {/* Recent Passwords */}
          <div className="h-80 col-span-1 lg:col-span-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-bold text-xl text-gray-800">Recent Passwords</h2>
              <button className="text-sm text-end font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-full transition">
                View All
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 p-6">
               <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                 <IoKey size={20}/>
               </div>
               <p className="text-gray-500 font-medium">No recent passwords accessed</p>
               <p className="text-xs text-gray-400 mt-1">Your most used items will appear here.</p>
            </div>
          </div>

          {/* Statistics Section (GRAPH RESTORED HERE) */}
          <div className="h-80 col-span-1 lg:col-span-3 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h2 className="font-bold text-xl text-gray-800">Security Score</h2>
               <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">GOOD</span>
            </div>

            {/* --- THE GRAPH UI --- */}
            <div className="flex-1 flex flex-col items-end justify-end">
              <div className="w-full flex items-end justify-between gap-2 h-40 px-2">
                 <ChartBar height="40%" color="bg-blue-200" label="Mon" />
                 <ChartBar height="70%" color="bg-blue-300" label="Tue" />
                 <ChartBar height="50%" color="bg-blue-400" label="Wed" />
                 <ChartBar height="85%" color="bg-blue-500" label="Thu" />
                 <ChartBar height="60%" color="bg-blue-300" label="Fri" />
              </div>
              <p className="w-full text-center text-xs text-gray-400 mt-4 border-t border-gray-100 pt-3">
                Weekly Encryption Activity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* The Floating Action Button */}
      <DashboardFab />
    </>
  );
}

// --- SUB-COMPONENT: CHART BAR ---
function ChartBar({ height, color, label }: { height: string; color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div 
        className={`w-full ${color} rounded-t-md hover:opacity-80 transition-all duration-300`} 
        style={{ height }}
      ></div>
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
    </div>
  )
}