"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { blurProps } from "@/lib/images";
import { ArrowLeft, ArrowRight } from "./Icons";
import Reveal from "./Reveal";

export type TreatmentCard = {
  slug: string;
  name: string;
  description: string;
  image: string;
  href: string;
  durations: string | null;
  fromLabel: string | null;
};

type Props = {
  items: TreatmentCard[];
  bookLabel: string;
  detailsAria: string;
  eyebrow: string;
  title: string;
  viewAll: string;
  viewAllHref: string;
  prevLabel: string;
  nextLabel: string;
  swipeLabel: string;
};

export default function TreatmentCarousel({
  items,
  bookLabel,
  detailsAria,
  eyebrow,
  title,
  viewAll,
  viewAllHref,
  prevLabel,
  nextLabel,
  swipeLabel,
}: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const slide = (direction: 1 | -1) => {
    const row = scroller.current;
    const card = row?.querySelector("article");
    if (!row || !card) return;
    const rtl = getComputedStyle(row).direction === "rtl";
    row.scrollBy({
      left: (card.getBoundingClientRect().width + 16) * direction * (rtl ? -1 : 1),
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <div className="min-w-0">
          <Reveal>
            <p className="text-[0.68rem] font-medium tracking-[0.22em] text-sage uppercase sm:tracking-[0.28em]">{eyebrow}</p>
          </Reveal>
          <Reveal delay={110}>
            <h2 className="mt-3 text-[1.7rem] leading-[1.12] font-semibold tracking-[-0.03em] text-balance text-forest sm:text-[2.15rem] lg:text-[2.45rem]">
              {title}
            </h2>
          </Reveal>
        </div>
        <div className="mb-1 flex shrink-0 items-center gap-2">
          <p className="flex items-center gap-1.5 text-[0.72rem] tracking-[0.16em] text-sage uppercase sm:hidden">
            {swipeLabel}
            <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
          </p>
          <Link href={viewAllHref} className="me-1 hidden items-center gap-1.5 text-[0.9rem] font-medium text-ink sm:inline-flex">
            {viewAll}
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
          <button type="button" onClick={() => slide(-1)} aria-label={prevLabel} className="hidden h-10 w-10 place-items-center rounded-full border border-sand bg-white text-ink transition hover:border-forest sm:grid">
            <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
          </button>
          <button type="button" onClick={() => slide(1)} aria-label={nextLabel} className="hidden h-10 w-10 place-items-center rounded-full border border-sand bg-white text-ink transition hover:border-forest sm:grid">
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </button>
        </div>
      </div>

      <div ref={scroller} className="no-scrollbar -me-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pe-5 pb-2 sm:mt-10">
        {items.map((item) => (
          <article key={item.slug} className="group flex w-[84%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-sand bg-white sm:w-[calc(50%-0.5rem)] lg:w-[calc(25%-0.75rem)]">
            <Link href={item.href} className="relative h-40 overflow-hidden sm:h-44" aria-label={detailsAria.replace("{name}", item.name)}>
              <Image
                src={item.image}
                {...blurProps(item.image)}
                alt={item.name}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
            </Link>
            <Reveal delay={80} className="flex flex-1 flex-col px-4 py-4 font-display">
              <h3 className="text-[1.05rem] leading-tight font-semibold text-ink">{item.name}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-[0.86rem] leading-relaxed text-sage">{item.description}</p>
              {item.durations ? <p className="mt-3 text-[0.78rem] text-ink">{item.durations}</p> : null}
              <div className="mt-4 flex items-center justify-between gap-3">
                {item.fromLabel ? <p className="text-[0.92rem] font-semibold text-forest">{item.fromLabel}</p> : <span />}
                <Link
                  href={item.href}
                  className="inline-flex min-h-10 items-center rounded-full bg-forest px-4 text-[0.82rem] font-medium text-white transition hover:bg-forest-dark"
                >
                  {bookLabel}
                </Link>
              </div>
            </Reveal>
          </article>
        ))}
      </div>
    </div>
  );
}
