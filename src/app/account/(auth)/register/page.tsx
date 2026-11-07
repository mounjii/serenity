import { redirect } from "next/navigation";
import AuthShell from "@/components/account/AuthShell";
import CustomerRegisterForm from "@/components/account/CustomerRegisterForm";
import { getI18n } from "@/i18n/server";
import { getCustomerSession } from "@/server/customer/session";

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
    value.startsWith("/account/register")
  )
    return "/account";
  if (value.startsWith("/account") || value.startsWith("/reservation"))
    return value;
  return "/account";
}

export default async function CustomerRegisterPage({
  searchParams,
}: PageProps<"/account/register">) {
  const session = await getCustomerSession();
  if (session) redirect("/account");
  const { t } = await getI18n();
  const { next } = await searchParams;
  return (
    <AuthShell current={t.account.registerTitle}>
      <p className="text-[0.68rem] font-medium tracking-[0.28em] text-sage uppercase">
        {t.account.eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-forest sm:text-3xl">
        {t.account.registerTitle}
      </h1>
      <p className="mt-1.5 text-[0.85rem] leading-snug text-sage">
        {t.account.registerLead}
      </p>
      <CustomerRegisterForm
        next={safeNext(typeof next === "string" ? next : undefined)}
      />
    </AuthShell>
  );
}
