"use client";

import { motion, Variants } from "framer-motion";
import { IoKey } from "react-icons/io5";

const boxVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const barVariants: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: (customHeight: string) => ({
    height: customHeight,
    opacity: 1,
    transition: { duration: 0.8, ease: "backOut" },
  }),
};


export default function DashboardHome() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 md:gap-8 mt-2">
      {/* Recent Passwords Card */}
      <motion.div 
        variants={boxVariants}
        initial="hidden"
        animate="visible"
        className="h-80 col-span-1 lg:col-span-4 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-bold text-lg text-gray-800 dark:text-white">Recent Passwords</h2>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-all">
            View All
          </button>
        </div>
        
        {/* Empty State / Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-gray-900/50 p-6 group">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="h-14 w-14 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-full flex items-center justify-center text-blue-500 mb-3 group-hover:text-blue-600 transition-colors"
            >
              <IoKey size={24}/>
            </motion.div>
            <p className="text-gray-600 dark:text-gray-300 font-bold text-sm">No recent activity</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
              Items you view or edit will appear here for quick access.
            </p>
        </div>
      </motion.div>

      {/* Security Score & Chart Card */}
      <motion.div 
        variants={boxVariants}
        initial="hidden"
        animate="visible"
        className="h-80 col-span-1 lg:col-span-3 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
           <div>
              <h2 className="font-bold text-lg text-gray-800 dark:text-white">Security Score</h2>
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
          <p className="w-full text-center text-[10px] uppercase tracking-wider text-gray-400 mt-5 border-t border-gray-100 dark:border-gray-700 pt-3">
            Encryption Activity (7 Days)
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function AnimatedChartBar({ customHeight, color, label }: { customHeight: string; color: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 w-full h-full justify-end">
      <motion.div 
        variants={barVariants}
        initial="hidden"
        animate="visible"
        custom={customHeight}
        className={`w-full ${color} rounded-t-lg hover:opacity-80 cursor-pointer transition-all duration-300`} 
      ></motion.div>
      <span className="text-[10px] text-gray-400 font-bold">{label}</span>
    </div>
  )
}
