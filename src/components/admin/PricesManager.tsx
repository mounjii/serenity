"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  addServicePriceAction,
  deleteServicePriceAction,
  setServiceBookableAction,
  setServicePriceActiveAction,
  updateServicePriceAction,
} from "@/app/admin/actions";
import { ChevronDown } from "@/components/Icons";
import { formatPrice } from "@/lib/format";
import type { AdminPricedService } from "@/server/admin/prices";

const field =
  "h-9 rounded-lg border border-sand bg-white px-2.5 text-[0.85rem] text-ink outline-none transition focus:border-forest";

export default function PricesManager({ services }: { services: AdminPricedService[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function run(id: string, task: () => Promise<{ ok: boolean; error?: { message: string } }>) {
    setError(null);
    setPendingId(id);
    const result = await task();
    setPendingId(null);
    if (!result.ok) {
      setError(result.error?.message ?? "Something went wrong.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-sand bg-white">
      {error ? <p className="border-b border-red-200 bg-red-50 px-4 py-2.5 text-[0.82rem] text-red-700">{error}</p> : null}
      <ul className="divide-y divide-sand">
        {services.map((service) => {
          const open = openId === service.id;
          const activePrices = service.options.filter((option) => option.active);
          const summary = activePrices.length
            ? activePrices.map((option) => `${option.durationMinutes} min ${formatPrice(option.priceCents)}`).join(" · ")
            : "No bookable price";
          return (
            <li key={service.id}>
              <div className="flex items-center gap-3 px-4 py-3">
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : service.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-start"
                >
                  <ChevronDown className={`h-4 w-4 shrink-0 text-sage transition ${open ? "rotate-180" : ""}`} />
                  <span className="min-w-0">
                    <span className="block truncate text-[0.92rem] font-medium text-ink">{service.name}</span>
                    <span className="block truncate text-[0.75rem] text-sage">{summary}</span>
                  </span>
                </button>
                <button
                  type="button"
                  disabled={pendingId === service.id}
                  onClick={() => run(service.id, () => setServiceBookableAction(service.id, !service.active))}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[0.75rem] font-medium transition disabled:opacity-50 ${
                    service.active ? "bg-forest text-white" : "bg-sand text-sage"
                  }`}
                >
                  {service.active ? "Booking on" : "Booking off"}
                </button>
              </div>

              {open ? (
                <div className="space-y-2 border-t border-sand bg-ivory/60 px-4 py-3">
                  {service.options.map((option) => (
                    <PriceRow
                      key={option.id}
                      option={option}
                      busy={pendingId === option.id}
                      onSave={(priceMad) => run(option.id, () => updateServicePriceAction(option.id, priceMad))}
                      onToggle={() => run(option.id, () => setServicePriceActiveAction(option.id, !option.active))}
                      onDelete={() => run(option.id, () => deleteServicePriceAction(option.id))}
                    />
                  ))}
                  <AddPrice
                    busy={pendingId === `add-${service.id}`}
                    onAdd={(durationMinutes, priceMad) =>
                      run(`add-${service.id}`, () => addServicePriceAction(service.id, durationMinutes, priceMad))
                    }
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PriceRow({
  option,
  busy,
  onSave,
  onToggle,
  onDelete,
}: {
  option: AdminPricedService["options"][number];
  busy: boolean;
  onSave: (priceMad: number) => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [price, setPrice] = useState(String(option.priceCents / 100));
  const current = String(option.priceCents / 100);
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[0.82rem] font-medium text-ink">{option.durationMinutes} min</span>
      <input
        aria-label={`Price for ${option.durationMinutes} minutes`}
        inputMode="decimal"
        value={price}
        disabled={busy}
        onChange={(event) => setPrice(event.target.value)}
        onBlur={() => {
          if (price !== current) onSave(Number(price.replace(",", ".")));
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSave(Number(price.replace(",", ".")));
          }
        }}
        className={`${field} w-24`}
      />
      <span className="text-[0.75rem] text-sage">MAD</span>
      <button
        type="button"
        disabled={busy}
        onClick={onToggle}
        className={`ms-auto rounded-full border px-3 py-1 text-[0.75rem] font-medium disabled:opacity-50 ${
          option.active ? "border-forest bg-forest text-white" : "border-sand bg-white text-sage"
        }`}
      >
        {option.active ? "Enabled" : "Disabled"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onDelete}
        className="rounded-full border border-red-200 bg-white px-3 py-1 text-[0.75rem] font-medium text-red-700 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}

function AddPrice({ busy, onAdd }: { busy: boolean; onAdd: (durationMinutes: number, priceMad: number) => void }) {
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  return (
    <form
      className="flex items-center gap-2 pt-1"
      onSubmit={(event) => {
        event.preventDefault();
        onAdd(Number(duration), Number(price.replace(",", ".")));
        setDuration("");
        setPrice("");
      }}
    >
      <input
        aria-label="Minutes"
        placeholder="Min"
        inputMode="numeric"
        value={duration}
        onChange={(event) => setDuration(event.target.value)}
        className={`${field} w-16`}
        required
      />
      <input
        aria-label="Price in MAD"
        placeholder="MAD"
        inputMode="decimal"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
        className={`${field} w-24`}
        required
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-full bg-forest px-3.5 py-1.5 text-[0.78rem] font-medium text-white disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}
