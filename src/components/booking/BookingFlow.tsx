"use client";

import { formatInTimeZone } from "date-fns-tz";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { DEFAULT_PHONE_PREFIX, NOTE_MAX } from "@/lib/booking-rules";
import { customerDetailsSchema } from "@/lib/booking-schema";
import { formatDuration, formatPrice } from "@/lib/format";
import { formatPhone } from "@/lib/phone";
import { formatLongDate } from "@/lib/time";
import type { BookableDay } from "@/server/booking/calendar";
import type { PublicService } from "@/server/booking/services";
import type { ApiErrorBody } from "@/server/errors";

type Slot = { time: string; startAt: string };
type Step = 1 | 2 | 3 | 4 | 5;
type Details = { customerName: string; customerPhone: string; note: string; website: string };

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "Service" },
  { id: 2, label: "Date" },
  { id: 3, label: "Time" },
  { id: 4, label: "Details" },
  { id: 5, label: "Confirm" },
];

const SLOT_TAKEN_MESSAGE = "This time was just booked by someone else. Please choose another time.";
const SLOT_REFRESH_MS = 30_000;
const NETWORK_MESSAGE = "We couldn't reach the server. Please check your connection and try again.";

function newIdempotencyKey(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
}

function dayParts(date: string) {
  const d = new Date(`${date}T12:00:00.000Z`);
  return {
    weekday: formatInTimeZone(d, "UTC", "EEE"),
    day: formatInTimeZone(d, "UTC", "d"),
    month: formatInTimeZone(d, "UTC", "MMM"),
  };
}

async function readError(res: Response): Promise<ApiErrorBody["error"] | null> {
  try {
    const body = (await res.json()) as Partial<ApiErrorBody>;
    return body.error ?? null;
  } catch {
    return null;
  }
}

type Props = { services: PublicService[]; days: BookableDay[]; initialServiceSlug?: string };

export default function BookingFlow({ services, days, initialServiceSlug }: Props) {
  const router = useRouter();
  const initialService = services.find((s) => s.slug === initialServiceSlug);

  const [step, setStep] = useState<Step>(initialService ? 2 : 1);
  const [serviceId, setServiceId] = useState<string | null>(initialService?.id ?? null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [details, setDetails] = useState<Details>({
    customerName: "",
    customerPhone: `${DEFAULT_PHONE_PREFIX} `,
    note: "",
    website: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const idempotencyKey = useRef<string>(newIdempotencyKey());
  const slotsRequest = useRef<AbortController | null>(null);

  const service = services.find((s) => s.id === serviceId) ?? null;

  const resetAttempt = () => {
    idempotencyKey.current = newIdempotencyKey();
    setSubmitError(null);
  };

  const loadSlots = useCallback(async (forService: string, forDate: string, quiet = false) => {
    slotsRequest.current?.abort();
    const controller = new AbortController();
    slotsRequest.current = controller;
    if (!quiet) setSlotsLoading(true);
    setSlotsError(null);
    try {
      const params = new URLSearchParams({ serviceId: forService, date: forDate });
      const res = await fetch(`/api/availability?${params}`, { cache: "no-store", signal: controller.signal });
      if (!res.ok) {
        const err = await readError(res);
        throw new Error(err?.message ?? "Could not load available times.");
      }
      const data = (await res.json()) as { slots: Slot[] };
      setSlots(data.slots);
      setSlot((current) => (current && data.slots.some((s) => s.startAt === current.startAt) ? current : null));
    } catch (error) {
      if (controller.signal.aborted) return;
      setSlotsError(error instanceof Error && error.message ? error.message : "Could not load available times.");
    } finally {
      if (slotsRequest.current === controller) setSlotsLoading(false);
    }
  }, []);

  // While the customer is choosing a time, keep the slots fresh: every 30 s and whenever the tab regains focus.
  useEffect(() => {
    if (step !== 3 || !serviceId || !date) return;
    const refresh = () => {
      if (!document.hidden) void loadSlots(serviceId, date, true);
    };
    const timer = window.setInterval(refresh, SLOT_REFRESH_MS);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [step, serviceId, date, loadSlots]);

  const chooseService = (id: string) => {
    setServiceId(id);
    if (id !== serviceId) {
      setDate(null);
      setSlot(null);
      setSlots([]);
    }
    resetAttempt();
    setNotice(null);
    setStep(2);
  };

  const chooseDate = (value: string) => {
    if (!serviceId) return;
    setDate(value);
    setSlot(null);
    setNotice(null);
    resetAttempt();
    setStep(3);
    void loadSlots(serviceId, value);
  };

  const chooseSlot = (value: Slot) => {
    setSlot(value);
    setNotice(null);
    resetAttempt();
    setStep(4);
  };

  const submitDetails = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = customerDetailsSchema.safeParse(details);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!errors[key]) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    resetAttempt();
    setStep(5);
  };

  const confirm = async () => {
    if (!service || !slot || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          startAt: slot.startAt,
          customerName: details.customerName,
          customerPhone: details.customerPhone,
          note: details.note,
          website: details.website,
          idempotencyKey: idempotencyKey.current,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id: string };
        router.push(`/reservation/confirmation/${data.id}`);
        return;
      }
      const err = await readError(res);
      if (res.status === 409) {
        setNotice(SLOT_TAKEN_MESSAGE);
        setSlot(null);
        resetAttempt();
        setStep(3);
        if (date) void loadSlots(service.id, date);
      } else if (res.status === 400 && err?.fields) {
        setFieldErrors(err.fields);
        setStep(4);
      } else if (res.status === 422 && err && ["TOO_SOON", "TOO_FAR", "CLOSED", "OUTSIDE_OPENING_HOURS", "INVALID_SLOT"].includes(err.code)) {
        setNotice(err.message);
        setSlot(null);
        resetAttempt();
        setStep(3);
        if (date) void loadSlots(service.id, date);
      } else {
        setSubmitError(err?.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setSubmitError(NETWORK_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  };

  const canOpen = (target: Step) =>
    target === 1 ||
    (target === 2 && !!service) ||
    (target === 3 && !!service && !!date) ||
    (target === 4 && !!slot) ||
    (target === 5 && !!slot && step === 5);

  const goTo = (target: Step) => {
    if (!canOpen(target) || submitting) return;
    if (target === 3 && serviceId && date) void loadSlots(serviceId, date);
    setStep(target);
  };

  const updateDetail = (key: keyof Details, value: string) => {
    setDetails((d) => ({ ...d, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((errors) => {
        const next = { ...errors };
        delete next[key];
        return next;
      });
    }
  };

  const normalizedPhone = customerDetailsSchema.shape.customerPhone.safeParse(details.customerPhone);

  return (
    <div className="mt-12">
      <ol className="flex items-center justify-between gap-1 sm:gap-2" aria-label="Reservation steps">
        {STEPS.map((s) => {
          const current = s.id === step;
          const done = s.id < step;
          return (
            <li key={s.id} className="flex flex-1 flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => goTo(s.id)}
                disabled={!canOpen(s.id)}
                aria-current={current ? "step" : undefined}
                className={`grid h-9 w-9 place-items-center rounded-full text-[0.78rem] transition ${
                  current ? "bg-ink text-cream" : done ? "bg-sand text-ink hover:bg-ink hover:text-cream" : "border border-sand text-muted"
                }`}
              >
                {s.id}
              </button>
              <span className={`text-[0.65rem] tracking-[0.15em] uppercase sm:text-[0.7rem] ${current ? "text-ink" : "text-muted"}`}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {notice && (
        <div role="alert" className="mt-8 rounded-sm border border-gold/40 bg-gold/10 px-5 py-4 text-[0.85rem] text-ink">
          {notice}
        </div>
      )}

      <section className="mt-8 rounded-sm bg-white p-5 shadow-[0_20px_40px_-28px_rgba(60,40,20,0.35)] sm:p-8">
        {step === 1 && (
          <div>
            <StepTitle title="Choose your treatment" />
            {services.length === 0 ? (
              <p className="mt-6 text-[0.9rem] text-ink-soft">No treatments are available for booking right now.</p>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => chooseService(s.id)}
                    className={`flex flex-col rounded-sm border p-5 text-left transition hover:border-ink ${
                      s.id === serviceId ? "border-ink bg-cream" : "border-sand"
                    }`}
                  >
                    <span className="font-serif text-xl text-ink">{s.name}</span>
                    <span className="mt-2 text-[0.8rem] leading-relaxed font-light text-muted">{s.description}</span>
                    <span className="mt-4 flex items-center gap-3 text-[0.8rem] text-ink-soft">
                      <span>{formatDuration(s.durationMinutes)}</span>
                      <span className="h-3 w-px bg-sand" />
                      <span className="text-ink">{formatPrice(s.priceCents)}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && service && (
          <div>
            <StepTitle title="Pick a date" subtitle={`${service.name} · ${formatDuration(service.durationMinutes)}`} />
            <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {days.map((d) => {
                const parts = dayParts(d.date);
                const selected = d.date === date;
                return (
                  <button
                    key={d.date}
                    type="button"
                    disabled={!d.open}
                    onClick={() => chooseDate(d.date)}
                    aria-pressed={selected}
                    aria-label={d.open ? formatLongDate(new Date(`${d.date}T12:00:00.000Z`)) : `${parts.weekday} ${parts.day} ${parts.month} (closed)`}
                    className={`flex min-h-16 flex-col items-center justify-center rounded-sm border text-center transition ${
                      selected
                        ? "border-ink bg-ink text-cream"
                        : d.open
                          ? "border-sand text-ink hover:border-ink"
                          : "cursor-not-allowed border-transparent bg-cream-dark/50 text-muted/60 line-through"
                    }`}
                  >
                    <span className="text-[0.65rem] tracking-wider uppercase">{parts.weekday}</span>
                    <span className="font-serif text-xl leading-tight">{parts.day}</span>
                    <span className="text-[0.65rem]">{parts.month}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-[0.75rem] text-muted">We are open Monday to Saturday, 10:00 to 20:00.</p>
          </div>
        )}

        {step === 3 && service && date && (
          <div>
            <StepTitle title="Choose a time" subtitle={`${service.name} · ${formatLongDate(new Date(`${date}T12:00:00.000Z`))}`} />
            {slotsLoading && slots.length === 0 ? (
              <p className="mt-6 text-[0.9rem] text-ink-soft">Loading available times…</p>
            ) : slotsError ? (
              <div className="mt-6 space-y-4">
                <p role="alert" className="text-[0.9rem] text-red-700">{slotsError}</p>
                <Button variant="outline" size="sm" onClick={() => void loadSlots(service.id, date)}>Try again</Button>
              </div>
            ) : slots.length === 0 ? (
              <div className="mt-6 space-y-4">
                <p className="text-[0.9rem] text-ink-soft">No available times on this day.</p>
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>Choose another date</Button>
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-6">
                {slots.map((s) => (
                  <button
                    key={s.startAt}
                    type="button"
                    onClick={() => chooseSlot(s)}
                    aria-pressed={slot?.startAt === s.startAt}
                    className={`min-h-12 rounded-sm border text-[0.9rem] transition ${
                      slot?.startAt === s.startAt ? "border-ink bg-ink text-cream" : "border-sand text-ink hover:border-ink"
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <form onSubmit={submitDetails} noValidate>
            <StepTitle title="Your details" subtitle="We'll send your confirmation on WhatsApp." />
            <div className="mt-6 space-y-5">
              <Field label="Full name" htmlFor="customerName" error={fieldErrors.customerName}>
                <input
                  id="customerName"
                  name="customerName"
                  autoComplete="name"
                  value={details.customerName}
                  onChange={(e) => updateDetail("customerName", e.target.value)}
                  maxLength={80}
                  aria-invalid={!!fieldErrors.customerName}
                  className={inputClass(!!fieldErrors.customerName)}
                />
              </Field>
              <Field
                label="Phone number"
                htmlFor="customerPhone"
                hint="Moroccan numbers can start with +212 or 0. International numbers are welcome."
                error={fieldErrors.customerPhone}
              >
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={details.customerPhone}
                  onChange={(e) => updateDetail("customerPhone", e.target.value)}
                  maxLength={32}
                  aria-invalid={!!fieldErrors.customerPhone}
                  className={inputClass(!!fieldErrors.customerPhone)}
                />
              </Field>
              <Field label="Note (optional)" htmlFor="note" error={fieldErrors.note}>
                <textarea
                  id="note"
                  name="note"
                  rows={3}
                  value={details.note}
                  onChange={(e) => updateDetail("note", e.target.value)}
                  maxLength={NOTE_MAX}
                  aria-invalid={!!fieldErrors.note}
                  className={`${inputClass(!!fieldErrors.note)} resize-y`}
                />
                <span className="mt-1 block text-right text-[0.7rem] text-muted">{details.note.length}/{NOTE_MAX}</span>
              </Field>
              <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={details.website}
                  onChange={(e) => updateDetail("website", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep(3)}>Back</Button>
              <Button type="submit">Continue</Button>
            </div>
          </form>
        )}

        {step === 5 && service && slot && (
          <div>
            <StepTitle title="Review your reservation" />
            <dl className="mt-6 divide-y divide-sand border-y border-sand text-[0.9rem]">
              <SummaryRow label="Service" value={service.name} />
              <SummaryRow label="Date" value={formatLongDate(new Date(slot.startAt))} />
              <SummaryRow label="Time" value={`${slot.time} (${formatDuration(service.durationMinutes)})`} />
              <SummaryRow label="Name" value={details.customerName.replace(/\s+/g, " ").trim()} />
              <SummaryRow label="Phone" value={normalizedPhone.success ? formatPhone(normalizedPhone.data) : details.customerPhone} />
              {details.note.trim() && <SummaryRow label="Note" value={details.note.trim()} />}
              <SummaryRow label="Price" value={formatPrice(service.priceCents)} strong />
            </dl>
            <p className="mt-4 text-[0.75rem] text-muted">Payment is made at the salon.</p>
            {submitError && (
              <p role="alert" className="mt-6 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
                {submitError}
              </p>
            )}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep(4)} disabled={submitting}>Back</Button>
              <Button type="button" onClick={() => void confirm()} loading={submitting}>
                {submitting ? "Confirming…" : "Confirm reservation"}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="font-serif text-2xl text-ink sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1 text-[0.85rem] font-light text-ink-soft">{subtitle}</p>}
    </div>
  );
}

function inputClass(invalid: boolean) {
  return `block w-full rounded-sm border bg-white px-4 py-3 text-[0.95rem] text-ink outline-none transition focus:border-ink ${
    invalid ? "border-red-400" : "border-sand"
  }`;
}

function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.8rem] text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[0.78rem] text-red-700">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-[0.75rem] text-muted">{hint}</p>
      )}
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between sm:gap-6">
      <dt className="text-muted">{label}</dt>
      <dd className={`break-words sm:text-right ${strong ? "font-serif text-xl text-ink" : "text-ink"}`}>{value}</dd>
    </div>
  );
}
