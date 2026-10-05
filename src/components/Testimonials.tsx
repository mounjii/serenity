"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { blurProps, images } from "@/lib/images";
import { ArrowLeft, ArrowRight, StarIcon } from "./Icons";
import Reveal from "./Reveal";

const testimonials = [
  {
    quote:
      "An amazing experience! The atmosphere is so calming and the therapist was incredibly professional. I left feeling lighter, both physically and mentally.",
    name: "Sarah L.",
  },
  {
    quote:
      "The deep tissue massage was exactly what my back needed. Every detail, from the scent to the music, made me feel completely at ease.",
    name: "Emma R.",
  },
  {
    quote:
      "A true sanctuary in the middle of the city. I have been coming every month and each visit feels like a small holiday.",
    name: "Claire M.",
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const count = testimonials.length;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(id);
  }, [count, index]);

  const prev = () => setIndex((i) => (i - 1 + count) % count);
  const next = () => setIndex((i) => (i + 1) % count);

  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    const end = e.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (start === null || end === undefined || Math.abs(end - start) < 40) return;
    if (end < start) next();
    else prev();
  };

  return (
    <section className="bg-cream-dark/60">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-16 sm:gap-14 sm:px-6 sm:py-24 md:grid-cols-[1fr_1.15fr] lg:gap-24 lg:px-12 lg:py-28">
        <Reveal variant="curtain" className="relative aspect-[16/9] overflow-hidden rounded-sm shadow-[0_30px_60px_-30px_rgba(60,40,20,0.35)] sm:aspect-[4/3]">
          <Image
            src={images.testimonial} {...blurProps(images.testimonial)}
            alt="Zen stones, candle and orchid"
            fill
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </Reveal>

        <Reveal variant="right" delay={200}>
          <p className="eyebrow">Testimonials</p>
          <h2 className="mt-4 font-serif text-[2.4rem] leading-[1.08] text-ink sm:text-5xl lg:text-[3.2rem]">
            What Our Clients Say
          </h2>

          <div className="relative mt-6 grid touch-pan-y sm:mt-8" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {testimonials.map((t, i) => (
              <blockquote
                key={t.name}
                aria-hidden={i !== index}
                className={`col-start-1 row-start-1 transition-all duration-700 ${
                  i === index ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
                }`}
              >
                <p className="max-w-lg font-serif text-[1.15rem] leading-relaxed text-ink-soft italic sm:text-xl">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </blockquote>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-white">
                <Image src={images.avatar} {...blurProps(images.avatar)} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div>
                <p className="text-[0.88rem] text-ink">{testimonials[index].name}</p>
                <div className="mt-1 flex gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <StarIcon key={s} className="h-3.5 w-3.5" />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="grid h-11 w-11 place-items-center rounded-full border border-sand bg-white text-ink transition hover:border-ink"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                aria-label="Next testimonial"
                className="grid h-11 w-11 place-items-center rounded-full border border-sand bg-white text-ink transition hover:border-ink"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-8 flex gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setIndex(i)}
                aria-label={`Show testimonial ${i + 1}`}
                className={`h-[3px] rounded-full transition-all duration-500 ${
                  i === index ? "w-8 bg-ink" : "w-4 bg-sand"
                }`}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
