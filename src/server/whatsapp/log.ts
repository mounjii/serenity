import { getDb } from "@/server/db";
import type { WhatsAppMessage } from "./types";

type LogEntry = {
  message: WhatsAppMessage;
  provider: string;
  status: "SENT" | "FAILED";
  error?: string;
  providerMessageId?: string;
};

export async function logNotification({ message, provider, status, error, providerMessageId }: LogEntry) {
  return getDb().notificationLog.create({
    data: {
      bookingId: message.bookingId,
      recipient: message.recipient,
      phone: message.to.slice(0, 20),
      template: message.template,
      payload: { text: message.text, params: message.params, ...(providerMessageId ? { providerMessageId } : {}) },
      provider: provider.slice(0, 30),
      status,
      error: error ?? null,
    },
    select: { id: true },
  });
}
