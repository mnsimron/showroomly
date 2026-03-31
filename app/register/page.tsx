"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { generateUniquePayment } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const showroomName = formData.get("showroomName") as string;
    
    // Create slug: "Limo Motor" -> "limo-motor"
    const slug = showroomName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

    // 1. SignUp ke Supabase Auth
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
      // 2. Generate Nominal Unik (Base 100rb + 3 digit unik)
      const { totalAmount, uniqueCode } = generateUniquePayment();

      // 3. Simpan data Showroom
      const { data: showroom, error: sError } = await supabase
        .from("showrooms")
        .insert([{ 
          owner_id: authData.user.id, 
          name: showroomName, 
          slug: slug,
          status: 'pending' 
        }])
        .select().single();

      if (showroom) {
        // 4. Simpan data Payment Pending
        await supabase.from("payments").insert([{
          showroom_id: showroom.id,
          amount: totalAmount,
          unique_code: uniqueCode,
          status: 'pending'
        }]);
        
        // 5. ALUR: Setelah berhasil, langsung lempar ke Onboarding
        router.push("/onboarding"); 
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <h1 className="text-3xl font-black text-primary text-center mb-2">Showroomly</h1>
        <p className="text-slate-500 text-center text-sm mb-8 font-medium">Mulai katalog mobil modern Anda.</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <input name="fullName" placeholder="Nama Lengkap Pemilik" className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-accent" required />
          <input name="showroomName" placeholder="Nama Showroom (Limo Motor)" className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-accent" required />
          <input name="email" type="email" placeholder="email@bisnis.com" className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-accent" required />
          <input name="password" type="password" placeholder="Password" className="w-full p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-accent" required />
          
          <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:opacity-90 transition-all mt-2">
            {loading ? "Menyiapkan Akun..." : "Daftar & Ambil Kode Unik"}
          </button>
        </form>
      </div>
    </div>
  );
}
