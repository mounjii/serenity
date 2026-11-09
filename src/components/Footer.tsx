import Link from "next/link";
import { connection } from "next/server";
import { fmt } from "@/i18n/format";
import { getI18n } from "@/i18n/server";
import { serviceText } from "@/i18n/services";
import BackToTop from "./BackToTop";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import { navLinks, RESERVATION_PATH } from "@/lib/navigation";
import { formatPhone, salonPhone, whatsappLink } from "@/lib/phone";
import { SOCIAL_LINKS } from "@/lib/site";
import { getActiveServices } from "@/server/booking/services";
import { FacebookIcon, InstagramIcon } from "./Icons";
import Reveal from "./Reveal";

const socials = [
  { label: "Instagram", icon: InstagramIcon, href: SOCIAL_LINKS.instagram },
  { label: "Facebook", icon: FacebookIcon, href: SOCIAL_LINKS.facebook },
];

export default async function Footer() {
  await connection();
  const { t, href } = await getI18n();
  const phone = salonPhone();
  let treatments: { slug: string; name: string }[] = [];
  try {
    const services = await getActiveServices();
    treatments = services.map((service) => ({ slug: service.slug, name: serviceText(t, service).name }));
  } catch {
    treatments = [];
  }

  return (
    <footer className="bg-ivory font-display text-ink">
      <div className="w-full px-5 pt-12 pb-10 sm:px-6 sm:pt-16 md:pb-12 lg:px-8">
        <div className="grid gap-10 border-t border-sand pt-10 lg:grid-cols-4 lg:gap-12 lg:pt-14">
          <div>
            <Logo flush />
            <Reveal delay={80}>
              <p className="mt-5 max-w-xs text-[0.95rem] leading-relaxed text-sage">{t.footer.blurb}</p>
            </Reveal>
            <Link
              href={href(RESERVATION_PATH)}
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-forest px-5 text-[0.88rem] font-medium text-white transition hover:bg-forest-dark"
            >
              {t.hero.cta}
            </Link>
          </div>

          <Reveal delay={140} as="section">
          <nav aria-label={t.nav.breadcrumb}>
            <ul>
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={href(l.href)} className="inline-flex min-h-11 items-center text-[0.95rem] text-ink transition hover:text-forest">
                    {t.nav[l.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          </Reveal>

          {treatments.length > 0 ? (
            <Reveal delay={200} as="section">
            <nav aria-label={t.footer.treatments}>
              <p className="text-[0.72rem] font-medium tracking-[0.16em] text-sage uppercase">{t.footer.treatments}</p>
              <ul className="mt-3">
                {treatments.slice(0, 4).map((service) => (
                  <li key={service.slug}>
                    <Link
                      href={href(`${RESERVATION_PATH}?service=${service.slug}`)}
                      className="inline-flex min-h-11 items-center text-[0.95rem] text-ink transition hover:text-forest"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            </Reveal>
          ) : null}

          <Reveal delay={260}>
            <p className="text-[0.72rem] font-medium tracking-[0.16em] text-sage uppercase">{t.contact.title}</p>
            <p className="mt-4 max-w-xs text-[0.95rem] leading-relaxed text-ink">{t.contact.address}</p>
            <p className="mt-2 text-[0.88rem] text-sage">{t.contact.hoursValue}</p>
            {phone ? (
              <a href={whatsappLink(phone, t.contact.bookMessage)} className="mt-3 inline-flex min-h-11 items-center text-[0.95rem] text-ink" dir="ltr">
                {formatPhone(phone)}
              </a>
            ) : null}
            <div className="mt-4 flex items-center gap-3">
              <div className="hidden lg:block">
                <LanguageSwitcher variant="icon" />
              </div>
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-11 w-11 place-items-center rounded-full border border-sand text-forest transition hover:border-forest"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-sand pt-5 sm:mt-12 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.78rem] text-sage">{fmt(t.footer.rights, { year: new Date().getFullYear() })}</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href={href("/privacy")} className="inline-flex min-h-11 items-center text-[0.82rem] text-sage transition hover:text-forest">
              {t.footer.privacy}
            </Link>
            <Link href={href(RESERVATION_PATH)} className="inline-flex min-h-11 items-center text-[0.82rem] text-sage transition hover:text-forest">
              {t.footer.bookings}
            </Link>
            <Link href="/admin" className="inline-flex min-h-11 items-center text-[0.82rem] text-sage transition hover:text-forest">
              {t.footer.staff}
            </Link>
            <BackToTop label={t.footer.backToTop} />
          </div>
        </div>
      </div>
    </footer>
  );
}
