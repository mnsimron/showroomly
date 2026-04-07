import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { headers } from 'next/headers';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // 🔥 PERBAIKAN: Tambahkan await pada headers()
  const headerList = await headers();
  const host = headerList.get('host') || '';
  
  // Ambil bagian pertama subdomain
  const subdomain = host.split('.')[0];

  // Ambil data showroom
  const { data: showroom } = await supabase
    .from("showrooms")
    .select("name, logo_url")
    .eq("slug", subdomain)
    .maybeSingle();

  return {
    name: showroom?.name || 'Showroomly Catalog',
    short_name: showroom?.name || 'Showroomly',
    description: `Katalog mobil bekas resmi dari ${showroom?.name}`,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e293b',
    icons: [
      {
        src: showroom?.logo_url || '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
