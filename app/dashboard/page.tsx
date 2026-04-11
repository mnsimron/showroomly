"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiPlus, HiCamera, HiUserCircle, HiTrash, HiOutlineLogout, HiCog, HiEye } from "react-icons/hi";

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
  slug: string;
}

export default function ShowroomDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  

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

const openDeleteModal = (carId: string) => {
  setSelectedCarId(carId);
  setDeleteModalOpen(true);
};

const confirmDelete = async () => {
  if (!selectedCarId) return;

  const { error } = await supabase
    .from("cars")
    .delete()
    .eq("id", selectedCarId);

  if (error) {
    setError("Failed to delete car");
    return;
  }

  setCars(prev => prev.filter(car => car.id !== selectedCarId));
  setDeleteModalOpen(false);
  setSelectedCarId(null);
};
  if (loading && !error)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600">

      <div className="relative w-72 h-32 flex items-end justify-center">

        <div
          className="relative w-56 h-20"
          style={{ animation: "drift 2s ease-in-out infinite" }}
        >

          <div className="absolute bottom-4 w-full h-12 bg-[var(--showroomly-accent)] rounded-full shadow-lg"></div>

          {/* ROOF */}
          <div className="absolute bottom-12 left-16 w-24 h-8 bg-[var(--showroomly-accent)] rounded-t-3xl"></div>

          {/* WINDOWS */}
          <div className="absolute bottom-14 left-20 w-7 h-5 bg-white rounded opacity-80"></div>
          <div className="absolute bottom-14 left-29 w-7 h-5 bg-white rounded opacity-80"></div>

          {/* HEADLIGHT */}
          <div className="absolute bottom-8 right-0 w-3 h-3 bg-yellow-300 rounded-full blur-[1px]"></div>
          {/* HEADLIGHT */}
          <div className="absolute bottom-8 left-1 w-4 h-4 bg-red-600 rounded-none blur-[1px]"></div>


          {/* WHEEL LEFT */}
          <div
            className="absolute bottom-0 left-12 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <div className="absolute w-4 h-[2px] bg-white rounded"></div>
            <div className="absolute h-4 w-[2px] bg-white rounded"></div>
          </div>

          {/* WHEEL RIGHT */}
          <div
            className="absolute bottom-0 right-12 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <div className="absolute w-4 h-[2px] bg-white rounded"></div>
            <div className="absolute h-4 w-[2px] bg-white rounded"></div>
          </div>

        </div>

      </div>

      {/* TEXT */}
      <div className="mt-8 text-center">
        <div className="text-lg font-semibold">Mempersiapkan Akses...</div>
        <p className="mt-2 text-sm text-slate-500">
          Sedang menyalakan mesin dan memeriksa session.
        </p>
      </div>

      <style jsx>{`

        @keyframes drift {
          0% {
            transform: translateX(0) rotate(0deg);
          }
          30% {
            transform: translateX(10px) rotate(2deg);
          }
          60% {
            transform: translateX(-8px) rotate(-2deg);
          }
          100% {
            transform: translateX(0) rotate(0deg);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

      `}</style>
    </div>
  );

return (
  
  <div className="min-h-screen bg-slate-50 p-3 md:p-8">
    <div className="max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex items-start justify-between mb-6 md:mb-10">

        {/* LEFT */}
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
            Katalog Stok
          </h1>
          <p className="text-slate-500 text-xs md:text-sm font-medium">
            Dashboard <span className="text-primary font-bold">{showroom?.name}</span>
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 relative" ref={menuRef}>

          {/* TOGGLE VIEW */}
          <button
            onClick={() => setViewMode(prev => prev === "grid" ? "list" : "grid")}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
          >
            {viewMode === "grid" ? "LIST" : "CARD"}
          </button>

          {/* ADD */}
          <Link
            href="/dashboard/add"
            onClick={(e) => {
              if (!showroom?.logo_url) {
                e.preventDefault();
                setLogoError("Anda belum upload logo untuk watermark. Silahkan ke settings dan upload logo showroom Anda.");
                setLogoModalOpen(true);
              }
            }}
            className="bg-slate-900 text-white px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1"
          >
            <HiPlus />Tambah Unit
          </Link>

          {/* USER */}
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <HiUserCircle size={34} className="text-slate-500" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 z-50">
              <div className="p-2">
                <Link href={`/${showroom?.slug}`} target="_blank" className="flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-slate-50 rounded-xl">
                  <HiEye size={16} /> Customer View
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-xs font-bold hover:bg-slate-50 rounded-xl">
                  <HiCog size={16} /> Settings
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl">
                  <HiOutlineLogout size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ERROR MESSAGE */} {error && ( <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium"> {error} <button onClick={() => setError(null)} className="float-right ml-4 font-bold hover:text-red-900" > × </button> </div> )}
      {logoModalOpen && ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setLogoModalOpen(false)}> <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl border border-slate-200 p-6" onClick={(event) => event.stopPropagation()}> <div className="flex flex-col gap-4"> <div className="flex items-center justify-between gap-4"> <div> <h2 className="text-lg font-black text-slate-900">Logo Showroom Belum Tersedia</h2> <p className="text-sm text-slate-500 mt-1">Watermark belum dapat dibuat tanpa logo showroom.</p> </div> <button type="button" onClick={() => setLogoModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors" > × </button> </div> <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600"> {logoError} </div> <div className="flex justify-end gap-3 pt-2"> <button type="button" onClick={() => setLogoModalOpen(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors" > Tutup </button> <button type="button" onClick={() => { setLogoModalOpen(false); router.push('/dashboard/settings'); }} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-700 transition-colors" > Buka Settings </button> </div> </div> </div> </div> )}

      {/* GRID / LIST */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {cars.map((car) => {
            const mainImage =
              car.car_images?.find(img => img.is_main)?.image_url ||
              car.car_images?.[0]?.image_url;

            return (
              <div
                key={car.id}
                onClick={() => router.push(`/dashboard/car/${car.id}`)}
                className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col active:scale-[0.98] transition cursor-pointer"
              >
                {/* IMAGE */}
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  {mainImage ? (
                    <img src={mainImage} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <HiCamera size={36} />
                    </div>
                  )}

                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                      car.status === 'available'
                        ? 'bg-emerald-500 text-white'
                        : car.status === 'booking'
                        ? 'bg-orange-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {car.status}
                    </span>
                  </div>
                </div>

                {/* INFO */}
                <div className="p-4 md:p-6 flex flex-col flex-grow">
                  <h3 className="font-black text-base md:text-xl text-slate-800">
                    {car.brand} {car.model}
                  </h3>

                  <p className="text-[10px] md:text-xs text-slate-400 font-bold mb-3">
                    {car.year} • {car.transmission} • {(car.mileage || 0).toLocaleString()} KM
                  </p>

                  <div className="space-y-3 mt-auto">

                    <select
                      value={car.status}
                      onChange={(e) => updateStatus(e, car.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-[11px] md:text-xs font-bold p-2 bg-slate-50 rounded-xl"
                    >
                      <option value="available">Ready</option>
                      <option value="booking">Booked</option>
                      <option value="sold">Sold</option>
                    </select>

                    <div className="flex justify-between items-center pt-2 border-t">
                      <p className="text-sm md:text-lg font-black">
                        Rp {((car.price_cash || 0) / 1000000).toFixed(0)}jt
                      </p>

                      <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(car.id);
                      }}
                        className="text-slate-300 hover:text-red-500"
                      >
                        <HiTrash size={18} />
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (

        <div className="flex flex-col gap-3">
          {cars.map((car) => {
            const mainImage =
              car.car_images?.find(img => img.is_main)?.image_url ||
              car.car_images?.[0]?.image_url;

            return (
              <div
                key={car.id}
                onClick={() => router.push(`/dashboard/car/${car.id}`)}
                className="flex bg-white rounded-2xl border overflow-hidden active:scale-[0.98] transition cursor-pointer"
              >
                {/* IMAGE */}
                <div className="w-32 h-28 bg-slate-100">
                  {mainImage ? (
                    <img src={mainImage} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-300">
                      <HiCamera />
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="flex-1 p-3 flex flex-col justify-between">

                  <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-800">
                      {car.brand} {car.model}
                    </h3>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase whitespace-nowrap ${
                      car.status === 'available'
                        ? 'bg-emerald-500 text-white'
                        : car.status === 'booking'
                        ? 'bg-orange-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                      {car.status}
                    </span>
                  </div>
                    <p className="text-[10px] text-slate-400">
                      {car.year} • {car.transmission}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {(car.mileage || 0).toLocaleString()} KM
                    </p>
                  </div>
                  <div className="my-1">
                    <select
                      value={car.status}
                      onChange={(e) => updateStatus(e, car.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-[11px] md:text-xs font-bold px-2 py-1.5 bg-slate-100 rounded-lg outline-none"
                    >
                      <option value="available">Ready</option>
                      <option value="booking">Booked</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-black">
                      Rp {((car.price_cash || 0) / 1000000).toFixed(0)}jt
                    </p>

                    <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(car.id);
                    }}
                      className="text-slate-300 hover:text-red-500"
                    >
                      <HiTrash size={16} color="red" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      )}

      {/* EMPTY */}
      {cars.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed">
          <p className="text-slate-300 font-bold italic text-sm">
            Katalog Anda masih kosong.
          </p>
          <Link href="/dashboard/add" className="text-primary text-xs font-black underline mt-2 inline-block">
            Tambah unit pertama
          </Link>
        </div>
      )}

    </div>
    {deleteModalOpen && (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => setDeleteModalOpen(false)}
    >
      <div 
        className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-black text-slate-900 mb-2">
          Hapus Unit
        </h2>

        <p className="text-sm text-slate-500 mb-6">
          Apakah Anda yakin ingin menghapus unit ini?
        </p>

        <div className="flex gap-3">
          
          {/* BATAL */}
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold text-sm"
          >
            Batal
          </button>

          {/* YAKIN */}
          <button
            onClick={confirmDelete}
            className="flex-1 py-2 rounded-xl bg-emerald-500 text-white font-bold text-sm"
          >
            Yakin
          </button>

        </div>
      </div>
    </div>
)}
  </div>
);
}
