"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { HiOutlineClock, HiOutlineChatBubbleLeftRight, HiOutlineArrowLeftOnRectangle } from "react-icons/hi2";

export default function PaymentValidationPage() {
  const [status, setStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(true);
  const [showroom, setShowroom] = useState<{ name: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkStatus();
    
    // 🔥 REALTIME: Otomatis masuk dashboard jika admin approve
    const channel = supabase
      .channel('payment_status')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'showrooms' }, 
        (payload) => {
          if (payload.new.status === 'active') {
            router.push("/dashboard");
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");


    const { data: showroom } = await supabase
      .from("showrooms")
      .select("status, name")
      .eq("owner_id", user.id)
      .single();

    if (showroom?.status === "active") {
      router.push("/dashboard");
    } else if (showroom?.status === "inactive") {
      setStatus("inactive");
    } else {
      setStatus(showroom?.status || "pending");
    }
    setShowroom(showroom);
    setLoading(false);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return null;

  if (status === "inactive") {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 text-center relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>

          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <HiOutlineArrowLeftOnRectangle size={48} className="text-red-500" />
          </div>

          <h2 className="text-2xl font-black text-[#1e293b] uppercase italic tracking-tighter leading-none mb-4">
            Akun Dinonaktifkan
          </h2>
          
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed mb-10">
            Akun showroom Anda telah dinonaktifkan oleh admin. Silakan hubungi tim Showroomly untuk informasi lebih lanjut.
          </p>

          <div className="space-y-4">
            {/* Button Hubungi Admin */}
            <a 
              href="https://wa.me Admin Showroomly, akun saya dinonaktifkan. Mohon bantu cek."
              target="_blank"
              className="w-full py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-red-600 transition-all shadow-xl shadow-red-200"
            >
              <HiOutlineChatBubbleLeftRight size={18} />
              Hubungi Admin Via WA
            </a>

            {/* Button Logout */}
            <button 
              onClick={handleLogout}
              className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <HiOutlineArrowLeftOnRectangle size={18} />
              Keluar
            </button>
          </div>

          <p className="mt-10 text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
            Showroomly Account Status
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 text-center relative overflow-hidden">
        
        {/* ✨ Dekorasi Latar Belakang */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#10b981] animate-pulse"></div>

        {/* ⏳ Animated Icon */}
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-[#10b981] rounded-full animate-ping opacity-10"></div>
          <HiOutlineClock size={48} className="text-[#1e293b] animate-spin-slow" />
        </div>

        <h2 className="text-xl font-black text-[#1e293b] uppercase tracking-tighter leading-none mb-4">
         <span className="underline">{showroom?.name}</span> Sedang Divalidasi
        </h2>
        
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed mb-10">
          Tim Showroomly sedang mengecek bukti transfer Anda. Proses ini biasanya memakan waktu <span className="text-[#1e293b]">5-15 menit</span> pada jam kerja.
        </p>

        <div className="space-y-4">
          {/* Button Hubungi Admin */}
          <a 
            href="https://wa.me Admin Showroomly, saya sudah upload bukti bayar. Mohon bantu verifikasi."
            target="_blank"
            className="w-full py-4 bg-[#1e293b] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#10b981] transition-all shadow-xl shadow-slate-200"
          >
            <HiOutlineChatBubbleLeftRight size={18} />
            Hubungi Admin Via WA
          </a>

          <button 
            onClick={refreshPage}
            className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <HiOutlineArrowLeftOnRectangle size={18} />
            Check Status Account
          </button>

          {/* Button Logout */}
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
          >
            <HiOutlineArrowLeftOnRectangle size={18} />
            Keluar Sementara
          </button>
        </div>

        <p className="mt-10 text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
          Showroomly Validation System
        </p>
      </div>

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
