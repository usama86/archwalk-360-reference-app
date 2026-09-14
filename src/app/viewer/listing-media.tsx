"use client";

import Image from "next/image";
import { useState } from "react";
import { ViewerEmbed } from "./viewer-embed";
import livingArea from "../../../public/property/living-area.webp";
import loungeDetail from "../../../public/property/lounge-detail.webp";
import kitchenDetail from "../../../public/property/kitchen-detail.webp";

export function ListingMedia({ embedUrl }: { embedUrl?: string }) {
  const [mode, setMode] = useState<"photos" | "tour">("photos");
  return (
    <section aria-label="Property photos and tour" className="mt-7">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border bg-surface p-1" role="group" aria-label="Choose property media">
          <button type="button" aria-pressed={mode === "photos"} aria-controls="listing-media" onClick={() => setMode("photos")} className={`min-h-11 rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${mode === "photos" ? "bg-foreground text-surface" : "text-muted hover:text-foreground"}`}>Photos</button>
          {embedUrl ? <button type="button" aria-pressed={mode === "tour"} aria-controls="listing-media" onClick={() => setMode("tour")} className={`min-h-11 rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${mode === "tour" ? "bg-foreground text-surface" : "text-muted hover:text-foreground"}`}>360° Tour</button> : null}
        </div>
        <p className="text-xs text-muted">{mode === "photos" ? "A closer look at the living area" : "Explore at your own pace"}</p>
      </div>
      <div id="listing-media" className="h-[clamp(360px,58dvh,480px)] overflow-hidden rounded-2xl bg-surface sm:h-[520px] xl:h-[580px]">
        {mode === "tour" && embedUrl ? <ViewerEmbed src={embedUrl} /> : (
          <div aria-label="Sunset Villa photo gallery" className="grid h-full grid-cols-2 grid-rows-[minmax(0,2fr)_minmax(0,1fr)] gap-1.5 md:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] md:grid-rows-2">
            <div className="relative col-span-2 min-h-0 md:col-span-1 md:row-span-2">
              <Image src={livingArea} alt="Sunset Villa living area with sofas and a marble coffee table" fill sizes="(min-width: 1280px) 760px, (min-width: 768px) 62vw, 100vw" preload className="object-cover" />
              <span className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1.5 text-xs text-white backdrop-blur">Living area</span>
            </div>
            <div className="relative min-h-0"><Image src={loungeDetail} alt="Another angle of the same demo living area, looking toward the lounge" fill sizes="(min-width: 1280px) 460px, (min-width: 768px) 38vw, 50vw" className="object-cover" /></div>
            <div className="relative min-h-0"><Image src={kitchenDetail} alt="Kitchen detail from the same Sunset Villa demo panorama" fill sizes="(min-width: 1280px) 460px, (min-width: 768px) 38vw, 50vw" className="object-cover" /></div>
          </div>
        )}
      </div>
    </section>
  );
}
