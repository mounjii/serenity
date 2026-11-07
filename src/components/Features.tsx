import { getI18n } from "@/i18n/server";
import { HeartIcon, LeafIcon, LotusIcon, SparkLotusIcon } from "./Icons";

const icons = [LotusIcon, LeafIcon, HeartIcon, SparkLotusIcon];

export default async function Features() {
  const { t } = await getI18n();
  return (
    <section className="relative z-10 mt-8 bg-transparent pb-6 sm:mt-0 sm:pb-10 lg:-mt-36">
      <div className="w-full px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-black/[0.04] bg-white shadow-[0_24px_50px_-32px_rgba(23,23,23,0.35)] lg:grid-cols-4">
          {t.features.map((feature, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div
                key={feature.title}
                className={`flex items-start gap-2.5 px-3 py-4 sm:items-center sm:gap-3 sm:px-6 sm:py-5 ${i % 2 === 1 ? "border-s border-sand" : ""} ${
                  i >= 2 ? "border-t border-sand lg:border-t-0" : ""
                } ${i > 0 ? "lg:border-s lg:border-sand" : ""}`}
              >
                <Icon className="h-6 w-6 shrink-0 text-ink sm:h-7 sm:w-7" />
                <div className="min-w-0">
                  <h3 className="font-display text-[0.82rem] leading-tight font-semibold text-ink sm:text-[0.92rem]">{feature.title}</h3>
                  <p className="mt-1 text-[0.72rem] leading-snug text-balance text-sage sm:text-[0.78rem]">{feature.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
