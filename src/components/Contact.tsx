import { connection } from "next/server";
import { getI18n } from "@/i18n/server";
import { formatPhone, salonPhone, whatsappLink } from "@/lib/phone";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./Icons";
import Reveal from "./Reveal";

const DEFAULT_ADDRESS = "2nd floor, 42 Ave Al Haouz, Rabat 10140";

type Item = { icon: (p: React.SVGProps<SVGSVGElement>) => React.JSX.Element; label: string; value: string; href?: string; external?: boolean };

export default async function Contact() {
  // Contact details come from the hosting panel at runtime, not from the build environment.
  await connection();
  const { t, locale } = await getI18n();
  const phone = salonPhone();
  const configuredAddress = process.env.CONTACT_ADDRESS?.trim();
  const address = configuredAddress || t.contact.address;
  const email = process.env.CONTACT_EMAIL?.trim() || null;
  const mapQuery = encodeURIComponent(`THAI PRAKHOP, ${configuredAddress || DEFAULT_ADDRESS}`);
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const items: Item[] = [];
  if (phone) {
    items.push({ icon: PhoneIcon, label: t.contact.callUs, value: formatPhone(phone), href: `tel:${phone}` });
    items.push({
      icon: WhatsAppIcon,
      label: t.contact.whatsappUs,
      value: formatPhone(phone),
      href: whatsappLink(phone, t.contact.bookMessage),
      external: true,
    });
  }
  items.push({ icon: PinIcon, label: t.contact.visitUs, value: address, href: mapHref, external: true });
  if (email) items.push({ icon: MailIcon, label: t.contact.email, value: email, href: `mailto:${email}` });
  items.push({ icon: ClockIcon, label: t.contact.hours, value: t.contact.hoursValue });

  return (
    <section id="contact" className="scroll-mt-16 bg-ivory">
      <div className="grid w-full gap-8 px-5 py-16 font-display sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-stretch lg:gap-10 lg:px-8 lg:py-24">
        <div>
          <Reveal variant="left">
            <p className="text-[0.68rem] font-medium tracking-[0.22em] text-sage uppercase sm:tracking-[0.28em]">
              {t.contact.eyebrow}
            </p>
          </Reveal>
          <Reveal variant="left" delay={110}>
            <h2 className="mt-3 text-[1.7rem] leading-[1.12] font-semibold tracking-[-0.03em] text-balance text-forest sm:text-[2.15rem] lg:text-[2.45rem]">
              {t.contact.title}
            </h2>
          </Reveal>
          <Reveal variant="left" delay={200}>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-sage">{t.contact.text}</p>
          </Reveal>

          <Reveal variant="left" delay={280}>
          <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
            {phone ? (
              <>
              <a
                href={whatsappLink(phone, t.contact.bookMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-forest px-6 text-[0.88rem] font-medium text-white transition hover:bg-forest-dark sm:w-auto"
              >
                <WhatsAppIcon className="h-4 w-4" />
                {t.contact.whatsapp}
              </a>
              <a
                href={`tel:${phone}`}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-sand bg-white px-6 text-[0.88rem] font-medium text-ink transition hover:border-forest sm:w-auto"
              >
                <PhoneIcon className="h-4 w-4" />
                {t.contact.call}
              </a>
              </>
            ) : null}
            <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-sand bg-white px-6 text-[0.88rem] font-medium text-ink transition hover:border-forest sm:w-auto"
              >
                <PinIcon className="h-4 w-4" />
                {t.contact.directions}
            </a>
          </div>

          <ul className="mt-8 overflow-hidden rounded-2xl border border-sand bg-white">
            {items.map((item) => {
              const body = (
                <>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand text-ink">
                    <item.icon className="h-[1.1rem] w-[1.1rem]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.68rem] tracking-[0.16em] text-sage uppercase">{item.label}</span>
                    <span className="mt-0.5 block text-[0.95rem] break-words text-ink">
                      {item.icon === PhoneIcon || item.icon === WhatsAppIcon ? <bdi dir="ltr">{item.value}</bdi> : item.value}
                    </span>
                  </span>
                </>
              );
              return (
                <li key={item.label} className="border-b border-black/[0.06] last:border-b-0">
                  {item.href ? (
                    <a
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex items-center gap-4 px-4 py-4 transition hover:bg-ivory"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 px-4 py-4">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
          </Reveal>
        </div>

        <Reveal variant="right" delay={160} className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-sand bg-mist lg:aspect-auto lg:min-h-[480px]">
          <iframe
            title={t.contact.mapTitle}
            src={`https://maps.google.com/maps?q=${mapQuery}&z=17&hl=${locale}&output=embed`}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            suppressHydrationWarning
          />
        </Reveal>
      </div>
    </section>
  );
}
