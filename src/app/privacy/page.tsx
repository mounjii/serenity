import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { INTL_LOCALE } from "@/i18n/config";
import type { PrivacyBlock } from "@/i18n/dictionaries/en";
import { fmt } from "@/i18n/format";
import { getI18n } from "@/i18n/server";
import { RESERVATION_PATH } from "@/lib/navigation";
import { formatPhone, normalizePhone } from "@/lib/phone";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.meta.privacyTitle, description: t.meta.privacyDescription };
}

const LAST_UPDATED = new Date("2026-10-08T12:00:00.000Z");

function Block({ block }: { block: PrivacyBlock }) {
  if ("ul" in block) {
    return (
      <ul>
        {block.ul.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (!block.link) return <p>{block.p}</p>;
  const [before, after = ""] = block.p.split("{link}");
  return (
    <p>
      {before}
      <a href={block.link.href} target="_blank" rel="noopener noreferrer">
        {block.link.text}
      </a>
      {after}
    </p>
  );
}

export default async function PrivacyPage() {
  await connection();
  const { t, locale, href } = await getI18n();
  const p = t.privacy;
  const phone = normalizePhone(process.env.CONTACT_PHONE || process.env.OWNER_WHATSAPP_PHONE || "");
  const email = process.env.CONTACT_EMAIL?.trim() || null;
  const updated = new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
    numberingSystem: "latn",
  }).format(LAST_UPDATED);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-28 pb-16 sm:pt-36 sm:pb-24">
        <article className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="eyebrow">{p.eyebrow}</p>
          <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.08] text-ink sm:text-5xl">{p.title}</h1>
          <p className="mt-3 text-[0.8rem] text-muted">{fmt(p.updated, { date: updated })}</p>
          <p className="mt-6 text-[0.95rem] leading-relaxed font-light text-ink-soft">{p.intro}</p>

          <div className="mt-10 divide-y divide-sand border-y border-sand">
            {p.sections.map((s, i) => (
              <section key={s.title} className="py-7 sm:py-8">
                <h2 className="flex items-baseline gap-3 font-serif text-[1.45rem] text-ink sm:text-[1.6rem]">
                  <span className="text-[0.8rem] font-sans tracking-[0.2em] text-bronze">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <div className="legal-prose mt-3">
                  {s.blocks.map((block, index) => (
                    <Block key={index} block={block} />
                  ))}
                </div>
              </section>
            ))}

            <section className="py-7 sm:py-8">
              <h2 className="flex items-baseline gap-3 font-serif text-[1.45rem] text-ink sm:text-[1.6rem]">
                <span className="text-[0.8rem] font-sans tracking-[0.2em] text-bronze">{String(p.sections.length + 1).padStart(2, "0")}</span>
                {p.contactTitle}
              </h2>
              <div className="legal-prose mt-3">
                <p>{p.contactIntro}</p>
                <ul>
                  {phone && (
                    <li>
                      {p.contactPhone}{" "}
                      <a href={`tel:${phone}`}>
                        <bdi dir="ltr">{formatPhone(phone)}</bdi>
                      </a>
                    </li>
                  )}
                  {email && (
                    <li>
                      {p.contactEmail} <a href={`mailto:${email}`}>{email}</a>
                    </li>
                  )}
                  <li>
                    {p.contactSalon} {t.contact.address}
                  </li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={href(RESERVATION_PATH)}
              className="inline-flex min-h-12 items-center rounded-full bg-ink px-8 text-[0.85rem] tracking-wide text-cream transition hover:bg-black"
            >
              {p.book}
            </Link>
            <Link
              href={href("/")}
              className="inline-flex min-h-12 items-center rounded-full border border-sand px-8 text-[0.85rem] text-ink transition hover:border-ink"
            >
              {p.backHome}
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
