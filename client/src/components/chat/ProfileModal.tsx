import { useState, useRef, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { Avatar } from "./Avatar";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import assets from "@/assets/assets";

export function ProfileModal({ isOpen, onClose }) {
  const { authUser, logout, updateProfile } = useContext(AuthContext);
  
  const [bio, setBio] = useState("");
  const [selectedImg, setSelectedImg] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when opened
  if (!isOpen || !authUser) return null;
  if (authUser.bio && bio === "" && !selectedImg) {
    setBio(authUser.bio);
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      if (selectedImg) {
        const reader = new FileReader();
        reader.readAsDataURL(selectedImg);
        reader.onload = async () => {
          await updateProfile({ profilePic: reader.result, bio, fullName: authUser.fullName });
          setLoading(false);
          onClose();
        };
      } else {
        await updateProfile({ bio, fullName: authUser.fullName });
        setLoading(false);
        onClose();
      }
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ y: 50, scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 20, scale: 0.95 }}
          className="w-full max-w-sm rounded-[24px] bg-[#1C1C1E] border border-white/5 overflow-hidden shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Profile</h2>
            <button disabled={loading} onClick={onClose} className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {/* Avatar & Edit Photo */}
            <div className="flex flex-col items-center gap-3 mb-8">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => setSelectedImg(e.target.files?.[0] || null)}
                accept="image/png, image/jpeg" 
                hidden 
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer group"
              >
                <Avatar
                  image={selectedImg ? URL.createObjectURL(selectedImg) : authUser.profilePic}
                  initials={authUser.fullName?.charAt(0) || "M"}
                  color="bg-purple-600"
                  size="xl"
                  className="shadow-xl border-4 border-[#1C1C1E]"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-[2px]">
                  <span className="text-white text-xs font-semibold">Click to Edit</span>
                </div>
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="text-[#32D74B] font-semibold text-sm mt-1 hover:brightness-110">
                Edit photo
              </button>
            </div>

            {/* About (Bio) - Editable */}
            <div className="mb-6">
              <label className="text-[13px] font-semibold text-white/50 tracking-wide mb-1.5 block px-1">About</label>
              <input 
                type="text"
                value={bio || ""}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Hi, I am using QuickChat!"
                className="w-full bg-[#2C2C2E] border-none text-white/90 px-4 py-3.5 rounded-xl font-medium focus:ring-2 focus:ring-[#32D74B] outline-none transition text-[15px]"
              />
            </div>

            {/* Name - Unchangeable */}
            <div className="mb-8">
              <label className="text-[13px] font-semibold text-white/50 tracking-wide mb-1.5 block px-1">Name</label>
              <div className="w-full bg-[#2C2C2E]/40 border-none text-white/50 px-4 py-3.5 rounded-xl font-medium flex items-center justify-between cursor-not-allowed">
                <span className="text-[15px]">{authUser.fullName}</span>
              </div>
              <p className="text-[11px] text-white/30 mt-2 px-1">This is not your username or pin. This name will be permanently visible to your contacts.</p>
            </div>

            {/* Log Out */}
            <button 
              onClick={() => { onClose(); logout(); }} 
              className="w-full bg-[#2C2C2E] hover:bg-[#3A3A3C] transition text-[#FF453A] font-semibold text-left px-4 py-3.5 rounded-xl text-[15px]"
            >
              Log out
            </button>
          </div>

          {/* Footer Done button */}
          <div className="px-6 py-4 border-t border-white/5 bg-[#1C1C1E] flex justify-end">
            <button 
              disabled={loading}
              onClick={handleSave} 
              className={cn(
                "px-5 py-2 rounded-lg font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition shadow-sm",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? "Saving..." : "Done"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
