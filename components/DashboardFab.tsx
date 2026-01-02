"use client";

import { useState, useRef } from "react";
import {
  FaPlus,
  FaGlobe,
  FaCreditCard,
  FaWallet,
  FaFile,
  FaXmark,
} from "react-icons/fa6";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { encryptData } from "@/lib/crypto";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; // Upgrade to Framer Motion

type VaultType = "password" | "card" | "crypto" | "file";

export default function DashboardFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<VaultType>("password");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [details, setDetails] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  // Reusable Tailwind Class for Inputs (Replaces the <style jsx>)
  const inputClass = "w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm text-gray-700 transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 focus:bg-white placeholder:text-gray-400";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Authenticated user not found");

      let dataToEncrypt = { ...details };

      if (activeTab === "file" && fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const filePath = `${user.id}/${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("vault-files")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        dataToEncrypt = {
          fileName: file.name,
          fileSize: file.size,
          storagePath: filePath,
        };
      }

      const encryptedBlob = encryptData(dataToEncrypt);

      const { error } = await (supabase.from("vault_items") as any).insert({
        user_id: user.id,
        type: activeTab,
        name: name,
        ciphertext: encryptedBlob,
      });

      if (error) throw error;

      setIsOpen(false);
      setName("");
      setDetails({});
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error saving item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* --- 1. THE TRIGGER BUTTON --- */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl shadow-blue-500/30 flex items-center justify-center z-50"
      >
        <FaPlus size={24} />
      </motion.button>

      {/* --- 2. THE MODAL (AnimatePresence handles entrance/exit) --- */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
            
            {/* Dark Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ y: 100, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-100 p-4 shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">
                    Add to Vault
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition text-gray-600"
                  >
                    <FaXmark />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <TabButton
                    active={activeTab === "password"}
                    onClick={() => setActiveTab("password")}
                    icon={<FaGlobe />}
                    label="Login"
                  />
                  <TabButton
                    active={activeTab === "card"}
                    onClick={() => setActiveTab("card")}
                    icon={<FaCreditCard />}
                    label="Card"
                  />
                  <TabButton
                    active={activeTab === "crypto"}
                    onClick={() => setActiveTab("crypto")}
                    icon={<FaWallet />}
                    label="Crypto"
                  />
                  <TabButton
                    active={activeTab === "file"}
                    onClick={() => setActiveTab("file")}
                    icon={<FaFile />}
                    label="File"
                  />
                </div>
              </div>

              {/* Scrollable Form Body */}
              <form
                onSubmit={handleSubmit}
                className="p-6 space-y-4 overflow-y-auto"
              >
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                    Item Title
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      activeTab === "password"
                        ? "e.g. Netflix"
                        : activeTab === "card"
                        ? "e.g. GTBank Dollar Card"
                        : activeTab === "crypto"
                        ? "e.g. Binance Wallet"
                        : "e.g. ID Card Scan"
                    }
                    className={inputClass}
                  />
                </div>

                {/* --- DYNAMIC FIELDS --- */}
                {activeTab === "password" && (
                  <>
                    <input
                      name="url"
                      placeholder="Website URL"
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                    <input
                      name="username"
                      placeholder="Username / Email"
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </>
                )}

                {activeTab === "card" && (
                  <>
                    <input
                      name="cardholder"
                      placeholder="Cardholder Name"
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                    <input
                      name="number"
                      placeholder="Card Number"
                      maxLength={19}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        name="expiry"
                        placeholder="MM/YY"
                        maxLength={5}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                      <input
                        name="cvv"
                        placeholder="CVV"
                        maxLength={4}
                        type="password"
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                    <input
                      name="pin"
                      placeholder="Card PIN"
                      type="password"
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </>
                )}

                {activeTab === "crypto" && (
                  <>
                    <input
                      name="network"
                      placeholder="Network (e.g. Solana, ETH)"
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                    <input
                      name="address"
                      placeholder="Public Wallet Address"
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                    <textarea
                      name="seed_phrase"
                      placeholder="Private Key / Seed Phrase (Encrypted)"
                      onChange={handleInputChange}
                      className={`${inputClass} h-24 resize-none pt-3`}
                    />
                  </>
                )}

                {activeTab === "file" && (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center relative hover:bg-gray-50 transition cursor-pointer bg-gray-50">
                    <input
                      required
                      type="file"
                      ref={fileInputRef}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FaFile className="mx-auto text-blue-500 mb-2" size={32} />
                    <p className="text-sm font-bold text-gray-700">
                      Tap to upload file
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Files are encrypted safely
                    </p>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition mt-4 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Encrypting & Saving..." : "Save Securely"}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper Component for Tabs
function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all whitespace-nowrap border ${
        active
          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
          : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );
}