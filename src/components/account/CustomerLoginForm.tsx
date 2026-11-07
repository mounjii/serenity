"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  customerLoginAction,
  type CustomerAuthState,
} from "@/app/account/actions";
import PasswordField from "@/components/admin/PasswordField";
import PhoneField from "@/components/account/PhoneField";
import { useI18n } from "@/i18n/client";

const initialState: CustomerAuthState = { error: null };
const labelClass = "mb-1 block text-[0.75rem] font-medium text-ink";
const passwordClass =
  "block w-full min-h-10 rounded-full border border-sand bg-white px-4 pe-12 text-[0.9rem] text-ink outline-none transition focus:border-forest";

export default function CustomerLoginForm({ next }: { next: string }) {
  const { t, href } = useI18n();
  const [state, formAction, pending] = useActionState(
    customerLoginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="phone" className={labelClass}>
          {t.account.phone}
        </label>
        <PhoneField invalid={Boolean(state.fieldErrors?.phone)} />
        <p className="mt-1 text-[0.7rem] leading-tight text-sage">
          {t.account.phoneHint}
        </p>
        {state.fieldErrors?.phone && (
          <p className="mt-1.5 text-[0.78rem] text-red-700">
            {state.fieldErrors.phone}
          </p>
        )}
      </div>
      <PasswordField
        id="password"
        name="password"
        label={t.account.password}
        autoComplete="current-password"
        required
        inputClassName={passwordClass}
        labelClassName={labelClass}
      />
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pt-0.5">
        <label className="flex items-center gap-2 text-[0.82rem] text-ink">
          <input type="checkbox" name="remember" value="1" defaultChecked className="h-4 w-4 accent-forest" />
          {t.account.rememberMe}
        </label>
        <Link href={href("/account/forgot")} className="text-[0.82rem] font-medium text-ink underline-offset-2 hover:underline">
          {t.account.forgotTitle}
        </Link>
      </div>
      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700"
        >
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-forest px-6 text-[0.9rem] font-medium text-white transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending && (
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        )}
        {t.account.signIn}
      </button>
      <p className="text-center text-[0.82rem] text-sage">
        {t.account.noAccount}{" "}
        <Link
          href={href(
            next && next !== "/account"
              ? `/account/register?next=${encodeURIComponent(next)}`
              : "/account/register",
          )}
          className="font-medium text-ink underline-offset-2 hover:underline"
        >
          {t.account.registerLink}
        </Link>
      </p>
      <p className="text-center text-[0.78rem] text-sage">
        <Link
          href="/admin/login"
          className="underline-offset-2 hover:text-ink hover:underline"
        >
          {t.account.staffSignIn}
        </Link>
      </p>
    </form>
  );
}
