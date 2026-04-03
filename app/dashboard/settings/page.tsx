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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-black italic uppercase tracking-widest">
      Loading Showroomly...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-72 space-y-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="group flex items-center gap-3 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all mb-8"
          >
            <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Kembali Ke Dashboard
          </button>
          
          {[
            { id: "showroom", label: "Profil Showroom", icon: <HiHome size={20}/> },
            { id: "logo", label: "Logo & Watermark", icon: <HiPhotograph size={20}/> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest transition-all ${
                activeTab === item.id 
                ? "bg-[#1e293b] text-white shadow-2xl shadow-slate-300 scale-[1.02]" 
                : "text-slate-400 hover:bg-white hover:text-slate-600"
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </aside>

        {/* Main Form Area */}
        <div className="flex-1">
          <header className="mb-10">
            <h2 className="text-3xl font-black text-[#1e293b] tracking-tighter uppercase italic">Pengaturan</h2>
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mt-1">Kelola identitas digital showroom Anda</p>
          </header>

          <main className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100 p-8 md:p-12">
            
            {activeTab === "showroom" && (
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Showroom</label>
                    <input 
                      name="name" 
                      defaultValue={showroom.name} 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#10b981] focus:bg-white transition-all outline-none font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Admin</label>
                    <input 
                      name="whatsapp" 
                      defaultValue={showroom.whatsapp} 
                      className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#10b981] focus:bg-white transition-all outline-none font-bold text-[#10b981]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alamat Showroom</label>
                    <textarea 
                      name="address" 
                      defaultValue={showroom.address} 
                      rows={3}
                      className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-[#10b981] focus:bg-white transition-all outline-none font-bold"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={updating}
                  className="w-full md:w-auto px-10 py-4 bg-[#1e293b] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#10b981] transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
                >
                  {updating ? "Memproses..." : "Simpan Perubahan"}
                </button>
              </form>
            )}

            {activeTab === "logo" && (
              <div className="space-y-10">
                <div className="bg-slate-50 rounded-[2.5rem] p-8 border-2 border-dashed border-slate-200 flex flex-col items-center text-center">
                  <div className="relative group">
                    <div className="w-40 h-40 bg-white rounded-[2rem] shadow-xl flex items-center justify-center overflow-hidden border border-slate-100 mb-6 p-4">
                      {showroom.logo_url ? (
                        <img src={showroom.logo_url} className="w-full h-full object-contain" alt="Logo preview" />
                      ) : (
                        <HiPhotograph size={48} className="text-slate-100" />
                      )}
                    </div>
                    {updating && (
                       <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[2rem] z-10">
                          <div className="w-6 h-6 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin"></div>
                       </div>
                    )}
                  </div>

                  <div className="max-w-xs">
                    <h4 className="font-black text-[#1e293b] uppercase tracking-tighter text-lg">Identity Watermark</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 leading-relaxed">
                      Upload logo PNG transparan. Logo akan otomatis menjadi watermark pada setiap foto unit mobil.
                    </p>
                  </div>

                  <input 
                    type="file" 
                    id="logo-upload" 
                    className="hidden" 
                    onChange={handleUploadLogo} 
                    accept="image/png" 
                    disabled={updating}
                  />
                  
                  <div className="flex gap-3 mt-8">
                    <label 
                      htmlFor="logo-upload" 
                      className="cursor-pointer flex items-center gap-3 bg-[#1e293b] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#10b981] transition-all shadow-lg shadow-slate-200"
                    >
                      <HiCloudUpload size={18} /> {showroom.logo_url ? "Ganti Logo" : "Upload Logo"}
                    </label>
                  </div>

                  {showroom.logo_url && (
                    <div className="mt-6 flex items-center gap-2 text-[#10b981] bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                      <HiCheckCircle size={16} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Watermark System Active</span>
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
