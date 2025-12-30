"use client";

import { useState } from "react";
import { FaIdCard, FaWallet, FaXmark, FaEye, FaEyeSlash, FaGlobe, FaFile, FaArrowRight, FaCopy, FaCheck } from "react-icons/fa6";
import { IoKey, IoApps, IoDocumentText } from "react-icons/io5";
import { decryptData } from "@/lib/crypto"; 

type VaultItem = {
  id: string;
  type: string;
  name: string;
  ciphertext: string;
  created_at: string;
};

export default function DashboardStatsGrid({ items }: { items: VaultItem[] }) {
  // 1. Calculate Counts
  const counts = {
    card: items.filter((i) => i.type === "card").length,
    crypto: items.filter((i) => i.type === "crypto").length,
    password: items.filter((i) => i.type === "password").length,
    file: items.filter((i) => i.type === "file").length,
    app: 0,
  };

  // 2. State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [decryptedDetails, setDecryptedDetails] = useState<any | null>(null);
  const [showSensitive, setShowSensitive] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 3. Filter Items for List
  const categoryItems = items.filter((i) => i.type === selectedCategory);

  // 4. Handle View
  const handleViewItem = (item: VaultItem) => {
    try {
      const details = decryptData(item.ciphertext);
      setDecryptedDetails(details);
      setSelectedItem(item);
      setShowSensitive(false);
    } catch (err) {
      alert("Failed to decrypt item. Check your encryption key.");
    }
  };

  // 5. Handle Copy
  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000); // Reset after 2s
  };

  // Helper to get Icon
  const getIcon = (type: string) => {
    switch(type) {
      case "card": return <FaIdCard />;
      case "crypto": return <FaWallet />;
      case "password": return <IoKey />;
      case "file": return <FaFile />;
      default: return <IoApps />;
    }
  };

  return (
    <>
      {/* --- GRID OF CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-10">
        <DashboardCard icon={<FaIdCard />} label="Cards" count={counts.card} onClick={() => setSelectedCategory("card")} />
        <DashboardCard icon={<FaWallet />} label="Wallets" count={counts.crypto} onClick={() => setSelectedCategory("crypto")} />
        <DashboardCard icon={<IoKey />} label="Passkeys" count={counts.password} onClick={() => setSelectedCategory("password")} />
        <DashboardCard icon={<IoApps />} label="Apps" count={counts.app} onClick={() => setSelectedCategory("app")} />
        <DashboardCard icon={<IoDocumentText />} label="Files" count={counts.file} onClick={() => setSelectedCategory("file")} />
      </div>

      {/* --- MODAL 1: LIST VIEW --- */}
      {selectedCategory && !selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-4 shrink-0 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                   {getIcon(selectedCategory)}
                 </div>
                 <h2 className="text-lg font-bold text-gray-800 capitalize">
                   {selectedCategory === "crypto" ? "Wallets" : selectedCategory + "s"}
                 </h2>
              </div>
              <button 
                onClick={() => setSelectedCategory(null)} 
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-500"
              >
                <FaXmark />
              </button>
            </div>

            {/* List Body */}
            <div className="p-4 overflow-y-auto space-y-2 bg-gray-50/50 flex-1">
              {categoryItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300 mb-4">
                    {getIcon(selectedCategory)}
                  </div>
                  <p className="text-gray-400 font-medium">No items found</p>
                </div>
              ) : (
                categoryItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleViewItem(item)}
                    className="group w-full p-4 bg-white border border-gray-100 rounded-xl flex justify-between items-center cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-gray-700">{item.name}</span>
                    </div>
                    <FaArrowRight className="text-gray-300 group-hover:text-blue-500 transition-colors" size={14} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ITEM DETAILS (The Fix for your Screenshot) --- */}
      {selectedItem && decryptedDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[110] p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-5 shrink-0 flex justify-between items-start">
              <div className="flex gap-3 items-center">
                 <div className="h-12 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    {getIcon(selectedItem.type)}
                 </div>
                 <div>
                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {selectedItem.type} Details
                    </span>
                    <h2 className="text-xl font-bold text-gray-900 leading-tight mt-1">{selectedItem.name}</h2>
                 </div>
              </div>
              <button 
                onClick={() => setSelectedItem(null)} 
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-500"
              >
                <FaXmark />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              
              {Object.entries(decryptedDetails).map(([key, value]: any) => {
                if (key === "storagePath" || key === "fileSize" || key === "fileName") return null;
                
                const isSecret = key.includes("password") || key.includes("pin") || key.includes("cvv") || key.includes("phrase");

                return (
                  <div key={key}>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block ml-1">
                      {key.replace(/_/g, " ")}
                    </label>
                    
                    <div className="relative group">
                      {/* Input Field: Gray Background, No Border (Cleaner Look) */}
                      <input
                        readOnly
                        type={isSecret ? (showSensitive ? "text" : "password") : "text"}
                        value={value}
                        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 font-semibold text-sm rounded-xl px-4 py-3.5 outline-none transition-colors border border-transparent focus:border-blue-200 focus:bg-white"
                      />
                      
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
                         {/* Copy Button */}
                         <button
                            onClick={() => handleCopy(value, key)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Copy to clipboard"
                         >
                            {copiedField === key ? <FaCheck className="text-emerald-500" /> : <FaCopy size={14} />}
                         </button>

                         {/* Eye Button for Secrets */}
                         {isSecret && (
                            <button
                              onClick={() => setShowSensitive(!showSensitive)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              {showSensitive ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                            </button>
                         )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* File View */}
              {selectedItem.type === "file" && (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50">
                   <div className="h-14 w-14 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
                      <FaFile className="text-blue-500" size={24} />
                   </div>
                   <p className="text-sm font-bold text-gray-800">{decryptedDetails.fileName}</p>
                   <p className="text-xs text-gray-400 mb-5 font-medium">{(decryptedDetails.fileSize / 1024).toFixed(1)} KB</p>
                   <button className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200">
                     Download File
                   </button>
                </div>
              )}

            </div>
            
            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-sm font-bold text-gray-500 hover:text-gray-800 transition"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

// --- CARD COMPONENT ---
function DashboardCard({ icon, label, count, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="group flex flex-row items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer h-full relative overflow-hidden"
    >
      <div className="flex flex-shrink-0 items-center justify-center h-12 w-12 bg-blue-50 border border-blue-100 rounded-full text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-gray-800 text-sm md:text-base">{label}</span>
        <span className="text-xs text-gray-400 font-medium">{count} Items</span>
      </div>
    </div>
  );
}