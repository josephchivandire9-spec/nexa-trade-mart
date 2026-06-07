import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  alt: string;
  badge?: React.ReactNode;
}

export function ProductGallery({ images, alt, badge }: ProductGalleryProps) {
  const [idx, setIdx] = useState(0);
  const startX = useRef<number | null>(null);
  const deltaX = useRef(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-3xl bg-secondary border flex items-center justify-center text-muted-foreground">
        No image
      </div>
    );
  }

  const safeIdx = Math.min(idx, images.length - 1);
  const go = (n: number) => setIdx((prev) => (prev + n + images.length) % images.length);

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX;
    deltaX.current = 0;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (startX.current == null) return;
    deltaX.current = e.touches[0].clientX - startX.current;
  }
  function onTouchEnd() {
    if (startX.current == null) return;
    if (Math.abs(deltaX.current) > 50) {
      go(deltaX.current < 0 ? 1 : -1);
    }
    startX.current = null;
    deltaX.current = 0;
  }

  return (
    <div>
      <div
        className="relative rounded-3xl overflow-hidden bg-secondary aspect-square border select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img src={images[safeIdx]} alt={alt} className="w-full h-full object-cover" draggable={false} />
        {badge}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/55 text-white inline-flex items-center justify-center hover:bg-black/80 backdrop-blur"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/55 text-white inline-flex items-center justify-center hover:bg-black/80 backdrop-blur"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === safeIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 text-white text-[11px] font-semibold">
              {safeIdx + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`aspect-square rounded-lg overflow-hidden border transition ${i === safeIdx ? "border-gold ring-2 ring-gold/40" : "border-border opacity-70 hover:opacity-100"}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
