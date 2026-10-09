import Link from "next/link";
import { fmt } from "@/i18n/format";
import { getI18n } from "@/i18n/server";
import Logo from "./Logo";
import Reveal from "./Reveal";
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
    <footer className="bg-cream">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <Reveal variant="fade" className="flex flex-col items-center gap-4 border-t border-sand py-7 sm:gap-8 sm:py-12 md:flex-row md:justify-between">
          <Logo variant="stacked" />

          <ul className="flex flex-wrap justify-center gap-x-5 sm:gap-8">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={href(l.href)} className="inline-block py-2 text-[0.85rem] text-ink-soft transition hover:text-ink sm:py-0 sm:text-[0.8rem]">
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
                className="grid h-10 w-10 place-items-center rounded-full border border-sand text-ink-soft transition hover:border-ink hover:text-ink sm:h-9 sm:w-9"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </Reveal>

        <div className="flex flex-col items-center gap-3 border-t border-sand pt-4 pb-safe text-center text-[0.72rem] text-muted md:flex-row md:justify-between md:pb-6">
          <p>{fmt(t.footer.rights, { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-6 sm:gap-8">
            <Link href={href("/privacy")} className="hover:text-ink">{t.footer.privacy}</Link>
            <Link href={href(RESERVATION_PATH)} className="hover:text-ink">{t.footer.bookings}</Link>
            <Link
              href="#"
              aria-label={t.footer.backToTop}
              className="grid h-9 w-9 place-items-center rounded-full bg-sand/70 text-ink transition hover:bg-ink hover:text-cream"
            >
              <ArrowUp className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
