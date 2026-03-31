"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    // Kita ambil data showroom yang statusnya 'pending' tapi sudah ada payment-nya
    const { data } = await supabase
      .from("payments")
      .select(`
        *,
        showrooms!inner(id, name, slug, owner_id)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (data) setPendingPayments(data);
    setLoading(false);
  };

  const handleApprove = async (paymentId: string, showroomId: string) => {
    const confirm = window.confirm("Aktifkan showroom ini?");
    if (!confirm) return;

    setLoading(true);
    
    // 1. Update status pembayaran jadi verified
    await supabase.from("payments").update({ status: 'verified' }).eq("id", paymentId);

    // 2. Update status showroom jadi active
    const { error } = await supabase
      .from("showrooms")
      .update({ status: 'active' })
      .eq("id", showroomId);

    if (!error) {
      alert("Showroom Berhasil Diaktifkan!");
      fetchPendingPayments();
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black text-slate-900 mb-8">Admin Showroomly</h1>
        
        <div className="grid gap-4">
          {pendingPayments.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-800">{p.showrooms.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{p.showrooms.slug}.showroomly.id</p>
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-emerald-600 font-bold">Rp {p.amount.toLocaleString('id-ID')}</span>
                  {p.proof_url && (
                    <a href={p.proof_url} target="_blank" className="text-blue-600 text-xs font-bold hover:underline italic">
                      Lihat Bukti Transfer →
                    </a>
                  )}
                </div>
              </div>

              <button 
                onClick={() => handleApprove(p.id, p.showrooms.id)}
                disabled={loading || !p.proof_url}
                className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-700 disabled:opacity-30 transition-all"
              >
                {loading ? "Proses..." : "Approve & Aktifkan"}
              </button>
            </div>
          ))}

          {pendingPayments.length === 0 && !loading && (
            <p className="text-center text-slate-400 py-20 italic">Tidak ada antrean pendaftaran baru.</p>
          )}
        </div>
      </div>
    </div>
  );
}
