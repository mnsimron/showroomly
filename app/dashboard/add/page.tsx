"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { applyWatermark } from "@/lib/watermark";
import { useRouter } from "next/navigation";

export default function AddCarPage() { // Hapus 'async' di sini
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    
    // 1. Ambil data Showroom (termasuk logo_url untuk watermark)
    const { data: sh } = await supabase
      .from("showrooms")
      .select("id, logo_url")
      .eq("owner_id", user?.id)
      .single();

    if (!sh) {
      alert("Showroom tidak ditemukan!");
      setLoading(false);
      return;
    }

    // 2. LOGIC UPLOAD FOTO & WATERMARK
    const photoInput = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    const photoFiles = photoInput.files;
    let imageLinks: string[] = [];

    if (photoFiles && photoFiles.length > 0) {
      if (!sh.logo_url) {
        alert("Harap upload logo showroom di menu Settings terlebih dahulu untuk fitur watermark!");
        setLoading(false);
        return;
      }

      const uploadPromises = Array.from(photoFiles).map(async (file, index) => {
        // Tempel Watermark
        const watermarkedBlob = await applyWatermark(file, sh.logo_url);
        const fileName = `${sh.id}/${Date.now()}-${index}.webp`;

        const { data: uploadData } = await supabase.storage
          .from('catalog')
          .upload(fileName, watermarkedBlob);

        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('catalog').getPublicUrl(fileName);
          return publicUrl;
        }
        return null;
      });

      const results = await Promise.all(uploadPromises);
      imageLinks = results.filter((url): url is string => url !== null);
    }

    // 3. Simpan Data Mobil
    const rawTags = formData.get("tags") as string;
    const tagsArray = rawTags ? rawTags.split(",").map(t => t.trim().startsWith("#") ? t.trim() : `#${t.trim()}`) : [];

    const carData = {
      showroom_id: sh.id,
      brand: formData.get("brand"),
      model: formData.get("model"),
      year: parseInt(formData.get("year") as string),
      transmission: formData.get("transmission"),
      mileage: parseInt(formData.get("mileage") as string),
      price_cash: parseInt(formData.get("price_cash") as string),
      price_credit: parseInt(formData.get("price_credit") as string) || 0,
      tags: tagsArray,
      description: formData.get("description"),
      status: 'available'
    };

    const { data: car, error: carError } = await supabase
      .from("cars")
      .insert([carData])
      .select()
      .single();

    // 4. Simpan ke tabel car_images
    if (car && imageLinks.length > 0) {
      const imageData = imageLinks.map((url, idx) => ({
        car_id: car.id,
        image_url: url,
        is_main: idx === 0,
        order: idx
      }));
      await supabase.from("car_images").insert(imageData);
    }

    if (!carError) {
      alert("Mobil dan Foto berhasil ditambahkan!");
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <h1 className="text-2xl font-black text-primary mb-6">Tambah Unit Baru</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 mb-4">
            <label className="text-xs font-bold text-slate-500 uppercase">Foto Mobil (Banyak sekaligus)</label>
            <input type="file" multiple accept="image/*" className="w-full mt-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-100 file:text-slate-700" />
          </div>
          
          <div className="col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Merk</label>
            <input name="brand" placeholder="Toyota" className="w-full p-3 bg-slate-50 border-none rounded-xl mt-1" required />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Tipe</label>
            <input name="model" placeholder="Avanza G" className="w-full p-3 bg-slate-50 border-none rounded-xl mt-1" required />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Tahun</label>
            <input name="year" type="number" placeholder="2022" className="w-full p-3 bg-slate-50 border-none rounded-xl mt-1" required />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Transmisi</label>
            <select name="transmission" className="w-full p-3 bg-slate-50 border-none rounded-xl mt-1">
              <option value="AT">Automatic (AT)</option>
              <option value="MT">Manual (MT)</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Hashtag (Pisahkan dengan koma)</label>
            <input name="tags" placeholder="irit, keluarga" className="w-full p-3 bg-slate-50 border-none rounded-xl mt-1" />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Harga Cash</label>
            <input name="price_cash" type="number" className="w-full p-3 bg-slate-50 border-none rounded-xl mt-1 font-bold text-emerald-600" required />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase">KM</label>
            <input name="mileage" type="number" className="w-full p-3 bg-slate-50 border-none rounded-xl mt-1" required />
          </div>
          
          <button type="submit" disabled={loading} className="col-span-2 bg-primary text-white py-4 rounded-2xl font-bold mt-4 shadow-lg">
            {loading ? "Memproses Watermark & Upload..." : "Simpan Unit Mobil"}
          </button>
        </form>
      </div>
    </div>
  );
}
