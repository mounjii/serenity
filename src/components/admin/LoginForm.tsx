"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";
import PasswordField from "./PasswordField";

const initialState: LoginState = { error: null };
const inputClass =
  "block w-full min-h-10 rounded-full border border-sand bg-white px-4 text-[0.9rem] text-ink outline-none transition focus:border-forest";
const labelClass = "mb-1 block text-[0.75rem] font-medium text-ink";
const passwordClass =
  "block w-full min-h-10 rounded-full border border-sand bg-white px-4 pe-12 text-[0.9rem] text-ink outline-none transition focus:border-forest";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="username" className={labelClass}>
          Username
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          className={inputClass}
        />
      </div>
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        required
        inputClassName={passwordClass}
        labelClassName={labelClass}
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
        Sign in
      </button>
    </form>
  );
}
