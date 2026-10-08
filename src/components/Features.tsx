import { getI18n } from "@/i18n/server";
import { HeartIcon, LeafIcon, LotusIcon, SparkLotusIcon } from "./Icons";
import Reveal from "./Reveal";

const icons = [LeafIcon, LotusIcon, HeartIcon, SparkLotusIcon];

export default async function Features() {
  const { t } = await getI18n();
  return (
    <section className="bg-cream">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-2 px-4 pt-4 pb-12 sm:px-6 sm:pt-6 sm:pb-20 lg:grid-cols-4 lg:px-12">
        {t.features.map((f, i) => {
          const Icon = icons[i % icons.length];
          return (
            <Reveal
              key={f.title}
              delay={(i % 2) * 120}
              className={`flex flex-col items-center px-2 py-6 text-center sm:px-8 sm:py-8 lg:py-2 ${
                i > 0 ? "lg:border-s lg:border-sand" : ""
              }`}
            >
              <Icon className="h-9 w-9 text-ink sm:h-11 sm:w-11" />
              <h3 className="mt-4 text-[0.88rem] leading-snug font-normal text-ink sm:mt-6 sm:text-[0.95rem]">{f.title}</h3>
              <p className="mt-2 max-w-[13rem] text-[0.76rem] leading-relaxed font-light text-muted sm:mt-2.5 sm:text-[0.8rem]">
                {f.text}
              </p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
