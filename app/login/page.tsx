"use client";

import { useState, useEffect } from "react"; // Tambahkan useEffect
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(true); // Default true untuk cek session
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // --- PENJAGAAN: JIKA SUDAH LOGIN, JANGAN KASIH MASUK KE HALAMAN INI ---
useEffect(() => {
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // Ambil role user dari profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile?.role === 'superadmin') {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      setLoading(false); 
    }
  };
  checkUser();
}, [router]);

  const logos = [
  "audi.svg",
  "mercy.svg",
  "bmw.svg",
  "chevrolet.svg",
  "ford.svg",
  "hyundai.svg",
  "lexus.svg",
  "mazda.svg",
  "suzuki.svg",
  "toyota.svg",
  "vw.svg",
];

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // --- VALIDASI SIMPLE ---
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Custom error message agar lebih "friendly"
      const msg = authError.message === "Invalid login credentials" 
        ? "Email atau password salah. Cek kembali akun Showroomly Anda."
        : authError.message;
      setError(msg);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 1. CEK ROLE TERLEBIH DAHULU
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      // Jika Superadmin, arahkan dan BERHENTI (return)
      if (profile?.role === 'superadmin') {
        router.push("/admin");
        return; // <--- WAJIB ADA AGAR TIDAK LANJUT KE BAWAH
      }

      // 2. CEK ROLE OWNER (Opsional jika ingin eksplisit)
      if (profile?.role === 'owner') {
        // Cek status showroom
        const { data: showroom } = await supabase
          .from("showrooms")
          .select("status")
          .eq("owner_id", data.user.id)
          .maybeSingle();

        if (showroom?.status === 'active') {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
        return; // BERHENTI
      }

      // Jika role tidak ditemukan (fallback)
      router.push("/dashboard");     }

  };

  // Tampilkan blank/loading screen sebentar saat sistem cek session
  if (loading && !error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400">
      Mempersiapkan Akses...
    </div>
  );

return (
  <div className="min-h-screen grid md:grid-cols-2 bg-[var(--showroomly-light)]">

  {/* LEFT SIDE */}
  <div className="hidden md:flex flex-col justify-center px-16 bg-[var(--showroomly-light-bg)] text-white overflow-hidden">
    <div className="flex items-center gap-2 mb-10">
      <img src="/showroomly.svg" alt="Showroomly" className="h-12 md:h-14 w-auto" />
    </div>

    <h1 className="text-5xl font-black leading-tight mb-6">
      Kelola Katalog <br /> Showroom Anda
    </h1>

    <p className="text-white-300 text-lg leading-relaxed max-w-md">
      Showroomly membantu showroom mobil memiliki katalog digital yang
      modern, mudah dikelola, dan siap dibagikan ke pelanggan kapan saja.
    </p>

    {/* LOGO CAROUSEL */}
    <div className="mt-12 w-full overflow-hidden">
      <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-[var(--showroomly-light-bg)] to-transparent z-10" />
      {/* <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-[var(--showroomly-light-bg)] to-transparent z-10" /> */}
      <div className="flex gap-10 animate-logo-scroll w-max">

        {[...logos, ...logos].map((logo, i) => (
          <img
            key={i}
            src={logo}
            className="h-20 w-auto opacity-70 hover:opacity-100 transition"
          />
        ))}

      </div>
    </div>

    <div className="mt-12 text-sm text-white-400">
      Powered by Showroomly.
    </div>

  </div>

    {/* RIGHT SIDE */}
    <div className="flex items-center justify-center p-8">

      <div className="max-w-md w-full">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-[var(--showroomly-primary)]">
            Masuk Showroomly
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Akses dashboard showroom Anda
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="text-sm font-semibold text-slate-600">
              Email Bisnis
            </label>

            <input
              name="email"
              type="email"
              placeholder="Masukkan email Anda"
              className="mt-1 w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--showroomly-accent)] outline-none"
              required
            />
          </div>

            <div>
            <label className="text-sm font-semibold text-slate-600">
              Password
            </label>

            <div className="relative">
              <input
              name="password"
              type="password"
              placeholder="*********"
              className="mt-1 w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--showroomly-accent)] outline-none"
              required
              />
                <button
                type="button"
                onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                input.type = input.type === "password" ? "text" : "password";
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                </button>
            </div>
            </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--showroomly-accent)] text-white py-3 rounded-xl font-bold hover:scale-[1.02] transition-all shadow-md"
          >
            {loading ? "Menghubungkan..." : "Masuk ke Dashboard"}
          </button>

        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm">
          <p className="text-slate-500">
            Belum punya showroom di Showroomly?
          </p>

          <Link
            href="/register"
            className="text-[var(--showroomly-accent)] font-bold hover:underline"
          >
            Daftarkan Showroom
          </Link>
        </div>

      </div>

    </div>

  </div>
);
}
