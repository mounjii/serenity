import { redirect } from "next/navigation";
import AuthShell from "@/components/account/AuthShell";
import CustomerLoginForm from "@/components/account/CustomerLoginForm";
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

export default async function CustomerLoginPage({
  searchParams,
}: PageProps<"/account/login">) {
  const session = await getCustomerSession();
  if (session) redirect("/account");
  const { t } = await getI18n();
  const { next, reset } = await searchParams;
  return (
    <AuthShell current={t.account.loginTitle}>
      <p className="text-[0.68rem] font-medium tracking-[0.28em] text-sage uppercase">
        {t.account.eyebrow}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-forest sm:text-3xl">
        {t.account.loginTitle}
      </h1>
      <p className="mt-1.5 text-[0.85rem] leading-snug text-sage">
        {t.account.loginLead}
      </p>
      {reset === "1" ? (
        <p className="mt-3 rounded-lg border border-forest/20 bg-white px-4 py-3 text-[0.85rem] text-forest">
          {t.account.forgotChanged}
        </p>
      ) : null}
      <CustomerLoginForm
        next={safeNext(typeof next === "string" ? next : undefined)}
      />
    </AuthShell>
  );
}
