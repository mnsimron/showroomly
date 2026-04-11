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
        ? "Email atau password salah.\nCek kembali akun Showroomly Anda."
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
        } else if (showroom?.status === 'pending') {
          router.push("/payment-validation");
        } else {
          router.push("/onboarding");
        }
        return; // BERHENTI
      }

      // Jika role tidak ditemukan (fallback)
      router.push("/dashboard");     }

  };

  // Tampilkan blank/loading screen sebentar saat sistem cek session
  if (loading && !error)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">

      <div className="relative w-72 h-32 flex items-end justify-center">

        <div
          className="relative w-56 h-20"
          style={{ animation: "drift 2s ease-in-out infinite" }}
        >

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
  <div className="min-h-screen grid md:grid-cols-2 bg-[var(--showroomly-light)]">

    {/* LEFT SIDE (DESKTOP ONLY) */}
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

      <div className="mt-12 w-full overflow-hidden">
        <div className="flex gap-10 animate-logo-scroll w-max">
          {[...logos, ...logos].map((logo, i) => (
            <img key={i} src={logo} className="h-20 w-auto opacity-70" />
          ))}
        </div>
      </div>

      <div className="mt-12 text-sm text-white-400">
        Powered by Showroomly.
      </div>
    </div>

    {/* RIGHT SIDE */}
    <div className="flex flex-col justify-top p-6 md:p-8 md:justify-center">

      {/* MOBILE HEADER (NEW) */}
      <div className="md:hidden mb-8 text-center">
        <img src="/showroomly.svg" className="h-10 mx-auto mb-4" />
        <p className="text-xs text-slate-400 mt-1">
          Kelola katalog mobil lebih mudah
        </p>
      </div>

      <div className="max-w-md w-full mx-auto">

        {/* TITLE */}
        <div className="mb-6 md:mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-[var(--showroomly-primary)]">
            Masuk Showroomly
          </h2>
          <p className="text-slate-500 mt-2 text-xs md:text-sm">
            Akses dashboard showroom Anda
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl text-center font-medium whitespace-pre-line">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">

          {/* EMAIL */}
          <div>
            <label className="text-xs md:text-sm font-semibold text-slate-600">
              Email
            </label>

            <input
              name="email"
              type="email"
              placeholder="Masukkan email Anda"
              className="mt-1 w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--showroomly-accent)] outline-none"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-xs md:text-sm font-semibold text-slate-600">
              Password
            </label>

            <div className="relative">
              <input
                name="password"
                type="password"
                placeholder="Masukkan password Anda"
                className="mt-1 w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-[var(--showroomly-accent)] outline-none"
                required
              />

              <button
                type="button"
                onClick={(e) => {
                  const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                  input.type = input.type === "password" ? "text" : "password";
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                👁
              </button>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--showroomly-accent)] text-white py-3 text-sm rounded-xl font-bold hover:scale-[1.02] transition-all shadow-md"
          >
            {loading ? "Menghubungkan..." : "Masuk ke Dashboard"}
          </button>

        </form>

        {/* REGISTER */}
        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-slate-100 text-center text-xs md:text-sm">
          <p className="text-slate-500">
            Belum punya showroom?
          </p>

          <Link
            href="/register"
            className="text-[var(--showroomly-accent)] font-bold hover:underline"
          >
            Daftarkan sekarang
          </Link>
        </div>

      </div>
    </div>
  </div>
);
}
