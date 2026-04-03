import { supabase } from "@/lib/supabase";
import { HiOutlineArrowLeft, HiOutlineChatBubbleLeftRight, HiOutlineCalendarDays, HiOutlineChartBar, HiOutlineBolt, HiOutlineBuildingStorefront } from "react-icons/hi2";
import Link from "next/link";
import CarGallery from "@/components/CarGallery"; // Kita buat komponen ini

export default async function CarDetail({ params }: { params: Promise<{ slug: string, id: string }> }) {
  const { slug, id } = await params;

  const { data: car } = await supabase
    .from("cars")
    .select(`*, showrooms(*), car_images(*)`)
    .eq("id", id)
    .single();

  if (!car) return <div className="p-20 text-center font-black">Unit Tidak Ditemukan</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-32">
      <nav className="fixed top-6 left-6 z-[60]">
        <Link href={`/${slug}`} className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-slate-100 flex items-center justify-center hover:bg-[#1e293b] hover:text-white transition-all group">
          <HiOutlineArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </Link>
      </nav>

    <div className="w-full h-[70vh] md:h-[85vh] bg-white relative">
    <CarGallery images={car.car_images} />
    </div>

      <main className="max-w-4xl mx-auto px-6 -mt-20 relative z-10">
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-slate-50">
          
          {/* Header & Price */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-50 pb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-[#1e293b] text-white text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest italic">
                  {car.type_car}
                </span>
                {car.status === 'booking' && (
                  <span className="bg-orange-500 text-white text-[9px] font-black px-4 py-1.5 rounded-xl uppercase tracking-widest animate-pulse">
                    Booked
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.9] text-[#1e293b]">
                {car.brand} <br /> {car.model}
              </h1>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 min-w-[240px]">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Harga Penawaran</p>
              <p className="text-4xl font-black text-[#1e293b] italic leading-none">
                Rp {(car.price_cash / 1000000).toFixed(0)}<span className="text-lg text-slate-400 ml-1">Juta</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <HiOutlineCalendarDays size={20}/>, label: "Tahun", val: car.year },
              { icon: <HiOutlineChartBar size={20}/>, label: "Odometer", val: `${car.mileage?.toLocaleString()} KM` },
              { icon: <HiOutlineBolt size={20}/>, label: "Transmisi", val: car.transmission },
              { icon: <HiOutlineBuildingStorefront size={20}/>, label: "Body Type", val: car.type_car },
            ].map((spec, i) => (
              <div key={i} className="group">
                <div className="text-slate-300 group-hover:text-[#10b981] transition-colors mb-3">{spec.icon}</div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{spec.label}</p>
                <p className="text-sm font-black text-[#1e293b] uppercase tracking-tighter italic">{spec.val}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
            <h3 className="text-[10px] font-black text-[#10b981] uppercase tracking-[0.3em]">Spesifikasi & Kondisi</h3>
            <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line text-sm md:text-base">
              {car.description || "Hubungi showroom untuk detail deskripsi unit ini."}
            </p>
            
            <div className="flex flex-wrap gap-2 pt-4">
              {car.tags?.map((tag: string) => (
                <span key={tag} className="text-[8px] font-black text-slate-400 bg-white px-3 py-1.5 rounded-lg uppercase border border-slate-200">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#1e293b]/95 backdrop-blur-2xl rounded-[2.5rem] p-4 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 border border-white/10">
        <div className="pl-4">
          <p className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-0.5">Admin {car.showrooms?.name}</p>
          <p className="text-white text-[10px] font-bold uppercase tracking-tighter">Tanya Ketersediaan Unit</p>
        </div>
        <a 
          href={`https://wa.me{car.showrooms?.whatsapp_number}?text=Halo, saya tertarik dengan ${car.brand} ${car.model} di Showroomly.`}
          className="bg-[#10b981] text-white px-8 py-4 rounded-[1.8rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all flex items-center gap-3 shadow-lg shadow-emerald-500/20"
        >
          <HiOutlineChatBubbleLeftRight size={18} />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
