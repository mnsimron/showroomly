import { supabase } from "@/lib/supabase";
import { Metadata } from "next";
import { 
  HiOutlineChatBubbleLeftRight, 
  HiOutlineMapPin, 
  HiChevronRight, 
  HiOutlineSparkles 
} from "react-icons/hi2";
import Link from "next/link";

// 1. DYNAMIC METADATA (Untuk SEO & Social Media Preview)
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  const { data: showroom } = await supabase
    .from("showrooms")
    .select("name, logo_url")
    .eq("slug", slug)
    .maybeSingle();

  return {
    title: showroom ? `${showroom.name} | Showroomly` : "Showroom Tidak Ditemukan",
    description: `Lihat katalog mobil bekas berkualitas di ${showroom?.name || 'Showroomly'}.`,
    openGraph: {
      images: showroom?.logo_url ? [showroom.logo_url] : [],
    },
  };
}

// 1. Tambahkan SearchParams ke Props Page
export default async function PublicCatalog({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ type?: string }> 
}) {
  const { slug } = await params;
  const { type } = await searchParams; // Ambil filter dari URL

  // 2. Ambil data showroom
  const { data: showroom } = await supabase
    .from("showrooms")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!showroom) return <div>404</div>;

  // 3. Modifikasi Query Supabase agar dinamis
  let query = supabase
    .from("cars")
    .select(`*, car_images(image_url, is_main)`)
    .eq("showroom_id", showroom.id)
    .in("status", ["available", "booking"]);

  // Jika ada filter type di URL, tambahkan filter ke query
  if (type && type !== 'Semua Unit') {
    query = query.eq("type_car", type);
  }

  const { data: cars } = await query.order("created_at", { ascending: false });

  // List kategori sesuai database Anda
  const categories = ['Semua Unit', 'SUV', 'Sedan', 'MPV', 'Hatchback', 'City Car'];


  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-[#1e293b]">
      
      {/* 💎 PREMIUM HEADER */}
      <header className="bg-white/80 backdrop-blur-2xl sticky top-0 z-50 px-6 py-6 flex flex-col items-center border-b border-slate-100 shadow-sm">
        {showroom.logo_url ? (
          <img 
            src={showroom.logo_url} 
            alt={showroom.name} 
            className="h-12 md:h-16 w-auto object-contain mb-3" 
          />
        ) : (
          <div className="h-12 w-12 bg-slate-900 rounded-2xl mb-3 flex items-center justify-center text-white font-black text-xl italic">
            {showroom.name.charAt(0)}
          </div>
        )}
        {/* <h1 className="text-xl md:text-2xl font-black tracking-tighter uppercase italic leading-none">
          {showroom.name}
        </h1> */}
        <div className="flex items-center gap-1.5 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <HiOutlineMapPin className="text-[#10b981]" size={14} /> 
          {showroom.address || "Indonesia"}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 overflow-x-auto no-scrollbar flex gap-3">
        {categories.map((filter) => {
          const isActive = (type === filter) || (!type && filter === 'Semua Unit');
          
          return (
            <Link 
              key={filter}
              href={filter === 'Semua Unit' ? `/${slug}` : `/${slug}?type=${filter}`}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border inline-block
                ${isActive 
                  ? "bg-[#1e293b] text-white border-[#1e293b] shadow-lg shadow-slate-200 scale-105" 
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-600"
                }`}
            >
              {filter}
            </Link>
          );
        })}
      </div>

    <main className="max-w-7xl mx-auto px-6 pb-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {(!cars || cars.length === 0) ? (
        <div className="col-span-full py-20 flex flex-col items-center text-center animate-fade-in">
          {/* Icon Minimalis dengan Efek Glassmorphism */}
          <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#f1f5f9] rounded-full scale-110 opacity-50"></div>
            <div className="absolute inset-0 bg-white rounded-full shadow-xl border border-slate-100 flex items-center justify-center">
              <HiOutlineSparkles size={48} className="text-slate-200" />
            </div>
            {/* Dekorasi Aksen */}
            <div className="absolute -top-2 -right-2 bg-[#10b981] w-4 h-4 rounded-full animate-ping"></div>
          </div>

          <h3 className="text-2xl font-black text-[#1e293b] uppercase italic tracking-tighter leading-none mb-3">
            Unit {type && type !== 'Semua Unit' ? type : ''} Belum Tersedia
          </h3>
          
          <p className="max-w-xs text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed mb-10">
            Katalog sedang diperbarui atau unit pilihan Anda sudah terjual. Hubungi admin untuk antrean unit masuk.
          </p>

          {/* Action Button untuk Konversi */}
          <div className="flex flex-col md:flex-row gap-4">
            <a 
              href={`https://wa.me${showroom.whatsapp_number}?text=Halo ${showroom.name}, saya mencari unit ${type || 'mobil'} yang belum ada di katalog. Bisa info jika ada unit masuk?`}
              target="_blank"
              className="bg-[#1e293b] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#10b981] transition-all shadow-xl shadow-slate-200 flex items-center gap-3"
            >
              <HiOutlineChatBubbleLeftRight size={18} />
              Tanyakan Unit
            </a>
            
            {type && type !== 'Semua Unit' && (
              <a 
                href={`/${slug}`}
                className="bg-white text-slate-400 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:text-slate-900 transition-all"
              >
                Lihat Semua Unit
              </a>
            )}
          </div>
        </div>
      ) : (
        cars.map((car: any) => {
          const mainImg = car.car_images?.find((i: any) => i.is_main)?.image_url || car.car_images?.[0]?.image_url;
          
          return (
            <Link 
            href={`/${slug}/${car.id}`}
            key={car.id} className="group bg-white rounded-[2.5rem] p-3 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 flex flex-col h-full">
            
            <div className="aspect-[4/3] rounded-[2rem] bg-slate-50 overflow-hidden relative border border-slate-50">
                <img 
                src={mainImg || "/placeholder-car.jpg"} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                alt={`${car.brand} ${car.model}`}
                />
                
                {car.status === 'booking' && (
                <div className="absolute top-3 left-3 bg-[#10b981] text-white text-[7px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-lg z-10 animate-pulse">
                    Booked
                </div>
                )}

                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#1e293b] text-[7px] font-black px-3 py-1 rounded-lg uppercase tracking-widest border border-slate-100 shadow-sm">
                {car.type_car || 'Unit'}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute bottom-4 right-4 bg-white text-[#1e293b] p-3 rounded-2xl shadow-xl translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 group-hover:bg-[#10b981] group-hover:text-white">
                <HiChevronRight size={20} />
                </div>
            </div>
            
            {/* 📝 INTEGRATED INFO AREA */}
            <div className="mt-5 px-3 pb-3 flex flex-col flex-1">
                
                {/* Price Section (Sekarang di bawah gambar, lebih bersih) */}
                <div className="mb-3">
                <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Harga Cash</p>
                <p className="text-xl font-black text-[#1e293b] leading-none italic tracking-tighter">
                    Rp {(car.price_cash / 1000000).toFixed(0)}<span className="text-sm ml-0.5 uppercase not-italic text-slate-400">Jt</span>
                </p>
                </div>

                {/* <div className="h-[1px] w-full bg-slate-50 mb-4" /> */}
                
                <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-base font-black text-[#1e293b] leading-tight uppercase tracking-tighter italic group-hover:text-[#10b981] transition-colors">
                    {car.brand} {car.model}
                </h3>
                <HiOutlineSparkles className="text-[#10b981] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                </div>
                
                {/* Spec Row */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 items-center mb-5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{car.year}</span>
                <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{car.transmission}</span>
                <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    {car.mileage?.toLocaleString()} KM
                </span>
                </div>

                {/* Tags (Push to bottom) */}
                <div className="flex flex-wrap gap-1.5 mt-auto">
                {car.tags?.slice(0, 3).map((tag: string) => (
                    <span key={tag} className="text-[8px] font-black text-[#10b981] bg-emerald-50 px-2.5 py-1.5 rounded-lg uppercase tracking-tighter border border-emerald-100/50">
                    #{tag}
                    </span>
                ))}
                </div>
            </div>
            </Link>
            
          )
        })
      )}
    </main>

      {/* 📱 FLOATING CTA - DESIGN MODERN STARTUP */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-md px-6 py-4 bg-[#1e293b]/95 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 flex items-center justify-between border border-white/10">
         <div className="flex flex-col">
           <p className="text-[#10b981] text-[8px] font-black uppercase tracking-[0.2em] mb-0.5">Showroom Resmi</p>
           <p className="text-white text-xs font-bold tracking-tight uppercase">{showroom.name}</p>
         </div>
         
         <a 
           href={`https://wa.me${showroom.whatsapp_number?.replace(/\D/g, '')}?text=Halo ${showroom.name}, saya melihat katalog Anda di Showroomly dan tertarik dengan salah satu unit.`} 
           target="_blank"
           rel="noopener noreferrer"
           className="bg-[#10b981] hover:bg-[#0da371] text-white px-6 py-3 rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
         >
           <HiOutlineChatBubbleLeftRight size={20} />
           <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
         </a>
      </div>
    </div>
  );
}
