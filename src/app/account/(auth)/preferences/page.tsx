import { redirect } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import PreferencesForm from "@/components/account/PreferencesForm";
import { serviceText } from "@/i18n/services";
import { getI18n } from "@/i18n/server";
import { serviceImage } from "@/lib/images";
import { getActiveServices } from "@/server/booking/services";
import { getCustomerProfile } from "@/server/customer/preferences";
import { requireCustomerPage } from "@/server/customer/session";

function safeNext(value: string | undefined): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  )
    return "/account";
  if (
    value.startsWith("/account/login") ||
    value.startsWith("/account/register") ||
    value.startsWith("/account/preferences")
  )
    return "/account";
  if (value.startsWith("/account") || value.startsWith("/reservation"))
    return value;
  return "/account";
}

export default async function PreferencesPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const session = await requireCustomerPage();
  const { t, href } = await getI18n();
  const params = await searchParams;
  const next = safeNext(
    typeof params.next === "string" ? params.next : undefined,
  );
  const profile = await getCustomerProfile(session.id);
  if (
    profile?.preferredMassage &&
    profile.wellnessGoal &&
    profile.visitFrequency &&
    profile.discovery
  )
    redirect(href(next));

  const services = await getActiveServices();
  const massages = services.map((service) => ({
    slug: service.slug,
    name: serviceText(t, service).name,
    image: serviceImage(service.slug),
  }));

  return (
    <section className="mx-auto w-full max-w-3xl py-4">
      <Breadcrumbs current={t.account.preferencesTitle} />
      <p className="text-[0.68rem] font-medium tracking-[0.28em] text-sage uppercase">
        {t.account.eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-forest sm:text-3xl">
        {t.account.preferencesTitle}
      </h1>
      <p className="mt-1.5 text-[0.85rem] leading-snug text-sage">
        {t.account.preferencesLead}
      </p>
      <PreferencesForm next={next} massages={massages} />
    </section>
  );
}
