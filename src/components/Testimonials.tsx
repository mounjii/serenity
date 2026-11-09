"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { fmt } from "@/i18n/format";
import { ArrowLeft, ArrowRight, GoogleIcon, StarIcon } from "./Icons";
import Reveal from "./Reveal";

export default function Testimonials({
  rating,
  count,
  reviewUrl,
}: {
  rating: number;
  count: number;
  reviewUrl: string;
}) {
  const { t } = useI18n();
  const testimonials = t.testimonials.items;
  const pageSize = 2;
  const pageCount = Math.max(1, Math.ceil(testimonials.length / pageSize));
  const [page, setPage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPage((current) => (current + 1) % pageCount), 8000);
    return () => clearInterval(id);
  }, [pageCount]);

  const start = page * pageSize;
  const visible = testimonials.slice(start, start + pageSize);
  const prev = () => setPage((current) => (current - 1 + pageCount) % pageCount);
  const next = () => setPage((current) => (current + 1) % pageCount);

  return (
    <section className="bg-ivory">
      <div className="grid w-full items-start gap-8 px-5 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16 lg:px-8 lg:py-24">
        <div className="font-display">
          <Reveal>
            <p className="text-[0.68rem] font-medium tracking-[0.22em] text-sage uppercase sm:tracking-[0.28em]">{t.testimonials.eyebrow}</p>
          </Reveal>
          <Reveal delay={110}>
            <h2 className="mt-3 text-[2rem] leading-[1.08] font-semibold tracking-[-0.03em] text-forest sm:text-[2.45rem] lg:text-[2.8rem]">
              {t.testimonials.title1}
              <br />
              {t.testimonials.title2}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-sage">{t.testimonials.text}</p>
          </Reveal>
          <Reveal delay={280}>
          <a
            href={reviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-[0.9rem] text-ink"
          >
            <GoogleIcon className="h-5 w-5" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span className="flex gap-0.5 text-[#F5C400]" aria-hidden>
              {Array.from({ length: 5 }, (_, star) => (
                <StarIcon key={star} className={star < Math.round(rating) ? "h-3.5 w-3.5" : "h-3.5 w-3.5 opacity-30"} />
              ))}
            </span>
            <span className="text-sage">{count === 1 ? fmt(t.testimonials.countOne, { n: count }) : fmt(t.testimonials.count, { n: count })}</span>
          </a>
          <div className="mt-7 flex items-center gap-3">
            <button
              type="button"
              onClick={prev}
              aria-label={t.testimonials.prev}
              className="grid h-10 w-10 place-items-center rounded-full border border-sand bg-white text-ink transition hover:border-forest"
            >
              <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label={t.testimonials.next}
              className="grid h-10 w-10 place-items-center rounded-full border border-sand bg-white text-ink transition hover:border-forest"
            >
              <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
            </button>
            <div className="ms-2 flex gap-1.5">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i)}
                  aria-label={fmt(t.testimonials.show, { n: i + 1 })}
                  className={`h-1.5 rounded-full transition-all ${i === page ? "w-6 bg-forest" : "w-1.5 bg-sand"}`}
                />
              ))}
            </div>
          </div>
          </Reveal>
        </div>

        <Reveal delay={160} className="grid gap-4 md:grid-cols-2">
          {visible.map((item) => (
            <blockquote key={item.name} className="rounded-2xl border border-sand bg-white p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-mist font-display text-sm font-semibold text-ink">
                  {item.name.charAt(0)}
                </span>
                <div>
                  <p className="font-display text-[0.92rem] font-semibold text-ink">
                    <bdi>{item.name}</bdi>
                  </p>
                  <p className="mt-0.5 text-[0.75rem] text-sage">{t.testimonials.source}</p>
                </div>
              </div>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-ink">&ldquo;{item.quote}&rdquo;</p>
            </blockquote>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
