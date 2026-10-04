import { HeartIcon, LeafIcon, LotusIcon, SparkLotusIcon } from "./Icons";
import Reveal from "./Reveal";

const features = [
  {
    icon: LeafIcon,
    title: "Professional Therapists",
    text: "Skilled and certified therapists for your well-being.",
  },
  {
    icon: LotusIcon,
    title: "Natural & Safe Products",
    text: "We use only the best essential oils and natural products.",
  },
  {
    icon: HeartIcon,
    title: "Personalized Care",
    text: "Every session is tailored to your needs.",
  },
  {
    icon: SparkLotusIcon,
    title: "A Peaceful Environment",
    text: "Designed for your total relaxation.",
  },
];

export default function Features() {
  return (
    <section className="bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-1 px-6 pt-6 pb-20 sm:grid-cols-2 lg:grid-cols-4 lg:px-12">
        {features.map((f, i) => (
          <Reveal
            key={f.title}
            delay={i * 120}
            className={`flex flex-col items-center px-8 py-8 text-center lg:py-2 ${
              i > 0 ? "lg:border-l lg:border-sand" : ""
            }`}
          >
            <f.icon className="h-11 w-11 text-ink" />
            <h3 className="mt-6 text-[0.95rem] font-normal text-ink">{f.title}</h3>
            <p className="mt-2.5 max-w-[13rem] text-[0.8rem] leading-relaxed font-light text-muted">
              {f.text}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
