"use client";

import { FormEvent, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { applyWatermark } from "@/lib/watermark";
import { useRouter } from "next/navigation";
import { 
  HiCloudArrowUp, HiArrowLeft, HiSparkles, 
  HiCheckCircle, HiXMark, HiPhoto 
} from "react-icons/hi2";

// Tipe data untuk antrean foto
interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  status: 'processing' | 'uploading' | 'success' | 'error';
  url?: string;
}

export default function AddCarPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [priceCash, setPriceCash] = useState("");
  const [priceCredit, setPriceCredit] = useState("");
  const [mileage, setMileage] = useState("");
  const [tags, setTags] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // State Utama untuk Foto
  const [photoQueue, setPhotoQueue] = useState<PhotoItem[]>([]);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // --- LOGIC: HANDLE PHOTO SELECTION & AUTO PROCESS ---
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Ambil info showroom untuk watermark
    const { data: { user } } = await supabase.auth.getUser();
    const { data: sh } = await supabase.from("showrooms").select("id, logo_url").eq("owner_id", user?.id).single();

    if (!sh?.logo_url) return alert("Harap upload logo di Settings terlebih dahulu!");

    // Tambahkan file ke queue
    const newItems: PhotoItem[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      status: 'processing'
    }));

    setPhotoQueue(prev => [...prev, ...newItems]);

    // Proses satu per satu (Sequential) agar tidak berat
    for (const item of newItems) {
      try {
        // 1. Watermark
        const watermarkedBlob = await applyWatermark(item.file, sh.logo_url);
        
        updatePhotoStatus(item.id, 'uploading');

        // 2. Upload
        const fileName = `${sh.id}/${Date.now()}-${item.id}.webp`;
        const { data: uploadData, error } = await supabase.storage
          .from('catalog')
          .upload(fileName, watermarkedBlob, { contentType: 'image/webp' });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from('catalog').getPublicUrl(fileName);
        
        updatePhotoStatus(item.id, 'success', publicUrl);
      } catch (err) {
        console.error("Gagal proses foto:", err);
        updatePhotoStatus(item.id, 'error');
      }
    }
  };

 // --- HELPER FORMATTING ---
  const formatKilometerInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    return num ? new Intl.NumberFormat("id-ID").format(Number(num)) : "";
  };

  const formatRupiahInput = (value: string) => {
    const num = value.replace(/[^0-9]/g, "");
    return num ? `Rp ${new Intl.NumberFormat("id-ID").format(Number(num))}` : "";
  };
  const updatePhotoStatus = (id: string, status: PhotoItem['status'], url?: string) => {
    setPhotoQueue(prev => prev.map(p => p.id === id ? { ...p, status, url } : p));
  };

  const removePhoto = (id: string) => {
    setPhotoQueue(prev => {
      const item = prev.find(p => p.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter(p => p.id !== id);
    });
  };

  // --- VALIDASI: TOMBOL ENABLED ---
  const isReadyToPublish = 
    photoQueue.length > 0 && 
    photoQueue.every(p => p.status === 'success') &&
    !loading;

  // --- LOGIC: SUBMIT FINAL ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi berakhir. Silakan login kembali.");

      const { data: sh } = await supabase.from("showrooms").select("id").eq("owner_id", user.id).single();
      if (!sh) throw new Error("Data showroom tidak ditemukan. Silakan lengkapi profil showroom di Settings.");

      // Format Tags dari string ke Array ["tag1", "tag2"]
      const tagsArray = tags.split(",").map(t => t.trim().replace("#", "")).filter(t => t !== "");

      const carData = {
        showroom_id: sh.id,
        brand: formData.get("brand"),
        model: formData.get("model"),
        year: parseInt(formData.get("year") as string),
        transmission: formData.get("transmission"),
        type_car: formData.get("type_car"),
        mileage: Number(mileage.replace(/[^0-9]/g, "")),      
        price_cash: Number(priceCash.replace(/[^0-9]/g, "")),    
        price_credit: Number(priceCredit.replace(/[^0-9]/g, "")), 
        description: formData.get("description"),
        tags: tagsArray,
        status: 'available',
      };

      const { data: car, error: carError } = await supabase.from("cars").insert([carData]).select().single();
      if (carError) throw carError;

      // Simpan referensi gambar yang sudah sukses diupload tadi
      const imageData = photoQueue.map((p, idx) => ({
        car_id: car.id,
        image_url: p.url,
        is_main: idx === 0,
        order: idx
      }));

      await supabase.from("car_images").insert(imageData);
      setShowSuccessModal(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-[#1e293b] tracking-tighter italic uppercase leading-none">Tambah Unit</h1>
          <button type="button" onClick={() => router.back()} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors"><HiArrowLeft size={24} /></button>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          
          {/* PHOTO QUEUE AREA */}
          <div className="col-span-2 space-y-4">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
              {photoQueue.map((item) => (
                <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 group">
                  <img src={item.preview} className={`w-full h-full object-cover transition-opacity ${item.status !== 'success' ? 'opacity-40' : 'opacity-100'}`} />
                  
                  {/* Status Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {item.status === 'processing' && <div className="w-5 h-5 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />}
                    {item.status === 'uploading' && <HiCloudArrowUp className="text-[#10b981] animate-bounce" size={20} />}
                    {item.status === 'success' && <HiCheckCircle className="text-[#10b981]" size={24} />}
                    {item.status === 'error' && <HiXMark className="text-red-500" size={24} />}
                  </div>

                  {/* Remove Button */}
                  <button type="button" onClick={() => removePhoto(item.id)} className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <HiXMark size={16} />
                  </button>
                </div>
              ))}
              
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#10b981] transition-all">
                <HiPhoto size={24} className="text-slate-300 mb-1" />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Add Foto</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoSelect} />
              </label>
            </div>
          </div>


          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Merk Mobil</label>
            <input name="brand" placeholder="Contoh: Toyota" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl mt-1 outline-none font-bold transition-all" required />
          </div>

          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipe & Varian</label>
            <input name="model" placeholder="Contoh: Avanza G AT" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl mt-1 outline-none font-bold transition-all" required />
          </div>

          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tahun</label>
            <input name="year" type="number" placeholder="2024" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl mt-1 outline-none font-bold transition-all" required />
          </div>

          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori (Type Car)</label>
            <select name="type_car" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl mt-1 outline-none font-bold transition-all appearance-none" required>
              <option value="">Pilih Kategori</option>
              <option value="MPV">MPV</option>
              <option value="SUV">SUV</option>
              <option value="Hatchback">Hatchback</option>
              <option value="City Car">City Car</option>
              <option value="Sedan">Sedan</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transmisi</label>
            <select name="transmission" className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl mt-1 outline-none font-bold transition-all appearance-none">
              <option value="AT">Automatic (AT)</option>
              <option value="MT">Manual (MT)</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Jarak Tempuh (KM)</label>
            <input 
              value={mileage} 
              onChange={(e) => setMileage(formatKilometerInput(e.target.value))}
              placeholder="0" 
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl mt-1 outline-none font-bold transition-all" 
            />
          </div>

          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga Cash</label>
            <input 
              value={priceCash} 
              onChange={(e) => setPriceCash(formatRupiahInput(e.target.value))}
              placeholder="Rp 0" 
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl mt-1 outline-none font-bold text-[#10b981] transition-all" 
              required 
            />
          </div>

          <div className="col-span-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Harga Kredit (Opsional)</label>
            <input 
              value={priceCredit} 
              onChange={(e) => setPriceCredit(formatRupiahInput(e.target.value))}
              placeholder="Rp 0" 
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl mt-1 outline-none font-bold text-blue-600 transition-all" 
            />
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Tambahan</label>
            <textarea 
              name="description" 
              placeholder="Sebutkan keunggulan unit ini..." 
              rows={4}
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-[#10b981] focus:bg-white rounded-2xl mt-1 outline-none font-medium transition-all"
            />
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hashtag (cth : Kecil, Sporty, Simple)</label>
            <input 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="pisahkan dengan koma" 
              className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-[#10b981] rounded-2xl mt-1 outline-none font-bold" 
            />
          </div>

          <div className="col-span-2">
            <button 
              type="submit" 
              disabled={!isReadyToPublish}
              className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-xl
                ${isReadyToPublish ? 'bg-[#1e293b] text-white hover:bg-[#10b981]' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'}`}
            >
              <HiSparkles size={18} /> Publish Katalog
            </button>
          </div>
        </form>
      </div>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#1e293b]/60 backdrop-blur-md">
            <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-scale-up">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-[#10b981] rounded-full animate-ping opacity-20"></div>
                <HiCheckCircle size={48} className="text-[#10b981] relative z-10" />
              </div>
              <h3 className="text-2xl font-black text-[#1e293b] uppercase italic tracking-tighter mb-2">Unit Terbit!</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8">Unit berhasil ditambahkan ke katalog publik.</p>
              <div className="flex flex-col w-full gap-3">
                <button onClick={() => router.push("/dashboard")} className="w-full py-4 bg-[#1e293b] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#10b981] transition-all shadow-xl shadow-slate-200">Ke Dashboard</button>
                <button onClick={() => window.location.reload()} className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 hover:text-[#1e293b] transition-all">Tambah Unit Lagi</button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
