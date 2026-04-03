import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Deteksi subdomain (contoh: limo-motor)
  const subdomain = process.env.NODE_ENV === 'production'
    ? hostname.replace(`.showroomly.id`, '')
    : hostname.replace(`.localhost:3000`, '');

  // Jika domain utama, jangan di-rewrite
  if (['showroomly', 'localhost:3000', 'www', ''].includes(subdomain)) {
    return NextResponse.next();
  }

  if (
  url.pathname.startsWith('/_next') || 
  url.pathname.startsWith('/api') ||
  url.pathname.includes('.') // mengecualikan file seperti manifest.json, favicon.ico, dll
) {
    return NextResponse.next();
  }

  // Rewrite secara internal ke folder /[slug]
  return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
}
