"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
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
  prevLabel: string;
  nextLabel: string;
  detailsAria: string;
};

export default function TreatmentCarousel({ items, prevLabel, nextLabel, detailsAria }: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollByCard = (direction: 1 | -1) => {
    const el = scroller.current;
    const card = el?.querySelector("article");
    if (!el || !card) return;
    const gap = 20;
    const rtl = document.documentElement.dir === "rtl";
    el.scrollBy({ left: direction * (card.clientWidth + gap) * (rtl ? -1 : 1), behavior: "smooth" });
  };

  return (
    <div className="relative mt-8 sm:mt-10">
      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        aria-label={prevLabel}
        className="absolute top-[28%] -left-1 z-10 hidden h-11 w-11 place-items-center rounded-full border border-sand bg-white text-ink shadow-[0_10px_24px_-16px_rgba(60,40,20,0.5)] transition hover:border-ink sm:grid lg:-left-5"
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        aria-label={nextLabel}
        className="absolute top-[28%] -right-1 z-10 hidden h-11 w-11 place-items-center rounded-full border border-sand bg-white text-ink shadow-[0_10px_24px_-16px_rgba(60,40,20,0.5)] transition hover:border-ink sm:grid lg:-right-5"
      >
        <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
      </button>

      <div
        ref={scroller}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:gap-5 sm:px-0"
      >
        {items.map((item) => (
          <article
            key={item.slug}
            className="group flex w-[78%] shrink-0 snap-start flex-col rounded-2xl bg-white p-3 shadow-[0_18px_40px_-28px_rgba(60,40,20,0.4)] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
          >
            <Link href={item.href} className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image
                src={item.image}
                {...blurProps(item.image)}
                alt={item.name}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 78vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </Link>
            <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
              <h3 className="font-serif text-[1.35rem] leading-tight text-ink">{item.name}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-[0.84rem] leading-relaxed font-light text-ink-soft">{item.description}</p>
              <div className="mt-4 flex justify-end">
                <Link
                  href={item.href}
                  aria-label={detailsAria.replace("{name}", item.name)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-sand text-ink transition hover:border-ink hover:bg-ink hover:text-cream"
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
