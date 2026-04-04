"use client";

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination, Mousewheel, Thumbs, FreeMode } from 'swiper/modules';
import { Gallery, Item } from 'react-photoswipe-gallery';

// Import CSS dengan path yang lebih aman untuk Next.js/TS
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import 'photoswipe/dist/photoswipe.css';

export default function CarGallery({ images }: { images: any[] }) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [dimensions, setDimensions] = useState<{ [key: string]: { w: number, h: number } }>({});

  const handleImageLoad = (id: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (!dimensions[id]) {
      setDimensions(prev => ({ ...prev, [id]: { w: naturalWidth, h: naturalHeight } }));
    }
  };

  const sortedImages = [...images].sort((a, b) => (b.is_main ? 1 : 0) - (a.is_main ? 1 : 0));

  return (
    <div className="w-full h-full bg-[#f1f5f9] flex flex-col group overflow-hidden">
      <Gallery options={{ showHideOpacity: true, bgOpacity: 0.9 }}>
        
        {/* --- MAIN SLIDER --- */}
        <div className="flex-1 relative min-h-0">
          <Swiper
            modules={[Navigation, Pagination, Mousewheel, Thumbs]}
            navigation={true}
            mousewheel={true}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            pagination={{ clickable: true, dynamicBullets: true }}
            className="w-full h-full"
          >
            {sortedImages.map((img, index) => {
              const dim = dimensions[img.id] || { w: 1600, h: 1200 };
              
              return (
                <SwiperSlide key={img.id} className="flex items-center justify-center relative bg-[#0f172a]">
                  {/* Background Blur Effect */}
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
                      <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-10">
                        <img
                          ref={ref as any}
                          onClick={open}
                          onLoad={(e) => handleImageLoad(img.id, e)}
                          src={img.image_url}
                          className="max-w-full max-h-full w-auto h-auto object-contain rounded-2xl shadow-2xl cursor-zoom-in transition-transform duration-500 hover:scale-[1.01]"
                          alt={`Unit view ${index}`}
                        />
                      </div>
                    )}
                  </Item>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* --- THUMBNAIL STRIP --- */}
        <div className="h-24 md:h-28 w-full bg-white/50 backdrop-blur-md p-3 border-t border-slate-200">
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={4}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[FreeMode, Navigation, Thumbs]}
            breakpoints={{
              640: { slidesPerView: 5 },
              1024: { slidesPerView: 8 },
            }}
            className="h-full w-full max-w-5xl mx-auto"
          >
            {sortedImages.map((img) => (
              <SwiperSlide key={`thumb-${img.id}`} className="cursor-pointer rounded-xl overflow-hidden border-2 border-transparent transition-all opacity-50 [.swiper-slide-thumb-active&]:opacity-100 [.swiper-slide-thumb-active&]:border-[#10b981]">
                <img src={img.image_url} className="w-full h-full object-cover" alt="Thumbnail" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Gallery>

      <style jsx global>{`
        .pswp__img { object-fit: contain !important; }
        .swiper-button-next, .swiper-button-prev {
          background: white;
          width: 44px !important;
          height: 44px !important;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          color: #1e293b !important;
          opacity: 0;
          transition: 0.3s;
        }
        .group:hover .swiper-button-next, .group:hover .swiper-button-prev { opacity: 1; }
        .swiper-button-next:after, .swiper-button-prev:after { font-size: 14px !important; font-weight: 900; }
        .swiper-pagination-bullet-active { background: #10b981 !important; }
      `}</style>
    </div>
  );
}
