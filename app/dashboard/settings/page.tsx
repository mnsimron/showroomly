"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { 
  HiHome, HiPhotograph, HiCloudUpload, 
  HiCheckCircle, HiArrowLeft, HiTrash 
} from "react-icons/hi";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("showroom");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showroom, setShowroom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => { fetchShowroom(); }, []);

  const fetchShowroom = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");
    const { data } = await supabase.from("showrooms").select("*").eq("owner_id", user.id).single();
    setShowroom(data);
    setLoading(false);
  };

  // --- LOGIC: UPDATE PROFIL ---
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from("showrooms").update({
      name: formData.get("name"),
      whatsapp: formData.get("whatsapp"),
      address: formData.get("address"),
    }).eq("id", showroom.id);

    if (error) alert("Gagal memperbarui profil");
    else alert("Profil diperbarui!");
    
    setUpdating(false);
    fetchShowroom();
  };

  // --- LOGIC: UPLOAD / UPDATE LOGO ---
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validasi format PNG (Penting untuk watermark transparan)
    if (file.type !== "image/png") {
      return alert("Wajib gunakan format PNG Transparan agar watermark terlihat profesional!");
    }

    setUpdating(true);

    try {
      // 1. Hapus logo lama dari Storage jika ada (Opsional, agar storage bersih)
      if (showroom.logo_url) {
        const oldFileName = showroom.logo_url.split('/').pop();
        await supabase.storage.from("logos").remove([oldFileName]);
      }

      // 2. Upload file baru dengan nama unik
      const fileExt = file.name.split('.').pop();
      const fileName = `${showroom.slug}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("logos")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 3. Ambil Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("logos")
        .getPublicUrl(fileName);

      // 4. Update table showrooms
      const { error: updateError } = await supabase
        .from("showrooms")
        .update({ logo_url: publicUrl })
        .eq("id", showroom.id);

      if (updateError) throw updateError;

      alert("Logo berhasil diperbarui!");
      fetchShowroom();
    } catch (error: any) {
      alert(error.message || "Terjadi kesalahan saat upload");
    } finally {
      setUpdating(false);
    }
  };

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
  <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12">
    <div className="max-w-5xl mx-auto flex flex-col gap-6 md:flex-row md:gap-10">

      {/* NAV / TAB */}
      <aside className="w-full md:w-72">
        
        {/* BACK */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all mb-4 md:mb-8"
        >
          <HiArrowLeft /> Kembali
        </button>

        {/* TAB MOBILE = HORIZONTAL */}
        <div className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "showroom", label: "Profil", icon: <HiHome size={18}/> },
            { id: "logo", label: "Logo", icon: <HiPhotograph size={18}/> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-xl md:rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all
                ${
                  activeTab === item.id
                    ? "bg-[#1e293b] text-white shadow"
                    : "bg-white text-slate-400"
                }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* CONTENT */}
      <div className="flex-1">
        
        {/* HEADER */}
        <header className="mb-6 md:mb-10">
          <h2 className="text-xl md:text-3xl font-black text-[#1e293b] tracking-tighter uppercase italic">
            Pengaturan
          </h2>
          <p className="text-slate-400 text-[10px] md:text-xs font-bold tracking-widest uppercase mt-1">
            Kelola identitas showroom
          </p>
        </header>

        {/* CARD */}
        <main className="bg-white rounded-2xl md:rounded-[3rem] shadow border border-slate-100 p-4 md:p-8">

          {/* TAB: SHOWROOM */}
          {activeTab === "showroom" && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">

              <div className="space-y-4">
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Nama Showroom
                  </label>
                  <input
                    name="name"
                    defaultValue={showroom.name}
                    className="w-full p-3 md:p-4 text-sm bg-slate-50 rounded-xl md:rounded-2xl mt-1 font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    WhatsApp
                  </label>
                  <input
                    name="whatsapp"
                    type="number"
                    defaultValue={showroom.whatsapp}
                    className="w-full p-3 md:p-4 text-sm bg-slate-50 rounded-xl md:rounded-2xl mt-1 font-bold text-[#10b981]"
                    placeholder="Masukkan No Whatsapp Anda"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                    Alamat
                  </label>
                  <textarea
                    name="address"
                    defaultValue={showroom.address}
                    rows={5}
                    className="w-full p-3 md:p-4 text-sm bg-slate-30 rounded-xl md:rounded-2xl mt-1 font-light outline-none resize-none"
                    placeholder="Masukkan Alamat Jelas dan Lengkap sesuai google maps"
                  />
                </div>

              </div>

              <button
                type="submit"
                disabled={updating}
                className="w-full md:w-auto px-6 py-3 md:px-10 md:py-4 bg-[#1e293b] text-white rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#10b981] transition-all disabled:opacity-50"
              >
                {updating ? "Memproses..." : "Simpan"}
              </button>
            </form>
          )}

          {/* TAB: LOGO */}
          {activeTab === "logo" && (
            <div className="space-y-6">
              
              <div className="bg-slate-50 rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                
                {/* PREVIEW */}
                <div className="relative mb-4">
                  <div className="w-28 h-28 md:w-40 md:h-40 bg-white rounded-xl md:rounded-[2rem] shadow flex items-center justify-center overflow-hidden border p-3">
                    {showroom.logo_url ? (
                      <img src={showroom.logo_url} className="w-full h-full object-contain" />
                    ) : (
                      <HiPhotograph size={40} className="text-slate-200" />
                    )}
                  </div>

                  {updating && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                      <div className="w-5 h-5 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* TEXT */}
                <h4 className="font-black text-[#1e293b] text-sm md:text-lg">
                  Watermark Logo
                </h4>
                <p className="text-[10px] text-slate-400 font-bold mt-2">
                  Gunakan PNG transparan
                </p>

                {/* INPUT */}
                <input
                  type="file"
                  id="logo-upload"
                  className="hidden"
                  onChange={handleUploadLogo}
                  accept="image/png"
                  disabled={updating}
                />

                <label
                  htmlFor="logo-upload"
                  className="mt-6 cursor-pointer flex items-center gap-2 bg-[#1e293b] text-white px-5 py-3 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#10b981]"
                >
                  <HiCloudUpload size={16} />
                  {showroom.logo_url ? "Ganti" : "Upload"}
                </label>

                {/* STATUS */}
                {showroom.logo_url && (
                  <div className="mt-4 flex items-center gap-2 text-[#10b981] bg-emerald-50 px-3 py-1.5 rounded-full border">
                    <HiCheckCircle size={14} />
                    <span className="text-[9px] font-black uppercase">
                      Active
                    </span>
                  </div>
                )}
              </div>

            </div>
          )}
        </main>
      </div>
    </div>
  </div>
);
}
