export const applyWatermark = async (file: File, logoUrl: string): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    // Konfigurasi Standar Katalog
    const MAX_WIDTH = 1600; // Resize foto agar tidak terlalu berat (Penting!)
    const QUALITY = 0.8;    // Kualitas WebP
    const LOGO_RATIO = 0.15; // Ukuran logo 15% dari lebar foto

    const timeoutId = setTimeout(() => {
      reject(new Error("Proses watermark terlalu lama (Timeout)"));
    }, 45000);

    try {
      // 1. Load Image & Logo secara paralel
      const loadImage = (url: string, isLogo = false): Promise<HTMLImageElement> => {
        return new Promise((res, rej) => {
          const img = new Image();
          if (isLogo) img.crossOrigin = "anonymous"; // Hindari Tainted Canvas
          img.onload = () => res(img);
          img.onerror = () => rej(new Error(isLogo ? "Logo tidak bisa dimuat" : "Foto rusak"));
          img.src = url;
        });
      };

      const imgObjectUrl = URL.createObjectURL(file);
      
      // Tunggu keduanya selesai dimuat
      const [mainImg, logoImg] = await Promise.all([
        loadImage(imgObjectUrl),
        loadImage(logoUrl, true)
      ]);

      // 2. Setup Canvas dengan Resize Logic
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) throw new Error("Canvas tidak didukung");

      // Hitung dimensi baru (Resize jika terlalu besar)
      let targetWidth = mainImg.width;
      let targetHeight = mainImg.height;

      if (mainImg.width > MAX_WIDTH) {
        targetWidth = MAX_WIDTH;
        targetHeight = (mainImg.height / mainImg.width) * MAX_WIDTH;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // 3. Gambar Foto Utama (Resized)
      ctx.drawImage(mainImg, 0, 0, targetWidth, targetHeight);

      // 4. Gambar Watermark (Posisi Kanan Bawah)
      const logoWidth = targetWidth * LOGO_RATIO;
      const logoHeight = (logoImg.height / logoImg.width) * logoWidth;
      
      // Margin 5% dari dimensi foto
      const paddingX = targetWidth * 0.05;
      const paddingY = targetHeight * 0.05;
      const x = targetWidth - logoWidth - paddingX;
      const y = targetHeight - logoHeight - paddingY;

      ctx.globalAlpha = 0.85; // Sedikit transparan agar menyatu
      ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);

      // 5. Konversi ke WebP Blob (Hemat Storage)
      canvas.toBlob(
        (blob) => {
          clearTimeout(timeoutId);
          URL.revokeObjectURL(imgObjectUrl);
          if (blob) resolve(blob);
          else reject(new Error("Gagal konversi ke Blob"));
        },
        "image/webp",
        QUALITY
      );

    } catch (err: any) {
      clearTimeout(timeoutId);
      reject(new Error(`Watermark Error: ${err.message}`));
    }
  });
};
