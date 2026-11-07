"use client";

import { formatInTimeZone } from "date-fns-tz";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckIcon, ChevronDown, HeartIcon, LeafIcon, LotusIcon } from "@/components/Icons";
import { Button } from "@/components/ui/Button";
import { BUFFER_MINUTES, DEFAULT_PHONE_PREFIX, NOTE_MAX } from "@/lib/booking-rules";
import { customerDetailsSchema } from "@/lib/booking-schema";
import { formatDuration, formatPrice } from "@/lib/format";
import { voucherDiscount } from "@/lib/loyalty-rules";
import { blurProps, serviceImage } from "@/lib/images";
import { formatPhone } from "@/lib/phone";
import { PRESSURE_LEVEL, type ServiceDetails } from "@/lib/service-details";
import { pickOption } from "@/lib/service-options";
import { LOCALE_SWITCH_KEY } from "@/i18n/config";
import { NAVBAR_OFFSET, smoothScrollTo } from "@/lib/smooth-scroll";
import type { FinderMatch } from "@/lib/treatment-finder";
import TreatmentFinder from "./TreatmentFinder";
import { useI18n } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { errorMessage, fieldErrorMessage } from "@/i18n/errors";
import { dayPartsIn, fmt, formatLongDateIn } from "@/i18n/format";
import { localizedServiceDetails, serviceText } from "@/i18n/services";
import type { BookableDay } from "@/server/booking/calendar";
import type { PublicService } from "@/server/booking/services";
import type { PublicVoucher } from "@/server/loyalty/engine";
import type { ApiErrorBody } from "@/server/errors";

type Slot = { time: string; startAt: string };
type GridStatus = "available" | "booked" | "rest" | "unavailable";
type GridTime = Slot & { available: boolean; status?: GridStatus };

const UNAVAILABLE_STYLE: Record<Exclude<GridStatus, "available">, { label: "booked" | "rest" | "tooShort"; className: string }> = {
  booked: { label: "booked", className: "border-transparent bg-sand text-sage" },
  rest: { label: "rest", className: "border-dashed border-sand bg-white text-sage" },
  unavailable: { label: "tooShort", className: "border-transparent bg-sand/70 text-sage" },
};
type Step = 1 | 2 | 3 | 4 | 5;
type Details = { customerName: string; customerPhone: string; note: string; website: string };

const STEP_IDS: Step[] = [1, 2, 3, 4, 5];

const SLOT_REFRESH_MS = 30_000;

function newIdempotencyKey(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
}

function dayParts(locale: Locale, date: string) {
  if (locale !== "en") {
    const parts = dayPartsIn(locale, date);
    return { weekday: parts.shortWeekday, day: parts.day, month: parts.month };
  }
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

type Props = {
  services: PublicService[];
  days: BookableDay[];
  initialServiceSlug?: string;
  initialDuration?: number;
  guest?: { name: string; phone: string };
  vouchers?: PublicVoucher[];
};

export default function BookingFlow({ services, days, initialServiceSlug, initialDuration, guest, vouchers = [] }: Props) {
  const router = useRouter();
  const { t, locale, href } = useI18n();
  const nameOf = (s: PublicService) => serviceText(t, s).name;
  const longDate = (instant: Date) => formatLongDateIn(locale, instant);
  const initialService = services.find((s) => s.slug === initialServiceSlug);
  // A link with a duration skips straight to the date; a link with only a service opens its details (and prices).
  const initialOption = initialService && initialDuration ? pickOption(initialService.options, initialDuration) : null;

  const [step, setStep] = useState<Step>(initialOption ? 2 : 1);
  const [serviceId, setServiceId] = useState<string | null>(initialService?.id ?? null);
  const [durationMinutes, setDurationMinutes] = useState<number | null>(initialOption?.durationMinutes ?? null);
  const [detailId, setDetailId] = useState<string | null>(initialService && !initialOption ? initialService.id : null);
  const [pickedDurations, setPickedDurations] = useState<Record<string, number>>({});
  const [finderOpen, setFinderOpen] = useState(false);
  const [recommendedId, setRecommendedId] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [details, setDetails] = useState<Details>({
    customerName: guest?.name ?? "",
    customerPhone: guest?.phone ? formatPhone(guest.phone) : `${DEFAULT_PHONE_PREFIX} `,
    note: "",
    website: "",
  });
  const [voucherCode, setVoucherCode] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [slots, setSlots] = useState<Slot[]>([]);
  const [times, setTimes] = useState<GridTime[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const idempotencyKey = useRef<string>(newIdempotencyKey());
  const slotsRequest = useRef<AbortController | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const showFinder = step === 1 && finderOpen;
  const detailService = step === 1 && !finderOpen ? (services.find((s) => s.id === detailId) ?? null) : null;
  const detailOption = detailService
    ? (pickOption(detailService.options, pickedDurations[detailService.id] ?? (detailService.id === serviceId ? durationMinutes ?? undefined : undefined)) ??
      detailService.options[0])
    : null;
  // The details view sits between the list (step 1) and the date (step 2).
  const position = showFinder ? 1.25 : detailService ? 1.5 : step;
  const recommended = services.find((s) => s.id === recommendedId);
  const orderedServices = recommended ? [recommended, ...services.filter((s) => s !== recommended)] : services;
  const scrolledForPosition = useRef(position);
  const [shownPosition, setShownPosition] = useState(position);
  const [direction, setDirection] = useState<1 | -1>(1);
  if (position !== shownPosition) {
    setDirection(position > shownPosition ? 1 : -1);
    setShownPosition(position);
  }

  // Arriving on the page: let the hero settle, then glide down to the steps, unless the visitor
  // already scrolled on their own. Decided when the timer fires, once the browser has settled the
  // initial scroll position. A language switch must not restart this glide.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    try {
      const switchedAt = Number(sessionStorage.getItem(LOCALE_SWITCH_KEY) || 0);
      if (switchedAt && Date.now() - switchedAt < 2000) {
        sessionStorage.removeItem(LOCALE_SWITCH_KEY);
        return undefined;
      }
    } catch {}
    let cancel = () => {};
    let userScrolled = false;
    const markUserScroll = () => {
      userScrolled = true;
    };
    const inputs = ["wheel", "touchmove"] as const;
    for (const e of inputs) window.addEventListener(e, markUserScroll, { passive: true });
    const removeInputs = () => {
      for (const e of inputs) window.removeEventListener(e, markUserScroll);
    };
    const timer = window.setTimeout(() => {
      removeInputs();
      if (userScrolled || root.getBoundingClientRect().top <= NAVBAR_OFFSET + 8) return;
      cancel = smoothScrollTo(root, 850);
    }, 400);
    return () => {
      window.clearTimeout(timer);
      removeInputs();
      cancel();
    };
  }, []);

  // On each step change, line the steps up under the navbar once the new step has been laid out.
  useEffect(() => {
    const root = rootRef.current;
    if (scrolledForPosition.current === position || !root) return undefined;
    scrolledForPosition.current = position;
    let cancel = () => {};
    const frame = requestAnimationFrame(() => {
      const top = root.getBoundingClientRect().top;
      if (Math.abs(top - NAVBAR_OFFSET) <= 24) return;
      cancel = smoothScrollTo(root, 550);
    });
    return () => {
      cancelAnimationFrame(frame);
      cancel();
    };
  }, [position]);

  const service = services.find((s) => s.id === serviceId) ?? null;
  const option = service && durationMinutes ? pickOption(service.options, durationMinutes) : null;
  const usableVouchers = vouchers.filter((v) => !v.serviceId || v.serviceId === serviceId);
  const selectedVoucher = usableVouchers.find((v) => v.code === voucherCode.trim().toUpperCase());
  const previewDiscount = option && selectedVoucher ? voucherDiscount(option.priceCents, selectedVoucher) : 0;

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
        throw new Error(err ? errorMessage(t, locale, err) : t.errors.loadTimes);
      }
      const data = (await res.json()) as { slots: Slot[]; times?: GridTime[] };
      setSlots(data.slots);
      setTimes(data.times ?? data.slots.map((s) => ({ ...s, available: true })));
      setSlot((current) => (current && data.slots.some((s) => s.startAt === current.startAt) ? current : null));
    } catch (error) {
      if (controller.signal.aborted) return;
      setSlotsError(error instanceof Error && error.message ? error.message : t.errors.loadTimes);
    } finally {
      if (slotsRequest.current === controller) setSlotsLoading(false);
    }
  }, [t, locale]);

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

  const pickFromFinder = (match: FinderMatch) => {
    setRecommendedId(match.serviceId);
    setPickedDurations((p) => ({ ...p, [match.serviceId]: match.durationMinutes }));
    setFinderOpen(false);
    openDetail(match.serviceId);
  };

  const chooseOption = (id: string, duration: number) => {
    if (id !== serviceId || duration !== durationMinutes) {
      setSlot(null);
      setSlots([]);
      setTimes([]);
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
        if (!errors[key]) errors[key] = fieldErrorMessage(t, locale, key, issue.message);
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
          locale,
          voucherCode: voucherCode.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id: string };
        router.push(href(`/reservation/confirmation/${data.id}`));
        return;
      }
      const err = await readError(res);
      if (res.status === 409) {
        setNotice(t.errors.slotTaken);
        setSlot(null);
        resetAttempt();
        setStep(3);
        if (date) void loadSlots(service.id, option.durationMinutes, date);
      } else if (res.status === 400 && err?.fields) {
        const fields = err.fields;
        setFieldErrors(Object.fromEntries(Object.entries(fields).map(([key, message]) => [key, fieldErrorMessage(t, locale, key, message)])));
        setStep(4);
      } else if (res.status === 422 && err && ["TOO_SOON", "TOO_FAR", "CLOSED", "OUTSIDE_OPENING_HOURS", "INVALID_SLOT"].includes(err.code)) {
        setNotice(errorMessage(t, locale, err));
        setSlot(null);
        resetAttempt();
        setStep(3);
        if (date) void loadSlots(service.id, option.durationMinutes, date);
      } else {
        setSubmitError(errorMessage(t, locale, err));
      }
    } catch {
      setSubmitError(t.errors.network);
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
    <div ref={rootRef} id="book" className="scroll-mt-24 font-display">
      <ol className="flex w-full items-start" aria-label={t.booking.stepsAria}>
        {STEP_IDS.map((id, index) => {
          const s = { id, label: t.booking.steps[index] };
          const current = s.id === step;
          const done = s.id < step;
          return (
            <li key={s.id} className="relative flex flex-1 flex-col items-center gap-2.5">
              {index > 0 && (
                <span
                  aria-hidden
                  className={`absolute top-[1.15rem] h-px -translate-y-1/2 sm:top-5 ${s.id <= step ? "bg-forest/30" : "bg-black/10"}`}
                  style={{ insetInlineStart: "calc(-50% + 1.6rem)", insetInlineEnd: "calc(50% + 1.6rem)" }}
                />
              )}
              <button
                type="button"
                onClick={() => goTo(s.id)}
                disabled={!canOpen(s.id)}
                aria-current={current ? "step" : undefined}
                aria-label={fmt(t.booking.stepAria, { n: s.id, label: s.label })}
                className={`relative grid h-9 w-9 place-items-center rounded-full text-[0.8rem] transition sm:h-10 sm:w-10 ${
                  current
                    ? "bg-forest text-white"
                    : done
                      ? "border border-forest/30 bg-white text-ink hover:bg-forest hover:text-white"
                      : "border border-sand bg-white text-sage"
                }`}
              >
                {s.id}
              </button>
              <span className={`text-[0.62rem] tracking-[0.14em] uppercase sm:text-[0.68rem] ${current ? "font-medium text-ink" : "text-sage"}`}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>

      {notice && (
        <div role="alert" className="mt-8 rounded-2xl border border-sand bg-white px-5 py-4 text-[0.85rem] text-ink">
          {notice}
        </div>
      )}

      <section className="mt-8 overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-4 sm:p-8 lg:p-10">
        <div key={position} className={direction > 0 ? "animate-step-next" : "animate-step-prev"}>
        {showFinder && <TreatmentFinder services={services} onPick={pickFromFinder} onClose={() => setFinderOpen(false)} />}

        {step === 1 && !showFinder && !detailService && (
          <div>
            <div>
              <h2 className="text-[1.7rem] leading-[1.12] font-semibold tracking-[-0.03em] text-forest sm:text-[2.15rem]">
                {t.booking.chooseTitle}
              </h2>
              <p className="mt-2 max-w-md text-[0.95rem] leading-relaxed text-sage">{t.booking.chooseSubtitle}</p>
            </div>
            {services.length > 1 && (
              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-black/[0.06] bg-ivory px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-ink">
                    <LotusIcon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-[0.9rem] font-medium text-ink">{recommended ? t.booking.finderAgain : t.booking.finderPrompt}</p>
                    <p className="text-[0.8rem] text-sage">{t.booking.finderText}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFinderOpen(true)}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-forest px-6 text-[0.88rem] font-medium text-white transition hover:bg-forest-dark"
                >
                  {t.booking.helpMe}
                  <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                </button>
              </div>
            )}
            {services.length === 0 ? (
              <p className="mt-6 text-[0.9rem] text-ink-soft">{t.booking.noServices}</p>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {orderedServices.map((s) => {
                  const text = serviceText(t, s);
                  return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openDetail(s.id)}
                    aria-label={fmt(t.treatments.detailsAria, { name: text.name })}
                    className={`group flex flex-col overflow-hidden rounded-2xl border bg-white text-start outline-none transition focus-visible:ring-2 focus-visible:ring-forest/30 ${
                      s.id === serviceId ? "border-forest" : "border-black/[0.06]"
                    }`}
                  >
                    <span className="relative h-40 overflow-hidden sm:h-44">
                      <Image
                        src={serviceImage(s.slug)}
                        {...blurProps(serviceImage(s.slug))}
                        alt=""
                        fill
                        sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    </span>
                    <span className="flex flex-1 flex-col px-4 pt-3.5 pb-4">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-[1.02rem] leading-tight font-semibold text-ink">{text.name}</span>
                        {s.id === recommendedId && (
                          <span className="shrink-0 rounded-full bg-sand px-2.5 py-1 text-[0.62rem] font-medium tracking-[0.08em] text-ink uppercase">
                            {t.booking.recommended}
                          </span>
                        )}
                      </span>
                      <span className="mt-1.5 line-clamp-2 flex-1 text-[0.8rem] leading-relaxed text-sage">{text.description}</span>
                      <span className="mt-3 flex items-end justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block text-[0.95rem] font-semibold text-ink">
                            {fmt(t.booking.from, { price: formatPrice(Math.min(...s.options.map((o) => o.priceCents)), locale) })}
                          </span>
                          <span className="mt-0.5 block text-[0.72rem] text-sage">
                            {s.options.map((o) => o.durationMinutes).join(" · ")} {t.booking.min}
                          </span>
                        </span>
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-sand text-ink transition group-hover:bg-forest group-hover:text-white">
                          <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" />
                        </span>
                      </span>
                    </span>
                  </button>
                  );
                })}
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
              title={t.booking.pickDate}
              subtitle={`${nameOf(service)} · ${formatDuration(option.durationMinutes, locale)} · ${formatPrice(option.priceCents, locale)}`}
            />
            <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {days.map((d) => {
                const parts = dayParts(locale, d.date);
                const selected = d.date === date;
                return (
                  <button
                    key={d.date}
                    type="button"
                    disabled={!d.open}
                    onClick={() => chooseDate(d.date)}
                    aria-pressed={selected}
                    aria-label={
                      d.open ? longDate(new Date(`${d.date}T12:00:00.000Z`)) : `${parts.weekday} ${parts.day} ${parts.month} (${t.booking.closed})`
                    }
                    className={`flex min-h-16 flex-col items-center justify-center rounded-xl border text-center transition ${
                      selected
                        ? "border-forest bg-forest text-white"
                        : d.open
                          ? "border-sand bg-white text-ink hover:border-forest"
                          : "cursor-not-allowed border-transparent bg-sand/70 text-sage line-through"
                    }`}
                  >
                    <span className="text-[0.65rem] tracking-wider uppercase">{parts.weekday}</span>
                    <span className="text-xl leading-tight font-semibold">{parts.day}</span>
                    <span className="text-[0.65rem]">{parts.month}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-[0.75rem] text-muted">{t.booking.openNote}</p>
          </div>
        )}

        {step === 3 && service && option && date && (
          <div>
            <StepTitle
              title={t.booking.chooseTime}
              subtitle={`${nameOf(service)} · ${formatDuration(option.durationMinutes, locale)} · ${longDate(new Date(`${date}T12:00:00.000Z`))}`}
            />
            {slotsLoading && times.length === 0 ? (
              <p className="mt-6 text-[0.9rem] text-ink-soft">{t.booking.loadingTimes}</p>
            ) : slotsError ? (
              <div className="mt-6 space-y-4">
                <p role="alert" className="text-[0.9rem] text-red-700">{slotsError}</p>
                <Button variant="outline" size="sm" onClick={() => void loadSlots(service.id, option.durationMinutes, date)}>{t.booking.tryAgain}</Button>
              </div>
            ) : times.length === 0 ? (
              <div className="mt-6 space-y-4">
                <p className="text-[0.9rem] text-ink-soft">{t.booking.noTimes}</p>
                <Button variant="outline" size="sm" onClick={() => setStep(2)}>{t.booking.anotherDate}</Button>
              </div>
            ) : (
              <>
                {slots.length === 0 && (
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <p className="text-[0.9rem] text-ink-soft">{fmt(t.booking.fullyBooked, { duration: formatDuration(option.durationMinutes, locale) })}</p>
                    <Button variant="outline" size="sm" onClick={() => setStep(2)}>{t.booking.anotherDate}</Button>
                  </div>
                )}
                <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                  {times.map((time) =>
                    time.available ? (
                      <button
                        key={time.startAt}
                        type="button"
                        onClick={() => chooseSlot({ time: time.time, startAt: time.startAt })}
                        aria-pressed={slot?.startAt === time.startAt}
                        className={`min-h-12 rounded-xl border text-[0.9rem] transition ${
                          slot?.startAt === time.startAt ? "border-forest bg-forest text-white" : "border-sand bg-white text-ink hover:border-forest"
                        }`}
                      >
                        {time.time}
                      </button>
                    ) : (
                      (() => {
                        const look = UNAVAILABLE_STYLE[time.status && time.status !== "available" ? time.status : "booked"];
                        const label = t.booking[look.label];
                        return (
                          <span
                            key={time.startAt}
                            aria-label={`${time.time}, ${label.toLowerCase()}`}
                            className={`flex min-h-12 cursor-not-allowed flex-col items-center justify-center rounded-xl border leading-tight ${look.className}`}
                          >
                            <span className="text-[0.85rem] line-through">{time.time}</span>
                            <span className="text-[0.56rem] tracking-[0.15em] uppercase">{label}</span>
                          </span>
                        );
                      })()
                    ),
                  )}
                </div>
                <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.72rem] text-muted">
                  <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-sand" aria-hidden /> {t.booking.legendBooked}</li>
                  <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-dashed border-black/20" aria-hidden /> {fmt(t.booking.legendRest, { n: BUFFER_MINUTES })}</li>
                  <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-sand/70" aria-hidden /> {t.booking.legendShort}</li>
                </ul>
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <form onSubmit={submitDetails} noValidate>
            <StepTitle title={t.booking.detailsTitle} subtitle={t.booking.detailsSubtitle} />
            <div className="mt-6 space-y-5">
              <Field label={t.booking.fullName} htmlFor="customerName" error={fieldErrors.customerName}>
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
                label={t.booking.phone}
                htmlFor="customerPhone"
                hint={t.booking.phoneHint}
                error={fieldErrors.customerPhone}
              >
                <input
                  id="customerPhone"
                  name="customerPhone"
                  dir="ltr"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={details.customerPhone}
                  onChange={(e) => updateDetail("customerPhone", e.target.value)}
                  maxLength={32}
                  aria-invalid={!!fieldErrors.customerPhone}
                  className={`${inputClass(!!fieldErrors.customerPhone)} rtl:text-end`}
                />
              </Field>
              <Field label={t.loyalty.voucherLabel} htmlFor="voucherCode" hint={t.loyalty.voucherHint}>
                {usableVouchers.length > 0 && (
                  <select
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className={inputClass(false)}
                  >
                    <option value="">{t.loyalty.voucherNone}</option>
                    {usableVouchers.map((v) => (
                      <option key={v.id} value={v.code}>
                        {v.code} — {v.title}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  id="voucherCode"
                  name="voucherCode"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  maxLength={16}
                  placeholder={t.loyalty.voucherCode}
                  className={`${inputClass(false)} ${usableVouchers.length > 0 ? "mt-2" : ""}`}
                />
              </Field>
              <Field label={t.booking.note} htmlFor="note" error={fieldErrors.note}>
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
                <span className="mt-1 block text-end text-[0.7rem] text-muted">{details.note.length}/{NOTE_MAX}</span>
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
              <Button type="button" variant="ghost" onClick={() => setStep(3)}>{t.booking.back}</Button>
              <Button type="submit">{t.booking.continue}</Button>
            </div>
          </form>
        )}

        {step === 5 && service && option && slot && (
          <div>
            <StepTitle title={t.booking.review} />
            <dl className="mt-6 divide-y divide-black/[0.06] border-y border-black/[0.06] text-[0.9rem]">
              <SummaryRow label={t.booking.service} value={nameOf(service)} />
              <SummaryRow label={t.booking.date} value={longDate(new Date(slot.startAt))} />
              <SummaryRow label={t.booking.time} value={`${slot.time} (${formatDuration(option.durationMinutes, locale)})`} />
              <SummaryRow label={t.booking.name} value={details.customerName.replace(/\s+/g, " ").trim()} />
              <SummaryRow
                label={t.booking.phoneLabel}
                value={normalizedPhone.success ? formatPhone(normalizedPhone.data) : details.customerPhone}
                ltr
              />
              {details.note.trim() && <SummaryRow label={t.booking.noteLabel} value={details.note.trim()} />}
              {selectedVoucher && <SummaryRow label={t.loyalty.voucherLabel} value={selectedVoucher.code} />}
              <SummaryRow
                label={t.booking.price}
                value={
                  previewDiscount > 0
                    ? `${formatPrice(option.priceCents - previewDiscount, locale)} (${fmt(t.loyalty.priceWas, { price: formatPrice(option.priceCents, locale) })})`
                    : formatPrice(option.priceCents, locale)
                }
                strong
              />
            </dl>
            <p className="mt-4 text-[0.75rem] text-muted">{t.booking.payAtSalon}</p>
            <p className="mt-2 text-[0.75rem] leading-relaxed text-muted">
              {t.booking.privacyBefore}{" "}
              <Link href={href("/privacy")} target="_blank" className="text-ink underline underline-offset-2">
                {t.booking.privacyLink}
              </Link>
              {t.booking.privacyAfter}
            </p>
            {submitError && (
              <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
                {submitError}
              </p>
            )}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button type="button" variant="ghost" onClick={() => setStep(4)} disabled={submitting}>{t.booking.back}</Button>
              <Button type="button" onClick={() => void confirm()} loading={submitting}>
                {submitting ? t.booking.confirming : t.booking.confirm}
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
      <h2 className="text-[1.7rem] leading-[1.12] font-semibold tracking-[-0.03em] text-forest sm:text-[2.05rem]">{title}</h2>
      {subtitle && <p className="mt-2 text-[0.95rem] leading-relaxed text-sage">{subtitle}</p>}
    </div>
  );
}

function inputClass(invalid: boolean) {
  return `block w-full rounded-sm border bg-white px-4 py-3 text-[0.95rem] text-ink outline-none transition focus:border-forest ${
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

const BENEFIT_ICONS = [LeafIcon, HeartIcon, LotusIcon];

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
  const { t, locale } = useI18n();
  const info = localizedServiceDetails(t, service);
  const { name } = serviceText(t, service);
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[0.88rem] font-medium text-ink"
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" /> {t.booking.allTreatments}
      </button>

      <div className="mt-5 grid gap-6 md:grid-cols-[0.85fr_1.5fr] md:gap-8">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:aspect-auto md:min-h-[21rem]">
          <Image src={serviceImage(service.slug)} {...blurProps(serviceImage(service.slug))} alt={name} fill sizes="(min-width: 768px) 34vw, 100vw" className="object-cover" />
        </div>

        <div className="flex flex-col">
          <p className="text-[0.68rem] font-medium tracking-[0.22em] text-sage uppercase">{t.booking.treatment}</p>
          <h2 className="mt-2 text-[1.7rem] leading-[1.1] font-semibold tracking-[-0.03em] text-forest sm:text-[2.15rem]">{name}</h2>

          <ul className="mt-5 grid grid-cols-3 border-b border-black/[0.06] pb-5">
            {info.benefits.map((benefit, index) => {
              const Icon = BENEFIT_ICONS[index % BENEFIT_ICONS.length];
              return (
                <li key={benefit} className={`flex flex-col gap-2.5 px-3 first:ps-0 sm:px-5 ${index > 0 ? "border-s border-sand" : ""}`}>
                  <Icon className="h-6 w-6 text-ink-soft" aria-hidden />
                  <span className="text-[0.72rem] leading-snug text-ink-soft sm:text-[0.78rem]">{benefit}</span>
                </li>
              );
            })}
          </ul>

          <p className="mt-5 text-[0.68rem] font-medium tracking-[0.22em] text-sage uppercase">{t.booking.duration}</p>
          <div className="mt-2.5 grid grid-cols-3 gap-2 sm:gap-3">
            {service.options.map((o, index) => {
              const isSelected = o.durationMinutes === selected.durationMinutes;
              return (
                <button
                  key={o.durationMinutes}
                  type="button"
                  onClick={() => onSelect(o.durationMinutes)}
                  aria-pressed={isSelected}
                  style={{ animationDelay: `${120 + index * 60}ms` }}
                  className={`flex min-h-[3.75rem] flex-col items-center justify-center rounded-xl border px-1 leading-tight transition ${
                    isSelected
                      ? "border-forest bg-forest text-white"
                      : "border-sand bg-white text-ink hover:border-forest"
                  }`}
                >
                  <span className="text-[0.72rem] opacity-80">{formatDuration(o.durationMinutes, locale)}</span>
                  <span className="mt-0.5 text-lg font-semibold">{formatPrice(o.priceCents, locale)}</span>
                </button>
              );
            })}
          </div>

          <p className="mt-2.5 text-[0.72rem] text-muted">{fmt(t.booking.restNote, { n: BUFFER_MINUTES })}</p>

          <button
            type="button"
            onClick={onContinue}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-forest text-[0.88rem] font-medium text-white transition hover:bg-forest-dark"
          >
            {fmt(t.booking.bookDuration, { duration: formatDuration(selected.durationMinutes, locale) })}
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </button>
        </div>
      </div>

      <TreatmentDetails info={info} t={t} />
    </div>
  );
}

function TreatmentDetails({ info, t }: { info: ServiceDetails; t: Dictionary }) {
  return (
    <section className="mt-8 rounded-2xl border border-black/[0.06] bg-ivory p-4 sm:p-6">
      <h3 className="px-1 text-[1.05rem] font-medium text-ink">{t.booking.treatmentDetails}</h3>
      <div className="mt-4 space-y-3">
        <DetailItem icon={LotusIcon} title={t.booking.overview} summary={info.summary}>
          <p className="text-[0.86rem] leading-relaxed font-light text-ink-soft">{info.intro}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white px-4 py-3">
              <dt className="text-[0.68rem] tracking-[0.16em] text-sage uppercase">{t.booking.pressure}</dt>
              <dd className="mt-2">
                <span className="flex gap-1" aria-hidden>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <span key={level} className={`h-1.5 w-5 rounded-full ${level <= PRESSURE_LEVEL[info.pressure] ? "bg-forest" : "bg-sand"}`} />
                  ))}
                </span>
                <span className="mt-1.5 block text-[0.8rem] text-ink first-letter:uppercase">{t.pressure[info.pressure]}</span>
              </dd>
            </div>
            <div className="rounded-xl bg-white px-4 py-3">
              <dt className="text-[0.68rem] tracking-[0.16em] text-sage uppercase">{t.booking.idealFor}</dt>
              <dd className="mt-2 text-[0.8rem] leading-snug text-ink">{info.idealFor}</dd>
            </div>
          </dl>
          {info.why && (
            <p className="mt-4 border-s-2 border-sand ps-3 text-[0.95rem] leading-snug text-ink">{info.why}</p>
          )}
        </DetailItem>

        {info.highlights.length > 0 && (
          <DetailItem icon={LeafIcon} title={t.booking.whatToExpect} summary={info.expectSummary}>
            <ul className="space-y-2 text-[0.86rem] text-ink-soft">
              {info.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>
          </DetailItem>
        )}

        {info.helpsWith.length > 0 && (
          <DetailItem icon={HeartIcon} title={t.booking.helpsWith} summary={`${info.helpsWith.slice(0, 3).join(t.booking.listSeparator)}…`}>
            <ul className="flex flex-wrap gap-1.5">
              {info.helpsWith.map((item) => (
                <li key={item} className="rounded-full bg-white px-3 py-1 text-[0.76rem] text-ink">
                  {item}
                </li>
              ))}
            </ul>
          </DetailItem>
        )}
      </div>
    </section>
  );
}

function DetailItem({
  icon: Icon,
  title,
  summary,
  children,
}: {
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border bg-white ${open ? "border-sand" : "border-black/[0.06]"}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-4 px-4 py-3.5 text-start sm:px-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand text-ink">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[1.05rem] leading-tight font-semibold text-ink">{title}</span>
          <span className="mt-0.5 block truncate text-[0.78rem] font-light text-muted">{summary}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-ink-soft transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden" inert={!open}>
          <div className="border-t border-black/[0.06] px-4 pt-4 pb-5 sm:ps-[4.75rem] sm:pe-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, strong = false, ltr = false }: { label: string; value: string; strong?: boolean; ltr?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 sm:gap-6">
      <dt className="shrink-0 text-muted">{label}</dt>
      <dd className={`min-w-0 text-end break-words text-ink ${strong ? "text-xl font-semibold" : ""}`}>
        {ltr ? <bdi dir="ltr">{value}</bdi> : value}
      </dd>
    </div>
  );
}
