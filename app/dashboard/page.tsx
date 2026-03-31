"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { HiPlus, HiCamera } from "react-icons/hi";

type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  mileage: number;
  tags?: string[];
  status: string;
  price_cash: number;
};

type Showroom = {
  id: string;
  name: string;
};

export default function ShowroomDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showroom, setShowroom] = useState<Showroom | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Ambil info showroom
      const { data: sh } = await supabase
        .from("showrooms")
        .select("*")
        .eq("owner_id", user?.id)
        .single();

      if (sh) {
        setShowroom(sh);

        // 2. Ambil list mobil
        const { data: carList } = await supabase
          .from("cars")
          .select("*")
          .eq("showroom_id", sh.id)
          .order("created_at", { ascending: false });

        setCars((carList as Car[]) || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <p className="text-slate-500">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Dashboard */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Katalog Saya</h1>
            <p className="text-slate-500 text-sm">Kelola stok mobil di <span className="font-bold">{showroom?.name}</span></p>
          </div>
          <Link href="/dashboard/add" className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-all shadow-lg">
            <HiPlus /> Tambah Mobil
          </Link>
        </div>

        {/* Grid Katalog */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden group">
              <div className="aspect-video bg-slate-100 relative overflow-hidden">
                {/* Nanti di sini foto utama mobil */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                  <HiCamera size={40} />
                </div>
                <div className="absolute top-3 left-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${car.status === 'available' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                    {car.status}
                  </span>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-800">{car.brand} {car.model}</h3>
                <p className="text-xs text-slate-400 mb-3">{car.year} • {car.transmission} • {car.mileage.toLocaleString()} KM</p>
                
                <div className="flex gap-1 mb-4 flex-wrap">
                  {car.tags?.map((tag: string) => (
                    <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded italic">{tag}</span>
                  ))}
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Harga Cash</p>
                    <p className="text-lg font-black text-primary">Rp {(car.price_cash / 1000000).toFixed(0)}jt</p>
                  </div>
                  <button className="text-xs font-bold text-slate-400 hover:text-red-500">Hapus</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cars.length === 0 && !loading && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
             <p className="text-slate-400 font-medium italic">Belum ada mobil yang diupload.</p>
          </div>
        )}
      </div>
    </div>
  );
}
