"use client";

import { motion, Variants } from "framer-motion";
import { FaArrowRight } from "react-icons/fa6";
import { getIcon, getColorClasses } from "./utils";

interface CategoryItemGridProps {
  items: any[];
  selectedCategory: string; // Guaranteed to be set here
  onSelectItem: (item: any) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

export default function CategoryItemGrid({
  items,
  selectedCategory,
  onSelectItem,
}: CategoryItemGridProps) {
  
  // Filter items based on category
  const categoryItems = selectedCategory === "nok" 
    ? items.filter((i) => i.share_with_nok)
    : items.filter((i) => i.type === selectedCategory);

  const colors = getColorClasses(selectedCategory);

  if (categoryItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-300">
        <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${colors.bg} ${colors.text}`}>
          <span className="text-3xl">{getIcon(selectedCategory)}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-700 dark:text-white">No items found</h3>
        <p className="text-sm text-gray-500 max-w-xs text-center mt-2">
          You haven't added any {selectedCategory === 'nok' ? 'Next of Kin items' : selectedCategory + 's'} yet.
        </p>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {categoryItems.map((item) => (
        <motion.div
          key={item.id}
          variants={cardVariants}
          onClick={() => onSelectItem(item)}
          className={`group relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:shadow-xl dark:hover:shadow-lg dark:hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden ${colors.hoverBorder}`}
        >
          {/* Top Decorative Line */}
          <div className={`absolute top-0 left-0 w-full h-1 ${colors.bg.replace('/20', '')} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

          <div className="flex justify-between items-start mb-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${colors.modalIconBg} ${colors.modalIconText}`}>
              {selectedCategory === 'nok' ? getIcon(item.type) : item.name.substring(0, 2).toUpperCase()}
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300 bg-gray-50 dark:bg-gray-700`}>
               <FaArrowRight className="text-gray-400 dark:text-gray-300 text-xs" />
            </div>
          </div>
          
          <div>
             <h3 className="font-bold text-gray-800 dark:text-white text-lg truncate mb-1">{item.name}</h3>
             <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${colors.badgeBg} ${colors.badgeText}`}>
                   {item.type}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
             </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
