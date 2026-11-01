"use client";

import Link from "next/link";
import { useActionState } from "react";
import { customerRegisterAction, type CustomerAuthState } from "@/app/account/actions";
import PasswordField from "@/components/admin/PasswordField";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/client";
import { DEFAULT_PHONE_PREFIX } from "@/lib/booking-rules";

const initialState: CustomerAuthState = { error: null };
const inputClass =
  "block w-full rounded-sm border border-sand bg-white px-4 py-3 text-[0.95rem] text-ink outline-none transition focus:border-ink";

export default function CustomerRegisterForm({ next }: { next: string }) {
  const { t, href } = useI18n();
  const [state, formAction, pending] = useActionState(customerRegisterAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="name" className="mb-1.5 block text-[0.8rem]">
          {t.account.name}
        </label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          required
          aria-invalid={state.fieldErrors?.name ? true : undefined}
          className={`${inputClass} ${state.fieldErrors?.name ? "border-red-300" : ""}`}
        />
        {state.fieldErrors?.name && <p className="mt-1.5 text-[0.78rem] text-red-700">{state.fieldErrors.name}</p>}
      </div>
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-[0.8rem]">
          {t.account.phone}
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          defaultValue={`${DEFAULT_PHONE_PREFIX} `}
          aria-invalid={state.fieldErrors?.phone ? true : undefined}
          className={`${inputClass} ${state.fieldErrors?.phone ? "border-red-300" : ""}`}
        />
        <p className="mt-1.5 text-[0.75rem] text-muted">{t.account.phoneHint}</p>
        {state.fieldErrors?.phone && <p className="mt-1.5 text-[0.78rem] text-red-700">{state.fieldErrors.phone}</p>}
      </div>
      <PasswordField
        id="password"
        name="password"
        label={t.account.password}
        autoComplete="new-password"
        required
        error={state.fieldErrors?.password}
      />
      <p className="-mt-3 text-[0.75rem] text-muted">{t.account.passwordHint}</p>
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label={t.account.confirmPassword}
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirmPassword}
      />
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
          {state.error}
        </p>
      )}
      <Button type="submit" loading={pending} className="w-full">
        {t.account.createAccount}
      </Button>
      <p className="text-center text-[0.85rem] text-ink-soft">
        {t.account.hasAccount}{" "}
        <Link href={href(next && next !== "/account" ? `/account/login?next=${encodeURIComponent(next)}` : "/account/login")} className="text-ink underline-offset-2 hover:underline">
          {t.account.loginLink}
        </Link>
      </p>
    </form>
  );
}
