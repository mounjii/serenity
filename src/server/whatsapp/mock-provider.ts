import { logNotification } from "./log";
import type { WhatsAppProvider } from "./types";

/** Sends nothing: prints the message to the server console and records it in NotificationLog. */
export const mockProvider: WhatsAppProvider = {
  name: "mock",
  async send(message) {
    console.log(
      [
        "──────── WhatsApp (mock) ────────",
        `To:       ${message.to} (${message.recipient.toLowerCase()})`,
        `Template: ${message.template}`,
        `Message:  ${message.text}`,
        ...(message.buttons?.length ? [`Buttons:  ${message.buttons.map((b) => `[${b.title}]`).join(" ")}`] : []),
        "─────────────────────────────────",
      ].join("\n"),
    );
    const log = await logNotification({ message, provider: "mock", status: "SENT" });
    return { providerMessageId: `mock-${log.id}` };
  },
};
