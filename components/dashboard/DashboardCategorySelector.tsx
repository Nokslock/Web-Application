"use client";

import { FaIdCard, FaWallet, FaUserShield } from "react-icons/fa6";
import { IoKey, IoDocumentText } from "react-icons/io5";
import { getColorClasses } from "./utils";

interface DashboardCategorySelectorProps {
  items: any[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export default function DashboardCategorySelector({
  items,
  selectedCategory,
  onSelectCategory,
}: DashboardCategorySelectorProps) {
  
  // Calculate Counts
  const counts = {
    card: items.filter((i) => i.type === "card").length,
    crypto: items.filter((i) => i.type === "crypto").length,
    password: items.filter((i) => i.type === "password").length,
    file: items.filter((i) => i.type === "file").length,
    nok: items.filter((i) => i.share_with_nok).length,
  };

  const handleCategoryClick = (category: string) => {
    // If clicking already selected, deselect it (toggle)
    if (selectedCategory === category) {
      onSelectCategory(null);
    } else {
      onSelectCategory(category);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-10">
      <DashboardCard 
        icon={<FaIdCard />} 
        label="Cards" 
        count={counts.card} 
        onClick={() => handleCategoryClick("card")} 
        isActive={selectedCategory === "card"}
        colorParams={getColorClasses("card")} 
      />
      <DashboardCard 
        icon={<FaWallet />} 
        label="Wallets" 
        count={counts.crypto} 
        onClick={() => handleCategoryClick("crypto")} 
        isActive={selectedCategory === "crypto"}
        colorParams={getColorClasses("crypto")} 
      />
      <DashboardCard 
        icon={<IoKey />} 
        label="Passwords" 
        count={counts.password} 
        onClick={() => handleCategoryClick("password")} 
        isActive={selectedCategory === "password"}
        colorParams={getColorClasses("password")} 
      />
      <DashboardCard 
        icon={<FaUserShield />} 
        label="Next of Kin" 
        count={counts.nok} 
        onClick={() => handleCategoryClick("nok")} 
        isActive={selectedCategory === "nok"}
        colorParams={getColorClasses("nok")} 
      />
      <DashboardCard 
        icon={<IoDocumentText />} 
        label="Files" 
        count={counts.file} 
        onClick={() => handleCategoryClick("file")} 
        isActive={selectedCategory === "file"}
        colorParams={getColorClasses("file")} 
      />
    </div>
  );
}

function DashboardCard({ icon, label, count, onClick, isActive, colorParams }: any) {
  // If no colorParams provided, fallback to blue using helper
  const colors = colorParams || getColorClasses("default");

  return (
    <div
      onClick={onClick}
      className={`group flex flex-row items-center gap-4 p-4 border rounded-2xl shadow-sm dark:shadow-none hover:shadow-lg dark:hover:shadow-none hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full relative overflow-hidden
        ${isActive ? "bg-blue-600 border-blue-600 dark:bg-blue-600 dark:border-blue-600" : `bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${colors.hoverBorder}`}
      `}
    >
      <div className={`flex flex-shrink-0 items-center justify-center h-12 w-12 rounded-full transition-colors duration-200
         ${isActive 
            ? "bg-white/20 text-white border border-white/30" 
            : `${colors.bg} border ${colors.border} ${colors.text} ${colors.groupHoverBg} ${colors.groupHoverText}`
         }
      `}>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className={`font-bold text-sm md:text-base ${isActive ? "text-white" : "text-gray-800 dark:text-gray-100"}`}>{label}</span>
        <span className={`text-xs font-medium ${isActive ? "text-blue-100" : "text-gray-400 dark:text-gray-500"}`}>{count} Items</span>
      </div>
    </div>
  );
}
