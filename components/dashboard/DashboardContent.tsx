"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion"; // <--- Variant Fix Applied
import { IoKey, IoSearch } from "react-icons/io5";
import NotificationBell from "@/components/NotificationBell";
import DashboardFab from "@/components/DashboardFab";
import DashboardStatsGrid from "@/components/DashboardStatsGrid"; 

// --- ANIMATION VARIANTS (Typed correctly) ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger effect for children
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const barVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: (customHeight: string) => ({
    height: customHeight,
    opacity: 1,
    transition: { duration: 0.8, ease: "backOut" },
  }),
};

interface DashboardContentProps {
  user: any;
  items: any[];
}

export default function DashboardContent({ user, items }: DashboardContentProps) {
  const [greeting, setGreeting] = useState("Welcome back");

  // Dynamic Greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const userName = user.user_metadata?.first_name || user.email?.split("@")[0] || "User";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="pb-20"
    >
      {/* HEADER SECTION */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-center">
        <div className="col-span-1 md:col-span-2">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">
            {greeting}, <span className="text-blue-600">{userName}</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here is an overview of your secure vault.</p>
        </div>
        
        <div className="col-span-1 flex gap-4 justify-start md:justify-end items-center">
          <div className="relative w-full md:w-64 group">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              className="rounded-xl h-11 border border-gray-200 pl-10 pr-4 w-full focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm text-sm"
              placeholder="Search assets..."
              type="search"
            />
          </div>
          <NotificationBell />
        </div>
      </motion.div>

      {/* --- INTERACTIVE GRID (Animated) --- */}
      <motion.div variants={itemVariants}>
        <DashboardStatsGrid items={items || []} />
      </motion.div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 md:gap-8 mt-8">
        
        {/* Recent Passwords Card */}
        <motion.div 
          variants={itemVariants}
          className="h-80 col-span-1 lg:col-span-4 p-6 bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
        >
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-bold text-lg text-gray-800">Recent Passwords</h2>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-all">
              View All
            </button>
          </div>
          
          {/* Empty State / Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 p-6 group">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="h-14 w-14 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-blue-500 mb-3 group-hover:text-blue-600 transition-colors"
              >
                <IoKey size={24}/>
              </motion.div>
              <p className="text-gray-600 font-bold text-sm">No recent activity</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                Items you view or edit will appear here for quick access.
              </p>
          </div>
        </motion.div>

        {/* Security Score & Chart Card */}
        <motion.div 
          variants={itemVariants}
          className="h-80 col-span-1 lg:col-span-3 p-6 bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
             <div>
                <h2 className="font-bold text-lg text-gray-800">Security Score</h2>
                <p className="text-[10px] text-gray-400 font-medium">Updated just now</p>
             </div>
             <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-lg">92%</span>
             </div>
          </div>

          {/* --- ANIMATED GRAPH UI --- */}
          <div className="flex-1 flex flex-col items-end justify-end">
            <div className="w-full flex items-end justify-between gap-3 h-40 px-2">
               <AnimatedChartBar customHeight="40%" color="bg-blue-200" label="Mon" />
               <AnimatedChartBar customHeight="70%" color="bg-blue-300" label="Tue" />
               <AnimatedChartBar customHeight="50%" color="bg-blue-400" label="Wed" />
               <AnimatedChartBar customHeight="85%" color="bg-blue-600" label="Thu" />
               <AnimatedChartBar customHeight="60%" color="bg-blue-300" label="Fri" />
            </div>
            <p className="w-full text-center text-[10px] uppercase tracking-wider text-gray-400 mt-5 border-t border-gray-100 pt-3">
              Encryption Activity (7 Days)
            </p>
          </div>
        </motion.div>

      </div>

      {/* Floating Action Button */}
      <DashboardFab />
    </motion.div>
  );
}

// --- SUB-COMPONENT: ANIMATED CHART BAR ---
function AnimatedChartBar({ customHeight, color, label }: { customHeight: string; color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 w-full h-full justify-end">
      <motion.div 
        variants={barVariants}
        custom={customHeight}
        className={`w-full ${color} rounded-t-lg hover:opacity-80 cursor-pointer transition-all duration-300`} 
        // We set initial height to '100%' in CSS but animate it from 0 via framer-motion variants
      ></motion.div>
      <span className="text-[10px] text-gray-400 font-bold">{label}</span>
    </div>
  )
}