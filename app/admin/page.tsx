"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HiUserCircle, HiArrowLeftStartOnRectangle, HiCheckBadge, HiEye } from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";

export default function AdminDashboard() {
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          showrooms (
            id,
            name,
            slug,
            whatsapp
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Query Error:", error.message);
        return;
      }

      // Pastikan data showroom tidak null (karena relasi)
      const filteredData = data?.filter(item => item.showrooms !== null) || [];
      setPendingPayments(filteredData);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const openImageModal = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImageUrl("");
  };

  const handleApprove = async (paymentId: string, showroomId: string) => {
    const confirm = window.confirm("Aktifkan showroom ini?");
    if (!confirm) return;

    setLoading(true);
    
    try {
      // Jalankan update secara paralel
      const [resPayment, resShowroom] = await Promise.all([
        supabase.from("payments").update({ status: 'verified' }).eq("id", paymentId),
        supabase.from("showrooms").update({ status: 'active' }).eq("id", showroomId)
      ]);

      if (resPayment.error) throw new Error("Gagal update payment: " + resPayment.error.message);
      if (resShowroom.error) throw new Error("Gagal update showroom: " + resShowroom.error.message);

      alert("Showroom Berhasil Diaktifkan!");
      await fetchPendingPayments(); // Refresh list
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* NAVIGATION BAR */}
<nav className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
  {/* LEFT SIDE: LOGO & BRAND */}
  <div className="flex items-center gap-4">
    <img 
      src="/showroomly.svg" 
      alt="Showroomly" 
      className="h-10 md:h-12 w-auto" 
    />
    <div className="h-6 w-[1px] bg-slate-200 hidden md:block"></div> {/* Separator garis tipis */}
    <h1 className="text-lg md:text-xl font-black text-slate-900 tracking-tight leading-none">
      Admin <span className="text-slate-400 font-bold italic text-sm md:text-base">Portal</span>
    </h1>
  </div>

  {/* RIGHT SIDE: USER MENU DROPDOWN */}
  <div className="relative">
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="text-slate-400 hover:text-primary transition-all flex items-center group bg-slate-50 p-1 rounded-full border border-transparent hover:border-slate-200"
    >
      <HiUserCircle size={38} />
    </button>

    {menuOpen && (
      <>
        {/* Overlay untuk menutup menu saat klik di luar */}
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}></div>
        
        <div className="absolute right-0 top-14 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-20 animate-in fade-in zoom-in duration-200">
          <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
            <p className="text-sm font-black text-slate-700 truncate">Super Admin</p>
          </div>
          
          <div className="p-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-all"
            >
              <HiArrowLeftStartOnRectangle size={20} /> 
              <span>Logout</span>
            </button>
          </div>
        </div>
      </>
    )}
  </div>
</nav>
      {/* CONTENT AREA */}
      <main className="p-8 max-w-5xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-black text-slate-900">Antrean Aktivasi</h2>
          <p className="text-slate-500 mt-1">Review pembayaran manual untuk memberikan akses showroom.</p>
        </div>
        
        <div className="grid gap-4">
          {pendingPayments.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="font-bold text-xl text-slate-800">{p.showrooms.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400 font-mono italic">{new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <h4 className="text-lg text-slate-400 font-mono italic flex items-center gap-2"><span className="text-green-500 flex items-center gap-2"><FaWhatsapp /> {p.showrooms.whatsapp}</span></h4>
                <p className="text-xs text-slate-400 font-mono italic mb-4">{p.showrooms.slug}.showroomly.id</p>
                
                <div className="flex items-center gap-6">
                  <div className="bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider leading-none mb-1">Nominal Unik</p>
                    <p className="text-xl font-black text-emerald-700 leading-none">Rp {p.amount.toLocaleString('id-ID')}</p>
                  </div>
                  {p.proof_url && (
                    <button 
                      onClick={() => openImageModal(p.proof_url)}
                      className="flex items-center gap-2 text-blue-600 text-xs font-bold hover:underline bg-blue-50 px-3 py-2 rounded-xl border border-blue-100 transition-all"
                    >
                      <HiEye size={18} /> Lihat Bukti Transfer
                    </button>
                  )}
                </div>
              </div>

              <button 
                onClick={() => handleApprove(p.id, p.showrooms.id)}
                disabled={loading || !p.proof_url}
                className="bg-slate-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-900 disabled:opacity-50 shadow-lg shadow-slate-200 transition-all flex items-center gap-2 justify-center"
              >
                <HiCheckBadge size={22} /> Approve & Aktifkan
              </button>
            </div>
          ))}

          {pendingPayments.length === 0 && !loading && (
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium italic">Tidak ada pendaftaran pending saat ini.</p>
            </div>
          )}
        </div>
      </main>

      {/* IMAGE MODAL */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={closeImageModal}>
          <div className="relative max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors text-2xl font-bold z-10"
            >
              ✕
            </button>
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={selectedImageUrl}
                alt="Bukti Transfer"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="p-4 bg-slate-50 border-t border-slate-200">
                <p className="text-sm font-bold text-slate-700 text-center">Bukti Transfer</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
