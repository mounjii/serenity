"use client";

import { useActionState, useEffect, useRef } from "react";
import { changePasswordAction, type CustomerAuthState } from "@/app/account/actions";
import PasswordField from "@/components/admin/PasswordField";
import { useI18n } from "@/i18n/client";

const inputClass =
  "block w-full rounded-full border border-sand bg-white px-4 pe-12 text-[0.9rem] text-ink outline-none min-h-10 focus:border-forest";
const labelClass = "mb-1 block text-[0.75rem] font-medium text-ink";

export default function PasswordForm() {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(changePasswordAction, { error: null } satisfies CustomerAuthState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.saved) formRef.current?.reset();
  }, [state.saved]);

  return (
    <form ref={formRef} action={action} className="mt-4 space-y-3">
      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label={t.account.currentPassword}
        autoComplete="current-password"
        required
        error={state.fieldErrors?.currentPassword}
        inputClassName={inputClass}
        labelClassName={labelClass}
      />
      <PasswordField
        id="newPassword"
        name="password"
        label={t.account.newPassword}
        autoComplete="new-password"
        required
        error={state.fieldErrors?.password}
        inputClassName={inputClass}
        labelClassName={labelClass}
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label={t.account.confirmPassword}
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirmPassword}
        inputClassName={inputClass}
        labelClassName={labelClass}
      />
      {state.error && !state.fieldErrors && <p className="text-[0.78rem] text-red-700">{state.error}</p>}
      {state.saved && <p className="text-[0.78rem] text-sage">{t.account.passwordUpdated}</p>}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-5 text-[0.84rem] font-medium text-white transition hover:bg-forest-dark disabled:opacity-60"
      >
        {t.loyalty.saveBirthday}
      </button>
    </form>
  );
}
