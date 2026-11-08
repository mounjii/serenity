import Link from "next/link";
import { fmt } from "@/i18n/format";
import { getI18n } from "@/i18n/server";
import BackToTop from "./BackToTop";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import { navLinks, RESERVATION_PATH } from "@/lib/navigation";
import { SOCIAL_LINKS } from "@/lib/site";
import { FacebookIcon, InstagramIcon } from "./Icons";

const socials = [
  { label: "Instagram", icon: InstagramIcon, href: SOCIAL_LINKS.instagram },
  { label: "Facebook", icon: FacebookIcon, href: SOCIAL_LINKS.facebook },
];

export default async function Footer() {
  const { t, href } = await getI18n();
  return (
    <footer className="bg-ivory font-display text-ink">
      <div className="w-full px-5 pt-12 pb-10 sm:px-6 sm:pt-16 md:pb-12 lg:px-8">
        <div className="grid gap-10 border-t border-sand pt-10 lg:grid-cols-[minmax(16rem,1.15fr)_auto_minmax(14rem,0.85fr)] lg:items-start lg:gap-16 lg:pt-14">
          <div>
            <Logo flush />
            <p className="mt-5 max-w-xs text-[0.95rem] leading-relaxed text-sage">{t.contact.address}</p>
            <p className="mt-2 text-[0.88rem] text-ink">{t.contact.hoursValue}</p>
            <Link
              href={href(RESERVATION_PATH)}
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-forest px-5 text-[0.88rem] font-medium text-white transition hover:bg-forest-dark"
            >
              {t.nav.bookNow}
            </Link>
          </div>

          <nav>
            <ul className="grid grid-cols-2 gap-x-6 sm:max-w-xs lg:grid-cols-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={href(l.href)} className="inline-flex min-h-11 items-center text-[0.95rem] text-ink transition hover:text-forest">
                    {t.nav[l.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="icon" />
            <div className="flex gap-3">
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
          </div>
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
