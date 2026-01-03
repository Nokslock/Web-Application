import { 
  FaIdCard, 
  FaWallet, 
  FaFile, 
  FaUserShield,
  FaFolder, 
} from "react-icons/fa6";
import { IoKey, IoApps } from "react-icons/io5";

export const getIcon = (type: string) => {
  switch(type) {
    case "card": return <FaIdCard />;
    case "crypto": return <FaWallet />;
    case "password": return <IoKey />;
    case "file": return <FaFile />;
    case "vault": return <FaFolder />; // Added Vault support
    case "nok": return <FaUserShield />;
    default: return <IoApps />;
  }
};

export const getColorClasses = (type: string | undefined) => {
  switch(type) {
    case "card":
        return {
           bg: "bg-blue-50 dark:bg-blue-900/20",
           text: "text-blue-600 dark:text-blue-400",
           border: "border-blue-100 dark:border-blue-800",
           hoverBorder: "hover:border-blue-300 dark:hover:border-blue-500",
           groupHoverBg: "group-hover:bg-blue-600",
           groupHoverText: "group-hover:text-white",
           modalHeader: "bg-blue-600 text-white",
           modalIconBg: "bg-blue-50 dark:bg-blue-900/30",
           modalIconText: "text-blue-600 dark:text-blue-400",
           badgeBg: "bg-blue-50 dark:bg-blue-900/30",
           badgeText: "text-blue-700 dark:text-blue-300",
           highlight: "bg-blue-600 border-blue-600 text-blue-100"
        };
    case "crypto":
        return {
           bg: "bg-orange-50 dark:bg-orange-900/20",
           text: "text-orange-600 dark:text-orange-400",
           border: "border-orange-100 dark:border-orange-800",
           hoverBorder: "hover:border-orange-300 dark:hover:border-orange-500",
           groupHoverBg: "group-hover:bg-orange-600",
           groupHoverText: "group-hover:text-white",
           modalHeader: "bg-orange-600 text-white",
           modalIconBg: "bg-orange-50 dark:bg-orange-900/30",
           modalIconText: "text-orange-600 dark:text-orange-400",
           badgeBg: "bg-orange-50 dark:bg-orange-900/30",
           badgeText: "text-orange-700 dark:text-orange-300",
           highlight: "bg-orange-600 border-orange-600 text-orange-100"
        };
    case "password":
        return {
           bg: "bg-rose-50 dark:bg-rose-900/20",
           text: "text-rose-600 dark:text-rose-400",
           border: "border-rose-100 dark:border-rose-800",
           hoverBorder: "hover:border-rose-300 dark:hover:border-rose-500",
           groupHoverBg: "group-hover:bg-rose-600",
           groupHoverText: "group-hover:text-white",
           modalHeader: "bg-rose-600 text-white",
           modalIconBg: "bg-rose-50 dark:bg-rose-900/30",
           modalIconText: "text-rose-600 dark:text-rose-400",
           badgeBg: "bg-rose-50 dark:bg-rose-900/30",
           badgeText: "text-rose-700 dark:text-rose-300",
           highlight: "bg-rose-600 border-rose-600 text-rose-100"
        };
    case "nok":
        return {
           bg: "bg-emerald-50 dark:bg-emerald-900/20",
           text: "text-emerald-600 dark:text-emerald-400",
           border: "border-emerald-100 dark:border-emerald-800",
           hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-500",
           groupHoverBg: "group-hover:bg-emerald-600",
           groupHoverText: "group-hover:text-white",
           modalHeader: "bg-emerald-600 text-white",
           modalIconBg: "bg-emerald-50 dark:bg-emerald-900/30",
           modalIconText: "text-emerald-600 dark:text-emerald-400",
           badgeBg: "bg-emerald-50 dark:bg-emerald-900/30",
           badgeText: "text-emerald-700 dark:text-emerald-300",
           highlight: "bg-emerald-600 border-emerald-600 text-emerald-100"
        };
    case "file":
        return {
           bg: "bg-violet-50 dark:bg-violet-900/20",
           text: "text-violet-600 dark:text-violet-400",
           border: "border-violet-100 dark:border-violet-800",
           hoverBorder: "hover:border-violet-300 dark:hover:border-violet-500",
           groupHoverBg: "group-hover:bg-violet-600",
           groupHoverText: "group-hover:text-white",
           modalHeader: "bg-violet-600 text-white",
           modalIconBg: "bg-violet-50 dark:bg-violet-900/30",
           modalIconText: "text-violet-600 dark:text-violet-400",
           badgeBg: "bg-violet-50 dark:bg-violet-900/30",
           badgeText: "text-violet-700 dark:text-violet-300",
           highlight: "bg-violet-600 border-violet-600 text-violet-100"
        };
    case "vault":
        return {
           bg: "bg-indigo-50 dark:bg-indigo-900/20",
           text: "text-indigo-600 dark:text-indigo-400",
           border: "border-indigo-100 dark:border-indigo-800",
           hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-500",
           groupHoverBg: "group-hover:bg-indigo-600",
           groupHoverText: "group-hover:text-white",
           modalHeader: "bg-indigo-600 text-white",
           modalIconBg: "bg-indigo-50 dark:bg-indigo-900/30",
           modalIconText: "text-indigo-600 dark:text-indigo-400",
           badgeBg: "bg-indigo-50 dark:bg-indigo-900/30",
           badgeText: "text-indigo-700 dark:text-indigo-300",
           highlight: "bg-indigo-600 border-indigo-600 text-indigo-100"
        };
    default:
       return {
           bg: "bg-blue-50 dark:bg-blue-900/20",
           text: "text-blue-600 dark:text-blue-400",
           border: "border-blue-100 dark:border-blue-800",
           hoverBorder: "hover:border-blue-300 dark:hover:border-blue-500",
           groupHoverBg: "group-hover:bg-blue-600",
           groupHoverText: "group-hover:text-white",
           modalHeader: "bg-blue-600 text-white",
           modalIconBg: "bg-blue-50 dark:bg-blue-900/30",
           modalIconText: "text-blue-600 dark:text-blue-400",
           badgeBg: "bg-blue-50 dark:bg-blue-900/30",
           badgeText: "text-blue-700 dark:text-blue-300",
           highlight: "bg-blue-600 border-blue-600 text-blue-100"
       };
  }
};
