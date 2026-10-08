import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RESERVATION_PATH } from "@/lib/navigation";
import { formatPhone, normalizePhone } from "@/lib/phone";

export const metadata: Metadata = {
  title: "Privacy Policy — Touch Sense",
  description: "How Touch Sense Thai Massage collects, uses and protects your personal data.",
};

const LAST_UPDATED = "October 8, 2026";

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "Who we are",
    body: (
      <p>
        Touch Sense Thai Massage (&ldquo;Touch Sense&rdquo;, &ldquo;we&rdquo;) is a massage salon located at 2nd floor, 42 Ave Al Haouz, Rabat 10140,
        Morocco. We are responsible for the personal data collected through this website.
      </p>
    ),
  },
  {
    title: "What we collect",
    body: (
      <>
        <p>When you book a treatment, we only ask for what we need to take care of your appointment:</p>
        <ul>
          <li>your name;</li>
          <li>your phone number;</li>
          <li>the treatment, date and time you choose;</li>
          <li>any note you decide to add (for example, a preference or a health detail you want the therapist to know).</li>
        </ul>
        <p>
          We do not ask for your email, address, date of birth or payment details. Payment is made at the salon. Please only share health
          information in the note if you want us to take it into account during your session.
        </p>
      </>
    ),
  },
  {
    title: "Why we use it",
    body: (
      <ul>
        <li>to book, confirm, change or cancel your appointment;</li>
        <li>to contact you about your booking by phone or WhatsApp;</li>
        <li>to prepare your session and respect the preferences you shared;</li>
        <li>to keep basic records of past bookings for the running of the salon.</li>
      </ul>
    ),
  },
  {
    title: "Legal basis",
    body: (
      <p>
        We process your data because it is necessary to provide the booking you request, and with your consent when you send us your details. This
        policy follows Moroccan Law No. 09-08 on the protection of individuals with regard to the processing of personal data.
      </p>
    ),
  },
  {
    title: "Who can see it",
    body: (
      <>
        <p>Only the Touch Sense team can see your booking details. We never sell or rent your data, and we do not use it for advertising.</p>
        <p>Your data may pass through a few service providers that help us run the website, only for that purpose:</p>
        <ul>
          <li>our hosting provider, which stores the website and its database;</li>
          <li>WhatsApp (Meta), if you choose to message us or we confirm your booking there;</li>
          <li>Google Maps, which displays the map in the Contact section.</li>
        </ul>
      </>
    ),
  },
  {
    title: "How long we keep it",
    body: (
      <p>
        We keep booking details for as long as needed to manage your appointments and for a maximum of 3 years after your last visit, unless the law
        requires us to keep them longer. After that, they are deleted.
      </p>
    ),
  },
  {
    title: "Cookies",
    body: (
      <>
        <p>
          This website does not use advertising or tracking cookies. We use a single essential cookie for the salon&rsquo;s private admin area; visitors
          who book online do not receive it.
        </p>
        <p>
          The map in the Contact section is provided by Google Maps, which may set its own cookies when it loads. You can read{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google&rsquo;s privacy policy
          </a>{" "}
          for details.
        </p>
      </>
    ),
  },
  {
    title: "How we protect it",
    body: (
      <p>
        Your data is stored on a secured server. Access to bookings is limited to the salon&rsquo;s password-protected admin area, and we only keep
        the information described above.
      </p>
    ),
  },
  {
    title: "Your rights",
    body: (
      <>
        <p>
          You can ask us at any time to see the data we hold about you, to correct it, or to delete it. You can also object to its use. Just
          contact us using the details below; we will reply as quickly as possible.
        </p>
        <p>
          If you believe your rights are not respected, you can file a complaint with the CNDP (Commission Nationale de contrôle de la protection des
          Données à caractère Personnel) at{" "}
          <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer">
            www.cndp.ma
          </a>
          .
        </p>
      </>
    ),
  },
  {
    title: "Changes to this policy",
    body: <p>We may update this policy from time to time. The date at the top of this page shows when it was last changed.</p>,
  },
];

export default async function PrivacyPage() {
  await connection();
  const phone = normalizePhone(process.env.CONTACT_PHONE || process.env.OWNER_WHATSAPP_PHONE || "");
  const email = process.env.CONTACT_EMAIL?.trim() || null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-cream pt-28 pb-16 sm:pt-36 sm:pb-24">
        <article className="mx-auto max-w-3xl px-5 sm:px-6">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-4 font-serif text-[2.4rem] leading-[1.08] text-ink sm:text-5xl">Privacy Policy</h1>
          <p className="mt-3 text-[0.8rem] text-muted">Last updated: {LAST_UPDATED}</p>
          <p className="mt-6 text-[0.95rem] leading-relaxed font-light text-ink-soft">
            Your privacy matters to us as much as your comfort. This page explains, in plain words, what information we collect when you book with
            Touch Sense, why we need it, and how you stay in control of it.
          </p>

          <div className="mt-10 divide-y divide-sand border-y border-sand">
            {sections.map((s, i) => (
              <section key={s.title} className="py-7 sm:py-8">
                <h2 className="flex items-baseline gap-3 font-serif text-[1.45rem] text-ink sm:text-[1.6rem]">
                  <span className="text-[0.8rem] font-sans tracking-[0.2em] text-bronze">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <div className="legal-prose mt-3">{s.body}</div>
              </section>
            ))}

            <section className="py-7 sm:py-8">
              <h2 className="flex items-baseline gap-3 font-serif text-[1.45rem] text-ink sm:text-[1.6rem]">
                <span className="text-[0.8rem] font-sans tracking-[0.2em] text-bronze">{String(sections.length + 1).padStart(2, "0")}</span>
                Contact us
              </h2>
              <div className="legal-prose mt-3">
                <p>For any question about your data or this policy:</p>
                <ul>
                  {phone && (
                    <li>
                      Phone / WhatsApp: <a href={`tel:${phone}`}>{formatPhone(phone)}</a>
                    </li>
                  )}
                  {email && (
                    <li>
                      Email: <a href={`mailto:${email}`}>{email}</a>
                    </li>
                  )}
                  <li>At the salon: 2nd floor, 42 Ave Al Haouz, Rabat 10140</li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={RESERVATION_PATH}
              className="inline-flex min-h-12 items-center rounded-full bg-ink px-8 text-[0.85rem] tracking-wide text-cream transition hover:bg-black"
            >
              Book a massage
            </Link>
            <Link href="/" className="inline-flex min-h-12 items-center rounded-full border border-sand px-8 text-[0.85rem] text-ink transition hover:border-ink">
              Back to home
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
