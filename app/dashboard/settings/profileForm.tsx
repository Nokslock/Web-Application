"use client";

import { useState, useRef } from "react";
import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { FaCamera, FaSpinner, FaPen, FaXmark } from "react-icons/fa6";
import { toast } from "sonner"; 
import DefaultPfp from "@/public/pfp-default.jpg"; 

interface ProfileFormProps {
  user: any;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HELPER: Parse Initial Names ---
  // If first/last don't exist in DB yet, try to split the full_name
  const meta = user?.user_metadata || {};
  const initialFirst = meta.first_name || meta.full_name?.split(' ')[0] || "";
  const initialLast = meta.last_name || meta.full_name?.split(' ').slice(1).join(' ') || "";

  // --- STATES ---
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | StaticImageData>(
    meta.avatar_url || DefaultPfp
  );

  // Name Editing State
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [firstName, setFirstName] = useState(initialFirst);
  const [lastName, setLastName] = useState(initialLast);

  // Modal States
  const [modalType, setModalType] = useState<"NONE" | "EMAIL" | "PASSWORD">("NONE");
  
  // --- HANDLERS ---

  // 1. IMAGE UPLOAD
  const handleImageClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    const file = event.target.files[0];
    
    if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be smaller than 2MB");
        return;
    }

    setLoading(true);
    const toastId = toast.loading("Uploading image...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      router.refresh(); 
      toast.success("Profile photo updated!", { id: toastId });

    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image", { id: toastId });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 2. UPDATE NAMES (First & Last)
  const handleUpdateNames = async () => {
    setLoading(true);
    try {
      // We update first_name, last_name AND full_name (for compatibility)
      const updates = {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim()
      };

      const { error } = await supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;
      
      setIsEditingNames(false);
      router.refresh();
      toast.success("Profile details updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-xl p-8 relative">
      <div className="flex flex-col gap-8">

        {/* IMAGE UPLOAD */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-neutral-200 relative bg-neutral-50">
              <Image
                src={avatarUrl}
                alt="Profile"
                fill
                className={`object-cover transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
                priority
              />
              {loading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-sm">
                  <FaSpinner className="text-white animate-spin text-xl" />
                </div>
              )}
            </div>

            <button
              onClick={handleImageClick}
              disabled={loading}
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-xl shadow-sm hover:bg-blue-700 active:scale-95 transition-all z-10 border-2 border-white"
            >
              <FaCamera className="text-sm" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
          <div className="flex flex-col gap-1">
             <p className="font-medium text-neutral-900">Profile Photo</p>
             <p className="text-xs text-neutral-500 max-w-[200px] leading-relaxed">
               Click the camera icon to upload a new photo.
             </p>
          </div>
        </div>

        {/* FORM FIELDS */}
        <div className="grid gap-6">
          
          {/* NAMES SECTION (Split Inputs) */}
          <div className="flex flex-col gap-3">
             <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-neutral-700">Name</label>
                {isEditingNames ? (
                   <div className="flex gap-2">
                      <button onClick={() => setIsEditingNames(false)} className="text-xs text-red-500 font-medium hover:underline">Cancel</button>
                      <button onClick={handleUpdateNames} disabled={loading} className="text-xs text-blue-600 font-bold hover:underline">Save</button>
                   </div>
                ) : (
                  <button onClick={() => setIsEditingNames(true)} className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline">
                    <FaPen className="text-[10px]" /> Edit Name
                  </button>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* First Name */}
               <div className="flex flex-col gap-1">
                 <input
                   type="text"
                   placeholder="First Name"
                   value={firstName}
                   onChange={(e) => setFirstName(e.target.value)}
                   disabled={!isEditingNames || loading}
                   className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
                     isEditingNames 
                       ? "bg-white border-blue-500 text-neutral-900 shadow-sm" 
                       : "bg-neutral-50 border-neutral-200 text-neutral-600 cursor-not-allowed"
                   }`}
                 />
                 {isEditingNames && <span className="text-[10px] text-neutral-400 pl-1">First Name</span>}
               </div>

               {/* Last Name */}
               <div className="flex flex-col gap-1">
                 <input
                   type="text"
                   placeholder="Last Name"
                   value={lastName}
                   onChange={(e) => setLastName(e.target.value)}
                   disabled={!isEditingNames || loading}
                   className={`w-full p-3 border rounded-lg focus:outline-none transition-colors ${
                     isEditingNames 
                       ? "bg-white border-blue-500 text-neutral-900 shadow-sm" 
                       : "bg-neutral-50 border-neutral-200 text-neutral-600 cursor-not-allowed"
                   }`}
                 />
                 {isEditingNames && <span className="text-[10px] text-neutral-400 pl-1">Last Name</span>}
               </div>
             </div>
          </div>

          {/* EMAIL ADDRESS */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-neutral-700">Email Address</label>
              <button 
                onClick={() => setModalType("EMAIL")} 
                className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:underline"
              >
                <FaPen className="text-[10px]" /> Change Email
              </button>
            </div>
            <input
              type="email"
              defaultValue={user?.email || ""}
              disabled
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-600 cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-2 border-t border-neutral-100 pt-4 mt-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-neutral-700">Security</label>
            </div>
            <button 
              onClick={() => setModalType("PASSWORD")}
              className="w-full p-3 border border-neutral-300 rounded-lg text-neutral-700 font-medium hover:bg-neutral-50 transition-colors text-left flex justify-between items-center"
            >
              <span>Reset Password via OTP</span>
              <span className="text-xs bg-neutral-200 px-2 py-1 rounded">Secure</span>
            </button>
          </div>

        </div>
      </div>

      {/* --- MODALS --- */}
      {modalType === "EMAIL" && (
        <EmailUpdateModal 
          user={user} 
          supabase={supabase} 
          onClose={() => setModalType("NONE")} 
        />
      )}

      {modalType === "PASSWORD" && (
        <PasswordResetModal 
          user={user} 
          supabase={supabase} 
          onClose={() => setModalType("NONE")} 
        />
      )}

    </div>
  );
}

// --- SUB-COMPONENTS (Same as before) ---

function EmailUpdateModal({ user, supabase, onClose }: { user: any, supabase: any, onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const initiateEmailChange = async () => {
    if (!newEmail || newEmail === user.email) {
      toast.warning("Please enter a valid, new email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setStep(2);
      toast.success(`OTP sent to ${newEmail}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: newEmail,
        token: otp,
        type: 'email_change'
      });
      
      if (error) throw error;
      
      toast.success("Email updated successfully!");
      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error("Invalid OTP or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl">
      <div className="bg-white p-6 rounded-xl shadow-2xl border border-neutral-200 w-full max-w-sm relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900"><FaXmark/></button>
        <h3 className="text-lg font-bold mb-4">Update Email</h3>
        {step === 1 ? (
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">Enter your new email address.</p>
            <input 
              type="email" 
              placeholder="New Email Address"
              className="w-full p-3 border rounded-lg focus:outline-blue-600"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <button onClick={initiateEmailChange} disabled={loading || !newEmail} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">{loading ? "Sending..." : "Send OTP"}</button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">Enter the 6-digit code sent to <b>{newEmail}</b></p>
            <input type="text" placeholder="000000" maxLength={6} className="w-full p-3 border rounded-lg text-center tracking-widest text-xl font-bold" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button onClick={verifyEmailOtp} disabled={loading || otp.length < 6} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">{loading ? "Verifying..." : "Verify & Change"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function PasswordResetModal({ user, supabase, onClose }: { user: any, supabase: any, onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sendResetOtp = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      setStep(2);
      toast.success(`OTP sent to ${user.email}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndSetPassword = async () => {
    setLoading(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ email: user.email, token: otp, type: 'recovery' });
      if (verifyError) throw verifyError;
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      toast.success("Password updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Invalid Code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-xl">
      <div className="bg-white p-6 rounded-xl shadow-2xl border border-neutral-200 w-full max-w-sm relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900"><FaXmark/></button>
        <h3 className="text-lg font-bold mb-4">Reset Password</h3>
        {step === 1 && (
          <div className="space-y-4">
             <p className="text-sm text-neutral-500">We will send a 6-digit code to <b>{user.email}</b>.</p>
             <button onClick={sendResetOtp} disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">{loading ? "Sending..." : "Send Code"}</button>
          </div>
        )}
        {step === 2 && (
           <div className="space-y-4">
            <p className="text-sm text-neutral-500">Enter code & new password.</p>
            <input type="text" placeholder="Enter 6-digit OTP" className="w-full p-3 border rounded-lg text-center tracking-widest font-bold" value={otp} onChange={(e) => setOtp(e.target.value)} />
            <input type="password" placeholder="New Password" className="w-full p-3 border rounded-lg" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <button onClick={verifyOtpAndSetPassword} disabled={loading || otp.length < 6 || newPassword.length < 6} className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">{loading ? "Updating..." : "Update Password"}</button>
           </div>
        )}
      </div>
    </div>
  );
}