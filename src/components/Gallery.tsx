import Image from "next/image";
import { blurProps, images } from "@/lib/images";
import Reveal from "./Reveal";

const alts = ["Treatment room", "Rolled towels and candle", "Stone bath with petals", "Relaxation lounge"];

export default function Gallery() {
  return (
    <section id="gallery" className="bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-24 lg:px-12 lg:py-28">
        <Reveal className="mx-auto max-w-md text-center">
          <p className="eyebrow">Our Space</p>
          <h2 className="mt-4 font-serif text-[2.4rem] leading-[1.08] text-ink sm:text-5xl lg:text-[3.2rem]">A Place for Peace</h2>
          <p className="mx-auto mt-4 max-w-xs text-[0.88rem] leading-relaxed font-light text-ink-soft">
            Step into a serene environment designed to help you unwind and feel at ease.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-14 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {images.gallery.map((src, i) => (
            <Reveal
              key={src}
              variant="zoom"
              delay={i * 110}
              className={`group relative overflow-hidden rounded-sm ${
                i === 0 || i === images.gallery.length - 1 ? "col-span-2 aspect-[16/9] sm:col-span-1 sm:aspect-[4/3]" : "aspect-square sm:aspect-[4/3]"
              }`}
            >
              <Image
                src={src} {...blurProps(src)}
                alt={alts[i]}
                fill
                sizes={i === 0 || i === images.gallery.length - 1 ? "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                className="object-cover transition-transform duration-[1.2s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/15" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
