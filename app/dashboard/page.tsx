"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Tambahkan ini
import { HiPlus, HiCamera, HiUserCircle } from "react-icons/hi";

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
  car_images?: { image_url: string; is_main: boolean }[];
};

type Showroom = {
  id: string;
  name: string;
};

export default function ShowroomDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter(); // Inisialisasi router
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

    const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // 1. FUNGSI UPDATE STATUS (Tetap sama)
  const updateStatus = async (e: React.ChangeEvent<HTMLSelectElement>, carId: string) => {
    e.preventDefault();
    const newStatus = e.target.value;
    const { error } = await supabase.from("cars").update({ status: newStatus }).eq("id", carId);
    if (!error) {
      setCars(prev => prev.map(c => c.id === carId ? { ...c, status: newStatus } : c));
    } else {
      alert("Gagal memperbarui status");
    }
  };

  // 2. FUNGSI HAPUS (Tetap sama)
  const handleDelete = async (e: React.MouseEvent, carId: string) => {
    e.preventDefault();
    if (!confirm("Yakin ingin menghapus unit ini dari Showroomly?")) return;
    const { error } = await supabase.from("cars").delete().eq("id", carId);
    if (!error) {
      setCars(prev => prev.filter(c => c.id !== carId));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // PENJAGAAN: Cek Session User
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return router.push("/login"); // Redirect jika tidak ada user
      }

      // Ambil info showroom
      const { data: sh } = await supabase.from("showrooms").select("*").eq("owner_id", user.id).single();

      if (sh) {
        setShowroom(sh);
        const { data: carList } = await supabase
          .from("cars")
          .select(`*, car_images (image_url, is_main)`)       
          .eq("showroom_id", sh.id)
          .order("created_at", { ascending: false });

        setCars((carList as Car[]) || []);
      } else {
        // Jika login tapi tidak punya showroom (bukan owner)
        return router.push("/");
      }
      setLoading(false);
    };
    fetchData();
  }, [router]); // Tambahkan router ke dependency

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500 font-bold italic animate-pulse">Memverifikasi Akses Showroomly...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8" ref={menuRef}>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Katalog Saya</h1>
            <p className="text-slate-500 text-sm">
              Kelola stok di <span className="font-bold">{showroom?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 relative">
            
            {/* BUTTON TAMBAH MOBIL */}
            <Link
              href="/dashboard/add"
              className="bg-primary text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 hover:text-white transition-all shadow-xl"
            >
              <HiPlus /> Tambah Mobil
            </Link>

            {/* USER MENU */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-slate-600 hover:text-slate-900"
            >
              <HiUserCircle size={34} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-12 w-44 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>

              </div>
            )}

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cars.map((car) => {
            const mainImage = car.car_images?.find(img => img.is_main)?.image_url || car.car_images?.[0]?.image_url;

            return (
              <div key={car.id} className="relative group">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
                  
                  <Link href={`/dashboard/car/${car.id}`} className="block relative aspect-video bg-slate-100 overflow-hidden">
                    {mainImage ? (
                      <img src={mainImage} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300"><HiCamera size={40} /></div>
                    )}
                    
                    <div className="absolute top-3 left-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${
                        car.status === 'available' ? 'bg-emerald-500 text-white' : 
                        car.status === 'booking' ? 'bg-orange-500 text-white' : 'bg-slate-700 text-white'
                      }`}>
                        {car.status}
                      </span>
                    </div>
                  </Link>
                  
                  <div className="p-5 flex-grow">
                    <Link href={`/dashboard/car/${car.id}`}>
                      <h3 className="font-bold text-lg text-slate-800 hover:text-primary transition-colors">{car.brand} {car.model}</h3>
                    </Link>
                    <p className="text-xs text-slate-400 mb-3">{car.year} • {car.transmission} • {(car.mileage || 0).toLocaleString()} KM</p>
                    
                    <div className="mb-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Set Status Unit:</label>
                      <select 
                        value={car.status} 
                        onChange={(e) => updateStatus(e, car.id)}
                        className="w-full text-xs p-2 bg-slate-50 border-none rounded-lg font-bold focus:ring-2 focus:ring-primary outline-none"
                      >
                        <option value="available">Available</option>
                        <option value="booking">Booked</option>
                        <option value="sold">Sold Out</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-end pt-4 border-t border-slate-50 mt-auto">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Harga Cash</p>
                        <p className="text-lg font-black text-primary">Rp {(car.price_cash / 1000000).toFixed(0)}jt</p>
                      </div>
                      <button onClick={(e) => handleDelete(e, car.id)} className="text-xs font-bold text-slate-300 hover:text-red-500 transition-colors uppercase">Hapus</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
