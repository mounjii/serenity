"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  customerRegisterAction,
  type CustomerAuthState,
} from "@/app/account/actions";
import PasswordField from "@/components/admin/PasswordField";
import DateOfBirthField from "@/components/account/DateOfBirthField";
import PhoneField from "@/components/account/PhoneField";
import { useI18n } from "@/i18n/client";

const initialState: CustomerAuthState = { error: null };
const inputClass =
  "block w-full min-h-10 rounded-full border border-sand bg-white px-4 text-[0.9rem] text-ink outline-none transition focus:border-forest";
const labelClass = "mb-1 block text-[0.75rem] font-medium text-ink";
const passwordClass =
  "block w-full min-h-10 rounded-full border border-sand bg-white px-4 pe-12 text-[0.9rem] text-ink outline-none transition focus:border-forest";

export default function CustomerRegisterForm({ next }: { next: string }) {
  const { t, href } = useI18n();
  const [state, formAction, pending] = useActionState(
    customerRegisterAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="name" className={labelClass}>
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
        {state.fieldErrors?.name && (
          <p className="mt-1.5 text-[0.78rem] text-red-700">
            {state.fieldErrors.name}
          </p>
        )}
      </div>
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
      <div>
        <label htmlFor="email" className={labelClass}>
          {t.account.email}{" "}
          <span className="font-normal text-sage">
            ({t.account.emailOptional})
          </span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          aria-invalid={state.fieldErrors?.email ? true : undefined}
          className={`${inputClass} ${state.fieldErrors?.email ? "border-red-300" : ""}`}
        />
        {state.fieldErrors?.email && (
          <p className="mt-1.5 text-[0.78rem] text-red-700">
            {state.fieldErrors.email}
          </p>
        )}
      </div>
      <DateOfBirthField error={state.fieldErrors?.birthday} />
      <PasswordField
        id="password"
        name="password"
        label={t.account.password}
        autoComplete="new-password"
        required
        inputClassName={passwordClass}
        labelClassName={labelClass}
        error={state.fieldErrors?.password}
      />
      <p className="-mt-1 text-[0.7rem] leading-tight text-sage">
        {t.account.passwordHint}
      </p>
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label={t.account.confirmPassword}
        autoComplete="new-password"
        required
        inputClassName={passwordClass}
        labelClassName={labelClass}
        error={state.fieldErrors?.confirmPassword}
      />
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
        {t.account.createAccount}
      </button>
      <p className="text-center text-[0.82rem] text-sage">
        {t.account.hasAccount}{" "}
        <Link
          href={href(
            next && next !== "/account"
              ? `/account/login?next=${encodeURIComponent(next)}`
              : "/account/login",
          )}
          className="font-medium text-ink underline-offset-2 hover:underline"
        >
          {t.account.loginLink}
        </Link>
      </p>
    </form>
  );
}
