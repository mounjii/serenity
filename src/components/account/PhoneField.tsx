"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown } from "@/components/Icons";
import { useI18n } from "@/i18n/client";
import { DEFAULT_PHONE_COUNTRY } from "@/lib/booking-rules";
import { getCountries, getCountryCallingCode, type CountryCode } from "libphonenumber-js";

const countries = getCountries();

function Flag({ code }: { code: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="inline-flex h-3.5 w-5 items-center justify-center rounded-[2px] bg-sand text-[0.5rem] font-semibold text-ink">
        {code}
      </span>
    );
  }
  return (
    <img
      src={`/flags/${code.toLowerCase()}.svg`}
      alt=""
      width={20}
      height={14}
      className="h-3.5 w-5 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(33,31,27,0.12)]"
      onError={() => setFailed(true)}
    />
  );
}

export default function PhoneField({
  id = "phone",
  invalid = false,
}: {
  id?: string;
  invalid?: boolean;
}) {
  const { t, locale } = useI18n();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [country, setCountry] = useState<CountryCode>(DEFAULT_PHONE_COUNTRY);
  const [national, setNational] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const names = useMemo(() => new Intl.DisplayNames([locale], { type: "region" }), [locale]);
  const catalog = useMemo(() => {
    return countries
      .map((code) => ({
        code,
        name: names.of(code) ?? code,
        dial: getCountryCallingCode(code),
      }))
      .sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [locale, names]);

  const shown = query.trim()
    ? catalog.filter((row) => {
        const q = query.trim().toLowerCase();
        return row.name.toLowerCase().includes(q) || row.dial.includes(q.replace("+", "")) || row.code.toLowerCase().includes(q);
      })
    : catalog;

  const selected = catalog.find((row) => row.code === country) ?? catalog[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name="phone" value={national.trim() ? `+${selected.dial} ${national.trim()}` : ""} />
      <div className={`flex min-h-10 overflow-hidden rounded-full border bg-white ${invalid ? "border-red-300" : "border-sand focus-within:border-forest"}`}>
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
          className="flex shrink-0 items-center gap-1.5 border-e border-sand px-3 text-[0.85rem] text-ink"
        >
          <Flag code={selected.code} />
          <span dir="ltr">+{selected.dial}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-sage transition ${open ? "rotate-180" : ""}`} />
        </button>
        <input
          id={id}
          type="tel"
          autoComplete="tel-national"
          required
          dir="ltr"
          inputMode="tel"
          value={national}
          onChange={(event) => setNational(event.target.value)}
          aria-invalid={invalid || undefined}
          placeholder="6 12 34 56 78"
          className="min-w-0 flex-1 bg-transparent px-3 text-[0.9rem] text-ink outline-none"
        />
      </div>
      {open ? (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-2xl border border-sand bg-white shadow-[0_16px_40px_-24px_rgba(36,56,36,0.45)]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            placeholder={t.account.countrySearch}
            className="w-full border-b border-sand px-3 py-2 text-[0.85rem] text-ink outline-none"
          />
          <ul id={listId} role="listbox" className="max-h-56 overflow-y-auto py-1">
            {shown.map((row) => (
              <li key={row.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={row.code === country}
                  onClick={() => {
                    setCountry(row.code);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-start text-[0.85rem] ${
                    row.code === country ? "bg-forest/5 text-forest" : "text-ink hover:bg-ivory"
                  }`}
                >
                  <Flag code={row.code} />
                  <span className="min-w-0 flex-1 truncate">{row.name}</span>
                  <span dir="ltr" className="text-sage">+{row.dial}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
