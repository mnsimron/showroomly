import { supabase } from "@/lib/supabase";
import { 
  HiOutlineArrowLeft, 
  HiOutlineChatBubbleLeftRight, 
  HiOutlineCalendarDays, 
  HiOutlineChartBar, 
  HiOutlineBolt, 
  HiOutlineBuildingStorefront 
} from "react-icons/hi2";
import Link from "next/link";
import CarGallery from "@/components/CarGallery";

export default async function CarDetail({ params }: { params: Promise<{ slug: string, id: string }> }) {
  const { slug, id } = await params;

  const { data: car } = await supabase
    .from("cars")
    .select(`*, showrooms(*), car_images(*)`)
    .eq("id", id)
    .single();

  if (!car) return (
    <div className="min-h-screen flex items-center justify-center bg-white p-10 text-center font-black italic uppercase tracking-widest text-slate-300">
      Unit Tidak Ditemukan
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-40">
      
      {/* 🔙 BACK NAV - Higher Z-index to stay above gallery */}
      <nav className="fixed top-6 left-6 z-[70]">
        <Link 
          href={`/${slug}`} 
          className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-slate-100 flex items-center justify-center hover:bg-[#1e293b] hover:text-white transition-all group"
        >
          <HiOutlineArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
      </nav>

      {/* 🖼️ INTERACTIVE GALLERY (70-85% Height) */}
      <div className="w-full h-[50vh] md:h-[85vh] bg-white relative">
        <CarGallery images={car.car_images} />
      </div>

      {/* 📝 CONTENT AREA */}
      <main className="max-w-4xl mx-auto px-6 -mt-0 relative z-10">
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-slate-50">
          
          {/* Header & Price Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-5 border-b border-slate-50 pb-5">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#1e293b] text-white text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest italic">
                  {car.type_car || 'Reguler'}
                </span>
                {car.status === 'booking' && (
                  <span className="bg-orange-500 text-white text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest animate-pulse">
                    Unit Booked
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.85] text-[#1e293b]">
                {car.brand} <br /> {car.model}
              </h1>
            </div>

            <div className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 min-w-[260px] shadow-sm">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Harga Penawaran</p>
              <p className="text-4xl font-black text-[#1e293b] italic leading-none">
                Rp {(car.price_cash / 1000000).toFixed(0)}<span className="text-lg text-slate-300 ml-1 not-italic font-bold">Juta</span>
              </p>
            </div>
          </div>

          {/* 📊 SPECS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-5">
            {[
              { icon: <HiOutlineCalendarDays size={22}/>, label: "Tahun", val: car.year },
              { icon: <HiOutlineChartBar size={22}/>, label: "Odometer", val: `${car.mileage?.toLocaleString()} KM` },
              { icon: <HiOutlineBolt size={22}/>, label: "Transmisi", val: car.transmission },
              { icon: <HiOutlineBuildingStorefront size={22}/>, label: "Body Type", val: car.type_car },
            ].map((spec, i) => (
              <div key={i} className="group p-2">
                <div className="text-slate-300 group-hover:text-[#10b981] transition-colors mb-3">{spec.icon}</div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{spec.label}</p>
                <p className="text-sm font-black text-[#1e293b] uppercase tracking-tighter italic leading-none">{spec.val}</p>
              </div>
            ))}
          </div>

          {/* 📄 DESCRIPTION BOX */}
          <div className="space-y-6 bg-slate-50/50 p-8 md:p-10 rounded-[2.5rem] border border-slate-100/50">
            <h3 className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-8 h-[1px] bg-[#10b981]"></span> Deskripsi & Kondisi
            </h3>
            <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line text-sm md:text-base">
              {car.description || "Hubungi showroom untuk detail lengkap mengenai unit ini."}
            </p>
            
            {/* Dynamic Tags */}
            <div className="flex flex-wrap gap-2 pt-6">
              {car.tags?.map((tag: string) => (
                <span key={tag} className="text-[9px] font-black text-slate-400 bg-white px-4 py-2 rounded-xl uppercase border border-slate-100 shadow-sm tracking-tighter">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* 📱 FLOATING ACTION BAR */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-[#1e293b]/95 backdrop-blur-2xl rounded-[2.5rem] p-4 flex items-center justify-between shadow-[0_25px_60px_rgba(0,0,0,0.35)] z-[80] border border-white/10">
        <div className="pl-4">
          <p className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-0.5">Admin {car.showrooms?.name}</p>
          <p className="text-white text-[10px] font-bold uppercase tracking-tighter italic">Cek Stok Sekarang</p>
        </div>
        <a 
          href={`https://wa.me{car.showrooms?.whatsapp_number?.replace(/\D/g, '')}?text=Halo ${car.showrooms?.name}, saya tertarik dengan unit ${car.brand} ${car.model} (${car.year}) yang saya lihat di Showroomly.`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#10b981] text-white px-8 py-4 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all flex items-center gap-3 shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <HiOutlineChatBubbleLeftRight size={18} />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
