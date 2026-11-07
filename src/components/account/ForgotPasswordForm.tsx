"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { passwordResetAction, type PasswordResetState } from "@/app/account/actions";
import PasswordField from "@/components/admin/PasswordField";
import PhoneField from "@/components/account/PhoneField";
import { useI18n } from "@/i18n/client";

const initialState: PasswordResetState = { error: null, step: "ask", channel: "phone", destination: "" };
const labelClass = "mb-1 block text-[0.75rem] font-medium text-ink";
const inputClass =
  "block w-full min-h-10 rounded-full border border-sand bg-white px-4 text-[0.9rem] text-ink outline-none transition focus:border-forest";
const passwordClass =
  "block w-full min-h-10 rounded-full border border-sand bg-white px-4 pe-12 text-[0.9rem] text-ink outline-none transition focus:border-forest";

export default function ForgotPasswordForm() {
  const { t, href } = useI18n();
  const [state, action, pending] = useActionState(passwordResetAction, initialState);
  const [channel, setChannel] = useState<"email" | "phone">(state.channel);
  const [editing, setEditing] = useState(false);
  const onCode = state.step === "code" && !editing;

  useEffect(() => {
    if (state.step === "code") setEditing(false);
  }, [state.step, state.destination]);

  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="channel" value={onCode ? state.channel : channel} />
      {onCode ? (
        <input type="hidden" name={state.channel === "email" ? "email" : "phone"} value={state.destination} />
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        {(["phone", "email"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setChannel(option);
              setEditing(true);
            }}
            className={`min-h-10 rounded-full border text-[0.85rem] font-medium transition ${
              (onCode ? state.channel : channel) === option
                ? "border-forest bg-forest text-white"
                : "border-sand bg-white text-ink"
            }`}
          >
            {option === "phone" ? t.account.phone : t.account.email}
          </button>
        ))}
      </div>

      {onCode ? (
        <>
          <p className="text-[0.82rem] leading-relaxed text-sage">{t.account.forgotSent}</p>
          {state.devCode ? (
            <p className="rounded-lg border border-gold/50 bg-white px-3 py-2 text-[0.82rem] text-ink">
              {t.account.forgotDevCode} <span className="font-semibold tracking-[0.2em]">{state.devCode}</span>
            </p>
          ) : null}
          <div>
            <label htmlFor="code" className={labelClass}>
              {t.account.forgotCode}
            </label>
            <input
              id="code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              dir="ltr"
              className={inputClass}
            />
          </div>
          <PasswordField
            id="password"
            name="password"
            label={t.account.newPassword}
            autoComplete="new-password"
            required
            inputClassName={passwordClass}
            labelClassName={labelClass}
            error={state.fieldErrors?.password}
          />
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
        </>
      ) : (onCode ? state.channel : channel) === "email" ? (
        <div>
          <label htmlFor="email" className={labelClass}>
            {t.account.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state.channel === "email" ? state.destination : undefined}
            aria-invalid={state.fieldErrors?.email ? true : undefined}
            className={`${inputClass} ${state.fieldErrors?.email ? "border-red-300" : ""}`}
          />
          {state.fieldErrors?.email ? <p className="mt-1.5 text-[0.78rem] text-red-700">{state.fieldErrors.email}</p> : null}
        </div>
      ) : (
        <div>
          <label htmlFor="phone" className={labelClass}>
            {t.account.phone}
          </label>
          <PhoneField invalid={Boolean(state.fieldErrors?.phone)} />
          {state.fieldErrors?.phone ? <p className="mt-1.5 text-[0.78rem] text-red-700">{state.fieldErrors.phone}</p> : null}
        </div>
      )}

      {state.error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        name="intent"
        value={onCode ? "confirm" : "send"}
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-forest px-6 text-[0.9rem] font-medium text-white transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {onCode ? t.account.forgotSave : t.account.forgotSend}
      </button>
      {onCode ? (
        <button type="submit" formNoValidate name="intent" value="send" className="w-full text-center text-[0.82rem] font-medium text-ink underline-offset-2 hover:underline">
          {t.account.forgotResend}
        </button>
      ) : null}
      <p className="text-center text-[0.82rem] text-sage">
        <Link href={href("/account/login")} className="font-medium text-ink underline-offset-2 hover:underline">
          {t.account.loginLink}
        </Link>
      </p>
    </form>
  );
}
