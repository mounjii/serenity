import Image from "next/image";
import { blurProps, images } from "@/lib/images";
import { formatPhone, normalizePhone, whatsappLink } from "@/lib/phone";
import Reveal from "./Reveal";
import { ButtonAnchor } from "./ui/Button";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "./Icons";

const WHATSAPP_GREETING = "Hello Touch Sense, I would like some information.";

type Item = { icon: (p: React.SVGProps<SVGSVGElement>) => React.JSX.Element; label: string; value: string; href?: string; external?: boolean };

export default function Contact() {
  const phone = normalizePhone(process.env.CONTACT_PHONE || process.env.OWNER_WHATSAPP_PHONE || "");
  const address = process.env.CONTACT_ADDRESS?.trim() || null;
  const email = process.env.CONTACT_EMAIL?.trim() || null;
  const mapQuery = address ? encodeURIComponent(address) : null;

  const items: Item[] = [];
  if (phone) items.push({ icon: PhoneIcon, label: "Call us", value: formatPhone(phone), href: `tel:${phone}` });
  if (address && mapQuery) {
    items.push({ icon: PinIcon, label: "Visit us", value: address, href: `https://www.google.com/maps/search/?api=1&query=${mapQuery}`, external: true });
  }
  if (email) items.push({ icon: MailIcon, label: "Email", value: email, href: `mailto:${email}` });
  items.push({ icon: ClockIcon, label: "Opening hours", value: "Monday – Saturday · 10:00 – 20:00" });

  return (
    <section id="contact" className="scroll-mt-16 bg-cream-dark/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-28">
        <Reveal>
          <p className="eyebrow">Get in Touch</p>
          <h2 className="mt-4 font-serif text-[2.4rem] leading-[1.08] text-ink sm:text-5xl lg:text-[3.2rem]">Contact Us</h2>
          <p className="mt-4 max-w-md text-[0.9rem] leading-relaxed font-light text-ink-soft">
            A question about a treatment, a gift, or a special request? Message us on WhatsApp or give us a call. We reply quickly.
          </p>

          {phone && (
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <ButtonAnchor href={whatsappLink(phone, WHATSAPP_GREETING)} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                <WhatsAppIcon className="h-4 w-4" />
                Chat on WhatsApp
              </ButtonAnchor>
              <ButtonAnchor href={`tel:${phone}`} variant="outline" className="w-full sm:w-auto">
                <PhoneIcon className="h-4 w-4" />
                Call now
              </ButtonAnchor>
            </div>
          )}

          <ul className="mt-10 divide-y divide-sand border-y border-sand">
            {items.map((item) => {
              const body = (
                <>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-sand bg-cream text-bronze">
                    <item.icon className="h-[1.1rem] w-[1.1rem]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.68rem] tracking-[0.2em] text-muted uppercase">{item.label}</span>
                    <span className="mt-0.5 block text-[0.95rem] break-words text-ink">{item.value}</span>
                  </span>
                </>
              );
              return (
                <li key={item.label}>
                  {item.href ? (
                    <a
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="flex items-center gap-4 py-4 transition active:bg-sand/40 [@media(hover:hover)]:hover:opacity-75"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 py-4">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </Reveal>

        {mapQuery ? (
          <Reveal variant="fade" delay={150} className="relative aspect-[4/3] overflow-hidden rounded-sm border border-sand bg-sand lg:aspect-auto lg:min-h-[480px]">
            <iframe
              title="Map showing Touch Sense"
              src={`https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed`}
              className="absolute inset-0 h-full w-full grayscale-[35%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        ) : (
          <Reveal variant="zoom" delay={150} className="relative hidden overflow-hidden rounded-sm lg:block lg:min-h-[480px]">
            <Image
              src={images.gallery[3]} {...blurProps(images.gallery[3])}
              alt="Relaxation lounge at Touch Sense"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </Reveal>
        )}
      </div>
    </section>
  );
}
