"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { HiChevronLeft, HiChevronRight, HiCalendar, HiLightningBolt, HiTag, HiCash } from "react-icons/hi";
import Link from "next/link";
import { HiOutlineShare } from "react-icons/hi";

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [car, setCar] = useState<any>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);

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
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-200">
                  {car.status}
                </span>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Mulai Dari</p>
                  <h2 className="text-3xl font-black text-slate-900 leading-none">{formatIDR(car.price_cash)}</h2>
                </div>
              </div>
              
              <h1 className="text-4xl font-black text-slate-800 leading-tight mb-6">
                {car.brand} <span className="text-primary">{car.model}</span>
              </h1>
              
              {/* Grid Spek Singkat */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                  <HiCalendar className="text-primary mb-1" size={20} />
                  <span className="text-xs font-black text-slate-800">{car.year}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                  <HiLightningBolt className="text-primary mb-1" size={20} />
                  <span className="text-xs font-black text-slate-800 uppercase">{car.transmission}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center border border-slate-100">
                  <HiTag className="text-primary mb-1" size={20} />
                  <span className="text-[10px] font-black text-slate-800">{(car.mileage || 0).toLocaleString()} KM</span>
                </div>
              </div>

              {/* Detail Harga & Pembayaran */}
              <div className="space-y-3 mb-8">
                <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-sm font-bold text-emerald-700">Harga Cash</span>
                  <span className="text-lg font-black text-emerald-700">{formatIDR(car.price_cash)}</span>
                </div>
                {car.price_credit > 0 && (
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <span className="text-sm font-bold text-blue-700">Harga Kredit</span>
                    <span className="text-lg font-black text-blue-700">{formatIDR(car.price_credit)}</span>
                  </div>
                )}
              </div>

              {/* Deskripsi */}
              <div className="border-t border-slate-100 pt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Informasi Kendaraan</p>
                <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-5 rounded-2xl italic">
                  {car.description || "Penjual belum memberikan deskripsi lengkap."}
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mt-6 flex-wrap">
                {car.tags?.map((t: string) => (
                  <span key={t} className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">{t}</span>
                ))}
              </div>
            </div>
                        <button className="w-full bg-green-500 text-white py-5 rounded-[1.5rem] font-black text-xl hover:bg-green-600 transition-all shadow-2xl shadow-green-500/30 flex items-center justify-center gap-3">
                          <HiOutlineShare size={24} />
                          Bagikan Katalog ke WhatsApp
                        </button>
          </div>
        </div>
      </div>
    </div>
  );
}
