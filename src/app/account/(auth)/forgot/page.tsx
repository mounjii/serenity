import AuthShell from "@/components/account/AuthShell";
import ForgotPasswordForm from "@/components/account/ForgotPasswordForm";
import { getI18n } from "@/i18n/server";

export default async function ForgotPasswordPage() {
  const { t } = await getI18n();

  return (
    <AuthShell current={t.account.forgotTitle}>
      <p className="text-[0.68rem] font-medium tracking-[0.28em] text-sage uppercase">{t.account.eyebrow}</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-forest sm:text-3xl">{t.account.forgotTitle}</h1>
      <p className="mt-1.5 text-[0.85rem] leading-snug text-sage">{t.account.forgotLead}</p>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
