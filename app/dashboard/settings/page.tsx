"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { HiCheckCircle, HiCloudUpload, HiTrash } from "react-icons/hi";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showroom, setShowroom] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchShowroom();
  }, []);

  const fetchShowroom = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data } = await supabase
      .from("showrooms")
      .select("*")
      .eq("owner_id", user.id)
      .single();

    setShowroom(data);
    setLoading(false);
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log("Showroom ID:", showroom.id);
    console.log("User Authenticated:", (await supabase.auth.getUser()).data.user?.id);


    // Validasi: Harus PNG untuk Transparansi Watermark
    if (file.type !== "image/png") {
      alert("Gunakan format PNG transparan agar watermark terlihat bagus!");
      return;
    }

    setUpdating(true);
    const fileName = `logo-${showroom.id}-${Date.now()}.png`;

    // 1. Upload Logo Baru ke Bucket 'logos'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("logos")
      .upload(fileName, file);

    if (uploadError) {
      alert("Gagal upload: " + uploadError.message);
    } else {
      const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(fileName);

      // 2. Update URL Logo di Tabel Showrooms
      await supabase
        .from("showrooms")
        .update({ logo_url: publicUrl })
        .eq("id", showroom.id);

      alert("Logo Berhasil Diperbarui!");
      fetchShowroom(); // Refresh data
    }
    setUpdating(false);
  };

  if (loading) return <div className="p-10 text-center">Memuat Pengaturan...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Pengaturan Showroom</h1>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
          <label className="text-sm font-bold text-slate-500 uppercase block mb-4">Logo Showroom (PNG Transparan)</label>
          
          <div className="flex items-center gap-8">
            {/* Preview Logo */}
            <div className="w-32 h-32 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 overflow-hidden relative group">
              {showroom.logo_url ? (
                <img src={showroom.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-slate-300 text-center p-2 text-[10px] font-bold">BELUM ADA LOGO</div>
              )}
            </div>

            {/* Upload Control */}
            <div className="flex-1">
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Gunakan logo dengan background transparan (.png). Logo ini akan otomatis muncul sebagai <strong>Watermark</strong> di setiap foto mobil Anda.
              </p>
              
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/png" 
                  onChange={handleUploadLogo}
                  disabled={updating}
                  className="hidden" 
                  id="logo-upload"
                />
                <label 
                  htmlFor="logo-upload" 
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold cursor-pointer transition-all ${updating ? 'bg-slate-200 text-slate-400' : 'bg-primary text-white hover:bg-slate-700'}`}
                >
                  <HiCloudUpload size={20} />
                  {showroom.logo_url ? "Ganti Logo" : "Upload Logo Pertama"}
                </label>
              </div>
            </div>
          </div>

          {showroom.logo_url && (
            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <HiCheckCircle size={20} /> Logo Aktif & Siap Digunakan untuk Watermark
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
