import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBanners } from "@/hooks/useBanners";
import { storageUrl } from "@/lib/storage";

export function BannerCarousel() {
  const { data: banners = [], isLoading } = useBanners();
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % banners.length), 5500);
    return () => clearInterval(t);
  }, [banners.length]);

  useEffect(() => {
    if (idx >= banners.length) setIdx(0);
  }, [banners.length, idx]);

  if (isLoading || banners.length === 0) return null;

  const b = banners[idx];
  const prev = () => setIdx((i) => (i - 1 + banners.length) % banners.length);
  const next = () => setIdx((i) => (i + 1) % banners.length);

  const CtaTag: "a" | "div" = b.cta_link ? "a" : "div";

  return (
    <section aria-label="Featured promotions" className="relative bg-ink">
      <div className="container-px mx-auto max-w-7xl py-4">
        <div className="relative overflow-hidden rounded-2xl border border-gold/20 shadow-gold">
          <div className="relative aspect-[16/7] sm:aspect-[21/7] bg-black">
            {b.image_url && (
              <img
                key={b.id}
                src={storageUrl(b.image_url)}
                alt={b.title}
                className="absolute inset-0 h-full w-full object-cover opacity-90"
                loading="eager"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="relative h-full flex flex-col justify-center px-5 sm:px-10 max-w-2xl">
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl text-white leading-tight">
                <span className="text-gradient-gold">{b.title}</span>
              </h2>
              {b.subtitle && (
                <p className="mt-2 text-sm sm:text-base text-white/85 max-w-md line-clamp-3">
                  {b.subtitle}
                </p>
              )}
              {b.cta_text && (
                <CtaTag
                  {...(b.cta_link ? { href: b.cta_link } : {})}
                  className="mt-4 inline-flex w-fit items-center gap-2 h-10 px-5 rounded-full gradient-gold text-ink font-bold text-sm shadow-gold hover:opacity-95"
                >
                  {b.cta_text}
                </CtaTag>
              )}
            </div>
          </div>

          {banners.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Previous"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 text-white inline-flex items-center justify-center"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                aria-label="Next"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 text-white inline-flex items-center justify-center"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Slide ${i + 1}`}
                    onClick={() => setIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${i === idx ? "w-6 bg-gold" : "w-1.5 bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
