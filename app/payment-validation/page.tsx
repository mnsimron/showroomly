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

  if (loading) return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">

      {/* CAR AREA */}
      <div className="relative w-72 h-32 flex items-end justify-center">

        {/* CAR WRAPPER */}
        <div
          className="relative w-56 h-20"
          style={{ animation: "drift 2s ease-in-out infinite" }}
        >

          {/* BODY */}
          <div className="absolute bottom-4 w-full h-12 bg-[var(--showroomly-accent)] rounded-full shadow-lg"></div>

          {/* ROOF */}
          <div className="absolute bottom-12 left-16 w-24 h-8 bg-[var(--showroomly-accent)] rounded-t-3xl"></div>

          {/* WINDOWS */}
          <div className="absolute bottom-14 left-20 w-7 h-5 bg-white rounded opacity-80"></div>
          <div className="absolute bottom-14 left-29 w-7 h-5 bg-white rounded opacity-80"></div>

          {/* HEADLIGHT */}
          <div className="absolute bottom-8 right-0 w-3 h-3 bg-yellow-300 rounded-full blur-[1px]"></div>
          {/* HEADLIGHT */}
          <div className="absolute bottom-8 left-1 w-4 h-4 bg-red-600 rounded-none blur-[1px]"></div>


          {/* WHEEL LEFT */}
          <div
            className="absolute bottom-0 left-12 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <div className="absolute w-4 h-[2px] bg-white rounded"></div>
            <div className="absolute h-4 w-[2px] bg-white rounded"></div>
          </div>

          {/* WHEEL RIGHT */}
          <div
            className="absolute bottom-0 right-12 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <div className="absolute w-4 h-[2px] bg-white rounded"></div>
            <div className="absolute h-4 w-[2px] bg-white rounded"></div>
          </div>

        </div>

      </div>

      {/* TEXT */}
      <div className="mt-8 text-center">
        <div className="text-lg font-semibold">Mempersiapkan Akses...</div>
        <p className="mt-2 text-sm text-slate-500">
          Sedang menyalakan mesin dan memeriksa session.
        </p>
      </div>

      <style jsx>{`

        @keyframes drift {
          0% {
            transform: translateX(0) rotate(0deg);
          }
          30% {
            transform: translateX(10px) rotate(2deg);
          }
          60% {
            transform: translateX(-8px) rotate(-2deg);
          }
          100% {
            transform: translateX(0) rotate(0deg);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

      `}</style>
    </div>
  );

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
