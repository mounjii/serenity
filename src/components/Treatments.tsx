import Image from "next/image";
import { images } from "@/lib/images";
import Reveal from "./Reveal";

const treatments = [
  {
    title: "Swedish Massage",
    text: "Gentle, flowing strokes to relieve tension and promote relaxation.",
    duration: "60 min",
    price: "$70",
    image: images.swedish,
  },
  {
    title: "Deep Tissue Massage",
    text: "Targeted pressure to release muscle tension and improve mobility.",
    duration: "60 min",
    price: "$80",
    image: images.deepTissue,
  },
  {
    title: "Aromatherapy Massage",
    text: "Essential oils to calm your mind and balance your energy.",
    duration: "60 min",
    price: "$75",
    image: images.aromatherapy,
  },
  {
    title: "Relaxation Massage",
    text: "A full-body experience for deep relaxation and mental clarity.",
    duration: "60 min",
    price: "$65",
    image: images.relaxation,
  },
];

export default function Treatments() {
  return (
    <section id="services" className="bg-cream">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-12 lg:py-28">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Our Services</p>
          <h2 className="mt-4 font-serif text-4xl text-ink sm:text-5xl lg:text-[3.2rem]">
            Massage & Wellness Treatments
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[0.9rem] leading-relaxed font-light text-ink-soft">
            Choose from our range of professional treatments designed to relax
            your body, calm your mind and restore your energy.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {treatments.map((t, i) => (
            <Reveal
              as="article"
              key={t.title}
              delay={i * 120}
              className="group flex flex-col overflow-hidden rounded-sm bg-white shadow-[0_20px_40px_-28px_rgba(60,40,20,0.35)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-25px_rgba(60,40,20,0.4)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={t.image}
                  alt={t.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-[0.95rem] font-normal text-ink">{t.title}</h3>
                <p className="mt-3 flex-1 text-[0.8rem] leading-relaxed font-light text-muted">
                  {t.text}
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-sand pt-4 text-[0.78rem] text-ink-soft">
                  <span>{t.duration}</span>
                  <span className="h-3 w-px bg-sand" />
                  <span className="text-ink">{t.price}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
