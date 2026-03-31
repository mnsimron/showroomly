"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
      return;
    }

    if (data.user) {
      // Cek status showroom user ini untuk mengarahkan ke halaman yang tepat
      const { data: showroom } = await supabase
        .from("showrooms")
        .select("status")
        .eq("owner_id", data.user.id)
        .single();

      if (showroom?.status === 'active') {
        router.push("/dashboard"); // Jika sudah aktif, masuk ke dashboard katalog
      } else {
        router.push("/onboarding"); // Jika masih pending/baru daftar, masuk ke upload bukti bayar
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Masuk Showroomly</h1>
          <p className="text-slate-500 mt-2 text-sm">Kelola katalog mobil Anda dengan mudah.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Email Bisnis</label>
            <input 
              name="email" 
              type="email" 
              placeholder="budi@showroom.com" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-700">Password</label>
            <input 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent outline-none" 
              required 
            />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-primary text-black py-3 rounded-lg font-bold hover:bg-slate-700 hover:text-white transition-all shadow-md mt-2">
            {loading ? "Menghubungkan..." : "Masuk Sekarang"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link href="/register" className="text-accent font-bold hover:underline">
              Daftar Showroom
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
