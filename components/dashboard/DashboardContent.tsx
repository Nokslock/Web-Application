"use client";

import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion"; // <--- Variant Fix Applied
import { IoKey, IoSearch } from "react-icons/io5";
import NotificationBell from "@/components/NotificationBell";
import DashboardFab from "@/components/DashboardFab";
import DashboardCategorySelector from "./DashboardCategorySelector"; 
import DashboardHome from "./DashboardHome";
import CategoryItemGrid from "./CategoryItemGrid";
import ItemDetailModal from "./ItemDetailModal"; 

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamic Greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const userName = user.user_metadata?.first_name || user.email?.split("@")[0] || "User";

  // Filter items for search
  const filteredItems = items?.filter(item => {
    const q = searchQuery.toLowerCase();
    
    // 1. Match Name or Type
    if (item.name.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)) {
      return true;
    }

    // 2. Match "Next of Kin" / "Family" if the item is shared
    if (item.share_with_nok) {
       const nokTerms = ["next of kin", "nok", "family", "shared"];
       // If the search query matches any of these terms (partial match)
       if (nokTerms.some(term => term.includes(q) || q.includes(term))) {
         return true;
       }
    }

    return false;
  });

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
          <h1 className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">
            {greeting}, <span className="text-blue-600">{userName}</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Here is an overview of your secure vault.</p>
        </div>
        
        <div className="col-span-1 flex gap-4 justify-start md:justify-end items-center">
          <div className="relative w-full md:w-64 group">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl h-11 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white pl-10 pr-4 w-full focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm text-sm"
              placeholder="Search assets..."
              type="search"
            />
          </div>
          <NotificationBell />
        </div>
      </motion.div>

      {/* --- CATEGORY SELECTOR (Hidden when searching) --- */}
      {!searchQuery && (
        <motion.div 
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <DashboardCategorySelector 
            items={items || []} 
            selectedCategory={selectedCategory} 
            onSelectCategory={setSelectedCategory} 
          />
        </motion.div>
      )}

      {/* --- DYNAMIC CONTENT (Home, Search, or Category Grid) --- */}
      {searchQuery ? (
         <CategoryItemGrid 
            items={items || []}
            selectedCategory="search"
            customItems={filteredItems}
            onSelectItem={setSelectedItem}
            emptyMessage={`No results found for "${searchQuery}"`}
         />
      ) : selectedCategory ? (
        <CategoryItemGrid 
          items={items || []} 
          selectedCategory={selectedCategory} 
          onSelectItem={setSelectedItem} 
        />
      ) : (
        <DashboardHome items={items || []} />
      )}

      {/* --- DETAIL MODAL --- */}
      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}

      {/* Floating Action Button */}
      <DashboardFab />
    </motion.div>
  );
}

