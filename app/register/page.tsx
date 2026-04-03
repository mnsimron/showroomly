"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { generateUniquePayment } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  HiOutlineUser, 
  HiOutlineEnvelope, 
  HiOutlineLockClosed, 
  HiOutlineBuildingStorefront,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiChevronRight
} from "react-icons/hi2";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const showroomName = formData.get("showroomName") as string;
    
    const slug = showroomName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (authError) {
      alert("Gagal daftar: " + authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profile?.role === "superadmin") {
        router.push("/admin");
        return;
      }

      const { totalAmount, uniqueCode } = generateUniquePayment();

      const { data: showroom } = await supabase
        .from("showrooms")
        .insert([{ 
          owner_id: authData.user.id, 
          name: showroomName, 
          slug: slug,
          status: 'pending' 
        }])
        .select().single();

      if (showroom) {
        await supabase.from("payments").insert([{
          showroom_id: showroom.id,
          amount: totalAmount,
          unique_code: uniqueCode,
          status: 'pending'
        }]);
        
        router.push("/onboarding"); 
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f8fafc]">
      <div className="max-w-[440px] w-full">
        <div className="flex flex-col items-center mb-10 group">
        <div className="flex items-center gap-2">
          <img src="/showroomly.svg" alt="Showroomly" className="h-12 md:h-14 w-auto" />
        </div>
        </div>
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">
          
          <header className="mb-8">
            <h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tighter">Buat Akun Showroom</h2>
            <p className="text-slate-400 text-xs font-medium mt-1">Daftarkan bisnis showroom Anda hari ini.</p>
          </header>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <div className="relative">
                <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input name="fullName" placeholder="Masukkan Nama Anda" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all" required />
              </div>
            </div>

            {/* Input Nama Showroom */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Bisnis Showroom</label>
              <div className="relative">
                <HiOutlineBuildingStorefront className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input name="showroomName" placeholder="Masukkan Nama Showroom" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all" required />
              </div>
            </div>

            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Bisnis</label>
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input name="email" type="email" placeholder="Masukkan Email Anda" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all" required />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="********" 
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <HiOutlineEyeSlash size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-[#1e293b] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#10b981] transition-all shadow-xl shadow-slate-200 mt-4 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Daftar & Aktivasi <HiChevronRight size={16} /></>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Sudah Bergabung?{" "}
              <Link href="/login" className="text-[#10b981] hover:underline underline-offset-4 ml-1">
                Masuk ke Dashboard
              </Link>
            </p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
            Kembali ke landing page ?{" "}
            <Link href="/" className="text-[#10b981] hover:underline underline-offset-4 ml-1">
              Klik
            </Link>
            </p>
          </div>
        </div>

        {/* Floating Credit/Footer */}
        <p className="text-center text-slate-300 text-[9px] font-bold uppercase tracking-[0.4em] mt-10">
          Powered by Showroomly Engine
        </p>
      </div>
    </div>
  );
}
