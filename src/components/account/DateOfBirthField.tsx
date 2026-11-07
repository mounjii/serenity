"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "@/components/Icons";
import { INTL_LOCALE } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

const selectClass =
  "block w-full min-h-10 appearance-none rounded-full border bg-white ps-3 pe-7 text-[0.9rem] text-ink outline-none transition focus:border-forest";

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export default function DateOfBirthField({ error }: { error?: string }) {
  const { t, locale } = useI18n();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const today = useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  const years = useMemo(
    () => Array.from({ length: todayYear - 1900 + 1 }, (_, index) => String(todayYear - index)),
    [todayYear],
  );
  const months = useMemo(() => {
    const format = new Intl.DateTimeFormat(INTL_LOCALE[locale], { month: "long", timeZone: "UTC" });
    const last = year === String(todayYear) ? todayMonth : 12;
    return Array.from({ length: last }, (_, index) => ({
      value: String(index + 1).padStart(2, "0"),
      label: format.format(new Date(Date.UTC(2020, index, 1))),
    }));
  }, [locale, todayMonth, todayYear, year]);

  const monthNumber = Number(month);
  const maxDay =
    year === String(todayYear) && monthNumber === todayMonth
      ? todayDay
      : daysInMonth(Number(year) || 2021, monthNumber || 1);
  const dayCount = month ? maxDay : 31;
  const dayValue = day && Number(day) <= dayCount ? day : "";
  const monthValue = months.some((item) => item.value === month) ? month : "";
  const birthday = year && monthValue && dayValue ? `${year}-${monthValue}-${dayValue}` : "";
  const border = error ? "border-red-300" : "border-sand";

  return (
    <fieldset>
      <legend className="mb-1 block text-[0.75rem] font-medium text-ink">{t.account.dateOfBirth}</legend>
      <div className="grid grid-cols-[4.6rem_minmax(0,1.35fr)_5.4rem] gap-1.5">
        <DobSelect
          id="birth-day"
          label={t.account.day}
          value={dayValue}
          border={border}
          autoComplete="bday-day"
          onChange={setDay}
          options={Array.from({ length: dayCount }, (_, index) => {
            const value = String(index + 1).padStart(2, "0");
            return { value, label: String(index + 1) };
          })}
        />
        <DobSelect
          id="birth-month"
          label={t.account.month}
          value={monthValue}
          border={border}
          autoComplete="bday-month"
          onChange={setMonth}
          options={months}
        />
        <DobSelect
          id="birth-year"
          label={t.account.year}
          value={year}
          border={border}
          autoComplete="bday-year"
          onChange={setYear}
          options={years.map((value) => ({ value, label: value }))}
        />
      </div>
      <input type="hidden" name="birthday" value={birthday} />
      {error && <p className="mt-1.5 text-[0.78rem] text-red-700">{error}</p>}
    </fieldset>
  );
}

function DobSelect({
  id,
  label,
  value,
  options,
  border,
  autoComplete,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  border: string;
  autoComplete: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        required
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className={`${selectClass} ${border}`}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sage" />
    </div>
  );
}
