import Link from "next/link";
import Logo from "./Logo";
import { navLinks, RESERVATION_PATH } from "@/lib/navigation";
import { ArrowUp, FacebookIcon, InstagramIcon, PinterestIcon } from "./Icons";

const socials = [
  { label: "Instagram", icon: InstagramIcon, href: "#" },
  { label: "Facebook", icon: FacebookIcon, href: "#" },
  { label: "Pinterest", icon: PinterestIcon, href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-cream">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex flex-col items-center gap-8 border-t border-sand py-12 md:flex-row md:justify-between">
          <Logo variant="stacked" />

          <ul className="flex flex-wrap justify-center gap-8">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-[0.8rem] text-ink-soft transition hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex gap-3">
            {socials.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="grid h-9 w-9 place-items-center rounded-full border border-sand text-ink-soft transition hover:border-ink hover:text-ink"
              >
                <s.icon className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 border-t border-sand py-6 text-[0.72rem] text-muted md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Touch Sense Thai Massage. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link href="#" className="hover:text-ink">Privacy</Link>
            <Link href={RESERVATION_PATH} className="hover:text-ink">Bookings</Link>
            <Link href="#" className="hover:text-ink">Wholesale</Link>
            <Link
              href="#"
              aria-label="Back to top"
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
