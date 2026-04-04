"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiPlus, HiCamera, HiUserCircle, HiTrash, HiOutlineLogout, HiCog } from "react-icons/hi";

// ... (Type definitions tetap sama)
interface CarImage {
  id: string;
  image_url: string;
  is_main: boolean;
}

interface Car {
  id: string;
  showroom_id: string;
  brand: string;
  model: string;
  year: number;
  transmission: string;
  mileage: number;
  price_cash: number;
  status: "available" | "booking" | "sold";
  car_images?: CarImage[];
}

interface Showroom {
  id: string;
  owner_id: string;
  name: string;
  status: "active" | "pending" | "inactive";
  logo_url?: string | null;
}

export default function ShowroomDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu saat klik luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const fetchShowroom = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { data, error } = await supabase
      .from("showrooms")
      .select("*")
      .eq("owner_id", user.id)
      .single();
    
    if (error) {
      setError("Failed to load showroom data");
      setLoading(false);
      return;
    }
    
    setShowroom(data);

    if (data && !data.logo_url) {
      setLogoError("Anda belum upload logo untuk watermark. Silahkan ke settings dan upload logo showroom Anda.");
      setLogoModalOpen(true);
    }

    return data;
  };

  const fetchCars = async (showroomId: string) => {
    const { data, error } = await supabase
      .from("cars")
      .select(`*, car_images(image_url, is_main)`)
      .eq("showroom_id", showroomId);
    
    if (error) {
      setError("Failed to load cars data");
      setLoading(false);
      return;
    }
    
    setCars(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      const showroomData = await fetchShowroom();
      if (showroomData) {
        await fetchCars(showroomData.id);
      }
    };
    loadData();
  }, [router]);

  const updateStatus = async (e: React.ChangeEvent<HTMLSelectElement>, carId: string) => {
    const newStatus = e.target.value as "available" | "booking" | "sold";
    
    const { error } = await supabase
      .from("cars")
      .update({ status: newStatus })
      .eq("id", carId);
    
    if (error) {
      setError("Failed to update car status");
      return;
    }
    
    // Update local state
    setCars(prev => prev.map(car => 
      car.id === carId ? { ...car, status: newStatus } : car
    ));
  };

  const handleDelete = async (carId: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return;
    
    const { error } = await supabase
      .from("cars")
      .delete()
      .eq("id", carId);
    
    if (error) {
      setError("Failed to delete car");
      return;
    }
    
    // Update local state
    setCars(prev => prev.filter(car => car.id !== carId));
  };
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Stok</h1>
            <p className="text-slate-500 text-sm font-medium">
              Dashboard <span className="text-primary font-bold">{showroom?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 relative" ref={menuRef}>
            <Link
              href="/dashboard/add"
              onClick={(e) => {
                if (!showroom?.logo_url) {
                  e.preventDefault();
                  setLogoError("Anda belum upload logo untuk watermark. Silahkan ke settings dan upload logo showroom Anda.");
                  setLogoModalOpen(true);
                }
              }}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-700 transition-all shadow-lg text-sm"
            >
              <HiPlus /> Tambah Unit
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-slate-400 hover:text-slate-900 transition-colors"
            >
              <HiUserCircle size={42} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                <div className="p-2">
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
                    <HiCog size={18} className="text-slate-400" /> Settings
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <HiOutlineLogout size={18} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="float-right ml-4 font-bold hover:text-red-900"
            >
              ×
            </button>
          </div>
        )}

        {logoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setLogoModalOpen(false)}>
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl border border-slate-200 p-6" onClick={(event) => event.stopPropagation()}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Logo Showroom Belum Tersedia</h2>
                    <p className="text-sm text-slate-500 mt-1">Watermark belum dapat dibuat tanpa logo showroom.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogoModalOpen(false)}
                    className="text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    ×
                  </button>
                </div>

                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
                  {logoError}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setLogoModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoModalOpen(false);
                      router.push('/dashboard/settings');
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-700 transition-colors"
                  >
                    Buka Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="text-center py-32">
            <p className="text-slate-500 font-medium">Memuat data...</p>
          </div>
        )}

        {/* GRID UNIT MOBIL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car) => {
            const mainImage = car.car_images?.find(img => img.is_main)?.image_url || car.car_images?.[0]?.image_url;

            return (
              <div key={car.id} onClick={() => router.push(`/dashboard/car/${car.id}`)} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 cursor-pointer">
                
                {/* IMAGE AREA */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  {mainImage ? (
                    <img src={mainImage} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300"><HiCamera size={48} /></div>
                  )}
                  
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                      car.status === 'available' ? 'bg-emerald-500 text-white' : 
                      car.status === 'booking' ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {car.status}
                    </span>
                  </div>
                </div>
                
                {/* INFO AREA */}
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="font-black text-xl text-slate-800 leading-tight mb-1">{car.brand} {car.model}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-5">{car.year} • {car.transmission} • {(car.mileage || 0).toLocaleString()} KM</p>
                  
                  <div className="space-y-4 mt-auto">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Status Stok</label>
                      <select 
                        value={car.status} 
                        onChange={(e) => updateStatus(e, car.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-xs font-bold p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-slate-200 transition-all outline-none"
                      >
                        <option value="available">Ready Stock</option>
                        <option value="booking">Booked</option>
                        <option value="sold">Sold Out</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <div>
                        <p className="text-lg font-black text-slate-900 italic">Rp {((car.price_cash || 0) / 1000000).toFixed(0)}jt</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(car.id); }} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <HiTrash size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* EMPTY STATE */}
        {cars.length === 0 && !loading && (
          <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <p className="text-slate-300 font-bold italic tracking-tight">Katalog Anda masih kosong.</p>
             <Link 
              href="/dashboard/add"
              onClick={(e) => {
                if (!showroom?.logo_url) {
                  e.preventDefault();
                  setLogoError("Anda belum upload logo untuk watermark. Silahkan ke settings dan upload logo showroom Anda.");
                  setLogoModalOpen(true);
                }
              }}
              className="text-primary text-xs font-black underline mt-2 inline-block">Klik untuk tambah unit pertama</Link>
          </div>
        )}
      </div>
    </div>
  );
}
