"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { HiOutlineSearch, HiLightningBolt, HiArrowRight, HiSparkles, HiCollection } from "react-icons/hi";

export default function LandingPage() {
  const [cars, setCars] = useState<any[]>([]);

  useEffect(() => {
    const fetchCars = async () => {
      const { data } = await supabase
        .from("cars")
        .select(`*, car_images(image_url, is_main)`)
        .eq('status', 'available')
        .limit(6);
      if (data) setCars(data);
    };
    fetchCars();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--showroomly-light)] text-[var(--showroomly-primary)] selection:bg-[var(--showroomly-accent)] selection:text-white">
      {/* --- FLOATING NAVBAR --- */}
      <nav className="fixed top-6 inset-x-0 z-50 max-w-5xl mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-3xl px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {/* <div className="w-8 h-8 bg-[var(--showroomly-primary)] rounded-xl flex items-center justify-center font-black shadow-lg text-white text-xl">S</div> */}
            <img src="/showroomly.svg" alt="Showroomly" className="h-9 w-auto" />
          </div>
          <div className="hidden md:flex gap-8 font-bold text-[10px] uppercase tracking-widest text-slate-400">
            <Link href="#explore" className="hover:text-[var(--showroomly-accent)] transition-colors">Stok</Link>
            <Link href="#" className="hover:text-[var(--showroomly-accent)] transition-colors">Cara Kerja</Link>
          </div>
          <div className="flex gap-4">
          <Link href="/register" className="bg-[var(--showroomly-primary)] text-white px-5 py-2 rounded-2xl font-black text-xs hover:bg-[var(--showroomly-accent)] transition-all active:scale-95">
            Daftar
          </Link>
          <Link href="/dashboard" className="bg-[var(--showroomly-primary)] text-white px-5 py-2 rounded-2xl font-black text-xs hover:bg-[var(--showroomly-accent)] transition-all active:scale-95">
            Masuk Admin
          </Link>
          </div>
        </div>
      </nav>

      {/* --- STARTUP HERO --- */}
      <section className="pt-44 pb-20 px-8 text-center relative overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[var(--showroomly-accent)]/10 blur-[120px] rounded-full -z-10"></div>
        
        <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100 mb-8 animate-bounce">
          <HiSparkles className="text-[var(--showroomly-accent)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cara baru beli mobil bekas</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8 text-[var(--showroomly-primary)]">
          Cari Mobil <br /> <span className="text-[var(--showroomly-accent)] italic">Anti Ribet.</span>
        </h1>
        
        <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium italic">
          Showroomly mendigitalkan pengalaman beli mobil bekas. <br className="hidden md:block" /> 
          Transparan, cepat, dan terpercaya.
        </p>

        {/* SEARCH BAR STARTUP STYLE */}
        <div className="max-w-2xl mx-auto bg-white p-2 rounded-[2.5rem] shadow-2xl flex items-center gap-2 border border-slate-100">
          <div className="flex-1 flex items-center gap-3 px-6">
            <HiOutlineSearch className="text-slate-300" size={24} />
            <input type="text" placeholder="Cari mobil impian Anda..." className="w-full py-4 font-bold text-[var(--showroomly-primary)] placeholder:text-slate-300 border-none outline-none" />
          </div>
          <button className="bg-[var(--showroomly-primary)] text-white px-10 py-4 rounded-[2rem] font-black hover:bg-[var(--showroomly-accent)] transition-all">
            Cari Unit
          </button>
        </div>
      </section>

      {/* --- FRIENDLY FEATURES --- */}
<section className="py-24 px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8" id="explore">

  {/* Card 1 */}
  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group text-center">
    <HiCollection size={42} className="text-[var(--showroomly-accent)] mb-6 mx-auto group-hover:scale-110 transition-transform"/>
    
    <h3 className="text-2xl font-black mb-4 tracking-tight">
      Katalog Digital Instan
    </h3>

    <p className="text-slate-500 leading-relaxed font-medium">
      Kelola semua unit mobil showroom Anda dalam satu katalog online yang rapi, modern, dan mudah diakses pelanggan.
    </p>
  </div>


  {/* Card 2 */}
  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group text-center">
    <HiLightningBolt size={42} className="text-[var(--showroomly-accent)] mb-6 mx-auto group-hover:scale-110 transition-transform"/>
    
    <h3 className="text-2xl font-black mb-4 tracking-tight">
      Kelola Sendiri
    </h3>

    <p className="text-slate-500 leading-relaxed font-medium">
      Tambah unit, edit harga, upload foto, dan update status mobil langsung dari dashboard tanpa perlu bantuan developer.
    </p>
  </div>


  {/* Card 3 CTA */}
  <div className="bg-[var(--showroomly-primary)] p-10 rounded-[2.5rem] shadow-lg flex flex-col justify-center text-center">
    
    <h3 className="text-3xl font-black mb-4 tracking-tight text-white">
      Website Katalog Showroom Anda
    </h3>

    <p className="text-slate-300 leading-relaxed font-medium mb-8">
      Dapatkan halaman katalog dengan subdomain khusus untuk showroom Anda dan mulai tampilkan semua unit secara online.
    </p>

    <Link href="/register" className="bg-[var(--showroomly-accent)] text-white px-6 py-3 rounded-2xl font-bold mx-auto w-fit flex items-center gap-2 hover:gap-4 transition-all">
      Buat Showroom <HiArrowRight />
    </Link>

  </div>

</section>

      {/* --- STARTUP CATALOG PREVIEW --- */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <h2 className="text-5xl font-black tracking-tighter">Unit <span className="text-slate-300">Ready.</span></h2>
          <div className="flex gap-2">
             <div className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 hover:border-[var(--showroomly-accent)] transition-colors">←</div>
             <div className="w-12 h-12 rounded-full bg-[var(--showroomly-primary)] text-white flex items-center justify-center hover:bg-[var(--showroomly-accent)] transition-colors">→</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {cars.map((car) => {
             const img = car.car_images?.find((i:any) => i.is_main)?.image_url || car.car_images?.[0]?.image_url;
             return (
               <Link href={`/car/${car.id}`} key={car.id} className="group relative">
                  <div className="aspect-[4/5] rounded-[3rem] overflow-hidden bg-slate-200 relative mb-6 shadow-xl group-hover:-translate-y-4 transition-all duration-500">
                    <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={car.model} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--showroomly-primary)]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 text-left">
                      <p className="font-black text-2xl">Rp {(car.price_cash / 1000000).toFixed(0)}jt</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--showroomly-accent)]">Lihat Detail Unit</p>
                    </div>
                  </div>
                  <div className="px-4 text-left">
                    <h4 className="text-2xl font-black mb-1 text-[var(--showroomly-primary)]">{car.brand} {car.model}</h4>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{car.year} • {car.transmission} • <span className="text-[var(--showroomly-accent)]">{car.status}</span></p>
                  </div>
               </Link>
             )
          })}
        </div>
      </section>

      {/* --- FRIENDLY FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10 px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
          <div className="max-w-xs">
            <h1 className="text-3xl font-black italic mb-4">Showroomly<span className="text-[var(--showroomly-accent)]">.</span></h1>
            <p className="text-slate-400 font-medium">Platform katalog mobil bekas modern dengan proses transparan dan bersahabat.</p>
          </div>
          <div className="flex gap-10 font-bold text-slate-600">
            <div className="flex flex-col gap-4">
              <span className="text-[var(--showroomly-primary)] uppercase text-[10px] font-black tracking-widest mb-2">Produk</span>
              <Link href="#" className="hover:text-[var(--showroomly-accent)]">Katalog</Link>
              <Link href="#" className="hover:text-[var(--showroomly-accent)]">Promo</Link>
            </div>
            <div className="flex flex-col gap-4">
               <span className="text-[var(--showroomly-primary)] uppercase text-[10px] font-black tracking-widest mb-2">Dukungan</span>
               <Link href="#" className="hover:text-[var(--showroomly-accent)]">FAQ</Link>
               <Link href="#" className="hover:text-[var(--showroomly-accent)]">Kontak</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-slate-300 font-bold text-xs">Build with ❤️ by Showroomly Team.</p>
           <div className="flex gap-6 text-slate-400 font-bold text-xs">
              <Link href="#" className="hover:text-[var(--showroomly-primary)]">Privacy Policy</Link>
              <Link href="#" className="hover:text-[var(--showroomly-primary)]">Terms</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
