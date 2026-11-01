"use client";

import { useState, useTransition } from "react";
import { sendLoyaltyPromoAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";

export default function LoyaltyPromoForm() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  return (
    <form
      className="mt-8 space-y-4 rounded-lg bg-white p-6 shadow-[0_20px_40px_-32px_rgba(60,40,20,0.35)] sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        start(async () => {
          const result = await sendLoyaltyPromoAction(data);
          setStatus(result.ok ? `Sent to ${result.data.count} customers.` : result.error.message);
          if (result.ok) setMessage("");
        });
      }}
    >
      <h2 className="font-serif text-2xl text-ink">Smart notification</h2>
      <p className="text-[0.85rem] text-ink-soft">Customers see this on their account. Add a percent to attach a voucher.</p>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-[0.8rem]">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={3}
          maxLength={200}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="block w-full rounded-sm border border-sand bg-white px-4 py-3 text-[0.95rem] text-ink outline-none focus:border-ink"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="percent" className="mb-1.5 block text-[0.8rem]">
            Discount % (optional)
          </label>
          <input
            id="percent"
            name="percent"
            type="number"
            min={0}
            max={50}
            className="block w-full rounded-sm border border-sand bg-white px-4 py-3 text-[0.95rem] text-ink outline-none focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="days" className="mb-1.5 block text-[0.8rem]">
            Valid days
          </label>
          <input
            id="days"
            name="days"
            type="number"
            min={3}
            max={90}
            defaultValue={14}
            className="block w-full rounded-sm border border-sand bg-white px-4 py-3 text-[0.95rem] text-ink outline-none focus:border-ink"
          />
        </div>
      </div>
      {status && <p className="text-[0.85rem] text-ink">{status}</p>}
      <Button type="submit" loading={pending}>
        Send offer
      </Button>
    </form>
  );
}
