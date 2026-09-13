"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
  tag?: string;
}

export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  return (
    <div
      className="relative overflow-hidden rounded-sm bg-white shadow-card"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={track}
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s) => (
          <div key={s.id} className="w-full shrink-0">
            <a href={s.href} className={cn("flex h-52 flex-col justify-center gap-2 bg-gradient-to-r px-8 md:h-64 md:px-14", s.gradient)}>
              {s.tag && <span className="w-fit rounded-sm bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Ad · {s.tag}</span>}
              <h2 className="text-2xl font-bold text-white md:text-4xl">{s.title}</h2>
              <p className="text-sm text-white/90 md:text-base">{s.subtitle}</p>
              <span className="mt-2 w-fit rounded-sm bg-white px-5 py-2 text-sm font-bold text-gray-900 hover:bg-gray-100">{s.cta}</span>
            </a>
          </div>
        ))}
      </div>
      <button aria-label="Previous slide" onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-r-sm bg-white/90 p-2 shadow-card hover:bg-white">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button aria-label="Next slide" onClick={() => setIndex((i) => (i + 1) % slides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-l-sm bg-white/90 p-2 shadow-card hover:bg-white">
        <ChevronRight className="h-5 w-5" />
      </button>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((s, i) => (
          <button key={s.id} aria-label={`Go to slide ${i + 1}`} onClick={() => setIndex(i)} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-white" : "w-1.5 bg-white/60")} />
        ))}
      </div>
    </div>
  );
}
