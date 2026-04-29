"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { HiChevronLeft, HiChevronRight, HiCalendar, HiLightningBolt, HiTag, HiCash } from "react-icons/hi";
import Link from "next/link";
import { HiOutlineShare } from "react-icons/hi";
import { FaCarSide } from "react-icons/fa6";

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [car, setCar] = useState<any>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<any>({});
  const [showToast, setShowToast] = useState(false);

  // Fungsi helper untuk format Rupiah di tampilan
  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    const fetchCarDetail = async () => {
      const { data, error } = await supabase
        .from("cars")
        .select(`*, car_images (*)`)
        .eq("id", id)
        .single();

      if (data) {
        setCar(data);
        setForm(data);
      } else {
        router.push("/dashboard");
      }
      setLoading(false);
    };
    fetchCarDetail();
  }, [id, router]);

  if (loading) return <div className="p-10 text-center font-bold text-slate-400">Memuat Unit Showroomly...</div>;
  if (!car) return null;

  const images = car.car_images || [];

  const handleUpdate = async () => {
  setLoading(true);

  const { error } = await supabase
      .from("cars")
      .update({
        brand: form.brand,
        type_car: form.type_car || "",
        year: form.year,
        transmission: form.transmission,
        mileage: form.mileage,
        price_cash: form.price_cash,
        price_credit: form.price_credit,
        description: form.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

      if (!error) {
        setCar(form);
        setIsEdit(false);

        setShowToast(true);

        setTimeout(() => {
          setShowToast(false);
        }, 2500);
      }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-6xl mx-auto p-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm mb-6">
          <HiChevronLeft size={20} /> Kembali ke Katalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* KIRI: GALLERY (SLIDESHOW) */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-slate-900 rounded-[2rem] overflow-hidden relative shadow-2xl border-4 border-white">
              {images.length > 0 ? (
                <img 
                  src={images[activeImg].image_url} 
                  className="w-full h-full object-contain"
                  alt={`${car.brand} ${car.model}`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 italic">Foto tidak tersedia</div>
              )}
              
              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <button onClick={() => setActiveImg(prev => prev === 0 ? images.length - 1 : prev - 1)} className="bg-white/10 hover:bg-white/30 backdrop-blur-md p-3 rounded-full text-white transition-all">
                    <HiChevronLeft size={24} />
                  </button>
                  <button onClick={() => setActiveImg(prev => prev === images.length - 1 ? 0 : prev + 1)} className="bg-white/10 hover:bg-white/30 backdrop-blur-md p-3 rounded-full text-white transition-all">
                    <HiChevronRight size={24} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-5 gap-3">
              {images.map((img: any, idx: number) => (
                <button 
                  key={img.id} 
                  onClick={() => setActiveImg(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden border-4 transition-all ${activeImg === idx ? 'border-primary scale-95 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <img src={img.image_url} className="w-full h-full object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>
          </div>
          {/* KANAN: INFO DETAIL */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-3xl lg:rounded-[2rem] p-6 lg:p-8 shadow-sm border border-slate-100">

              {/* HEADER */}
              <div className="flex justify-between items-start mb-6 gap-3">

                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {car.status}
                </span>

                <div className="flex gap-2">
                  {!isEdit ? (
                    <button onClick={() => setIsEdit(true)} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold">
                      Edit
                    </button>
                  ) : (
                    <>
                      <button onClick={() => setIsEdit(false)} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-bold">
                        Batal
                      </button>
                      <button onClick={handleUpdate} className="px-4 py-2 bg-[var(--showroomly-accent)] text-white rounded-xl text-sm font-bold">
                        Simpan
                      </button>
                    </>
                  )}
                </div>

              </div>

              {/* PRICE */}
              <div className="mb-6">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Mulai Dari</p>

                {isEdit ? (
                  <input
                    value={form.price_cash}
                    onChange={(e) => setForm({ ...form, price_cash: e.target.value })}
                    className="text-2xl font-black bg-transparent border-b border-slate-200 focus:outline-none w-full"
                  />
                ) : (
                  <h2 className="text-2xl font-black">
                    {formatIDR(car.price_cash)}
                  </h2>
                )}
              </div>

              {/* TITLE */}
              <div className="mb-6">
                {isEdit ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      className="text-3xl font-black bg-transparent border-b border-slate-200 focus:outline-none w-full"
                    />
                    <input
                      value={form.model}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      className="text-3xl font-black text-primary bg-transparent border-b border-slate-200 focus:outline-none w-full"
                    />
                  </div>
                ) : (
                  <h1 className="text-3xl lg:text-4xl font-black">
                    {car.brand} <span className="text-primary">{car.model}</span>
                  </h1>
                )}
              </div>

              {/* SPECS */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">

                {/* YEAR */}
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <HiCalendar className="mx-auto mb-1 text-primary" />
                  {isEdit ? (
                    <input
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      className="text-xs font-black text-center bg-white w-full border outline-none"
                    />
                  ) : (
                    <span className="text-xs font-black">{car.year}</span>
                  )}
                </div>

                {/* TYPE */}
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <FaCarSide className="mx-auto mb-1 text-primary" />
                  {isEdit ? (
                    <select
                      value={form.type_car || ""}
                      onChange={(e) => setForm({ ...form, type_car: e.target.value })}
                      className="text-xs font-black bg-white w-full border outline-none"
                      name="type_car"
                    >
                    <option>MPV</option>
                    <option>SUV</option>
                    <option>Hatchback</option>
                    <option>City Car</option>
                    <option>Sedan</option>
                    </select>
                  ) : (
                    <span className="text-xs font-black">{car.type_car}</span>
                  )}
                </div>

                {/* TRANSMISSION */}
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <HiLightningBolt className="mx-auto mb-1 text-primary" />
                  {isEdit ? (
                    <select
                      value={form.transmission}
                      onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                      className="text-xs font-black bg-white w-full border outline-none"
                      name="transmission"
                    >
                      <option value="AT">AT</option>
                      <option value="MT">MT</option>
                    </select>
                  ) : (
                    <span className="text-xs font-black uppercase">{car.transmission}</span>
                  )}
                </div>

                {/* KM */}
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <HiTag className="mx-auto mb-1 text-primary" />
                  {isEdit ? (
                    <input
                      value={form.mileage}
                      onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                      className="text-xs font-black text-center bg-white w-full border outline-none"
                    />
                  ) : (
                    <span className="text-xs font-black">
                      {(car.mileage || 0).toLocaleString()} KM
                    </span>
                  )}
                </div>

              </div>

              {/* PRICE DETAIL */}
              <div className="space-y-3 mb-8">

                <div className="flex justify-between p-4 bg-emerald-50 rounded-2xl">
                  <span className="text-sm font-bold text-emerald-700">Harga Cash</span>

                  {isEdit ? (
                    <input
                      value={form.price_cash}
                      onChange={(e) => setForm({ ...form, price_cash: e.target.value })}
                      className="text-right font-bold bg-white border outline-none"
                    />
                  ) : (
                    <span className="font-black text-emerald-700">
                      {formatIDR(car.price_cash)}
                    </span>
                  )}
                </div>

                <div className="flex justify-between p-4 bg-blue-50 rounded-2xl">
                  <span className="text-sm font-bold text-blue-700">Harga Kredit</span>

                  {isEdit ? (
                    <input
                      value={form.price_credit}
                      onChange={(e) => setForm({ ...form, price_credit: e.target.value })}
                      className="text-right font-bold bg-white border outline-none"
                    />
                  ) : (
                    <span className="font-black text-blue-700">
                      {formatIDR(car.price_credit)}
                    </span>
                  )}
                </div>

              </div>

              {/* DESCRIPTION */}
              <div className="border-t pt-6">
                <p className="text-xs font-bold text-slate-400 mb-3">Informasi Kendaraan</p>

                {isEdit ? (
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full p-4 rounded-2xl border"
                    rows={4}
                  />
                ) : (
                  <div className="text-sm whitespace-pre-line bg-slate-50 p-4 rounded-2xl italic">
                    {car.description || "-"}
                  </div>
                )}
              </div>
              <div className="text-sm text-slate-400 mt-4">
                Terakhir diperbarui: {new Date(car.updated_at).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
              </div>

            </div>
          </div>
            {/* Tombol CTA - Tetap di bawah atau Floating di mobile */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg lg:relative lg:bg-transparent lg:p-0 border-t lg:border-0 z-50">
              <button className="w-full bg-green-500 text-white py-4 lg:py-5 rounded-2xl lg:rounded-[1.5rem] font-black text-lg lg:text-xl hover:bg-green-600 transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-3">
                <HiOutlineShare size={24} />
                Hubungi Penjual
              </button>
            </div>
          </div>
        </div>
        {showToast && (
          <div className="fixed top-6 right-6 z-[999] animate-slideIn">
            <div className="bg-[var(--showroomly-primary)] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10">
              
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--showroomly-accent)] text-white font-black">
                ✓
              </div>

              <div>
                <p className="font-bold text-sm">Berhasil!</p>
                <p className="text-xs text-slate-300">Unit mobil diperbaharui</p>
              </div>

            </div>
          </div>
        )}
      </div>
  );
}