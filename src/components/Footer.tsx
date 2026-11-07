import Link from "next/link";
import { fmt } from "@/i18n/format";
import { getI18n } from "@/i18n/server";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import { navLinks, RESERVATION_PATH } from "@/lib/navigation";
import { SOCIAL_LINKS } from "@/lib/site";
import { ArrowUp, FacebookIcon, InstagramIcon } from "./Icons";

const socials = [
  { label: "Instagram", icon: InstagramIcon, href: SOCIAL_LINKS.instagram },
  { label: "Facebook", icon: FacebookIcon, href: SOCIAL_LINKS.facebook },
];

export default async function Footer() {
  const { t, href } = await getI18n();
  return (
    <footer className="bg-ivory font-display text-ink">
      <div className="w-full px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 border-t border-sand py-10 sm:py-14 md:flex-row md:justify-between">
          <Logo variant="stacked" />

          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 sm:gap-x-8">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={href(l.href)} className="inline-block py-2 text-[0.9rem] text-sage transition hover:text-forest">
                  {t.nav[l.key]}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-sand text-forest transition hover:border-forest"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 border-t border-sand pt-4 pb-safe text-center text-[0.78rem] text-sage md:flex-row md:justify-between md:pb-6">
          <p>{fmt(t.footer.rights, { year: new Date().getFullYear() })}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-8">
            <LanguageSwitcher variant="inline" />
            <Link href={href("/privacy")} className="hover:text-forest">
              {t.footer.privacy}
            </Link>
            <Link href={href(RESERVATION_PATH)} className="hover:text-forest">
              {t.footer.bookings}
            </Link>
            <Link href="/admin" className="hover:text-forest">
              {t.footer.staff}
            </Link>
            <Link
              href="#"
              aria-label={t.footer.backToTop}
              className="grid h-9 w-9 place-items-center rounded-full border border-sand text-forest transition hover:border-forest"
            >
              <ArrowUp className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
