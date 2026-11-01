"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/format";
import { ArrowLeft, ArrowRight, StarIcon } from "./Icons";
import Reveal from "./Reveal";

export default function Testimonials() {
  const { t } = useI18n();
  const testimonials = t.testimonials.items;
  const [index, setIndex] = useState(0);
  const count = testimonials.length;
  const pair = [testimonials[index], testimonials[(index + 1) % count]];

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(id);
  }, [count, index]);

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  return (
    <section className="bg-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16 lg:px-12 lg:py-24">
        <Reveal>
          <p className="eyebrow">{t.testimonials.eyebrow}</p>
          <h2 className="mt-4 max-w-xs font-serif text-[2.5rem] leading-[1.05] text-ink sm:text-5xl">{t.testimonials.title}</h2>
          <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed font-light text-ink-soft">{t.testimonials.intro}</p>
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label={t.testimonials.prev}
              className="grid h-11 w-11 place-items-center rounded-full border border-sand bg-white text-ink transition hover:border-ink"
            >
              <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={t.testimonials.next}
              className="grid h-11 w-11 place-items-center rounded-full border border-sand bg-white text-ink transition hover:border-ink"
            >
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </button>
            <div className="ms-2 flex gap-2">
              {testimonials.map((item, i) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={fmt(t.testimonials.show, { n: i + 1 })}
                  className={`h-2 w-2 rounded-full transition ${i === index ? "bg-ink" : "bg-sand"}`}
                />
              ))}
            </div>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {pair.map((item, slot) => (
            <article
              key={`${item.name}-${slot}`}
              className={`relative rounded-2xl bg-white px-6 py-6 shadow-[0_18px_40px_-28px_rgba(60,40,20,0.4)] ${slot === 1 ? "hidden sm:block" : ""}`}
            >
              <span aria-hidden className="absolute top-4 right-6 font-serif text-5xl leading-none text-sand">
                &rdquo;
              </span>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-sand font-serif text-lg text-ink">
                  {item.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-[0.92rem] font-medium text-ink">
                    <bdi>{item.name}</bdi>
                  </p>
                  <div className="mt-1 flex gap-0.5 text-gold">
                    {Array.from({ length: 5 }).map((_, star) => (
                      <StarIcon key={star} className="h-3.5 w-3.5" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-5 text-[0.92rem] leading-relaxed font-light text-ink-soft">&ldquo;{item.quote}&rdquo;</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
