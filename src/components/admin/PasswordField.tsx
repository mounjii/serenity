"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/Icons";

const inputClass =
  "block w-full rounded-sm border border-sand bg-white px-4 py-3 pe-12 text-[0.95rem] text-ink outline-none transition focus:border-ink";

export default function PasswordField({
  id,
  name,
  label,
  autoComplete,
  required,
  error,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[0.8rem]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={error ? true : undefined}
          className={`${inputClass} ${error ? "border-red-300" : ""}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute end-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center text-ink-soft transition hover:text-ink"
        >
          {visible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-[0.78rem] text-red-700">{error}</p>}
    </div>
  );
}
