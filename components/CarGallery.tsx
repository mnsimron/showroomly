"use client";

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Mousewheel } from 'swiper/modules';
import { Gallery, Item } from 'react-photoswipe-gallery';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'photoswipe/dist/photoswipe.css';

export default function CarGallery({ images }: { images: any[] }) {
  // Simpan dimensi gambar yang terdeteksi
  const [dimensions, setDimensions] = useState<{ [key: string]: { w: number, h: number } }>({});

  const handleImageLoad = (id: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (!dimensions[id]) {
      setDimensions(prev => ({ ...prev, [id]: { w: naturalWidth, h: naturalHeight } }));
    }
  };

  const sortedImages = [...images].sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0));

  return (
    <div className="w-full h-full bg-[#f1f5f9] group overflow-hidden">
      <Gallery options={{ showHideOpacity: true, bgOpacity: 0.9 }}>
        <Swiper
          modules={[Navigation, Pagination, Mousewheel]}
          navigation={true}
          mousewheel={true}
          pagination={{ clickable: true, dynamicBullets: true }}
          className="w-full h-full"
        >
          {sortedImages.map((img, index) => {
            const dim = dimensions[img.id] || { w: 1600, h: 1200 }; // Default fallback
            
            return (
              <SwiperSlide key={img.id} className="flex items-center justify-center relative">
                {/* Background Blur untuk kesan Mewah */}
                <div 
                  className="absolute inset-0 opacity-20 blur-3xl scale-110"
                  style={{ backgroundImage: `url(${img.image_url})`, backgroundSize: 'cover' }}
                />

                <Item
                  original={img.image_url}
                  thumbnail={img.image_url}
                  width={dim.w.toString()}
                  height={dim.h.toString()}
                >
                  {({ ref, open }) => (
                    <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-12">
                      <img
                        ref={ref as any}
                        onClick={open}
                        onLoad={(e) => handleImageLoad(img.id, e)}
                        src={img.image_url}
                        className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-2xl cursor-zoom-in transition-all duration-500 hover:scale-[1.01]"
                        alt={`Unit view ${index}`}
                      />
                    </div>
                  )}
                </Item>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </Gallery>

      {/* CSS Fix untuk PhotoSwipe agar gambar tidak "stretched" */}
      <style jsx global>{`
        .pswp__img {
          object-fit: contain !important; /* Memaksa gambar tetap proporsional */
        }
        .swiper-button-next, .swiper-button-prev {
          background: white;
          width: 48px !important;
          height: 48px !important;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          color: #1e293b !important;
          opacity: 0;
        }
        .group:hover .swiper-button-next, .group:hover .swiper-button-prev {
          opacity: 1;
        }
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 14px !important;
          font-weight: 900;
        }
      `}</style>
    </div>
  );
}
