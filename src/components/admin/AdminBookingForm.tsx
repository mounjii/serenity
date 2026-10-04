"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createAdminBookingAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { DEFAULT_PHONE_PREFIX, NOTE_MAX } from "@/lib/booking-rules";
import { customerDetailsSchema } from "@/lib/booking-schema";
import { formatDuration, formatPrice } from "@/lib/format";
import type { PublicService } from "@/server/booking/services";

type Slot = { time: string; startAt: string };
type Availability = { closed: boolean; slots: Slot[] };

const inputClass = (invalid = false) =>
  `block w-full rounded-sm border bg-white px-4 py-3 text-[0.95rem] text-ink outline-none transition focus:border-ink ${
    invalid ? "border-red-400" : "border-sand"
  }`;

const newKey = () => crypto.randomUUID();

type Props = { services: PublicService[]; today: string; initialDate: string };

export default function AdminBookingForm({ services, today, initialDate }: Props) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(initialDate < today ? today : initialDate);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(`${DEFAULT_PHONE_PREFIX} `);
  const [note, setNote] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const idempotencyKey = useRef(newKey());
  const request = useRef<AbortController | null>(null);

  const service = services.find((s) => s.id === serviceId) ?? null;

  const loadSlots = useCallback(async (forService: string, forDate: string) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    try {
      const params = new URLSearchParams({ serviceId: forService, date: forDate });
      const res = await fetch(`/api/admin/availability?${params}`, { cache: "no-store", signal: controller.signal });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const body = (await res.json()) as Availability | { error: { message: string } };
      if (!res.ok || "error" in body) throw new Error("error" in body ? body.error.message : "Could not load times.");
      setAvailability(body);
      setSlotsError(null);
      setSlot((current) => (current && body.slots.some((s) => s.startAt === current.startAt) ? current : null));
    } catch (error) {
      if (controller.signal.aborted) return;
      setAvailability(null);
      setSlotsError(error instanceof Error ? error.message : "Could not load times.");
    }
  }, [router]);

  useEffect(() => {
    if (!serviceId || !date) return;
    const timer = window.setTimeout(() => void loadSlots(serviceId, date), 0);
    return () => window.clearTimeout(timer);
  }, [serviceId, date, loadSlots]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (!service) return;

    const errors: Record<string, string> = {};
    if (!slot) errors.slot = "Please choose a time.";
    const parsed = customerDetailsSchema.safeParse({ customerName: name, customerPhone: phone, note });
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!errors[key]) errors[key] = issue.message;
      }
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0 || !slot) return;

    setSubmitting(true);
    const result = await createAdminBookingAction({
      serviceId: service.id,
      startAt: slot.startAt,
      customerName: name,
      customerPhone: phone,
      note,
      idempotencyKey: idempotencyKey.current,
    });
    if (result.ok) {
      router.push(`/admin/bookings/${result.data.id}`);
      return;
    }
    setSubmitting(false);
    const { error } = result;
    if (error.status === 401) {
      router.push("/admin/login");
    } else if (error.status === 400 && error.fields) {
      setFieldErrors(error.fields);
    } else {
      setFormError(error.message);
      idempotencyKey.current = newKey();
      if (error.status === 409 || error.status === 422) void loadSlots(service.id, date);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mt-8 space-y-8 rounded-sm bg-white p-6 shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)] sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="service" className="mb-1.5 block text-[0.8rem]">Service</label>
          <select
            id="service"
            value={serviceId}
            onChange={(e) => {
              setServiceId(e.target.value);
              setSlot(null);
              idempotencyKey.current = newKey();
            }}
            className={inputClass()}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {formatDuration(s.durationMinutes)} · {formatPrice(s.priceCents)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date" className="mb-1.5 block text-[0.8rem]">Date</label>
          <input
            id="date"
            type="date"
            min={today}
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setSlot(null);
              idempotencyKey.current = newKey();
            }}
            className={inputClass()}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-[0.8rem]">Time</p>
        {slotsError ? (
          <p className="text-[0.85rem] text-red-700">{slotsError}</p>
        ) : !availability ? (
          <p className="text-[0.85rem] text-muted">Loading available times…</p>
        ) : availability.slots.length === 0 ? (
          <p className="text-[0.85rem] text-muted">{availability.closed ? "The salon is closed on this day." : "No available times on this day."}</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {availability.slots.map((s) => (
              <button
                key={s.startAt}
                type="button"
                onClick={() => {
                  setSlot(s);
                  setFieldErrors((errors) => {
                    const next = { ...errors };
                    delete next.slot;
                    return next;
                  });
                }}
                aria-pressed={slot?.startAt === s.startAt}
                className={`min-h-11 rounded-sm border text-[0.9rem] transition ${
                  slot?.startAt === s.startAt ? "border-ink bg-ink text-cream" : "border-sand text-ink hover:border-ink"
                }`}
              >
                {s.time}
              </button>
            ))}
          </div>
        )}
        {fieldErrors.slot && <p className="mt-1.5 text-[0.78rem] text-red-700">{fieldErrors.slot}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="customerName" className="mb-1.5 block text-[0.8rem]">Customer name</label>
          <input id="customerName" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={inputClass(!!fieldErrors.customerName)} />
          {fieldErrors.customerName && <p className="mt-1.5 text-[0.78rem] text-red-700">{fieldErrors.customerName}</p>}
        </div>
        <div>
          <label htmlFor="customerPhone" className="mb-1.5 block text-[0.8rem]">Phone</label>
          <input
            id="customerPhone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={32}
            className={inputClass(!!fieldErrors.customerPhone)}
          />
          {fieldErrors.customerPhone && <p className="mt-1.5 text-[0.78rem] text-red-700">{fieldErrors.customerPhone}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="note" className="mb-1.5 block text-[0.8rem]">Note (optional)</label>
          <textarea id="note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={NOTE_MAX} className={inputClass(!!fieldErrors.note)} />
          {fieldErrors.note && <p className="mt-1.5 text-[0.78rem] text-red-700">{fieldErrors.note}</p>}
        </div>
      </div>

      {formError && (
        <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700">
          {formError}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={submitting}>Create booking</Button>
      </div>
    </form>
  );
}
