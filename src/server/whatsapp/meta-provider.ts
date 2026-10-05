import { logNotification } from "./log";
import type { WhatsAppProvider } from "./types";

/**
 * Official WhatsApp Business Cloud API (Meta). Sends pre-approved templates; each template must exist
 * in WhatsApp Manager with the same name, body variables in the order of `params`, and, for
 * booking_request_customer, two quick-reply buttons (Confirm, Cancel).
 */
function config() {
  const token = process.env.META_WA_TOKEN?.trim();
  const phoneNumberId = process.env.META_WA_PHONE_NUMBER_ID?.trim();
  if (!token || !phoneNumberId) throw new Error("META_WA_TOKEN and META_WA_PHONE_NUMBER_ID must be set for the meta provider.");
  return {
    token,
    phoneNumberId,
    version: process.env.META_WA_API_VERSION?.trim() || "v21.0",
    language: process.env.META_WA_TEMPLATE_LANG?.trim() || "en",
  };
}

type GraphResponse = { messages?: { id: string }[]; error?: { message?: string; code?: number } };

export const metaProvider: WhatsAppProvider = {
  name: "meta",
  async send(message) {
    const { token, phoneNumberId, version, language } = config();
    const components: unknown[] = [
      { type: "body", parameters: Object.values(message.params).map((text) => ({ type: "text", text })) },
      ...(message.buttons ?? []).map((button, index) => ({
        type: "button",
        sub_type: "quick_reply",
        index: String(index),
        parameters: [{ type: "payload", payload: button.payload }],
      })),
    ];

    const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: message.to.replace(/^\+/, ""),
        type: "template",
        template: { name: message.template, language: { code: language }, components },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    const data = (await response.json().catch(() => ({}))) as GraphResponse;
    const id = data.messages?.[0]?.id;
    if (!response.ok || !id) {
      throw new Error(`Meta API ${response.status}: ${data.error?.message ?? "no message id returned"}`);
    }
    await logNotification({ message, provider: "meta", status: "SENT", providerMessageId: id });
    return { providerMessageId: id };
  },
};
