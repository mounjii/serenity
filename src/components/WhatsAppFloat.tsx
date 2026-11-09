import { connection } from "next/server";
import { getI18n } from "@/i18n/server";
import { salonPhone, whatsappLink } from "@/lib/phone";
import { WhatsAppIcon } from "./Icons";

/** Desktop only. Phones already have the fixed booking bar. */
export default async function WhatsAppFloat() {
  await connection();
  const { t } = await getI18n();
  const phone = salonPhone();
  if (!phone) return null;

  return (
    <a
      href={whatsappLink(phone, t.contact.bookMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.contact.whatsapp}
      className="fixed bottom-6 end-6 z-40 hidden h-14 w-14 place-items-center rounded-full bg-forest text-white shadow-[0_16px_30px_-16px_rgba(23,74,53,0.8)] transition hover:bg-forest-dark md:grid"
    >
      <WhatsAppIcon className="h-6 w-6" />
    </a>
  );
}
