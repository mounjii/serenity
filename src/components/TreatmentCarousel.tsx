"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { blurProps } from "@/lib/images";
import { ArrowLeft, ArrowRight } from "./Icons";

export type TreatmentCard = {
  slug: string;
  name: string;
  description: string;
  image: string;
  href: string;
};

type Props = {
  items: TreatmentCard[];
  detailsAria: string;
  eyebrow: string;
  title: string;
  swipeLabel: string;
  viewAll: string;
  viewAllHref: string;
  prevLabel: string;
  nextLabel: string;
};

export default function TreatmentCarousel({
  items,
  detailsAria,
  eyebrow,
  title,
  swipeLabel,
  viewAll,
  viewAllHref,
  prevLabel,
  nextLabel,
}: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const row = scroller.current;
    const card = row?.querySelector("article");
    if (!row || !card) return;
    const gap = 16;
    const rtl = getComputedStyle(row).direction === "rtl";
    row.scrollBy({ left: (card.getBoundingClientRect().width + gap) * direction * (rtl ? -1 : 1), behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0">
          <p className="text-[0.68rem] font-medium tracking-[0.22em] text-sage uppercase sm:tracking-[0.28em]">{eyebrow}</p>
          <h2 className="mt-3 text-[1.7rem] leading-[1.12] font-semibold tracking-[-0.03em] text-balance text-forest sm:text-[2.15rem] lg:text-[2.45rem]">
            {title}
          </h2>
        </div>
        <p className="mb-1 flex shrink-0 items-center gap-1.5 text-[0.72rem] tracking-[0.16em] text-sage uppercase sm:hidden">
          {swipeLabel}
          <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
        </p>
        <div className="mb-1 hidden shrink-0 flex-col items-end gap-3 sm:flex">
          <Link href={viewAllHref} className="inline-flex items-center gap-1.5 text-[0.9rem] font-medium text-ink">
            {viewAll}
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label={prevLabel}
              className="grid h-10 w-10 place-items-center rounded-full border border-sand bg-white text-ink transition hover:border-forest"
            >
              <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label={nextLabel}
              className="grid h-10 w-10 place-items-center rounded-full border border-sand bg-white text-ink transition hover:border-forest"
            >
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </button>
          </div>
        </div>
      </div>

      <div ref={scroller} className="no-scrollbar -me-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pe-5 pb-2 sm:mx-0 sm:mt-10 sm:pe-0">
        {items.map((item) => (
          <article
            key={item.slug}
            className="group flex w-[84%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]"
          >
            <Link href={item.href} className="relative h-40 overflow-hidden sm:h-44">
              <Image
                src={item.image}
                {...blurProps(item.image)}
                alt={item.name}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 82vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </Link>
            <div className="flex flex-1 flex-col px-4 pt-3.5 pb-3 font-display">
              <h3 className="text-[1.02rem] leading-tight font-semibold text-ink">{item.name}</h3>
              <p className="mt-1.5 line-clamp-2 flex-1 text-[0.8rem] leading-relaxed text-sage">{item.description}</p>
              <div className="mt-3 flex justify-end">
                <Link
                  href={item.href}
                  aria-label={detailsAria.replace("{name}", item.name)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-sand text-ink transition group-hover:bg-forest group-hover:text-white"
                >
                  <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
