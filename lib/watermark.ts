export const applyWatermark = (file: File, logoUrl: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const logo = new Image();
    img.src = URL.createObjectURL(file);
    logo.crossOrigin = "anonymous"; // Penting agar bisa akses URL luar
    logo.src = logoUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Canvas tidak didukung");

      // Set ukuran canvas sesuai foto asli
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      logo.onload = () => {
        // Atur ukuran logo (misal 15% dari lebar foto)
        const logoWidth = canvas.width * 0.15;
        const logoHeight = (logo.height / logo.width) * logoWidth;
        
        // Posisi: Pojok kanan bawah dengan padding 5%
        const x = canvas.width - logoWidth - (canvas.width * 0.05);
        const y = canvas.height - logoHeight - (canvas.height * 0.05);

        // Gambar Logo dengan opacity 80% agar elegan
        ctx.globalAlpha = 0.8;
        ctx.drawImage(logo, x, y, logoWidth, logoHeight);
        
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Gagal membuat blob");
        }, "image/webp", 0.8); // Simpan sebagai WebP agar ringan
      };
    };
    img.onerror = reject;
  });
};
