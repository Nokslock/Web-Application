import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";
import { FaIdCard, FaWallet } from "react-icons/fa6";
import { IoKey, IoApps, IoDocumentText } from "react-icons/io5";
import NotificationBell from "@/components/NotificationBell";

export default async function DashboardPage() {
  // 1. Initialize Supabase on the server
  const supabase = await createSupabaseServerClient();

  // 2. Fetch the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 3. Protect the route: Redirect to login if no user found
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="pb-10 fade-in">
      
      {/* HEADER SECTION */}
      {/* Mobile: Stacked | Desktop: Title Left, Search & Bell Right */}
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
          
          {/* Interactive Notification Component */}
          <NotificationBell />
        </div>
      </div>

      {/* QUICK ACTIONS GRID */}
      {/* Mobile: 2 columns | Tablet: 3 columns | Desktop: 5 columns */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-10">
        <DashboardCard icon={<FaIdCard />} label="Cards" count={3} />
        <DashboardCard icon={<FaWallet />} label="Wallets" count={1} />
        <DashboardCard icon={<IoKey />} label="Passkeys" count={5} />
        <DashboardCard icon={<IoApps />} label="Apps" count={12} />
        <div className="col-span-2 md:col-span-1">
           <DashboardCard icon={<IoDocumentText />} label="Files" count={8} />
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      {/* Mobile: 1 column (Stacked) | Desktop: 7 columns (Side by side) */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 md:gap-10">
        
        {/* Passwords Section - Takes up 4/7ths of the width on desktop */}
        <div className="h-80 col-span-1 lg:col-span-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-xl text-gray-800">Recent Passwords</h2>
            <button className="text-sm text-end font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-full transition">
              View All
            </button>
          </div>
          
          {/* Empty State / Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50 p-6">
             <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
               <IoKey size={20}/>
             </div>
             <p className="text-gray-500 font-medium">No recent passwords accessed</p>
             <p className="text-xs text-gray-400 mt-1">Your most used items will appear here.</p>
          </div>
        </div>

        {/* Statistics Section - Takes up 3/7ths of the width on desktop */}
        <div className="h-80 col-span-1 lg:col-span-3 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h2 className="font-bold text-xl text-gray-800">Security Score</h2>
             <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">GOOD</span>
          </div>

          <div className="flex-1 flex flex-col items-end justify-end">
            <div className="w-full flex items-end justify-between gap-2 h-40 px-2">
                {/* Dummy Chart Bars */}
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
  );
}

// --- SUB-COMPONENTS ---

// 1. Dashboard Card Component
function DashboardCard({ icon, label, count }: { icon: React.ReactNode; label: string, count?: number }) {
  return (
    <div className="group flex flex-row items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer h-full relative overflow-hidden">
      {/* Icon Circle */}
      <div className="flex flex-shrink-0 items-center justify-center h-12 w-12 bg-blue-50 border border-blue-100 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
        <span className="text-lg">{icon}</span>
      </div>
      
      {/* Text Info */}
      <div className="flex flex-col">
        <span className="font-bold text-gray-800 text-sm md:text-base">{label}</span>
        {count !== undefined && (
          <span className="text-xs text-gray-400 font-medium">{count} Items</span>
        )}
      </div>

      {/* Hover Decoration */}
      <div className="absolute right-0 top-0 h-16 w-16 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 rounded-bl-full transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}

// 2. Simple Chart Bar Component for the UI
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