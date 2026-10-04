"use client";

import { formatInTimeZone } from "date-fns-tz";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, LeafIcon } from "@/components/Icons";
import { Button } from "@/components/ui/Button";
import { DEFAULT_PHONE_PREFIX, NOTE_MAX } from "@/lib/booking-rules";
import { customerDetailsSchema } from "@/lib/booking-schema";
import { formatDuration, formatPrice } from "@/lib/format";
import { serviceCardImage, serviceImage } from "@/lib/images";
import { formatPhone } from "@/lib/phone";
import { serviceDetails } from "@/lib/service-details";
import { pickOption } from "@/lib/service-options";
import { NAVBAR_OFFSET, smoothScrollTo } from "@/lib/smooth-scroll";
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

type Props = { services: PublicService[]; days: BookableDay[]; initialServiceSlug?: string; initialDuration?: number };

export default function BookingFlow({ services, days, initialServiceSlug, initialDuration }: Props) {
  const router = useRouter();
  const initialService = services.find((s) => s.slug === initialServiceSlug);
  // A link with a duration skips straight to the date; a link with only a service opens its details (and prices).
  const initialOption = initialService && initialDuration ? pickOption(initialService.options, initialDuration) : null;

  const [step, setStep] = useState<Step>(initialOption ? 2 : 1);
  const [serviceId, setServiceId] = useState<string | null>(initialService?.id ?? null);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(initialOption?.durationMinutes ?? null);
  const [detailId, setDetailId] = useState<string | null>(initialService && !initialOption ? initialService.id : null);
  const [pickedDurations, setPickedDurations] = useState<Record<string, number>>({});
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
  const rootRef = useRef<HTMLDivElement>(null);
  const detailService = step === 1 ? (services.find((s) => s.id === detailId) ?? null) : null;
  const detailOption = detailService
    ? (pickOption(detailService.options, pickedDurations[detailService.id] ?? (detailService.id === serviceId ? durationMinutes ?? undefined : undefined)) ??
      detailService.options[0])
    : null;
  // The details view sits between the list (step 1) and the date (step 2).
  const position = detailService ? 1.5 : step;
  const scrolledForPosition = useRef(position);
  const [shownPosition, setShownPosition] = useState(position);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [hasMoved, setHasMoved] = useState(false);
  if (position !== shownPosition) {
    setDirection(position > shownPosition ? 1 : -1);
    setShownPosition(position);
    setHasMoved(true);
  }

  // Arriving from a "Book" button: let the hero settle, then glide down to the steps.
  useEffect(() => {
    if (window.scrollY > 40 || !rootRef.current) return undefined;
    const root = rootRef.current;
    let cancel = () => {};
    const timer = window.setTimeout(() => {
      cancel = smoothScrollTo(root, 850);
    }, 400);
    return () => {
      window.clearTimeout(timer);
      cancel();
    };
  }, []);

  // On each step change, bring the steps back into view if the visitor had scrolled away from them.
  useEffect(() => {
    const root = rootRef.current;
    if (scrolledForPosition.current === position || !root) return undefined;
    scrolledForPosition.current = position;
    const top = root.getBoundingClientRect().top;
    if (top >= NAVBAR_OFFSET - 8 && top <= window.innerHeight * 0.4) return undefined;
    return smoothScrollTo(root, 500);
  }, [position]);

  const service = services.find((s) => s.id === serviceId) ?? null;
  const option = service && durationMinutes ? pickOption(service.options, durationMinutes) : null;

  const resetAttempt = () => {
    idempotencyKey.current = newIdempotencyKey();
    setSubmitError(null);
  };

  const loadSlots = useCallback(async (forService: string, forDuration: number, forDate: string, quiet = false) => {
    slotsRequest.current?.abort();
    const controller = new AbortController();
    slotsRequest.current = controller;
    if (!quiet) setSlotsLoading(true);
    setSlotsError(null);
    try {
      const params = new URLSearchParams({ serviceId: forService, duration: String(forDuration), date: forDate });
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
    if (step !== 3 || !serviceId || !durationMinutes || !date) return;
    const refresh = () => {
      if (!document.hidden) void loadSlots(serviceId, durationMinutes, date, true);
    };
    const timer = window.setInterval(refresh, SLOT_REFRESH_MS);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [step, serviceId, durationMinutes, date, loadSlots]);

  const openDetail = (id: string) => {
    setNotice(null);
    setDetailId(id);
  };

  const closeDetail = () => setDetailId(null);

  const chooseOption = (id: string, duration: number) => {
    if (id !== serviceId || duration !== durationMinutes) {
      setSlot(null);
      setSlots([]);
    }
    setServiceId(id);
    setDurationMinutes(duration);
    resetAttempt();
    setNotice(null);
    setStep(2);
  };

  const chooseDate = (value: string) => {
    if (!serviceId || !durationMinutes) return;
    setDate(value);
    setSlot(null);
    setNotice(null);
    resetAttempt();
    setStep(3);
    void loadSlots(serviceId, durationMinutes, value);
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
    if (!service || !option || !slot || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: service.id,
          durationMinutes: option.durationMinutes,
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
        if (date) void loadSlots(service.id, option.durationMinutes, date);
      } else if (res.status === 400 && err?.fields) {
        setFieldErrors(err.fields);
        setStep(4);
      } else if (res.status === 422 && err && ["TOO_SOON", "TOO_FAR", "CLOSED", "OUTSIDE_OPENING_HOURS", "INVALID_SLOT"].includes(err.code)) {
        setNotice(err.message);
        setSlot(null);
        resetAttempt();
        setStep(3);
        if (date) void loadSlots(service.id, option.durationMinutes, date);
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
    (target === 2 && !!option) ||
    (target === 3 && !!option && !!date) ||
    (target === 4 && !!slot) ||
    (target === 5 && !!slot && step === 5);

  const goTo = (target: Step) => {
    if (!canOpen(target) || submitting) return;
    if (target === 3 && serviceId && durationMinutes && date) void loadSlots(serviceId, durationMinutes, date);
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
    <div ref={rootRef} id="book" className="-mt-6 scroll-mt-24 sm:-mt-8">
      <ol className="animate-fade-up mx-auto flex max-w-3xl items-start [animation-delay:200ms]" aria-label="Reservation steps">
        {STEPS.map((s, index) => {
          const current = s.id === step;
          const done = s.id < step;
          return (
            <li key={s.id} className="relative flex flex-1 flex-col items-center gap-2.5">
              {index > 0 && (
                <span
                  aria-hidden
                  className={`absolute top-[1.15rem] h-px -translate-y-1/2 sm:top-5 ${s.id <= step ? "bg-olive/50" : "bg-sand"}`}
                  style={{ left: "calc(-50% + 1.6rem)", right: "calc(50% + 1.6rem)" }}
                />
              )}
              <button
                type="button"
                onClick={() => goTo(s.id)}
                disabled={!canOpen(s.id)}
                aria-current={current ? "step" : undefined}
                aria-label={`Step ${s.id}: ${s.label}`}
                className={`relative grid h-9 w-9 place-items-center rounded-full text-[0.8rem] transition sm:h-10 sm:w-10 ${
                  current
                    ? "bg-olive text-white shadow-[0_6px_16px_-6px_rgba(75,85,55,0.8)] ring-4 ring-olive/15"
                    : done
                      ? "border border-olive/40 bg-white text-olive hover:bg-olive hover:text-white"
                      : "border border-sand bg-white/80 text-muted"
                }`}
              >
                {s.id}
              </button>
              <span className={`text-[0.6rem] tracking-[0.2em] uppercase sm:text-[0.68rem] ${current ? "font-medium text-ink" : "text-muted"}`}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {notice && (
        <div role="alert" className="mt-8 rounded-lg border border-gold/40 bg-gold/10 px-5 py-4 text-[0.85rem] text-ink">
          {notice}
        </div>
      )}

      <section className="animate-fade-up mt-8 overflow-hidden rounded-xl border border-sand/60 bg-[#fcfaf7] p-4 shadow-[0_30px_60px_-35px_rgba(60,40,20,0.35)] [animation-delay:300ms] sm:p-8 lg:p-10">
        <div key={position} className={direction > 0 ? "animate-step-next" : "animate-step-prev"}>
        {step === 1 && !detailService && (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <LeafIcon className="h-9 w-9 shrink-0 -rotate-12 text-olive sm:h-11 sm:w-11" aria-hidden />
                <div>
                  <h2 className="font-serif text-2xl text-ink sm:text-[2.1rem] sm:leading-tight">Choose your treatment</h2>
                  <p className="mt-0.5 text-[0.85rem] font-light text-ink-soft">Tap a treatment to see the details and prices.</p>
                </div>
              </div>
              <p className="hidden -rotate-6 pt-1 font-script text-2xl leading-none text-bronze/80 md:block" aria-hidden>
                Your wellness
                <br />
                <span className="pl-6">matters ♡</span>
              </p>
            </div>
            {services.length === 0 ? (
              <p className="mt-6 text-[0.9rem] text-ink-soft">No treatments are available for booking right now.</p>
            ) : (
              <div className="mt-7 grid gap-4 lg:grid-cols-2">
                {services.map((s, index) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openDetail(s.id)}
                    aria-label={`${s.name}: details and prices`}
                    style={{ animationDelay: `${(hasMoved ? 40 : 380) + index * 50}ms` }}
                    className={`animate-fade-up group relative isolate flex min-h-[10rem] overflow-hidden rounded-lg border bg-gradient-to-r from-[#f7f2eb] to-[#efe8de] text-left transition-[box-shadow,border-color,translate] duration-500 outline-none hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-24px_rgba(40,30,15,0.65)] focus-visible:ring-2 focus-visible:ring-olive/60 sm:min-h-[10.5rem] ${
                      s.id === serviceId ? "border-olive/50" : "border-sand/60"
                    }`}
                  >
                    {/* The photo always spans the whole card; the clip only uncovers its left third until hover/focus. */}
                    <span className="absolute inset-0 -z-20 overflow-hidden transition-[clip-path] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] [clip-path:inset(0_64%_0_0)] group-hover:[clip-path:inset(0_0_0_0)] group-focus-visible:[clip-path:inset(0_0_0_0)]">
                      <Image
                        src={serviceCardImage(s.slug)}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 560px, 100vw"
                        className="origin-left object-cover object-left transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                      />
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-0 -z-10 bg-gradient-to-r from-black/20 via-black/45 to-black/65 opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-visible:opacity-100"
                    />

                    <span className="ml-[36%] flex min-w-0 flex-1 flex-col py-4 pr-4 pl-4 sm:py-5 sm:pr-5 sm:pl-6">
                      <span className="text-[0.65rem] tracking-[0.2em] text-muted transition-colors duration-500 group-hover:text-white/70 group-focus-visible:text-white/70">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="mt-1.5 font-serif text-xl leading-tight text-ink transition-colors duration-500 group-hover:text-white group-focus-visible:text-white sm:text-[1.4rem]">
                        {s.name}
                      </span>
                      <span className="mt-1.5 line-clamp-2 text-[0.76rem] leading-relaxed font-light text-muted transition-colors duration-500 group-hover:text-white/85 group-focus-visible:text-white/85">
                        {s.description}
                      </span>
                      <span className="mt-auto flex items-center justify-between gap-3 pt-3">
                        <span className="text-[0.66rem] tracking-[0.18em] text-ink-soft uppercase transition-colors duration-500 group-hover:text-white/85 group-focus-visible:text-white/85">
                          {s.options.map((o) => o.durationMinutes).join(" · ")} min
                        </span>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-olive bg-olive text-white transition-all duration-500 group-hover:border-white/80 group-hover:bg-white/10 group-hover:backdrop-blur-sm group-focus-visible:border-white/80 group-focus-visible:bg-white/10">
                          <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                        </span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 1 && detailService && detailOption && (
          <ServiceDetailView
            service={detailService}
            selected={detailOption}
            onSelect={(duration) => setPickedDurations((p) => ({ ...p, [detailService.id]: duration }))}
            onBack={closeDetail}
            onContinue={() => chooseOption(detailService.id, detailOption.durationMinutes)}
          />
        )}

        {step === 2 && service && option && (
          <div>
            <StepTitle
              title="Pick a date"
              subtitle={`${service.name} · ${formatDuration(option.durationMinutes)} · ${formatPrice(option.priceCents)}`}
            />
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
                    className={`flex min-h-16 flex-col items-center justify-center rounded-md border text-center transition ${
                      selected
                        ? "border-olive bg-olive text-white"
                        : d.open
                          ? "border-sand bg-white text-ink hover:border-olive/50"
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

        {step === 3 && service && option && date && (
          <div>
            <StepTitle
              title="Choose a time"
              subtitle={`${service.name} · ${formatDuration(option.durationMinutes)} · ${formatLongDate(new Date(`${date}T12:00:00.000Z`))}`}
            />
            {slotsLoading && slots.length === 0 ? (
              <p className="mt-6 text-[0.9rem] text-ink-soft">Loading available times…</p>
            ) : slotsError ? (
              <div className="mt-6 space-y-4">
                <p role="alert" className="text-[0.9rem] text-red-700">{slotsError}</p>
                <Button variant="outline" size="sm" onClick={() => void loadSlots(service.id, option.durationMinutes, date)}>Try again</Button>
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
                    className={`min-h-12 rounded-md border text-[0.9rem] transition ${
                      slot?.startAt === s.startAt ? "border-olive bg-olive text-white" : "border-sand bg-white text-ink hover:border-olive/50"
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

        {step === 5 && service && option && slot && (
          <div>
            <StepTitle title="Review your reservation" />
            <dl className="mt-6 divide-y divide-sand border-y border-sand text-[0.9rem]">
              <SummaryRow label="Service" value={service.name} />
              <SummaryRow label="Date" value={formatLongDate(new Date(slot.startAt))} />
              <SummaryRow label="Time" value={`${slot.time} (${formatDuration(option.durationMinutes)})`} />
              <SummaryRow label="Name" value={details.customerName.replace(/\s+/g, " ").trim()} />
              <SummaryRow label="Phone" value={normalizedPhone.success ? formatPhone(normalizedPhone.data) : details.customerPhone} />
              {details.note.trim() && <SummaryRow label="Note" value={details.note.trim()} />}
              <SummaryRow label="Price" value={formatPrice(option.priceCents)} strong />
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
        </div>
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

type ServiceOption = PublicService["options"][number];

function ServiceDetailView({
  service,
  selected,
  onSelect,
  onBack,
  onContinue,
}: {
  service: PublicService;
  selected: ServiceOption;
  onSelect: (durationMinutes: number) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const info = serviceDetails(service.slug, service.description);
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[0.72rem] tracking-[0.2em] text-muted uppercase transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> All treatments
      </button>

      <div className="mt-5 grid gap-6 md:grid-cols-[1fr_1.1fr] md:gap-10">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg md:aspect-auto md:min-h-[26rem]">
          <Image src={serviceImage(service.slug)} alt={service.name} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-5 pt-16">
            <p className="font-script text-2xl text-white/95">Your wellness matters ♡</p>
          </div>
        </div>

        <div className="flex flex-col">
          <p className="flex items-center gap-3 text-[0.68rem] tracking-[0.3em] text-bronze uppercase">
            <span className="h-px w-6 bg-bronze/60" aria-hidden />
            Treatment
          </p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-ink sm:text-4xl">{service.name}</h2>
          <p className="mt-4 text-[0.9rem] leading-relaxed font-light text-ink-soft">{info.intro}</p>

          <dl className="mt-5 grid grid-cols-2 gap-3 text-[0.8rem]">
            <div className="rounded-md border border-sand/70 bg-white px-4 py-3">
              <dt className="text-[0.65rem] tracking-[0.2em] text-muted uppercase">Pressure</dt>
              <dd className="mt-1 text-ink">{info.pressure}</dd>
            </div>
            <div className="rounded-md border border-sand/70 bg-white px-4 py-3">
              <dt className="text-[0.65rem] tracking-[0.2em] text-muted uppercase">Ideal for</dt>
              <dd className="mt-1 text-ink">{info.idealFor}</dd>
            </div>
          </dl>

          {info.highlights.length > 0 && (
            <ul className="mt-5 space-y-2 text-[0.85rem] text-ink-soft">
              {info.highlights.map((h) => (
                <li key={h} className="flex items-center gap-3">
                  <LeafIcon className="h-4 w-4 shrink-0 text-olive" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>
          )}

          {(info.why || info.helpsWith.length > 0) && (
            <div className="mt-6 rounded-lg border border-olive/15 bg-olive/[0.04] px-4 py-4 sm:px-5">
              {info.why && (
                <>
                  <p className="text-[0.65rem] tracking-[0.25em] text-olive uppercase">Why choose it</p>
                  <p className="mt-1.5 text-[0.85rem] leading-relaxed text-ink-soft">{info.why}</p>
                </>
              )}
              {info.helpsWith.length > 0 && (
                <>
                  <p className={`text-[0.65rem] tracking-[0.25em] text-olive uppercase ${info.why ? "mt-4" : ""}`}>Helps with</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {info.helpsWith.map((item) => (
                      <li key={item} className="rounded-full border border-olive/25 bg-white px-3 py-1 text-[0.75rem] text-ink">
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          <p className="mt-7 text-[0.68rem] tracking-[0.25em] text-muted uppercase">Choose your duration</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {service.options.map((o, index) => {
              const isSelected = o.durationMinutes === selected.durationMinutes;
              return (
                <button
                  key={o.durationMinutes}
                  type="button"
                  onClick={() => onSelect(o.durationMinutes)}
                  aria-pressed={isSelected}
                  style={{ animationDelay: `${150 + index * 60}ms` }}
                  className={`animate-fade-up flex min-h-16 flex-col items-center justify-center rounded-md border px-1 leading-tight transition ${
                    isSelected
                      ? "border-olive bg-olive text-white shadow-[0_8px_18px_-10px_rgba(75,85,55,0.9)]"
                      : "border-sand bg-white text-ink hover:border-olive/50"
                  }`}
                >
                  <span className="text-[0.75rem] opacity-90">{formatDuration(o.durationMinutes)}</span>
                  <span className="mt-0.5 font-serif text-lg">{formatPrice(o.priceCents)}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-sand pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.85rem] text-ink-soft">
              {formatDuration(selected.durationMinutes)} session ·{" "}
              <span className="font-serif text-2xl text-ink">{formatPrice(selected.priceCents)}</span>
            </p>
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center justify-center gap-3 rounded-full bg-olive px-7 py-3 text-[0.8rem] tracking-wide text-white transition hover:bg-olive-dark"
            >
              Choose a date
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
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
