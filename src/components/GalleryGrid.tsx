"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { blurProps } from "@/lib/images";
import { ArrowLeft, ArrowRight, CloseIcon } from "./Icons";

export type GalleryGroup = {
  title: string;
  items: { src: string; alt: string; label?: string }[];
};

export default function GalleryGrid({
  groups,
  closeLabel,
  prevLabel,
  nextLabel,
  swipeLabel,
}: {
  groups: GalleryGroup[];
  closeLabel: string;
  prevLabel: string;
  nextLabel: string;
  swipeLabel: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<{ src: string; alt: string } | null>(null);
  const photos = groups.flatMap((group) => group.items);
  const slide = (direction: 1 | -1) => {
    const row = scroller.current;
    const card = row?.querySelector("button");
    if (!row || !card) return;
    const rtl = getComputedStyle(row).direction === "rtl";
    row.scrollBy({
      left: (card.getBoundingClientRect().width + 16) * direction * (rtl ? -1 : 1),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <div className="mt-8 flex items-center justify-end gap-2 sm:mt-10">
        <p className="flex items-center gap-1.5 text-[0.72rem] tracking-[0.16em] text-sage uppercase sm:hidden">
          {swipeLabel}
          <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
        </p>
        <button type="button" onClick={() => slide(-1)} aria-label={prevLabel} className="hidden h-10 w-10 place-items-center rounded-full border border-sand bg-white text-ink transition hover:border-forest sm:grid">
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
        </button>
        <button type="button" onClick={() => slide(1)} aria-label={nextLabel} className="hidden h-10 w-10 place-items-center rounded-full border border-sand bg-white text-ink transition hover:border-forest sm:grid">
          <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
        </button>
      </div>
      <div ref={scroller} className="no-scrollbar -me-5 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pe-5 pb-2">
        {photos.map((item) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setOpen(item)}
            className="group relative aspect-[4/5] w-[78%] shrink-0 snap-start overflow-hidden rounded-2xl border border-sand text-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]"
          >
            <Image
              src={item.src}
              {...blurProps(item.src)}
              alt={item.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            {item.label ? (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#174A35]/80 to-transparent px-3 pt-8 pb-3 text-start text-[0.72rem] font-medium text-white">
                {item.label}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#26352B]/80 p-4" role="presentation" onClick={() => setOpen(null)}>
          <figure className="relative max-h-[88vh] max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <Image src={open.src} alt={open.alt} width={1600} height={2000} className="max-h-[88vh] w-auto rounded-2xl object-contain" />
            <figcaption className="sr-only">{open.alt}</figcaption>
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label={closeLabel}
              className="absolute top-3 end-3 grid h-11 w-11 place-items-center rounded-full bg-white text-ink"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </figure>
        </div>
      ) : null}
    </>
  );
}
