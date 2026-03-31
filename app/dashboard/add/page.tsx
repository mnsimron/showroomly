"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";
import { applyWatermark } from "@/lib/watermark";
import { useRouter } from "next/navigation";

export default function AddCarPage() { // Hapus 'async' di sini
  const [loading, setLoading] = useState(false);
  const [priceCash, setPriceCash] = useState("");
  const [priceCredit, setPriceCredit] = useState("");
  const [mileage, setMileage] = useState("");
  const router = useRouter();


const formatKilometerInput = (value: string) => {
  const numberString = value.replace(/[^0-9]/g, "");

  if (!numberString) return "";

  return new Intl.NumberFormat("id-ID").format(Number(numberString));
};

const parseKilometerValue = (value: string) => {
  if (!value) return 0;
  return Number(value.replace(/\./g, ""));
};

const formatRupiahInput = (value: string) => {
  const numberString = value.replace(/[^0-9]/g, ""); // hanya angka

  if (!numberString) return "";

  const formatted = new Intl.NumberFormat("id-ID").format(
    Number(numberString)
  );

  return `Rp ${formatted}`;
};

const parseRupiahValue = (value: string) => {
  return Number(value.replace(/[^0-9]/g, ""));
};

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    
    // Ambil data Showroom
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
    const photoFiles = formData.getAll("photos") as File[];
    let imageLinks: string[] = [];

    if (photoFiles.length > 0 && photoFiles[0]?.size > 0) {
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
      mileage: parseKilometerValue(mileage),      
      price_cash: parseRupiahValue(priceCash),    // Angka murni: 150000000
      price_credit: parseRupiahValue(priceCredit), // Angka murni: 145000000
      description: formData.get("description"),
      tags: formData.get("tags") ? (formData.get("tags") as string).split(",").map(t => t.trim()) : [],
      status: 'available',
      // Tambahkan payment_type jika Anda sudah menambahkan kolomnya di DB
      // payment_type: formData.get("price_credit") ? "CASH_KREDIT" : "CASH" 
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

    if (carError) {
      console.error(carError);
      alert("Gagal simpan data: " + carError.message);
    } else {
      alert("Unit Showroomly Berhasil Ditambahkan!");
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const handleTextareaKeyDown = (
  e: React.KeyboardEvent<HTMLTextAreaElement>
) => {
  if (e.key === "Enter") {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const value = textarea.value;

    const before = value.substring(0, start);
    const after = value.substring(start);

    const lines = before.split("\n");
    const lastLine = lines[lines.length - 1];

    if (lastLine.trim().startsWith("- ")) {
      e.preventDefault();

      const newValue = before + "\n- " + after;
      textarea.value = newValue;

      const cursor = start + 3;
      textarea.selectionStart = textarea.selectionEnd = cursor;
    }
  }
};

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <h1 className="text-2xl font-black text-primary mb-6">Tambah Unit Baru</h1>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 mb-4">
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <span className="px-4 py-2 bg-slate-100 rounded-full text-sm font-medium">
              Pilih Foto
            </span>
            
            <span className="text-sm text-slate-500">
              Belum ada file dipilih
            </span>

            <input
              name="photos"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
            />
          </label>
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
            <label className="text-xs font-bold text-slate-500 uppercase">KM</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={mileage}
              onChange={(e) => setMileage(formatKilometerInput(e.target.value))}
              className="w-full p-3 bg-slate-50 border-none rounded-xl mt-1 font-semibold" 
              required 
            />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Harga Cash</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={priceCash}
              onChange={(e) => setPriceCash(formatRupiahInput(e.target.value))}
              placeholder="Rp" 
              className="w-full p-3 bg-slate-50 border-none rounded-xl mt-1 font-bold text-black-600 focus:ring-2 focus:ring-emerald-500" 
              required 
            />
          </div>

          <div className="col-span-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Harga Kredit</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={priceCredit}
              onChange={(e) => setPriceCredit(formatRupiahInput(e.target.value))}
              placeholder="Rp" 
              className="w-full p-3 bg-slate-50 border-none rounded-xl mt-1 font-bold text-black-600 focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          {/* 3. INPUT DESKRIPSI (Sudah ada di DB) */}
          <div className="col-span-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi Lengkap Mobil</label>
            <textarea 
              name="description" 
              rows={4} 
              onKeyDown={handleTextareaKeyDown}
              placeholder="- Mesin halus
                            - Pajak hidup
                            - Ban baru -Tenor 24 bulan"
              className="w-full p-3 bg-slate-50 border-none rounded-xl mt-1 text-sm focus:ring-2 focus:ring-primary"
            ></textarea>
          </div>

          
          <button type="submit" disabled={loading} className="col-span-2 bg-primary text-black py-4 rounded-2xl font-bold mt-4 shadow-lg hover:bg-slate-700 hover:text-white">
            {loading ? "Memproses Watermark & Upload..." : "Simpan Unit Mobil"}
          </button>
        </form>
      </div>
    </div>
  );
}


