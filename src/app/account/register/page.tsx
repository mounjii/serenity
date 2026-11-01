import { redirect } from "next/navigation";
import CustomerRegisterForm from "@/components/account/CustomerRegisterForm";
import { getI18n } from "@/i18n/server";
import { getCustomerSession } from "@/server/customer/session";

function safeNext(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/account";
  if (value.startsWith("/account/login") || value.startsWith("/account/register")) return "/account";
  if (value.startsWith("/account") || value.startsWith("/reservation")) return value;
  return "/account";
}

export default async function CustomerRegisterPage({ searchParams }: PageProps<"/account/register">) {
  const session = await getCustomerSession();
  if (session) redirect("/account");
  const { t } = await getI18n();
  const { next } = await searchParams;
  return (
    <section className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)] sm:p-8">
      <p className="text-[0.7rem] tracking-[0.32em] text-bronze uppercase">{t.account.eyebrow}</p>
      <h1 className="mt-3 font-serif text-3xl text-ink sm:text-4xl">{t.account.registerTitle}</h1>
      <p className="mt-3 text-[0.92rem] leading-relaxed text-ink-soft">{t.account.registerLead}</p>
      <CustomerRegisterForm next={safeNext(typeof next === "string" ? next : undefined)} />
    </section>
  );
}
