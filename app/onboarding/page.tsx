"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

const fetchPaymentInfo = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return router.push("/login");

  // --- CEK ROLE DISINI ---
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === 'superadmin') {
    return router.push("/admin"); // Jika admin nyasar ke sini, lempar ke /admin
  }

  const { data, error } = await supabase
    .from("payments")
    .select(`*, showrooms!inner(name, owner_id)`)
    .eq("showrooms.owner_id", user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle(); // Gunakan maybeSingle agar lebih aman

  if (data) setPaymentData(data);
  setLoading(false);
};

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${paymentData.showroom_id}-${Date.now()}.${fileExt}`;

    // 1. Upload ke Storage Bucket 'payments'
    const { error: uploadError } = await supabase.storage
      .from('payments')
      .upload(fileName, file);

    if (uploadError) {
      alert("Gagal upload: " + uploadError.message);
    } else {
      const { data: { publicUrl } } = supabase.storage.from('payments').getPublicUrl(fileName);

      // 2. Update status bukti bayar di DB
      await supabase
        .from("payments")
        .update({ proof_url: publicUrl, status: 'pending' })
        .eq("id", paymentData.id);

      alert("Bukti terkirim! Admin akan memvalidasi pendaftaran Anda.");
      router.push("/payment-validation"); // Kembali ke homepage setelah upload, atau bisa ke halaman lain sesuai
    }
    setUploading(false);
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Aktivasi Katalog</h2>
        <p className="text-slate-500 text-sm mb-6">Showroom: <span className="font-bold text-slate-700">{paymentData?.showrooms?.name}</span></p>

        <div className="bg-slate-900 text-white p-6 rounded-2xl mb-8">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-bold">Total Transfer (Tepat)</p>
          <p className="text-4xl font-black italic tracking-tighter">Rp {paymentData?.amount.toLocaleString('id-ID')}</p>
        </div>

        <div className="space-y-4 text-left">
          <label className="text-sm font-bold text-slate-700 ml-1">Upload Bukti Transfer</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload}
            disabled={uploading}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-500 file:text-white cursor-pointer"
          />
          {paymentData?.proof_url && (
            <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2 rounded text-center">✓ Bukti sudah terunggah.</p>
          )}
        </div>
      </div>
    </div>
  );
}
