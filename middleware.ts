import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // 1. Tentukan domain utama (sesuaikan dengan domain asli Anda)
  const mainDomain = "showroomly.id";
  const vercelDomain = ".vercel.app";

  // 2. Ekstrak subdomain secara dinamis
  let subdomain = "";
  if (hostname.includes(mainDomain)) {
    subdomain = hostname.replace(`.${mainDomain}`, "");
  } else if (hostname.includes(vercelDomain)) {
    // Menangani URL Vercel: xxx.vercel.app -> ambil 'xxx' sebagai subdomain
    subdomain = hostname.replace(vercelDomain, "");
  } else {
    // Menangani localhost:3000
    subdomain = hostname.replace(`.localhost:3000`, "");
  }

  // 3. Bersihkan subdomain dari string tambahan (seperti port atau www)
  subdomain = subdomain.replace("www.", "").split(":")[0];

  // 4. Daftar pengecualian (Domain utama / Root)
  // Tambahkan nama project Vercel Anda di sini jika tanpa subdomain
  const rootDomains = [
    "showroomly", 
    "localhost", 
    "www", 
    "", 
    "showroomly-nine", // Ganti dengan nama project vercel Anda
    mainDomain.replace('.id', '')
  ];

  // Jika ini adalah domain utama, jangan di-rewrite
  if (rootDomains.includes(subdomain)) {
    return NextResponse.next();
  }

  // 5. Pengecualian file statis dan API (Sangat Penting untuk PWA & Next.js)
  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname.includes('.') 
  ) {
    return NextResponse.next();
  }

  // 6. Rewrite secara internal ke folder /[slug]
  // Contoh: limo-motor.showroomly.id/katalog -> /limo-motor/katalog
  return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
}
