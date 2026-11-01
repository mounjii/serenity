"use client";

import Link from "next/link";
import { useActionState } from "react";
import { customerLoginAction, type CustomerAuthState } from "@/app/account/actions";
import PasswordField from "@/components/admin/PasswordField";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/i18n/client";
import { DEFAULT_PHONE_PREFIX } from "@/lib/booking-rules";

const initialState: CustomerAuthState = { error: null };
const inputClass =
  "block w-full rounded-sm border border-sand bg-white px-4 py-3 text-[0.95rem] text-ink outline-none transition focus:border-ink";

export default function CustomerLoginForm({ next }: { next: string }) {
  const { t, href } = useI18n();
  const [state, formAction, pending] = useActionState(customerLoginAction, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
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
      <PasswordField id="password" name="password" label={t.account.password} autoComplete="current-password" required />
      {state.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
          {state.error}
        </p>
      )}
      <Button type="submit" loading={pending} className="w-full">
        {t.account.signIn}
      </Button>
      <p className="text-center text-[0.85rem] text-ink-soft">
        {t.account.noAccount}{" "}
        <Link href={href(next && next !== "/account" ? `/account/register?next=${encodeURIComponent(next)}` : "/account/register")} className="text-ink underline-offset-2 hover:underline">
          {t.account.registerLink}
        </Link>
      </p>
      <p className="text-center text-[0.8rem] text-muted">
        <Link href="/admin/login" className="underline-offset-2 hover:text-ink hover:underline">
          {t.account.staffSignIn}
        </Link>
      </p>
    </form>
  );
}
